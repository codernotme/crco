import { createPublicClient, createWalletClient, custom, http, parseUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { CONTRACTS } from '@/constants/contracts';

interface TransferParams {
  account: string;
  amount: string;
  sourceChain: keyof typeof CONTRACTS;
  destinationChain: keyof typeof CONTRACTS;
  isNFT: boolean;
  tokenId?: string;
}

export async function initiateTransfer({
  account,
  amount,
  sourceChain,
  destinationChain,
  isNFT,
  tokenId
}: TransferParams) {
  if (!account) throw new Error('Wallet not connected');

  const contractAddress = CONTRACTS[sourceChain];
  if (!contractAddress) throw new Error(`Unsupported source chain: ${sourceChain}`);

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: mainnet,
    transport: custom((window as any).ethereum)
  });

  try {
    if (isNFT && tokenId) {
      const { request } = await publicClient.simulateContract({
        address: contractAddress as `0x${string}`,
        abi: [{
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' }
          ],
          name: 'safeTransferFrom',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        }],
        functionName: 'safeTransferFrom',
        args: [account as `0x${string}`, account as `0x${string}`, BigInt(tokenId)],
        account: account as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    } else {
      const { request } = await publicClient.simulateContract({
        address: contractAddress as `0x${string}`,
        abi: [{
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function'
        }],
        functionName: 'transfer',
        args: [account as `0x${string}`, parseUnits(amount, 18)],
        account: account as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    }
  } catch (error) {
    console.error('Transfer failed:', error);
    throw new Error('Transaction failed');
  }
}