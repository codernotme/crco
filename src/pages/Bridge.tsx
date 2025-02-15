import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Info } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useNetwork, Network } from '../contexts/NetworkContext';
import NetworkSelector from '../components/NetworkSelector';
import TokenSelector from '../components/TokenSelector';
import GasFeeCalculator from '../components/GasFeeCalculator';
import TransactionStatus from '../components/TransactionStatus';
import BridgeStats from '../components/BridgeStats';
import NetworkStatus from '../components/NetworkStatus';
import BalanceMatrix from '../components/BalanceMatrix';
import { useBridge, useTransactionHistory } from '../hooks/useBridge';
import toast from 'react-hot-toast';

function Bridge() {
  const { account } = useWallet();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { networks, selectedNetwork } = useNetwork();
  const [amount, setAmount] = useState('');
  const [targetNetwork, setTargetNetwork] = useState<Network | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('');
  
  const { bridgeTokens, isProcessing } = useBridge(selectedNetwork!, targetNetwork);
  const transactions = useTransactionHistory();

  const handleBridge = async () => {
    if (!account || !selectedNetwork || !targetNetwork || !amount || !selectedToken) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const transaction = await bridgeTokens(selectedToken, amount);
      console.log('Bridge transaction:', transaction);
    } catch (error) {
      console.error('Bridge error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Bridge Stats */}
            <BridgeStats
              totalTransactions={transactions.length}
              totalVolume="$1,234,567.89"
              isLoading={false}
            />

            {/* Network Status */}
            {selectedNetwork && (
              <NetworkStatus
                network={selectedNetwork}
                isConnected={!!account}
                blockHeight={12345678}
                gasPrice="25"
              />
            )}

            <div className="glassmorphism p-6 sm:p-8 mb-8">
              <h1 className="text-2xl font-bold mb-6 flex items-center">
                <ArrowRightLeft className="w-6 h-6 mr-2 text-neon" />
                Cross-Chain Bridge
              </h1>

              <div className="space-y-6">
                {/* Network Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From Network</label>
                    <NetworkSelector
                      value={selectedNetwork}
                      onChange={() => {}}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">To Network</label>
                    <NetworkSelector
                      value={targetNetwork}
                      onChange={setTargetNetwork}
                      disabled={!account}
                      exclude={selectedNetwork?.id}
                    />
                  </div>
                </div>

                {/* Token Selection and Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Token</label>
                  <TokenSelector
                    value={selectedToken}
                    onChange={setSelectedToken}
                    disabled={!account}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-dark-200 rounded-lg focus:ring-2 focus:ring-neon focus:outline-none"
                      disabled={!account || !selectedToken}
                    />
                    {selectedToken && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-neon hover:bg-dark-300 rounded"
                        onClick={() => setAmount('1.0')}
                      >
                        MAX
                      </button>
                    )}
                  </div>
                </div>

                {/* Gas Fee Calculator */}
                <GasFeeCalculator
                  sourceNetwork={selectedNetwork}
                  targetNetwork={targetNetwork}
                  amount={amount}
                  token={selectedToken}
                />

                {/* Bridge Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-lg font-medium ${
                    account ? 'bg-neon text-dark hover:bg-opacity-90' : 'bg-dark-300 cursor-not-allowed'
                  }`}
                  onClick={handleBridge}
                  disabled={!account || isProcessing}
                >
                  {!account ? 'Connect Wallet to Bridge' :
                   isProcessing ? 'Processing...' : 'Bridge Tokens'}
                </motion.button>

                {/* Info Section */}
                <div className="bg-dark-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-neon mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium mb-2">Important Information</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Bridging usually takes 10-30 minutes to complete</li>
                        <li>Make sure you have enough native tokens for gas fees</li>
                        <li>Double-check the target network before confirming</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Balance Matrix */}
            <BalanceMatrix />
            
            {/* Transaction Status */}
            <TransactionStatus />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Bridge;