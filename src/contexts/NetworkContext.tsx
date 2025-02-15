import React, { createContext, useContext, useState } from 'react';

export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  type: 'ERC20' | 'ERC721';
  address: {
    [networkId: string]: `0x${string}`;
  };
}

const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 'sepolia',
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 'amoy',
    name: 'Amoy',
    chainId: 80001,
    rpcUrl: import.meta.env.VITE_AMOY_RPC_URL,
    explorerUrl: 'https://testnet.amoy.xyz/explorer',
    nativeCurrency: {
      name: 'Amoy Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
];

export const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    type: 'ERC20',
    address: {
      sepolia: import.meta.env.VITE_ETH_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_ETH_ADDRESS_AMOY as `0x${string}`,
    },
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    type: 'ERC20',
    address: {
      sepolia: import.meta.env.VITE_USDC_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_USDC_ADDRESS_AMOY as `0x${string}`,
    },
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    type: 'ERC20',
    address: {
      sepolia: import.meta.env.VITE_USDT_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_USDT_ADDRESS_AMOY as `0x${string}`,
    },
  },
  {
    symbol: 'BAYC',
    name: 'Bored Ape Yacht Club',
    icon: 'https://cryptologos.cc/logos/bored-ape-yacht-club-bayc-logo.svg',
    type: 'ERC721',
    address: {
      sepolia: import.meta.env.VITE_BAYC_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_BAYC_ADDRESS_AMOY as `0x${string}`,
    },
  },
  {
    symbol: 'PUNK',
    name: 'CryptoPunks',
    icon: 'https://cryptologos.cc/logos/cryptopunks-punk-logo.svg',
    type: 'ERC721',
    address: {
      sepolia: import.meta.env.VITE_PUNK_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_PUNK_ADDRESS_AMOY as `0x${string}`,
    },
  },
];

interface NetworkContextType {
  networks: Network[];
  selectedNetwork: Network | null;
  setSelectedNetwork: (network: Network) => void;
  getTokenBySymbol: (symbol: string) => Token | undefined;
  getTokenAddress: (symbol: string, networkId: string) => `0x${string}` | undefined;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(SUPPORTED_NETWORKS[0]);

  const getTokenBySymbol = (symbol: string) => {
    return SUPPORTED_TOKENS.find(token => token.symbol === symbol);
  };

  const getTokenAddress = (symbol: string, networkId: string) => {
    const token = getTokenBySymbol(symbol);
    return token?.address[networkId];
  };

  return (
    <NetworkContext.Provider
      value={{
        networks: SUPPORTED_NETWORKS,
        selectedNetwork,
        setSelectedNetwork,
        getTokenBySymbol,
        getTokenAddress,
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