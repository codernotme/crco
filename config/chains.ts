import { ChainInfo } from '@/types';

export const SUPPORTED_CHAINS: Record<string, ChainInfo> = {
  amoy: {
    id: '0x1f49',
    name: 'Amoy Testnet',
    rpcUrl: 'https://testnet.amoy.xyz/rpc',
    explorerUrl: 'https://testnet.amoy.xyz/explorer',
    tokenSymbol: 'CRCO',
    tokenAddress: '0x...',  // Add deployed token address
    bridgeAddress: '0x...'  // Add deployed bridge address
  },
  sepolia: {
    id: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    tokenSymbol: 'CRCO',
    tokenAddress: '0x...',  // Add deployed token address
    bridgeAddress: '0x...'  // Add deployed bridge address
  }
};