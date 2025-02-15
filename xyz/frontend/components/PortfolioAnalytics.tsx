'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface ChartData {
  timestamp: string;
  value: number;
}

export function PortfolioAnalytics() {
  const { connected, account, balance } = useWallet();
  const [historicalData, setHistoricalData] = useState<ChartData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [changePercent, setChangePercent] = useState(0);
  const [distribution, setDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!connected || !account) return;

    // Simulate historical data (replace with actual API calls)
    const generateHistoricalData = () => {
      const data: ChartData[] = [];
      const now = new Date();
      let baseValue = 10000;

      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Add some random variation
        baseValue = baseValue * (1 + (Math.random() * 0.1 - 0.05));
        
        data.push({
          timestamp: date.toISOString().split('T')[0],
          value: baseValue
        });
      }

      return data;
    };

    const calculateDistribution = () => {
      const total = Object.entries(balance).reduce(
        (acc, [_, amount]) => acc + parseFloat(amount),
        0
      );

      const dist: Record<string, number> = {};
      Object.entries(balance).forEach(([chainId, amount]) => {
        dist[chainId] = (parseFloat(amount) / total) * 100;
      });

      return dist;
    };

    const data = generateHistoricalData();
    setHistoricalData(data);
    setTotalValue(data[data.length - 1].value);
    setChangePercent(
      ((data[data.length - 1].value - data[0].value) / data[0].value) * 100
    );
    setDistribution(calculateDistribution());
  }, [connected, account, balance]);

  if (!connected) {
    return (
      <Card className="card-gradient p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-white/60">Connect wallet to view analytics</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Portfolio Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <XAxis
                  dataKey="timestamp"
                  stroke="#ffffff40"
                  tickFormatter={(value) => value.split('-')[2]}
                />
                <YAxis
                  stroke="#ffffff40"
                  tickFormatter={(value) =>
                    `$${(value / 1000).toFixed(1)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg glass-effect">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm text-white/60">Total Value</span>
            </div>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString(undefined, {
                maximumFractionDigits: 2
              })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-400" />
              <span className="text-sm text-green-400">
                {changePercent.toFixed(2)}%
              </span>
              <span className="text-sm text-white/60">30d</span>
            </div>
          </div>

          <div className="p-4 rounded-lg glass-effect">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm text-white/60">Distribution</span>
            </div>
            <div className="space-y-2">
              {Object.entries(distribution).map(([chainId, percentage]) => (
                <div key={chainId} className="flex items-center gap-2">
                  <img
                    src={SUPPORTED_CHAINS[chainId].icon}
                    alt={SUPPORTED_CHAINS[chainId].name}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/30"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}