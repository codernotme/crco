import React from 'react';
import { motion } from 'framer-motion';
import { useNetwork } from '../contexts/NetworkContext';
import { useWallet } from '../contexts/WalletContext';
import { formatEther } from 'viem';
import Skeleton from 'react-loading-skeleton';
import { useBalances } from '../hooks/useBalances';

function BalanceMatrix() {
  const { networks } = useNetwork();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { account } = useWallet();
  const { balances, isLoading, refetch } = useBalances();

  const supportedTokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
    { symbol: 'USDC', name: 'USD Coin', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' },
    { symbol: 'USDT', name: 'Tether', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Balance Matrix</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-dark-200 rounded-lg hover:bg-dark-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Token</th>
              {networks.map((network) => (
                <th key={network.id} className="px-4 py-2 text-center">
                  {network.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supportedTokens.map((token) => (
              <tr key={token.symbol} className="border-t border-dark-300">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-6 h-6 mr-2"
                    />
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                </td>
                {networks.map((network) => (
                  <td key={`${token.symbol}-${network.id}`} className="px-4 py-3 text-center">
                    {isLoading ? (
                      <Skeleton width={80} />
                    ) : (
                      <div className="font-medium">
                        {balances[network.id]?.[token.symbol]
                          ? formatEther(balances[network.id][token.symbol])
                          : '0.00'}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default BalanceMatrix;