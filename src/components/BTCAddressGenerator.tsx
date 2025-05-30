import React, { useState } from 'react';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

interface BTCAddressGeneratorProps {
  onBack: () => void;
}

type AddressType = 'legacy' | 'segwit' | 'native-segwit' | 'taproot';

interface AddressInfo {
  type: AddressType;
  address: string;
  derivationPath: string;
}

const btcSteps = [
  {
    title: 'Generate Entropy',
    description: 'Create a random 128-bit entropy (16 bytes) for address generation.'
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
    title: 'Derive Master Keys',
    description: 'Generate master extended private key (xprv) and public key (xpub) from the seed.'
  },
  {
    title: 'Derive Account Keys',
    description: 'Derive account-level extended keys using the purpose field.'
  },
  {
    title: 'Derive Address Keys',
    description: 'Generate address-specific keys and different types of Bitcoin addresses.'
  }
];

const getDerivationPath = (type: AddressType, index: number): string => {
  switch (type) {
    case 'legacy':
      return `m/44'/0'/0'/0/${index}`;
    case 'segwit':
      return `m/49'/0'/0'/0/${index}`;
    case 'native-segwit':
      return `m/84'/0'/0'/0/${index}`;
    case 'taproot':
      return `m/86'/0'/0'/0/${index}`;
    default:
      return `m/44'/0'/0'/0/${index}`;
  }
};

const getPathExplanation = (type: AddressType, index: number): string => {
  const basePath = getDerivationPath(type, index);
  const purpose = type === 'legacy' ? "44'" : 
                 type === 'segwit' ? "49'" :
                 type === 'native-segwit' ? "84'" : "86'";
  
  return `${basePath}\n` +
    `├── m: master key\n` +
    `├── ${purpose}: BIP${purpose} purpose\n` +
    `├── 0': Bitcoin coin type\n` +
    `├── 0': account index\n` +
    `├── 0: change (0 for receiving)\n` +
    `└── ${index}: address index`;
};

export const BTCAddressGenerator: React.FC<BTCAddressGeneratorProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsData, setStepsData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [entropyHex, setEntropyHex] = useState('');
  const [addressIndex, setAddressIndex] = useState(0);
  const [selectedAddressType, setSelectedAddressType] = useState<AddressType>('legacy');
  const [masterXprv, setMasterXprv] = useState('');
  const [masterXpub, setMasterXpub] = useState('');
  const [accountXprv, setAccountXprv] = useState('');
  const [accountXpub, setAccountXpub] = useState('');

  // Helper function to convert hex to binary
  const hexToBinary = (hex: string): string => {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
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
      binary: index.toString(2).padStart(11, '0')
    };
  };

  const deriveAddress = (publicKey: Buffer, type: AddressType): string => {
    const network = bitcoin.networks.bitcoin;
    
    try {
      switch (type) {
        case 'legacy': {
          const { address } = bitcoin.payments.p2pkh({ 
            pubkey: publicKey,
            network 
          });
          return address || '';
        }
        case 'segwit': {
          const { address } = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ 
              pubkey: publicKey,
              network 
            }),
            network
          });
          return address || '';
        }
        case 'native-segwit': {
          const { address } = bitcoin.payments.p2wpkh({ 
            pubkey: publicKey,
            network 
          });
          return address || '';
        }
        case 'taproot': {
          // For demo purposes, we'll use a mock Taproot address
          // In a real implementation, you would use proper Taproot derivation
          return 'bc1p' + publicKey.slice(1, 33).toString('hex').slice(0, 40);
        }
        default:
          return '';
      }
    } catch (error) {
      console.error('Error deriving address:', error);
      return 'Error deriving address';
    }
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    setError('');
    try {
      let newStepsData = [...stepsData];
      switch (currentStep) {
        case 0: // Generate entropy
          const entropy = ethers.utils.randomBytes(16);
          const entropyHexValue = ethers.utils.hexlify(entropy);
          const entropyBinary = hexToBinary(entropyHexValue);
          setEntropyHex(entropyHexValue);
          newStepsData[0] = `Hex: ${entropyHexValue}\nBinary: ${entropyBinary}`;
          break;
        case 1: // Calculate checksum
          const entropyBytes = ethers.utils.arrayify(entropyHex);
          const entropyHash = ethers.utils.sha256(entropyBytes);
          const checksum = entropyHash.slice(2, 4);
          const checksumBinary = hexToBinary(checksum);
          newStepsData[1] = `Entropy Hash: ${entropyHash}\nChecksum (first byte): ${checksum}\nChecksum Binary: ${checksumBinary}`;
          break;
        case 2: // Generate mnemonic
          const entropyBytes2 = ethers.utils.arrayify(entropyHex);
          const mnemonicPhrase = bip39.entropyToMnemonic(Buffer.from(entropyBytes2));
          const words = mnemonicPhrase.split(' ');
          const formattedMnemonic = words.map((word, i) => {
            const { index, binary } = getWordBinary(word);
            return `${i + 1}. ${word} (${index.toString().padStart(4)} = ${binary})`;
          }).join('\n');
          newStepsData[2] = formattedMnemonic;
          break;
        case 3: // Derive seed
          const seed = await bip39.mnemonicToSeed(stepsData[2]);
          newStepsData[3] = '0x' + Buffer.from(seed).toString('hex');
          break;
        case 4: // Derive master keys
          const hdNode = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const masterXprvValue = hdNode.extendedKey;
          const masterXpubValue = hdNode.neuter().extendedKey;
          setMasterXprv(masterXprvValue);
          setMasterXpub(masterXpubValue);
          newStepsData[4] = [
            'Master Extended Private Key (xprv):',
            masterXprvValue,
            '',
            'Master Extended Public Key (xpub):',
            masterXpubValue,
            '',
            'Note: The xprv can derive all child keys, while the xpub can only derive public keys.'
          ].join('\n');
          break;
        case 5: // Derive account keys
          const hdNode2 = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const purpose = selectedAddressType === 'legacy' ? "44'" : 
                         selectedAddressType === 'segwit' ? "49'" :
                         selectedAddressType === 'native-segwit' ? "84'" : "86'";
          const accountPath = `m/${purpose}/0'/0'`;
          const accountNode = hdNode2.derivePath(accountPath);
          const accountXprvValue = accountNode.extendedKey;
          const accountXpubValue = accountNode.neuter().extendedKey;
          setAccountXprv(accountXprvValue);
          setAccountXpub(accountXpubValue);
          newStepsData[5] = [
            `Account Path: ${accountPath}`,
            '',
            'Account Extended Private Key (xprv):',
            accountXprvValue,
            '',
            'Account Extended Public Key (xpub):',
            accountXpubValue,
            '',
            'Note: Account-level keys can derive all addresses for this account.'
          ].join('\n');
          break;
        case 6: // Derive address keys
          const hdNode3 = ethers.utils.HDNode.fromSeed(stepsData[3]);
          const derivedNode = hdNode3.derivePath(getDerivationPath(selectedAddressType, addressIndex));
          const publicKey = Buffer.from(derivedNode.publicKey.slice(2), 'hex');
          
          const addresses: AddressInfo[] = [
            { type: 'legacy', address: deriveAddress(publicKey, 'legacy'), derivationPath: getDerivationPath('legacy', addressIndex) },
            { type: 'segwit', address: deriveAddress(publicKey, 'segwit'), derivationPath: getDerivationPath('segwit', addressIndex) },
            { type: 'native-segwit', address: deriveAddress(publicKey, 'native-segwit'), derivationPath: getDerivationPath('native-segwit', addressIndex) },
            { type: 'taproot', address: deriveAddress(publicKey, 'taproot'), derivationPath: getDerivationPath('taproot', addressIndex) }
          ];
          
          newStepsData[6] = [
            `Address Path: ${getDerivationPath(selectedAddressType, addressIndex)}`,
            '',
            `Private Key: ${derivedNode.privateKey}`,
            '',
            `Public Key: ${derivedNode.publicKey}`,
            '',
            'Generated Addresses:',
            ...addresses.map(addr => [
              `${addr.type.toUpperCase()} Address:`,
              `Derivation Path: ${addr.derivationPath}`,
              `Address: ${addr.address}`,
              ''
            ].join('\n'))
          ].join('\n');
          break;
        default:
          break;
      }
      setStepsData(newStepsData);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      setError('Error during BTC address generation: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle address index change
  const handleAddressIndexChange = (newIndex: number) => {
    setAddressIndex(newIndex);
    if (currentStep >= 4) {
      const hdNode = ethers.utils.HDNode.fromSeed(stepsData[3]);
      const derivedNode = hdNode.derivePath(getDerivationPath(selectedAddressType, newIndex));
      let newStepsData = [...stepsData];
      
      if (currentStep >= 4) {
        newStepsData[4] = [
          'Master Extended Private Key (xprv):',
          masterXprv,
          '',
          'Master Extended Public Key (xpub):',
          masterXpub,
          '',
          'Note: The xprv can derive all child keys, while the xpub can only derive public keys.'
        ].join('\n');
      }
      if (currentStep >= 5) {
        const purpose = selectedAddressType === 'legacy' ? "44'" : 
                       selectedAddressType === 'segwit' ? "49'" :
                       selectedAddressType === 'native-segwit' ? "84'" : "86'";
        const accountPath = `m/${purpose}/0'/0'`;
        newStepsData[5] = [
          `Account Path: ${accountPath}`,
          '',
          'Account Extended Private Key (xprv):',
          accountXprv,
          '',
          'Account Extended Public Key (xpub):',
          accountXpub,
          '',
          'Note: Account-level keys can derive all addresses for this account.'
        ].join('\n');
      }
      if (currentStep >= 6) {
        const publicKey = Buffer.from(derivedNode.publicKey.slice(2), 'hex');
        const addresses: AddressInfo[] = [
          { type: 'legacy', address: deriveAddress(publicKey, 'legacy'), derivationPath: getDerivationPath('legacy', newIndex) },
          { type: 'segwit', address: deriveAddress(publicKey, 'segwit'), derivationPath: getDerivationPath('segwit', newIndex) },
          { type: 'native-segwit', address: deriveAddress(publicKey, 'native-segwit'), derivationPath: getDerivationPath('native-segwit', newIndex) },
          { type: 'taproot', address: deriveAddress(publicKey, 'taproot'), derivationPath: getDerivationPath('taproot', newIndex) }
        ];
        
        newStepsData[6] = [
          `Address Path: ${getDerivationPath(selectedAddressType, newIndex)}`,
          '',
          `Private Key: ${derivedNode.privateKey}`,
          '',
          `Public Key: ${derivedNode.publicKey}`,
          '',
          'Generated Addresses:',
          ...addresses.map(addr => [
            `${addr.type.toUpperCase()} Address:`,
            `Derivation Path: ${addr.derivationPath}`,
            `Address: ${addr.address}`,
            ''
          ].join('\n'))
        ].join('\n');
      }
      setStepsData(newStepsData);
    }
  };

  return (
    <div className="wallet-creation-page">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Generate BTC Address</h2>
      </div>

      <div className="btc-address-generator">
        <div className="creation-steps">
          {btcSteps.map((step, idx) => (
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
                      <label>Address Type: </label>
                      <select
                        value={selectedAddressType}
                        onChange={(e) => setSelectedAddressType(e.target.value as AddressType)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      >
                        <option value="legacy">Legacy (P2PKH)</option>
                        <option value="segwit">SegWit (P2SH-P2WPKH)</option>
                        <option value="native-segwit">Native SegWit (P2WPKH)</option>
                        <option value="taproot">Taproot (P2TR)</option>
                      </select>
                      <label style={{ marginLeft: '20px' }}>Address Index: </label>
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

        {currentStep < btcSteps.length && (
          <button 
            onClick={handleNextStep} 
            disabled={isLoading}
            className="generate-button"
          >
            {isLoading ? 'Processing...' : 
             stepsData.length === 0 ? 'Start' : 'Next'}
          </button>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}; 