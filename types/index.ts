export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  sourceChain: string;
  destinationChain: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
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
}

export interface TransferState {
  amount: string;
  sourceChain: string;
  destinationChain: string;
  loading: boolean;
  error: string | null;
}