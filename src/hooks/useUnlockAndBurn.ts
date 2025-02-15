import { useCallback, useState } from 'react';
import { createPublicClient, http, createWalletClient, custom, Chain, parseEther } from 'viem';
import { useWallet } from '../contexts/WalletContext';
import { Network } from '../contexts/NetworkContext';
import toast from 'react-hot-toast';

export function useUnlockAndBurn(network: Network) {
  const { account } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const unlockAndBurn = useCallback(async (
    wrappedTokenAddress: string,
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

    const unlockAndBurnAddress = import.meta.env.VITE_UNLOCK_AND_BURN_ADDRESS;
    if (!unlockAndBurnAddress) {
      throw new Error('Unlock and Burn contract address not configured');
    }

    setIsProcessing(true);
    const toastId = toast.loading('Initiating Unlock & Burn...');

    try {
      const parsedAmount = parseEther(amount);

      // First approve the contract
      const approvalHash = await walletClient.writeContract({
        address: wrappedTokenAddress as `0x${string}`,
        abi: ['function approve(address spender, uint256 amount) returns (bool)'],
        functionName: 'approve',
        args: [unlockAndBurnAddress as `0x${string}`, parsedAmount],
        account: account as `0x${string}`
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalHash });

      // Then unlock and burn
      const hash = await walletClient.writeContract({
        address: unlockAndBurnAddress as `0x${string}`,
        abi: [
          'function unlockAndBurn(address wrappedAsset, uint8 assetType, uint256 amount, uint256 tokenId) external'
        ],
        functionName: 'unlockAndBurn',
        args: [
          wrappedTokenAddress as `0x${string}`,
          0, // AssetType.ERC20
          parsedAmount,
          0n // tokenId (not used for ERC20)
        ],
        account: account as `0x${string}`
      });

      toast.success('Unlock & Burn initiated!', { id: toastId });
      return hash;
    } catch (error) {
      console.error('Unlock & Burn error:', error);
      toast.error('Unlock & Burn failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [account, network]);

  return {
    unlockAndBurn,
    isProcessing
  };
}