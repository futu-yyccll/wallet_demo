import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { updateTokenBalance, sendTokenTransaction } from '../services/tokenService';

interface TransferPageProps {
  wallet: ethers.Wallet;
  onBack: () => void;
}

export const TransferPage: React.FC<TransferPageProps> = ({ wallet, onBack }) => {
  const [balance, setBalance] = useState<string>('0');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [tokenRecipient, setTokenRecipient] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'eth' | 'token'>('eth');
  const [networkError, setNetworkError] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Create a provider instance with multiple fallback RPCs
  const getProvider = () => {
    const rpcUrls = [
      'https://eth-sepolia.public.blastapi.io',
      'https://rpc.sepolia.org',
      'https://rpc2.sepolia.org',
      'https://eth-sepolia.g.alchemy.com/v2/demo'
    ];

    for (const url of rpcUrls) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(url);
        return provider;
      } catch (error) {
        console.warn(`Failed to connect to ${url}, trying next...`);
      }
    }
    throw new Error('Failed to connect to any RPC endpoint');
  };

  const provider = getProvider();

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        try {
          setNetworkError('');
          const connectedWallet = wallet.connect(provider);
          const balance = await connectedWallet.getBalance();
          setBalance(ethers.utils.formatEther(balance));
        } catch (error: any) {
          console.error('Error fetching balance:', error);
          setNetworkError('Failed to connect to the network. Please check your internet connection and try again.');
        }
      }
    };

    fetchBalance();
  }, [wallet]);

  const handleTokenAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value.trim();
    setTokenAddress(address);
    if (wallet && address) {
      try {
        if (!ethers.utils.isAddress(address)) {
          setNetworkError('Invalid token contract address. Please enter a valid Ethereum address.');
          return;
        }
        setNetworkError('');
        const connectedWallet = wallet.connect(provider);
        const { balance, symbol, decimals } = await updateTokenBalance(connectedWallet.address, address);
        setTokenBalance(balance);
        setTokenSymbol(symbol);
        setTokenDecimals(decimals);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setNetworkError('Failed to fetch token information. Please check the contract address and try again.');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !recipient || !amount) return;

    // Validate recipient address
    if (!ethers.utils.isAddress(recipient)) {
      alert('Invalid recipient address. Please enter a valid Ethereum address.');
      return;
    }

    // Validate amount
    try {
      const amountWei = ethers.utils.parseEther(amount);
      if (amountWei.lte(0)) {
        alert('Amount must be greater than 0');
        return;
      }
    } catch (error) {
      alert('Invalid amount. Please enter a valid number.');
      return;
    }

    setIsLoading(true);
    setNetworkError('');
    setShowSuccess(false);
    
    try {
      // Connect wallet to provider
      const connectedWallet = wallet.connect(provider);
      
      // Check if we have enough balance
      const balanceWei = await connectedWallet.getBalance();
      const amountWei = ethers.utils.parseEther(amount);
      
      if (balanceWei.lt(amountWei)) {
        alert('Insufficient balance. Please check your ETH balance.');
        setIsLoading(false);
        return;
      }

      const tx = await connectedWallet.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount)
      });
      
      setTransactionHash(tx.hash);
      setShowSuccess(true);
      await tx.wait();
      
      const balance = await connectedWallet.getBalance();
      setBalance(ethers.utils.formatEther(balance));
      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      let errorMessage = 'Error sending transaction. ';
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        setNetworkError(errorMessage);
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += 'Insufficient funds for gas * price + value';
      } else if (error.code === 'NONCE_EXPIRED') {
        errorMessage += 'Transaction nonce is too low';
      } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
        errorMessage += 'Replacement transaction underpriced';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTokenTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !tokenRecipient || !tokenAmount || !tokenAddress) return;

    // Validate addresses
    if (!ethers.utils.isAddress(tokenAddress.trim())) {
      alert('Invalid token contract address. Please enter a valid Ethereum address.');
      return;
    }
    if (!ethers.utils.isAddress(tokenRecipient.trim())) {
      alert('Invalid recipient address. Please enter a valid Ethereum address.');
      return;
    }

    // Validate amount
    try {
      const amount = ethers.utils.parseUnits(tokenAmount, tokenDecimals);
      if (amount.lte(0)) {
        alert('Amount must be greater than 0');
        return;
      }
    } catch (error) {
      alert('Invalid amount. Please enter a valid number.');
      return;
    }

    setIsLoading(true);
    setNetworkError('');
    setShowSuccess(false);
    
    try {
      const connectedWallet = wallet.connect(provider);
      const tx = await sendTokenTransaction(
        connectedWallet,
        tokenAddress.trim(),
        tokenRecipient.trim(),
        tokenAmount,
        tokenDecimals
      );
      
      setTransactionHash(tx.hash);
      setShowSuccess(true);
      await tx.wait();
      
      const { balance } = await updateTokenBalance(connectedWallet.address, tokenAddress.trim());
      setTokenBalance(balance);
      setTokenRecipient('');
      setTokenAmount('');
    } catch (error: any) {
      console.error('Error sending token transaction:', error);
      let errorMessage = 'Error sending token transaction. ';
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        setNetworkError(errorMessage);
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += 'Insufficient funds for gas * price + value';
      } else if (error.code === 'NONCE_EXPIRED') {
        errorMessage += 'Transaction nonce is too low';
      } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
        errorMessage += 'Replacement transaction underpriced';
      } else if (error.code === 'INVALID_ARGUMENT') {
        errorMessage += 'Invalid address format. Please check the addresses and try again.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
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
        <h2>Transfer Assets</h2>
      </div>

      <div className="wallet-info" style={{
        background: 'var(--card-bg)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>Your Wallet Address:</div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          padding: '8px',
          borderRadius: '4px'
        }}>
          <code style={{ flex: 1, wordBreak: 'break-all' }}>{wallet.address}</code>
          <button 
            onClick={() => copyToClipboard(wallet.address)}
            style={{
              padding: '4px 8px',
              backgroundColor: 'var(--primary-color)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Copy Address
          </button>
        </div>
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.9em', 
          color: 'var(--text-muted)' 
        }}>
          Balance: {balance} ETH
        </div>
      </div>

      {networkError && (
        <div className="error-message" style={{ 
          color: 'red', 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: 'rgba(255, 0, 0, 0.1)', 
          borderRadius: '4px' 
        }}>
          {networkError}
        </div>
      )}

      {showSuccess && (
        <div className="success-message" style={{ 
          color: 'green', 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: 'rgba(0, 255, 0, 0.1)', 
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>Transaction sent successfully!</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            padding: '8px',
            borderRadius: '4px'
          }}>
            <code style={{ flex: 1, wordBreak: 'break-all' }}>{transactionHash}</code>
            <button 
              onClick={() => copyToClipboard(transactionHash)}
              style={{
                padding: '4px 8px',
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Copy Hash
            </button>
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            You can view this transaction on{' '}
            <a 
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)' }}
            >
              Etherscan
            </a>
          </div>
        </div>
      )}

      <div className="transfer-tabs">
        <button
          className={`tab-button ${activeTab === 'eth' ? 'active' : ''}`}
          onClick={() => setActiveTab('eth')}
        >
          Send ETH
        </button>
        <button
          className={`tab-button ${activeTab === 'token' ? 'active' : ''}`}
          onClick={() => setActiveTab('token')}
        >
          Send Token
        </button>
      </div>

      {activeTab === 'eth' && (
        <div className="transfer-form">
          <h3>Send ETH</h3>
          <p>Available Balance: {balance} ETH</p>
          <form onSubmit={handleSendTransaction}>
            <div className="form-group">
              <label>Recipient Address:</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>
            <div className="form-group">
              <label>Amount (ETH):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000000000000000001"
                min="0"
                required
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send ETH'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'token' && (
        <div className="transfer-form">
          <h3>Send Token</h3>
          <div className="form-group">
            <label>Token Contract Address:</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={handleTokenAddressChange}
              placeholder="0x..."
            />
          </div>
          {tokenSymbol && (
            <>
              <p>Available Balance: {tokenBalance} {tokenSymbol}</p>
              <form onSubmit={handleSendTokenTransaction}>
                <div className="form-group">
                  <label>Recipient Address:</label>
                  <input
                    type="text"
                    value={tokenRecipient}
                    onChange={(e) => setTokenRecipient(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount ({tokenSymbol}):</label>
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.000000000000000001"
                    min="0"
                    required
                  />
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : `Send ${tokenSymbol}`}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};