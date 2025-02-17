import React, { createContext, useContext, useState, useEffect } from 'react';

declare global {
  interface Window {
    ethereum: {
      request: (args: { method: string; params?: any[] }) => Promise<string[]>;
      on: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener: (event: string, handler: () => void) => void;
    };
  }
}

interface WalletContextType {
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  balance: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  const fetchBalance = async (account: string) => {
    if (!window.ethereum) return;
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
      setBalance(balance[0]);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      await fetchBalance(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) {
          fetchBalance(accounts[0]);
        } else {
          setBalance(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, connect, disconnect, isConnecting, balance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}