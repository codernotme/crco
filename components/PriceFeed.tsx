'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: string;
}

export function PriceFeed() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const responses = await Promise.all(
          Object.entries(SUPPORTED_CHAINS).map(async ([chainId, chain]) => {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${chain.coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`
            );
            const data = await response.json();
            return [chainId, data[chain.coingeckoId]];
          })
        );

        const newPrices: Record<string, PriceData> = {};
        responses.forEach(([chainId, data]: any) => {
          newPrices[chainId as string] = {
            price: data.usd,
            change24h: data.usd_24h_change,
            volume24h: data.usd_24h_vol,
            lastUpdated: new Date(data.last_updated_at * 1000).toLocaleString()
          };
        });

        setPrices(newPrices);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Real-Time Prices</h2>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => {
          const priceData = prices[chainId];
          return (
            <div
              key={chainId}
              className="p-4 rounded-lg glass-effect"
            >
              <div className="flex items-center gap-2 mb-2">
                <img src={chain.icon} alt={chain.name} className="w-6 h-6" />
                <span className="font-medium">{chain.name}</span>
              </div>
              
              {priceData ? (
                <>
                  <div className="text-2xl font-bold mb-2">
                    ${priceData.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2
                    })}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {priceData.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={
                        priceData.change24h >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    >
                      {Math.abs(priceData.change24h).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="text-xs text-white/60 mt-2">
                    Vol: ${(priceData.volume24h / 1000000).toFixed(2)}M
                  </div>
                </>
              ) : (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}