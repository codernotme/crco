import { useCallback, useMemo } from 'react';
import { parseEther, createPublicClient, http, createWalletClient, custom, Chain } from 'viem';
import { useWallet } from '../contexts/WalletContext';
import { Network } from '../contexts/NetworkContext';
import { bridgeABI } from '../contracts/abi/Bridge';

export function useBridgeContract(network: Network | null) {
  const { account } = useWallet();

  const client = useMemo(() => {
    if (!network) return null;
    
    return createPublicClient({
      chain: {
          id: network.chainId,
        name: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: {
          default: {
            http: [network.rpcUrl],
          },
          public: {
            http: [network.rpcUrl],
          },
        },
      } as Chain,
      transport: http(),
    });
  }, [network]);

  const walletClient = useMemo(() => 
    window.ethereum ? createWalletClient({
      chain: { id: network?.chainId } as unknown as Chain,
      transport: custom(window.ethereum)
    }) : null,
  [network]);

  const bridgeAddress = useMemo(() => {
    switch (network?.id) {
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
        address: tokenAddress as `0x${string}`,
        abi: ['function approve(address spender, uint256 amount) returns (bool)'],
        functionName: 'approve',
        args: [bridgeAddress, parsedAmount],
        account: null
      });

      await client?.waitForTransactionReceipt({ hash: approvalHash });

      // Then lock the tokens
      const hash = await walletClient.writeContract({
        address: bridgeAddress,
        abi: bridgeABI,
        functionName: 'lockTokens',
        args: [tokenAddress as `0x${string}`, parsedAmount, BigInt(targetChainId)],
        account: null
      });

      return hash;
    } catch (error) {
      console.error('Error locking tokens:', error);
      throw error;
    }
  }, [account, walletClient, bridgeAddress, client]);

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
        args: [tokenAddress as `0x${string}`, to as `0x${string}`, parsedAmount, transactionHash as `0x${string}`],
        account: null
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