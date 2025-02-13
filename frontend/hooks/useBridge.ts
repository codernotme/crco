import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { useToast } from './use-toast';
import { SUPPORTED_CHAINS } from '@/config/chains';

export function useBridge() {
  const { provider, account } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const lockTokens = useCallback(async (
    chainId: string,
    amount: string
  ) => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const bridgeContract = new Contract(
        SUPPORTED_CHAINS[chainId].bridgeAddress,
        ['function lockTokens(address,uint256) external'],
        provider
      );

      const tx = await bridgeContract.lockTokens(
        SUPPORTED_CHAINS[chainId].tokenAddress,
        amount
      );

      await tx.wait();

      toast({
        title: 'Tokens Locked',
        description: 'Your tokens have been successfully locked in the bridge contract.',
      });
    } catch (error) {
      console.error('Lock tokens failed:', error);
      toast({
        title: 'Lock Failed',
        description: error instanceof Error ? error.message : 'Failed to lock tokens',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, toast]);

  const unlockTokens = useCallback(async (
    chainId: string,
    recipient: string,
    amount: string
  ) => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const bridgeContract = new Contract(
        SUPPORTED_CHAINS[chainId].bridgeAddress,
        ['function unlockTokens(address,address,uint256) external'],
        provider
      );

      const tx = await bridgeContract.unlockTokens(
        SUPPORTED_CHAINS[chainId].tokenAddress,
        recipient,
        amount
      );

      await tx.wait();

      toast({
        title: 'Tokens Unlocked',
        description: 'Your tokens have been successfully unlocked and transferred.',
      });
    } catch (error) {
      console.error('Unlock tokens failed:', error);
      toast({
        title: 'Unlock Failed',
        description: error instanceof Error ? error.message : 'Failed to unlock tokens',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, toast]);

  const initiateTransfer = useCallback(async (
    sourceChain: string,
    destinationChain: string,
    recipient: string,
    amount: string,
    isNFT: boolean = false,
    tokenId?: string
  ) => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const bridgeContract = new Contract(
        SUPPORTED_CHAINS[sourceChain].bridgeAddress,
        ['function initiateTransfer(address,address,uint256,bool,uint256) external'],
        provider
      );

      const tx = await bridgeContract.initiateTransfer(
        SUPPORTED_CHAINS[sourceChain].tokenAddress,
        recipient,
        amount,
        isNFT,
        tokenId || 0
      );

      await tx.wait();

      toast({
        title: 'Transfer Initiated',
        description: 'Your cross-chain transfer has been initiated successfully.',
      });
    } catch (error) {
      console.error('Transfer initiation failed:', error);
      toast({
        title: 'Transfer Failed',
        description: error instanceof Error ? error.message : 'Failed to initiate transfer',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, toast]);

  return {
    loading,
    lockTokens,
    unlockTokens,
    initiateTransfer
  };
}