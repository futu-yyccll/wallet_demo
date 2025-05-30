import { ethers } from 'ethers';
import { TokenDetails } from '../types/wallet';
import { provider } from './walletService';

// ERC20 Token ABI - only the functions we need
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

export const updateTokenBalance = async (
  walletAddress: string,
  tokenAddress: string
): Promise<TokenDetails> => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, symbol, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);

    return {
      balance: ethers.utils.formatUnits(balance, decimals),
      symbol,
      decimals
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw new Error('Failed to fetch token balance. Please check the token address and try again.');
  }
};

export const sendTokenTransaction = async (
  wallet: ethers.Wallet,
  tokenAddress: string,
  recipient: string,
  amount: string,
  decimals: number
): Promise<ethers.ContractTransaction> => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    return tokenContract.transfer(recipient, amountInWei);
  } catch (error) {
    console.error('Error sending token transaction:', error);
    throw new Error('Failed to send token transaction. Please check the details and try again.');
  }
}; 