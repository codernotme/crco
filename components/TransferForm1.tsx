'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_CHAINS } from '@/config/chains';
import { useWallet } from '@/hooks/useWallet';

export function TransferForm() {
  const { toast } = useToast();
  const { initiateTransfer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    sourceChain: 'ethereum',
    destinationChain: 'polygon'
  });

  const handleTransfer = async () => {
    if (!formData.amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await initiateTransfer(
        formData.amount,
        formData.sourceChain,
        formData.destinationChain,
        "false"
      );

      toast({
        title: "Success",
        description: "Transfer initiated successfully",
      });

      setFormData({ ...formData, amount: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Transfer failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <Input
            type="number"
            placeholder="0.0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="glass-effect"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <Select 
              value={formData.sourceChain}
              onValueChange={(value) => setFormData({ ...formData, sourceChain: value })}
            >
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
            <label className="block text-sm font-medium mb-2">To</label>
            <Select 
              value={formData.destinationChain}
              onValueChange={(value) => setFormData({ ...formData, destinationChain: value })}
            >
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_CHAINS)
                  .filter(([id]) => id !== formData.sourceChain)
                  .map(([id, chain]) => (
                    <SelectItem key={id} value={id}>
                      {chain.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleTransfer} 
          disabled={loading}
          className="w-full glass-effect"
        >
          {loading ? 'Processing...' : 'Transfer'}
        </Button>
      </div>
    </div>
  );
}