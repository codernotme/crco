import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Grid as BridgeIcon } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

function Navbar() {
  const { account, connect, disconnect, isConnecting } = useWallet();

  return (
    <nav className="fixed top-0 w-full bg-dark-100/80 backdrop-blur-sm border-b border-dark-300 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BridgeIcon className="h-8 w-8 text-neon" />
              <span className="ml-2 text-xl font-bold">CrCo Bridge</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/bridge"
              className="px-4 py-2 rounded-lg bg-dark-200 hover:bg-dark-300 transition-colors"
            >
              Bridge
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={account ? disconnect : connect}
              className="flex items-center px-4 py-2 rounded-lg bg-neon text-dark font-medium"
              disabled={isConnecting}
            >
              <Wallet className="h-5 w-5 mr-2" />
              {isConnecting ? 'Connecting...' : 
               account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;