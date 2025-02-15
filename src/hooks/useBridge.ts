import { useState, useCallback } from 'react';
import { useBridgeContract } from './useBridgeContract';
import { Network } from '../contexts/NetworkContext';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';

export interface Transaction {
  hash: string;
  from: Network;
  to: Network;
  amount: string;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}

export function useBridge(sourceNetwork: Network, targetNetwork: Network | null) {
  const { account } = useWallet();
  const { lockTokens } = useBridgeContract(sourceNetwork);
  const [isProcessing, setIsProcessing] = useState(false);

  const bridgeTokens = useCallback(async (
    tokenAddress: string,
    amount: string,
  ) => {
    if (!account || !targetNetwork) {
      throw new Error('Wallet not connected or target network not selected');
    }

    setIsProcessing(true);
    const toastId = toast.loading('Initiating bridge transfer...');

    try {
      const hash = await lockTokens(
        tokenAddress,
        amount,
        targetNetwork.chainId
      );

      // Create transaction record
      const transaction: Transaction = {
        hash,
        from: sourceNetwork,
        to: targetNetwork,
        amount,
        token: tokenAddress,
        status: 'pending',
        timestamp: Date.now(),
      };

      toast.success('Bridge transfer initiated!', { id: toastId });
      return transaction;
    } catch (error) {
      console.error('Bridge error:', error);
      toast.error('Bridge transfer failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [account, sourceNetwork, targetNetwork, lockTokens]);

  return {
    bridgeTokens,
    isProcessing
  };
}

export function useTransactionHistory(): Transaction[] {
  // In a real app, this would fetch from an API or local storage
  return [
    {
      hash: '0x1234...5678',
      from: {
        id: 'sepolia',
        name: 'Sepolia',
        chainId: 11155111,
        rpcUrl: 'https://rpc.sepolia.org'
      },
      to: {
        id: 'amoy',
        name: 'Amoy',
        chainId: 80001,
        rpcUrl: 'https://polygon-mumbai.infura.io/v3/YOUR-PROJECT-ID'
      },
      amount: '1.5',
      token: 'ETH',
      status: 'completed',
      timestamp: Date.now() - 3600000
    }
  ];
}