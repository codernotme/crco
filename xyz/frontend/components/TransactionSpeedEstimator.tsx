'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Clock, Zap } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface SpeedEstimate {
  time: number;
  probability: number;
  gasPrice: number;
}

export function TransactionSpeedEstimator() {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [gasPrice, setGasPrice] = useState(50);
  const [estimate, setEstimate] = useState<SpeedEstimate>({
    time: 15,
    probability: 90,
    gasPrice: 50
  });

  useEffect(() => {
    // Simulate estimation based on gas price
    const estimateSpeed = (price: number) => {
      return {
        time: Math.max(5, Math.round(30 - (price / 100) * 25)),
        probability: Math.min(99, Math.round((price / 100) * 100)),
        gasPrice: price
      };
    };

    setEstimate(estimateSpeed(gasPrice));
  }, [gasPrice]);

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Transaction Speed Estimator</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-white/60">Gas Price (Gwei)</label>
          <Slider
            value={[gasPrice]}
            onValueChange={(value) => setGasPrice(value[0])}
            max={200}
            step={1}
          />
          <div className="flex justify-between text-sm">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{estimate.time}s</div>
            <div className="text-sm text-white/60">Estimated Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{estimate.probability}%</div>
            <div className="text-sm text-white/60">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{estimate.gasPrice}</div>
            <div className="text-sm text-white/60">Gas Price (Gwei)</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span>Recommended for fast transactions</span>
        </div>
      </div>
    </Card>
  );
}