import React, { useState } from 'react';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { importWallet } from '../services/walletService';
import { WalletSteps } from './WalletSteps';
import { WalletCreationProps } from '../types/wallet';
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

// Helper function to convert hex to binary
const hexToBinary = (hex: string): string => {
  // Remove '0x' prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  // Convert each hex character to 4 binary digits
  return cleanHex.split('').map(char => {
    return parseInt(char, 16).toString(2).padStart(4, '0');
  }).join('');
};

// Helper function to get word index and binary representation
const getWordBinary = (word: string): { index: number; binary: string } => {
  const wordlist = bip39.wordlists.english;
  const index = wordlist.indexOf(word);
  if (index === -1) throw new Error(`Word not found in wordlist: ${word}`);
  return {
    index,
    binary: index.toString(2).padStart(11, '0') // BIP39 uses 11 bits per word
  };
};

const creationSteps = [
  {
    title: 'Generate Entropy',
    description: 'Create a random 128-bit entropy (16 bytes) for wallet generation.'
  },
  {
    title: 'Calculate Checksum',
    description: 'Calculate the first byte of SHA256 hash of entropy as checksum.'
  },
  {
    title: 'Generate Mnemonic',
    description: 'Convert entropy + checksum to a BIP39 mnemonic phrase.'
  },
  {
    title: 'Derive Seed',
    description: 'Derive a seed from the mnemonic phrase.'
  },
  {
    title: 'Derive Private Key',
    description: 'Generate a private key from the seed using the Ethereum derivation path.'
  },
  {
    title: 'Derive Public Key',
    description: 'Generate a public key from the private key.'
  },
  {
    title: 'Derive Address',
    description: 'Generate the Ethereum address from the public key.'
  },
  {
    title: 'Wallet Complete',
    description: 'Review your wallet details and complete the process.'
  }
];

export const WalletCreationPage: React.FC<WalletCreationProps> = ({
  mode,
  onComplete,
  onBack
}) => {
  // Stepper state for creation
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsData, setStepsData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [importError, setImportError] = useState('');
  const [entropyHex, setEntropyHex] = useState(''); // Store hex value for later use
  const [addressIndex, setAddressIndex] = useState(0); // Add state for address index

  // For import mode
  const [importMnemonic, setImportMnemonic] = useState('');

  // Helper function to get derivation path
  const getDerivationPath = (index: number) => `m/44'/60'/0'/0/${index}`;

  // Helper function to get path explanation
  const getPathExplanation = (index: number) => 
    `m/44'/60'/0'/0/${index}\n` +
    `├── m: master key\n` +
    `├── 44': BIP44 purpose\n` +
    `├── 60': Ethereum coin type\n` +
    `├── 0': account index\n` +
    `├── 0: change (0 for receiving)\n` +
    `└── ${index}: address index`;

  // Step-by-step wallet creation logic
  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      let newStepsData = [...stepsData];
      switch (currentStep) {
        case 0: // Generate entropy
          const entropy = ethers.utils.randomBytes(16); // 128 bits for 12 words
          const entropyHexValue = ethers.utils.hexlify(entropy);
          const entropyBinary = hexToBinary(entropyHexValue);
          setEntropyHex(entropyHexValue); // Store hex value for later use
          newStepsData[0] = `Hex: ${entropyHexValue}\nBinary: ${entropyBinary}`;
          break;
        case 1: // Calculate checksum
          const entropyBytes = ethers.utils.arrayify(entropyHex);
          const entropyHash = ethers.utils.sha256(entropyBytes);
          // Get first byte of hash (2 hex characters)
          const checksum = entropyHash.slice(2, 4); // Get first byte after '0x'
          const checksumBinary = hexToBinary(checksum);
          newStepsData[1] = `Entropy Hash: ${entropyHash}\nChecksum (first byte): ${checksum}\nChecksum Binary: ${checksumBinary}`;
          break;
        case 2: // Generate mnemonic
          // Use the original entropy bytes directly
          const entropyBytes2 = ethers.utils.arrayify(entropyHex);
          const mnemonicPhrase = bip39.entropyToMnemonic(Buffer.from(entropyBytes2));
          
          // Format mnemonic with binary representation
          const words = mnemonicPhrase.split(' ');
          const formattedMnemonic = words.map((word, i) => {
            const { index, binary } = getWordBinary(word);
            return `${i + 1}. ${word} (${index.toString().padStart(4)} = ${binary})`;
          }).join('\n');
          
          newStepsData[2] = formattedMnemonic;
          setMnemonic(mnemonicPhrase);
          break;
        case 3: // Derive seed
          const seed = await bip39.mnemonicToSeed(stepsData[2]);
          // Store as 0x-prefixed hex string
          newStepsData[3] = '0x' + Buffer.from(seed).toString('hex');
          break;
        case 4: // Derive private key
          // Use ethers to derive HDNode from seed (must be 0x-prefixed hex string)
          const hdNode = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const derivedNode = hdNode.derivePath(getDerivationPath(addressIndex));
          newStepsData[4] = `Derivation Path:\n${getPathExplanation(addressIndex)}\n\nPrivate Key: ${derivedNode.privateKey}`;
          break;
        case 5: // Derive public key
          const hdNode2 = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const derivedNode2 = hdNode2.derivePath(getDerivationPath(addressIndex));
          newStepsData[5] = derivedNode2.publicKey;
          break;
        case 6: // Derive address
          const hdNode3 = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const derivedNode3 = hdNode3.derivePath(getDerivationPath(addressIndex));
          newStepsData[6] = derivedNode3.address;
          break;
        case 7: // Complete
          const hdNode4 = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const derivedNode4 = hdNode4.derivePath(getDerivationPath(addressIndex));
          newStepsData[7] = `Wallet Details:\n\n` +
            `Address: ${derivedNode4.address}\n` +
            `Private Key: ${derivedNode4.privateKey}\n` +
            `Public Key: ${derivedNode4.publicKey}\n\n` +
            `Mnemonic Phrase:\n${mnemonic}\n\n` +
            `Derivation Path: ${getDerivationPath(addressIndex)}\n\n` +
            `⚠️ IMPORTANT: Save your mnemonic phrase and private key securely!`;
          // Complete the process
          onComplete(new ethers.Wallet(derivedNode4.privateKey), mnemonic);
          break;
        default:
          break;
      }
      setStepsData(newStepsData);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      alert('Error during wallet creation: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle address index change
  const handleAddressIndexChange = (newIndex: number) => {
    setAddressIndex(newIndex);
    // Update the current step's data with new derivation
    if (currentStep >= 4) {
      const hdNode = ethers.utils.HDNode.fromSeed(stepsData[3]);
      const derivedNode = hdNode.derivePath(getDerivationPath(newIndex));
      let newStepsData = [...stepsData];
      
      if (currentStep >= 4) {
        newStepsData[4] = `Derivation Path:\n${getPathExplanation(newIndex)}\n\nPrivate Key: ${derivedNode.privateKey}`;
      }
      if (currentStep >= 5) {
        newStepsData[5] = derivedNode.publicKey;
      }
      if (currentStep >= 6) {
        newStepsData[6] = derivedNode.address;
      }
      setStepsData(newStepsData);
    }
  };

  // Import mode logic
  const handleImportWallet = async () => {
    setIsLoading(true);
    setImportError('');
    try {
      if (!ethers.utils.isValidMnemonic(importMnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      // Create HD wallet from mnemonic
      const seed = await bip39.mnemonicToSeed(importMnemonic);
      const hdNode = ethers.utils.HDNode.fromSeed(seed);
      const derivedNode = hdNode.derivePath(getDerivationPath(addressIndex));
      const wallet = new ethers.Wallet(derivedNode.privateKey);

      onComplete(wallet, importMnemonic);
    } catch (error) {
      setImportError('Invalid mnemonic phrase. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wallet-creation-page">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>{mode === 'create' ? 'Create New Wallet' : 'Import Existing Wallet'}</h2>
      </div>

      {mode === 'create' && (
        <div>
          <div className="creation-steps">
            {creationSteps.map((step, idx) => (
              <div key={step.title} className={`step ${idx === currentStep ? 'current' : idx < currentStep ? 'completed' : 'pending'}`}>
                <div className="step-header">
                  <div className="step-number">{idx + 1}</div>
                  <h4>{step.title}</h4>
                </div>
                <p className="step-description">{step.description}</p>
                {stepsData[idx] && (
                  <div className="step-data">
                    {idx === 4 && (
                      <div style={{ marginBottom: '10px' }}>
                        <label>Address Index: </label>
                        <input
                          type="number"
                          min="0"
                          value={addressIndex}
                          onChange={(e) => handleAddressIndexChange(parseInt(e.target.value) || 0)}
                          style={{ width: '60px', marginLeft: '10px' }}
                        />
                      </div>
                    )}
                    <pre style={{ 
                      wordBreak: 'break-all', 
                      whiteSpace: 'pre-wrap',
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#000000'
                    }}>
                      {stepsData[idx]}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
          {currentStep < creationSteps.length && (
            <button 
              onClick={handleNextStep} 
              disabled={isLoading} 
              style={{ 
                marginTop: 24,
                backgroundColor: currentStep === 7 ? '#4CAF50' : undefined,
                color: currentStep === 7 ? 'white' : undefined
              }}
            >
              {isLoading ? 'Processing...' : 
               currentStep === 7 ? 'Complete' : 
               stepsData.length === 0 ? 'Start' : 'Next'}
            </button>
          )}
        </div>
      )}

      {mode === 'import' && (
        <div className="mnemonic-input">
          <label>Enter your mnemonic phrase:</label>
          <textarea
            value={importMnemonic}
            onChange={(e) => setImportMnemonic(e.target.value)}
            placeholder="Enter your 12 or 24 word mnemonic phrase..."
            rows={3}
          />
          <div style={{ marginTop: '1rem' }}>
            <label>Address Index: </label>
            <input
              type="number"
              min="0"
              value={addressIndex}
              onChange={(e) => setAddressIndex(parseInt(e.target.value) || 0)}
              style={{ width: '60px', marginLeft: '10px' }}
            />
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.9em', 
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              <div>Derivation Path: {getDerivationPath(addressIndex)}</div>
              <div style={{ marginTop: '0.5rem' }}>
                {getPathExplanation(addressIndex)}
              </div>
            </div>
          </div>
          <button
            className="import-button"
            onClick={handleImportWallet}
            disabled={isLoading}
            style={{ marginTop: '1rem' }}
          >
            {isLoading ? 'Importing...' : 'Import Wallet'}
          </button>
          {importError && <p className="warning">{importError}</p>}
        </div>
      )}
    </div>
  );
}; 