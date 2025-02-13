'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';

export function BridgeFeeCalculator() {
  const [amount, setAmount] = useState('0');
  const [sourceChain, setSourceChain] = useState('ethereum');
  const [destinationChain, setDestinationChain] = useState('polygon');
  const [fee, setFee] = useState({
    baseFee: '0',
    gasEstimate: '0',
    total: '0'
  });

  useEffect(() => {
    const calculateFee = () => {
      const parsedAmount = parseFloat(amount) || 0;
      const baseFee = parsedAmount * 0.001; // 0.1% base fee
      const gasEstimate = Math.min(0.01, parsedAmount * 0.0005); // Gas estimate based on amount
      
      setFee({
        baseFee: baseFee.toFixed(6),
        gasEstimate: gasEstimate.toFixed(6),
        total: (baseFee + gasEstimate).toFixed(6)
      });
    };

    calculateFee();
  }, [amount, sourceChain, destinationChain]);

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Bridge Fee Calculator</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="glass-effect"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">From</label>
              <Select value={sourceChain} onValueChange={setSourceChain}>
                <SelectTrigger className="glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                    <SelectItem key={id} value={id}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">To</label>
              <Select value={destinationChain} onValueChange={setDestinationChain}>
                <SelectTrigger className="glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS)
                    .filter(([id]) => id !== sourceChain)
                    .map(([id, chain]) => (
                      <SelectItem key={id} value={id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-4">
          <div className="flex justify-between">
            <span className="text-white/60">Base Fee</span>
            <span>{fee.baseFee} {SUPPORTED_CHAINS[sourceChain].nativeCurrency.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Gas Estimate</span>
            <span>{fee.gasEstimate} {SUPPORTED_CHAINS[sourceChain].nativeCurrency.symbol}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-white/10">
            <span>Total Fee</span>
            <span>{fee.total} {SUPPORTED_CHAINS[sourceChain].nativeCurrency.symbol}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}