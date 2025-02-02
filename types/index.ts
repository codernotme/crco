import { ethers } from 'ethers';

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  sourceChain: string;
  destinationChain: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  isNFT?: boolean;
  tokenId?: number;
  proof?: string[];
}

export interface TransferReceipt {
  transferId: string;
  sender: string;
  recipient: string;
  amount: string;
  timestamp: number;
  isNFT: boolean;
  tokenId: number;
}

export interface ChainInfo {
  id: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  tokenSymbol: string;
  tokenAddress: string;
  bridgeAddress: string;
}

export interface WalletState {
  connected: boolean;
  account: string;
  chainId: string;
  balance: Record<string, string>;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

export interface TransferState {
  amount: string;
  sourceChain: string;
  destinationChain: string;
  loading: boolean;
  error: string | null;
  isNFT?: boolean;
  tokenId?: number;
}