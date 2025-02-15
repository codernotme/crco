import React from 'react';
import { Network, useNetwork } from '../contexts/NetworkContext';

export interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: Network | null;
  onChange: (network: Network) => void;
  disabled?: boolean;
  exclude?: string;
}

function NetworkSelector({ selectedNetwork, onChange, disabled, exclude }: NetworkSelectorProps) {
  const { networks: contextNetworks } = useNetwork();
  const availableNetworks = contextNetworks.filter(network => network.id !== exclude);

  return (
    <div className="relative">
      <select
        value={selectedNetwork?.id || ''}
        onChange={(e) => {
          const network = contextNetworks.find(n => n.id === e.target.value);
          if (network) onChange(network);
        }}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-dark-200 rounded-lg appearance-none focus:ring-2 focus:ring-neon focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <option value="">Select Network</option>
        {availableNetworks.map((network) => (
          <option key={network.id} value={network.id}>
            {network.name}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export default NetworkSelector;