import React from 'react';
import { motion } from 'framer-motion';
import { SUPPORTED_TOKENS, Token } from '../contexts/NetworkContext';

export interface TokenSelectorProps {
  selectedToken: string;
  onChange: (token: string) => void;
  disabled?: boolean;
}

function TokenSelector({ selectedToken, onChange, disabled }: TokenSelectorProps) {
  const filteredTokens = SUPPORTED_TOKENS.filter(token => token.type === 'ERC20');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {filteredTokens.map((token: Token) => (
        <motion.button
          key={token.symbol}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(token.symbol)}
          disabled={disabled}
          className={`flex items-center p-3 rounded-lg ${
            selectedToken === token.symbol
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
            <div className="text-sm text-gray-400">
              {token.name}
              <span className="ml-1 text-xs text-neon">{token.type}</span>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default TokenSelector;