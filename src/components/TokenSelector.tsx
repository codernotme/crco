import React from 'react';
import { motion } from 'framer-motion';

interface Token {
  symbol: string;
  name: string;
  icon: string;
}

const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
  },
];

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function TokenSelector({ value, onChange, disabled }: TokenSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SUPPORTED_TOKENS.map((token) => (
        <motion.button
          key={token.symbol}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(token.symbol)}
          disabled={disabled}
          className={`flex items-center p-3 rounded-lg ${
            value === token.symbol
              ? 'bg-neon bg-opacity-20 border border-neon'
              : 'bg-dark-200 hover:bg-dark-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <img
            src={token.icon}
            alt={token.name}
            className="w-6 h-6 mr-2"
          />
          <div className="text-left">
            <div className="font-medium">{token.symbol}</div>
            <div className="text-sm text-gray-400">{token.name}</div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default TokenSelector;