import React from 'react';
import { Network } from '../contexts/NetworkContext';
import { useWallet } from '../contexts/WalletContext';
import NetworkSelector from './NetworkSelector';
import TokenSelector from './TokenSelector';

interface LockAndMintProps {
  selectedNetwork: Network | null;
  targetNetwork: Network | null;
  onTargetNetworkChange: (network: Network) => void;
  selectedToken: string;
  onTokenChange: (token: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

function LockAndMint({
  selectedNetwork,
  targetNetwork,
  onTargetNetworkChange,
  selectedToken,
  onTokenChange,
  amount,
  onAmountChange,
  onSubmit,
  isProcessing
}: LockAndMintProps) {
  const { account } = useWallet();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Source Network (Lock)</label>
          <NetworkSelector
            value={selectedNetwork}
            onChange={() => {}}
            disabled={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Network (Mint)</label>
          <NetworkSelector
            value={targetNetwork}
            onChange={onTargetNetworkChange}
            disabled={!account}
            exclude={selectedNetwork?.id}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select Token to Lock</label>
        <TokenSelector
          selectedToken={selectedToken}
          onChange={onTokenChange}
          disabled={!account}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount to Lock</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-3 bg-dark-200 rounded-lg focus:ring-2 focus:ring-neon focus:outline-none"
            disabled={!account || !selectedToken}
          />
          {selectedToken && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-neon hover:bg-dark-300 rounded"
              onClick={() => onAmountChange('1.0')}
            >
              MAX
            </button>
          )}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!account || isProcessing || !amount || !selectedToken || !targetNetwork}
        className={`w-full py-4 rounded-lg font-medium ${
          account && !isProcessing && amount && selectedToken && targetNetwork
            ? 'bg-neon text-dark hover:bg-opacity-90'
            : 'bg-dark-300 cursor-not-allowed'
        }`}
      >
        {!account ? 'Connect Wallet to Lock & Mint' :
         isProcessing ? 'Processing...' : 'Lock & Mint Tokens'}
      </button>
    </div>
  );
}

export default LockAndMint;