import React, { createContext, useContext, useState } from 'react';

export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
}

const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 'sepolia',
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
  },
  {
    id: 'amoy',
    name: 'Amoy',
    chainId: 80001,
    rpcUrl: 'https://polygon-mumbai.infura.io/v3/YOUR-PROJECT-ID',
  },
];

interface NetworkContextType {
  networks: Network[];
  selectedNetwork: Network | null;
  setSelectedNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(SUPPORTED_NETWORKS[0]);

  return (
    <NetworkContext.Provider
      value={{
        networks: SUPPORTED_NETWORKS,
        selectedNetwork,
        setSelectedNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}