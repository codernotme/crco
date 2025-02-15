import{ useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Info, Lock, Unlock } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useNetwork, Network } from '../contexts/NetworkContext';
import NetworkSelector from '../components/NetworkSelector';
import TokenSelector from '../components/TokenSelector';
import GasFeeCalculator from '../components/GasFeeCalculator';
import TransactionStatus from '../components/TransactionStatus';
import BridgeStats from '../components/BridgeStats';
import NetworkStatus from '../components/NetworkStatus';
import BalanceMatrix from '../components/BalanceMatrix';
import LockAndMint from '../components/LockAndMint';
import UnlockAndBurn from '../components/UnlockAndBurn';
import { useBridge, useTransactionHistory } from '../hooks/useBridge';
import toast from 'react-hot-toast';

function Bridge() {
  const { account } = useWallet();
  const { networks, selectedNetwork, setSelectedNetwork } = useNetwork();
  const [bridgeMode, setBridgeMode] = useState<'lock' | 'unlock'>('lock');
  const [amount, setAmount] = useState('');
  const [targetNetwork, setTargetNetwork] = useState<Network | null>(networks[1] || null);
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
      toast.success('Bridge transaction initiated!');
    } catch (error) {
      console.error('Bridge error:', error);
      toast.error('Bridge transaction failed');
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
            <BridgeStats
              totalTransactions={transactions.length}
              totalVolume="$1,234,567.89"
              isLoading={false}
            />

            {selectedNetwork && (
              <NetworkStatus
                network={selectedNetwork}
                isConnected={!!account}
                blockHeight={12345678}
                gasPrice="25"
              />
            )}

            <div className="glassmorphism p-6 sm:p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center">
                  <ArrowRightLeft className="w-6 h-6 mr-2 text-neon" />
                  Cross-Chain Bridge
                </h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBridgeMode('lock')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      bridgeMode === 'lock' ? 'bg-neon text-dark' : 'bg-dark-200'
                    }`}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Lock & Mint
                  </button>
                  <button
                    onClick={() => setBridgeMode('unlock')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      bridgeMode === 'unlock' ? 'bg-neon text-dark' : 'bg-dark-200'
                    }`}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock & Burn
                  </button>
                </div>
              </div>

              {bridgeMode === 'lock' ? (
                <LockAndMint
                  selectedNetwork={selectedNetwork}
                  targetNetwork={targetNetwork}
                  onTargetNetworkChange={setTargetNetwork}
                  selectedToken={selectedToken}
                  onTokenChange={setSelectedToken}
                  amount={amount}
                  onAmountChange={setAmount}
                  onSubmit={handleBridge}
                  isProcessing={isProcessing}
                />
              ) : (
                <UnlockAndBurn
                  selectedNetwork={selectedNetwork}
                  targetNetwork={targetNetwork}
                  onTargetNetworkChange={setTargetNetwork}
                  selectedToken={selectedToken}
                  onTokenChange={setSelectedToken}
                  amount={amount}
                  onAmountChange={setAmount}
                  onSubmit={handleBridge}
                  isProcessing={isProcessing}
                />
              )}

              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Source Network</label>
                    <NetworkSelector 
                      networks={networks}
                      selectedNetwork={selectedNetwork}
                      onChange={(network) => setSelectedNetwork(network)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Network</label>
                    <NetworkSelector 
                      networks={networks.filter(n => n !== selectedNetwork)}
                      selectedNetwork={targetNetwork}
                      onChange={setTargetNetwork}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Token</label>
                  <TokenSelector
                    selectedToken={selectedToken}
                    onChange={setSelectedToken}
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 rounded-lg bg-dark-200 border border-dark-300 focus:border-neon focus:ring-1 focus:ring-neon"
                    placeholder="Enter amount"
                    disabled={isProcessing}
                  />
                </div>

                <button
                  onClick={handleBridge}
                  disabled={!account || !selectedNetwork || !targetNetwork || !amount || !selectedToken || isProcessing}
                  className="w-full py-3 px-4 bg-neon text-dark font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Bridge Tokens'}
                </button>
              </div>

              <GasFeeCalculator
                sourceNetwork={selectedNetwork}
                targetNetwork={targetNetwork}
                amount={amount}
                token={selectedToken}
              />

              <div className="mt-6 bg-dark-200 rounded-lg p-4 text-sm">
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

          <div className="lg:col-span-1">
            <BalanceMatrix />
            <TransactionStatus />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Bridge;