import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// Mock transaction for demonstration
const mockTransaction = {
  status: 'pending',
  hash: '0x1234...5678',
  from: 'Sepolia',
  to: 'Amoy',
  amount: '1.5',
  token: 'ETH',
  timestamp: new Date().toISOString(),
};

function TransactionStatus() {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      
      <div className="glassmorphism p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(mockTransaction.status)}
            <div>
              <p className="font-medium">
                {mockTransaction.amount} {mockTransaction.token}
              </p>
              <p className="text-sm text-gray-400">
                {mockTransaction.from} → {mockTransaction.to}
              </p>
            </div>
          </div>
          
          <a
            href={`https://sepolia.etherscan.io/tx/${mockTransaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon hover:underline text-sm"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default TransactionStatus;