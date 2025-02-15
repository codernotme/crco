import { useCallback, useState } from 'react';
import { createPublicClient, http, createWalletClient, custom, Chain, parseEther } from 'viem';
import { useWallet } from '../contexts/WalletContext';
import { Network } from '../contexts/NetworkContext';
import toast from 'react-hot-toast';

export function useLockAndMint(network: Network) {
  const { account } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const lockAndMint = useCallback(async (
    tokenAddress: string,
    amount: string,
    targetChainId: number
  ) => {
    if (!account || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    const publicClient = createPublicClient({
      chain: { id: network.chainId } as Chain,
      transport: http(network.rpcUrl)
    });

    const walletClient = createWalletClient({
      chain: { id: network.chainId } as Chain,
      transport: custom(window.ethereum)
    });

    const lockAndMintAddress = import.meta.env.VITE_LOCK_AND_MINT_ADDRESS;
    if (!lockAndMintAddress) {
      throw new Error('Lock and Mint contract address not configured');
    }

    setIsProcessing(true);
    const toastId = toast.loading('Initiating Lock & Mint...');

    try {
      const parsedAmount = parseEther(amount);

      // First approve the contract
      const approvalHash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ['function approve(address spender, uint256 amount) returns (bool)'],
        functionName: 'approve',
        args: [lockAndMintAddress as `0x${string}`, parsedAmount],
        account: account as `0x${string}`
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalHash });

      // Then lock and mint
      const hash = await walletClient.writeContract({
        address: lockAndMintAddress as `0x${string}`,
        abi: [
          'function lockAndMint(address asset, uint8 assetType, uint256 amount, uint256 tokenId, address receiver) external'
        ],
        functionName: 'lockAndMint',
        args: [
          tokenAddress as `0x${string}`,
          0, // AssetType.ERC20
          parsedAmount,
          0n, // tokenId (not used for ERC20)
          account as `0x${string}`
        ],
        account: account as `0x${string}`
      });

      toast.success('Lock & Mint initiated!', { id: toastId });
      return hash;
    } catch (error) {
      console.error('Lock & Mint error:', error);
      toast.error('Lock & Mint failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [account, network]);

  return {
    lockAndMint,
    isProcessing
  };
}