'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';
import { useWallet } from '@/hooks/useWallet';
import { formatEther } from 'viem';

interface TokenBalance {
  chain: string;
  balance: string;
  value: number;
  change24h: number;
}

export function PortfolioTracker() {
  const { connected, account, balance } = useWallet();
  const [portfolio, setPortfolio] = useState<TokenBalance[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!connected || !account) return;

    const fetchPortfolio = async () => {
      const balances: TokenBalance[] = [];
      let total = 0;

      for (const [chainId, amount] of Object.entries(balance)) {
        // Simulate price data (replace with actual price feed)
        const mockPrice = Math.random() * 1000;
        const mockChange = (Math.random() * 20) - 10;
        
        const value = parseFloat(amount) * mockPrice;
        total += value;

        balances.push({
          chain: chainId,
          balance: amount,
          value: value,
          change24h: mockChange
        });
      }

      setPortfolio(balances);
      setTotalValue(total);
    };

    fetchPortfolio();
  }, [connected, account, balance]);

  if (!connected) {
    return (
      <Card className="card-gradient p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-white/60">Connect wallet to view portfolio</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Portfolio Overview</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Total Value</p>
            <p className="text-2xl font-bold">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-white/20" />
        </div>

        <div className="space-y-4">
          {portfolio.map((token) => (
            <div key={token.chain} className="flex items-center justify-between p-3 rounded-lg glass-effect">
              <div className="flex items-center gap-3">
                <img
                  src={SUPPORTED_CHAINS[token.chain].icon}
                  alt={SUPPORTED_CHAINS[token.chain].name}
                  className="w-6 h-6"
                />
                <div>
                  <p className="font-medium">{SUPPORTED_CHAINS[token.chain].name}</p>
                  <p className="text-sm text-white/60">
                    {token.balance} {SUPPORTED_CHAINS[token.chain].tokenSymbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${token.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm flex items-center gap-1 ${
                  token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(token.change24h).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}