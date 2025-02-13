'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge, Zap } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';
import { createPublicClient, http } from 'viem';
import { mainnet, polygon, bsc, avalanche } from 'viem/chains';

interface GasPrice {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
}

interface NetworkGas {
  chainId: string;
  prices: GasPrice;
  loading: boolean;
}

export function GasTracker() {
  const [networkGas, setNetworkGas] = useState<NetworkGas[]>([]);

  useEffect(() => {
    const fetchGasPrices = async () => {
      const clients = {
        ethereum: createPublicClient({ chain: mainnet, transport: http() }),
        polygon: createPublicClient({ chain: polygon, transport: http() }),
        bsc: createPublicClient({ chain: bsc, transport: http() }),
        avalanche: createPublicClient({ chain: avalanche, transport: http() })
      };

      const updatedGas: NetworkGas[] = [];

      for (const [chainId, chain] of Object.entries(SUPPORTED_CHAINS)) {
        try {
          const client = clients[chainId as keyof typeof clients];
          const gasPrice = await client.getGasPrice();
          const baseFee = Number(gasPrice) / 1e9;

          updatedGas.push({
            chainId,
            prices: {
              slow: baseFee * 0.9,
              standard: baseFee,
              fast: baseFee * 1.2,
              instant: baseFee * 1.5
            },
            loading: false
          });
        } catch (err) {
          console.error(`Failed to fetch gas price for ${chainId}:`, err);
          updatedGas.push({
            chainId,
            prices: { slow: 0, standard: 0, fast: 0, instant: 0 },
            loading: false
          });
        }
      }

      setNetworkGas(updatedGas);
    };

    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getGasLevel = (price: number) => {
    if (price <= 30) return 'Low';
    if (price <= 60) return 'Normal';
    if (price <= 100) return 'High';
    return 'Very High';
  };

  const getGasColor = (price: number) => {
    if (price <= 30) return 'text-green-400';
    if (price <= 60) return 'text-yellow-400';
    if (price <= 100) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Network Gas Tracker</h2>
      </div>

      <div className="space-y-6">
        {networkGas.map((network) => (
          <div key={network.chainId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={SUPPORTED_CHAINS[network.chainId].icon}
                  alt={SUPPORTED_CHAINS[network.chainId].name}
                  className="w-5 h-5"
                />
                <span>{SUPPORTED_CHAINS[network.chainId].name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className={getGasColor(network.prices.standard)}>
                  {getGasLevel(network.prices.standard)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-white/60 mb-1">Slow</div>
                <div>{network.prices.slow.toFixed(1)} Gwei</div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Standard</div>
                <div>{network.prices.standard.toFixed(1)} Gwei</div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Fast</div>
                <div>{network.prices.fast.toFixed(1)} Gwei</div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Instant</div>
                <div>{network.prices.instant.toFixed(1)} Gwei</div>
              </div>
            </div>

            <Progress 
              value={Math.min((network.prices.standard / 200) * 100, 100)} 
              className="h-1.5"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}