import { useState, useEffect } from 'react';
import { WalletState } from '@/types';
import { SUPPORTED_CHAINS } from '@/config/chains';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: '',
    chainId: '',
    balance: {}
  });

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        setState(prev => ({
          ...prev,
          connected: true,
          account: accounts[0],
          chainId
        }));

        await updateBalances(accounts[0]);
      } else {
        throw new Error('Please install MetaMask!');
      }
    } catch (err) {
      throw new Error('Failed to connect wallet');
    }
  };

  const updateBalances = async (account: string) => {
    const balances: Record<string, string> = {};
    
    for (const [chainId, chain] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
        const tokenContract = new ethers.Contract(
          chain.tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await tokenContract.balanceOf(account);
        balances[chainId] = ethers.utils.formatUnits(balance, 18);
      } catch (err) {
        console.error(`Failed to fetch balance for ${chainId}:`, err);
        balances[chainId] = '0';
      }
    }

    setState(prev => ({ ...prev, balance: balances }));
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setState({
            connected: false,
            account: '',
            chainId: '',
            balance: {}
          });
        } else {
          setState(prev => ({
            ...prev,
            account: accounts[0]
          }));
          updateBalances(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setState(prev => ({ ...prev, chainId }));
        if (state.account) {
          updateBalances(state.account);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return {
    ...state,
    connectWallet,
    updateBalances
  };
}