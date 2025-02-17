import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Grid as BridgeIcon, LogOut } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

function Navbar() {
  const { account, connect, disconnect, isConnecting, balance } = useWallet();

  return (
    <nav className="fixed top-0 w-full bg-dark-100/80 backdrop-blur-sm border-b border-dark-300 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BridgeIcon className="h-8 w-8 text-neon" />
              <span className="ml-2 text-xl font-bold">CrCo Bridge</span>
            </Link>
            <div className="ml-8 flex space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg hover:bg-dark-200 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/bridge"
                className="px-3 py-2 rounded-lg hover:bg-dark-200 transition-colors"
              >
                Bridge
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 rounded-lg hover:bg-dark-200 transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {account && (
              <div className="px-4 py-2 rounded-lg bg-dark-200">
                <span className="text-sm text-gray-400">Balance:</span>
                <span className="ml-2 font-medium">{balance} ETH</span>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={account ? disconnect : connect}
              className="flex items-center px-4 py-2 rounded-lg bg-neon text-dark font-medium"
              disabled={isConnecting}
            >
              {account ? (
                <>
                  <span className="mr-2">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                  <LogOut className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;