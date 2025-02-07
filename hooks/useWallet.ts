import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet, polygon, bsc, avalanche } from 'viem/chains';
import { WalletState, TransferReceipt } from '@/types';
import { SUPPORTED_CHAINS } from '@/config/chains';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: '',
    chainId: '',
    balance: {},
    provider: null,
    signer: null
  });

  const isEthereumAvailable = typeof window !== 'undefined' && (window as any).ethereum;

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  const connectWallet = useCallback(async () => {
    if (!isEthereumAvailable) {
      console.error('MetaMask not detected');
      return;
    }

    try {
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom((window as any).ethereum)
      });

      const [address] = await walletClient.requestAddresses();
      const chainId = await walletClient.getChainId();

      setState(prev => ({
        ...prev,
        connected: true,
        account: address,
        chainId: `0x${chainId.toString(16)}`,
        provider: publicClient,
        signer: walletClient
      }));

      await updateBalances(address);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  }, [isEthereumAvailable, publicClient]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!isEthereumAvailable) return;

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
        if (chain) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chain.id,
              rpcUrls: [chain.rpcUrl],
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              blockExplorerUrls: [chain.explorerUrl]
            }],
          });
        }
      }
    }
  }, [isEthereumAvailable]);

  const updateBalances = useCallback(async (account: string) => {
    if (!publicClient) return;

    const balances: Record<string, string> = {};

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
      }
    }

    setState(prev => ({ ...prev, balance: balances }));
  }, [publicClient]);

  const initiateTransfer = useCallback(async (
    recipient: string,
    amount: string,
    sourceChain: string,
    destinationChain: string,
    isNFT: boolean = false,
    tokenId?: string
  ) => {
    if (!state.signer || !SUPPORTED_CHAINS[sourceChain]) {
      throw new Error('Wallet not connected or invalid chain');
    }

    await switchNetwork(SUPPORTED_CHAINS[sourceChain].id);

    const bridgeAddress = SUPPORTED_CHAINS[sourceChain].bridgeAddress;
    
    try {
      const { request } = await publicClient.simulateContract({
        address: bridgeAddress as `0x${string}`,
        abi: [{
          inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'destinationChain', type: 'uint256' },
            { name: 'isNFT', type: 'bool' },
            { name: 'tokenId', type: 'uint256' }
          ],
          name: 'initiateTransfer',
          outputs: [],
          stateMutability: 'payable',
          type: 'function'
        }],
        functionName: 'initiateTransfer',
        args: [
          recipient as `0x${string}`,
          BigInt(amount),
          BigInt(parseInt(SUPPORTED_CHAINS[destinationChain].id, 16)),
          isNFT,
          BigInt(tokenId || 0)
        ],
        account: state.account as `0x${string}`
      });

      const hash = await (state.signer as any).writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return receipt;
    } catch (err) {
      console.error('Transfer failed:', err);
      throw new Error('Transfer failed');
    }
  }, [state.signer, state.account, switchNetwork, publicClient]);

  useEffect(() => {
    if (!isEthereumAvailable) return;

    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState({
          connected: false,
          account: '',
          chainId: '',
          balance: {},
          provider: null,
          signer: null
        });
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
        updateBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
      if (state.account) {
        updateBalances(state.account);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isEthereumAvailable, state.account, updateBalances]);

  return {
    ...state,
    connectWallet,
    updateBalances,
    switchNetwork,
    initiateTransfer
  };
}