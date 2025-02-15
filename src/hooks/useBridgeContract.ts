import { useCallback, useMemo } from 'react';
import { parseEther, formatEther, createPublicClient, http, createWalletClient, custom } from 'viem';
import { useWallet } from '../contexts/WalletContext';
import { Network } from '../contexts/NetworkContext';
import { bridgeABI } from '../contracts/abi/Bridge';
import toast from 'react-hot-toast';

export function useBridgeContract(network: Network) {
  const { account } = useWallet();

  const publicClient = useMemo(() => 
    createPublicClient({
      chain: network.chainId,
      transport: http(network.rpcUrl)
    }),
  [network]);

  const walletClient = useMemo(() => 
    window.ethereum ? createWalletClient({
      chain: network.chainId,
      transport: custom(window.ethereum)
    }) : null,
  [network]);

  const bridgeAddress = useMemo(() => {
    switch (network.id) {
      case 'sepolia':
        return import.meta.env.VITE_SEPOLIA_BRIDGE_ADDRESS;
      case 'amoy':
        return import.meta.env.VITE_AMOY_BRIDGE_ADDRESS;
      default:
        return null;
    }
  }, [network]);

  const lockTokens = useCallback(async (
    tokenAddress: string,
    amount: string,
    targetChainId: number
  ) => {
    if (!account || !walletClient || !bridgeAddress) {
      throw new Error('Wallet not connected or bridge not configured');
    }

    try {
      const parsedAmount = parseEther(amount);
      
      // First approve the bridge contract
      const approvalHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: ['function approve(address spender, uint256 amount) returns (bool)'],
        functionName: 'approve',
        args: [bridgeAddress, parsedAmount]
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalHash });

      // Then lock the tokens
      const hash = await walletClient.writeContract({
        address: bridgeAddress,
        abi: bridgeABI,
        functionName: 'lockTokens',
        args: [tokenAddress, parsedAmount, targetChainId]
      });

      return hash;
    } catch (error) {
      console.error('Error locking tokens:', error);
      throw error;
    }
  }, [account, walletClient, bridgeAddress, publicClient]);

  const unlockTokens = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: string,
    transactionHash: string
  ) => {
    if (!account || !walletClient || !bridgeAddress) {
      throw new Error('Wallet not connected or bridge not configured');
    }

    try {
      const parsedAmount = parseEther(amount);
      
      const hash = await walletClient.writeContract({
        address: bridgeAddress,
        abi: bridgeABI,
        functionName: 'unlockTokens',
        args: [tokenAddress, to, parsedAmount, transactionHash]
      });

      return hash;
    } catch (error) {
      console.error('Error unlocking tokens:', error);
      throw error;
    }
  }, [account, walletClient, bridgeAddress]);

  return {
    lockTokens,
    unlockTokens,
    bridgeAddress
  };
}