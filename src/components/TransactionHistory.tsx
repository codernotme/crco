import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Network } from '../contexts/NetworkContext';

interface Transaction {
  hash: string;
  from: Network;
  to: Network;
  amount: string;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getExplorerUrl = (network: Network, hash: string) => {
    if (network.explorerUrl) {
      return `${network.explorerUrl}/tx/${hash}`;
    }
    return '#';
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="glassmorphism p-8 text-center text-gray-400">
            No transactions yet
          </div>
        ) : (
          transactions.map((tx, index) => (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphism p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(tx.status)}
                  <div>
                    <p className="font-medium">
                      {tx.amount} {tx.token}
                    </p>
                    <p className="text-sm text-gray-400">
                      {tx.from.name} → {tx.to.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(tx.timestamp, 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                  
                  <a
                    href={getExplorerUrl(tx.from, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon hover:underline flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <span className="text-sm">View</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;