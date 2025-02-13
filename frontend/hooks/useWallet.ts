import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet, polygon, bsc, avalanche } from 'viem/chains';
import { WalletState } from '@/types';
import { SUPPORTED_CHAINS } from '@/config/chains';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const { toast } = useToast();
  const [state, setState] = useState<WalletState>(() => {
    // Try to restore connection from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('walletConnection');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          provider: null,
          signer: null
        };
      }
    }
    return {
      connected: false,
      account: '',
      chainId: '',
      balance: {},
      provider: null,
      signer: null
    };
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const isEthereumAvailable = typeof window !== 'undefined' && (window as any).ethereum;

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  const connectWallet = useCallback(async () => {
    if (!isEthereumAvailable) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature",
        variant: "destructive"
      });
      return;
    }

    try {
      if (state.connected) {
        // Disconnect
        setState({
          connected: false,
          account: '',
          chainId: '',
          balance: {},
          provider: null,
          signer: null
        });
        localStorage.removeItem('walletConnection');
        return;
      }

      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom((window as any).ethereum)
      });

      const [address] = await walletClient.requestAddresses();
      const chainId = await walletClient.getChainId();

      const newState = {
        connected: true,
        account: address,
        chainId: `0x${chainId.toString(16)}`,
        provider: publicClient,
        signer: walletClient,
        balance: {}
      };

      setState(newState);
      localStorage.setItem('walletConnection', JSON.stringify({
        connected: true,
        account: address,
        chainId: `0x${chainId.toString(16)}`,
        balance: {}
      }));

      await updateBalances(address);

    } catch (err) {
      console.error('Failed to connect wallet:', err);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive"
      });
      setState({
        connected: false,
        account: '',
        chainId: '',
        balance: {},
        provider: null,
        signer: null
      });
      localStorage.removeItem('walletConnection');
    }
  }, [isEthereumAvailable, publicClient, state.connected, toast]);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      setState({
        connected: false,
        account: '',
        chainId: '',
        balance: {},
        provider: null,
        signer: null
      });
      localStorage.removeItem('walletConnection');
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } else {
      const newAccount = accounts[0];
      setState(prev => ({ ...prev, account: newAccount }));
      await updateBalances(newAccount);
      localStorage.setItem('walletConnection', JSON.stringify({
        connected: true,
        account: newAccount,
        chainId: state.chainId,
        balance: state.balance
      }));
    }
  }, [state.chainId, state.balance, toast]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    setState(prev => ({ ...prev, chainId }));
    if (state.account) {
      await updateBalances(state.account);
      localStorage.setItem('walletConnection', JSON.stringify({
        connected: true,
        account: state.account,
        chainId,
        balance: state.balance
      }));
    }
  }, [state.account, state.balance]);

  const updateBalances = useCallback(async (account: string) => {
    if (!publicClient || !account) return;

    const balances: Record<string, string> = {};
    let hasError = false;

    for (const [chainId, chain] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        const balance = await publicClient.readContract({
          address: chain.tokenAddress as `0x${string}`,
          abi: [{
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function'
          }],
          functionName: 'balanceOf',
          args: [account as `0x${string}`]
        });

        balances[chainId] = balance.toString();
      } catch (err) {
        console.error(`Failed to fetch balance for ${chainId}:`, err);
        balances[chainId] = '0';
        hasError = true;
      }
    }

    setState(prev => ({ ...prev, balance: balances }));
    
    if (hasError) {
      toast({
        title: "Balance Update",
        description: "Some balances could not be retrieved",
        variant: "destructive"
      });
    }
  }, [publicClient, toast]);

  // Initialize connection on mount
  useEffect(() => {
    const initConnection = async () => {
      if (isEthereumAvailable && state.connected) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            await connectWallet();
          } else {
            setState({
              connected: false,
              account: '',
              chainId: '',
              balance: {},
              provider: null,
              signer: null
            });
            localStorage.removeItem('walletConnection');
          }
        } catch (err) {
          console.error('Failed to initialize wallet connection:', err);
        }
      }
      setIsInitializing(false);
    };

    initConnection();
  }, [isEthereumAvailable, connectWallet, state.connected]);

  // Setup event listeners
  useEffect(() => {
    if (isEthereumAvailable && !isInitializing) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isEthereumAvailable, isInitializing, handleAccountsChanged, handleChainChanged]);

  return {
    ...state,
    isInitializing,
    connectWallet,
    updateBalances
  };
}