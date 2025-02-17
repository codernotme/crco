import React, { createContext, useContext, useState } from 'react';

// Define the Token type
export type Token = {
  symbol: string;
  name: string;
  icon: string;
  type: 'ERC20' | 'ERC721';
  address: {
    sepolia: `0x${string}`;
    amoy: `0x${string}`;
  };
};

// Update the SUPPORTED_TOKENS array with BAYC and PUNK images
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
    icon: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&w=1000',
    type: 'ERC721',
    address: {
      sepolia: import.meta.env.VITE_BAYC_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_BAYC_ADDRESS_AMOY as `0x${string}`,
    },
  },
  {
    symbol: 'PUNK',
    name: 'CryptoPunks',
    icon: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&w=1000',
    type: 'ERC721',
    address: {
      sepolia: import.meta.env.VITE_PUNK_ADDRESS_SEPOLIA as `0x${string}`,
      amoy: import.meta.env.VITE_PUNK_ADDRESS_AMOY as `0x${string}`,
    },
  },
];

export interface Network {
  id: string;
  name: string;
  explorerUrl: string;
}

interface NetworkContextProps {
  networks: Network[];
  selectedNetwork: Network | null;
  setCurrentNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextProps | undefined>(undefined);

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networks] = useState<Network[]>([
    { id: 'sepolia', name: 'Sepolia', explorerUrl: 'https://sepolia.etherscan.io' },
    { id: 'amoy', name: 'Amoy', explorerUrl: 'https://mumbai.polygonscan.com' },
  ]);
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null);

  return (
    <NetworkContext.Provider value={{ networks, selectedNetwork: currentNetwork, setCurrentNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};