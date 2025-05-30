import { ethers } from 'ethers';

export interface WalletStep {
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
  data?: string;
}

export interface KeyDetails {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface WalletCreationProps {
  mode: 'create' | 'import';
  onComplete: (wallet: ethers.Wallet, mnemonic?: string) => void;
  onBack: () => void;
}

export interface TokenDetails {
  balance: string;
  symbol: string;
  decimals: number;
} 