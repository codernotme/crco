import React, { useState } from 'react';
import { Network } from '../contexts/NetworkContext';
import { useWallet } from '../contexts/WalletContext';
import NetworkSelector from './NetworkSelector';
import TokenSelector from './TokenSelector';

interface UnlockAndBurnProps {
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

function UnlockAndBurn({
  selectedNetwork,
  targetNetwork,
  onTargetNetworkChange,
  selectedToken,
  onTokenChange,
  amount,
  onAmountChange,
  onSubmit,
  isProcessing
}: UnlockAndBurnProps) {
  const { account } = useWallet();
  const [sourceNetwork, setSourceNetwork] = useState<Network | null>(selectedNetwork);

  const handleSourceNetworkChange = (network: Network) => {
    setSourceNetwork(network);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Source Network (Burn)</label>
          <NetworkSelector
            value={sourceNetwork}
            onChange={handleSourceNetworkChange}
            disabled={!account}
            exclude={targetNetwork?.id}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Network (Unlock)</label>
          <NetworkSelector
            value={targetNetwork}
            onChange={onTargetNetworkChange}
            disabled={!account}
            exclude={sourceNetwork?.id}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select Token to Burn</label>
        <TokenSelector
          selectedToken={selectedToken}
          onChange={onTokenChange}
          disabled={!account}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount to Burn</label>
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
        {!account ? 'Connect Wallet to Unlock & Burn' :
         isProcessing ? 'Processing...' : 'Unlock & Burn Tokens'}
      </button>
    </div>
  );
}

export default UnlockAndBurn;