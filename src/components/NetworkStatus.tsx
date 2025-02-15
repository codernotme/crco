import React from 'react';
import { motion } from 'framer-motion';
import { Network } from '../contexts/NetworkContext';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  network: Network;
  isConnected: boolean;
  blockHeight?: number;
  gasPrice?: string;
}

function NetworkStatus({ network, isConnected, blockHeight, gasPrice }: NetworkStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glassmorphism p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{network.name}</span>
        </div>
        
        {isConnected && (
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            {blockHeight && (
              <span>Block: #{blockHeight.toLocaleString()}</span>
            )}
            {gasPrice && (
              <span>Gas: {gasPrice} Gwei</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default NetworkStatus;