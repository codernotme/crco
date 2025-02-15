import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface BridgeStatsProps {
  totalTransactions?: number;
  totalVolume?: string;
  isLoading?: boolean;
}

function BridgeStats({ totalTransactions, totalVolume, isLoading = false }: BridgeStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
    >
      <div className="glassmorphism p-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-neon" />
          <div>
            <p className="text-sm text-gray-400">Total Transactions</p>
            {isLoading ? (
              <Skeleton width={80} height={24} />
            ) : (
              <p className="text-xl font-bold">{totalTransactions || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="glassmorphism p-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-neon" />
          <div>
            <p className="text-sm text-gray-400">Total Volume</p>
            {isLoading ? (
              <Skeleton width={120} height={24} />
            ) : (
              <p className="text-xl font-bold">{totalVolume || '$0.00'}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BridgeStats;