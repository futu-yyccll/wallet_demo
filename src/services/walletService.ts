import { ethers } from 'ethers';
import { WalletStep } from '../types/wallet';

// Use a public RPC URL as fallback
const FALLBACK_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/demo';
export const SEPOLIA_RPC_URL = process.env.REACT_APP_RPC_URL || FALLBACK_RPC_URL;

// Create provider with error handling
let provider: ethers.providers.JsonRpcProvider;

try {
  provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
  // Test the connection
  provider.getNetwork().catch(error => {
    console.warn('Failed to connect to primary RPC URL, using fallback:', error);
    provider = new ethers.providers.JsonRpcProvider(FALLBACK_RPC_URL);
  });
} catch (error) {
  console.warn('Error initializing provider, using fallback:', error);
  provider = new ethers.providers.JsonRpcProvider(FALLBACK_RPC_URL);
}

export { provider };

export const initializeWalletSteps = (mode: 'create' | 'import'): WalletStep[] => {
  if (mode === 'create') {
    return [
      {
        title: 'Generating mnemonic phrase',
        description: 'Creating a secure random mnemonic phrase for your wallet',
        status: 'pending'
      },
      {
        title: 'Deriving private key',
        description: 'Generating your private key from the mnemonic phrase',
        status: 'pending'
      },
      {
        title: 'Generating public address',
        description: 'Creating your public Ethereum address from the private key',
        status: 'pending'
      }
    ];
  }

  return [
    {
      title: 'Validating mnemonic phrase',
      description: 'Checking if your mnemonic phrase is valid',
      status: 'pending'
    },
    {
      title: 'Deriving private key',
      description: 'Generating your private key from the mnemonic phrase',
      status: 'pending'
    },
    {
      title: 'Generating public address',
      description: 'Creating your public Ethereum address from the private key',
      status: 'pending'
    }
  ];
};

export const updateStepStatus = (
  steps: WalletStep[],
  stepTitle: string,
  newStatus: WalletStep['status']
): WalletStep[] => {
  return steps.map(step => 
    step.title === stepTitle 
      ? { ...step, status: newStatus }
      : step
  );
};

export const createWallet = async () => {
  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic.phrase;
  return { wallet, mnemonic };
};

export const importWallet = async (mnemonic: string) => {
  if (!ethers.utils.isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }
  return ethers.Wallet.fromMnemonic(mnemonic);
}; 