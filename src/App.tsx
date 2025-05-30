import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { updateTokenBalance, sendTokenTransaction } from './services/tokenService';
import { provider } from './services/walletService';
import { WalletCreationPage } from './components/WalletCreationPage';
import { BTCAddressGenerator } from './components/BTCAddressGenerator';
import { TransferPage } from './components/TransferPage';
import './App.css';

// ERC20 Token ABI - only the functions we need
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

type Page = 'index' | 'create' | 'import' | 'btc' | 'transfer';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('index');
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [tokenRecipient, setTokenRecipient] = useState<string>('');

  useEffect(() => {
    if (wallet) {
      provider.getBalance(wallet.address).then(balance => {
        setBalance(ethers.utils.formatEther(balance));
      });
    }
  }, [wallet]);

  const handleWalletCreated = (newWallet: ethers.Wallet, newMnemonic?: string) => {
    setWallet(newWallet);
    if (newMnemonic) {
      setMnemonic(newMnemonic);
    }
    setCurrentPage('index');
  };

  const handleWalletImported = (newWallet: ethers.Wallet, _mnemonic?: string) => {
    setWallet(newWallet);
    setCurrentPage('index');
  };

  const handleTokenAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setTokenAddress(address);
    if (wallet && address) {
      try {
        const { balance, symbol, decimals } = await updateTokenBalance(wallet.address, address);
        setTokenBalance(balance);
        setTokenSymbol(symbol);
        setTokenDecimals(decimals);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    }
  };

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !recipient || !amount) return;

    setIsLoading(true);
    try {
      const tx = await wallet.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      const balance = await provider.getBalance(wallet.address);
      setBalance(ethers.utils.formatEther(balance));
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Error sending transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTokenTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !tokenRecipient || !tokenAmount || !tokenAddress) return;

    setIsLoading(true);
    try {
      const tx = await sendTokenTransaction(
        wallet,
        tokenAddress,
        tokenRecipient,
        tokenAmount,
        tokenDecimals
      );
      await tx.wait();
      const { balance } = await updateTokenBalance(wallet.address, tokenAddress);
      setTokenBalance(balance);
      setTokenRecipient('');
      setTokenAmount('');
    } catch (error) {
      console.error('Error sending token transaction:', error);
      alert('Error sending token transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return (
          <WalletCreationPage
            mode="create"
            onComplete={handleWalletCreated}
            onBack={() => setCurrentPage('index')}
          />
        );
      case 'import':
        return (
          <WalletCreationPage
            mode="import"
            onComplete={handleWalletImported}
            onBack={() => setCurrentPage('index')}
          />
        );
      case 'btc':
        return (
          <BTCAddressGenerator
            onBack={() => setCurrentPage('index')}
          />
        );
      case 'transfer':
        return wallet ? (
          <TransferPage
            wallet={wallet}
            onBack={() => setCurrentPage('index')}
          />
        ) : null;
      default:
        return (
          <div className="index-page">
            <h1>FUTU Wallet Demo</h1>
            <div className="button-group">
              <button onClick={() => setCurrentPage('create')}>
                Create New Wallet
              </button>
              <button onClick={() => setCurrentPage('import')}>
                Import Existing Wallet
              </button>
              <button onClick={() => setCurrentPage('btc')}>
                Generate BTC Address
              </button>
            </div>
            {wallet && (
              <div className="wallet-info">
                <h2>Current Wallet</h2>
                <p>Address: {wallet.address}</p>
                <p>Balance: {balance} ETH</p>
                {mnemonic && (
                  <div className="mnemonic-info">
                    <h3>Mnemonic Phrase:</h3>
                    <p>{mnemonic}</p>
                  </div>
                )}
                <button 
                  onClick={() => setCurrentPage('transfer')}
                  style={{ marginTop: '1rem' }}
                >
                  Transfer Assets
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App; 