import { ChainInfo } from '@/types';

export const SUPPORTED_CHAINS: Record<string, ChainInfo> = {
  amoy: {
    id: '0x1f49',
    name: 'Amoy Testnet',
    rpcUrl: process.env.AMOY_RPC_URL || '',
    explorerUrl: 'https://testnet.amoy.xyz/explorer',
    tokenSymbol: 'CRCO',
    tokenAddress: process.env.NEXT_PUBLIC_AMOY_TOKEN_ADDRESS ?? '',
    bridgeAddress: process.env.NEXT_PUBLIC_AMOY_BRIDGE_ADDRESS ?? ''
  },
  sepolia: {
    id: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL || '',
    explorerUrl: 'https://sepolia.etherscan.io',
    tokenSymbol: 'CRCO',
    tokenAddress: process.env.NEXT_PUBLIC_SEPOLIA_TOKEN_ADDRESS ?? '',
    bridgeAddress: process.env.NEXT_PUBLIC_SEPOLIA_BRIDGE_ADDRESS ?? ''
  }
};