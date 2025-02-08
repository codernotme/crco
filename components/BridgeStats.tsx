'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpDown, Clock, Coins, Users } from 'lucide-react';
import { formatEther } from 'viem';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface BridgeStats {
  totalVolume: string;
  totalTransactions: number;
  activeUsers: number;
  averageTime: number;
}

export function BridgeStats() {
  const [stats, setStats] = useState<BridgeStats>({
    totalVolume: '0',
    totalTransactions: 0,
    activeUsers: 0,
    averageTime: 0,
  });

  const { provider } = useWallet();

  useEffect(() => {
    const fetchStats = async () => {
      if (!provider) return;

      try {
        let totalVolume = BigInt(0);
        let totalTx = 0;
        const uniqueUsers = new Set<string>();
        const processingTimes: number[] = [];

        // Fetch stats from all chains
        for (const chain of Object.values(SUPPORTED_CHAINS)) {
          const bridgeContract = new ethers.Contract(
            chain.bridgeAddress,
            ['event TransferCompleted(bytes32,address,uint256,bool,uint256)'],
            provider
          );

          const filter = bridgeContract.filters.TransferCompleted();
          const events = await bridgeContract.queryFilter(filter);

          events.forEach(async (event) => {
            totalVolume += BigInt(event.args?.amount || 0);
            totalTx++;
            uniqueUsers.add(event.args?.recipient);

            const block = await event.getBlock();
            if (block) {
              processingTimes.push(block.timestamp - (event.args?.timestamp || 0));
            }
          });
        }

        const avgTime =
          processingTimes.length > 0
            ? processingTimes.reduce((a, b) => a + b, 0) /
              processingTimes.length
            : 0;

        setStats({
          totalVolume: formatEther(totalVolume),
          totalTransactions: totalTx,
          activeUsers: uniqueUsers.size,
          averageTime: Math.round(avgTime / 60), // Convert to minutes
        });
      } catch (err) {
        console.error('Failed to fetch bridge stats:', err);
      }
    };

    fetchStats();
  }, [provider]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-6 card-gradient">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-white/10">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Volume</p>
            <h3 className="text-2xl font-bold">
              {Number(stats.totalVolume).toLocaleString()} CRCO
            </h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 card-gradient">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-white/10">
            <ArrowUpDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Transactions</p>
            <h3 className="text-2xl font-bold">
              {stats.totalTransactions.toLocaleString()}
            </h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 card-gradient">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-white/10">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Active Users</p>
            <h3 className="text-2xl font-bold">
              {stats.activeUsers.toLocaleString()}
            </h3>
          </div>
        </div>
      </Card>

      <Card className="p-6 card-gradient">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-white/10">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Average Time</p>
            <h3 className="text-2xl font-bold">{stats.averageTime} min</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
