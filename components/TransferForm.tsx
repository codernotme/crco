import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SUPPORTED_CHAINS } from '@/config/chains';
import { TransferState } from '@/types';
import { ArrowDownUp } from 'lucide-react';

interface TransferFormProps {
  state: TransferState;
  connected: boolean;
  balance: Record<string, string>;
  onSourceChainChange: (value: string) => void;
  onDestinationChainChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
  onTransfer: () => Promise<void>;
}

export function TransferForm({
  state,
  connected,
  balance,
  onSourceChainChange,
  onDestinationChainChange,
  onAmountChange,
  onMaxClick,
  onTransfer
}: TransferFormProps) {
  const swapChains = () => {
    const temp = state.sourceChain;
    onSourceChainChange(state.destinationChain);
    onDestinationChainChange(temp);
  };

  return (
    <Card className="card-gradient p-8 border border-white/10">
      <div className="space-y-8">
        <div className="relative">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Source Chain</label>
              <Select value={state.sourceChain} onValueChange={onSourceChainChange}>
                <SelectTrigger className="glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => (
                    <SelectItem key={chainId} value={chainId}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {connected && (
                <div className="mt-2 text-sm text-white/60">
                  Balance: {balance[state.sourceChain] || '0'} {SUPPORTED_CHAINS[state.sourceChain].tokenSymbol}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 glass-effect border-white/10 hover:border-white/20"
                  onClick={swapChains}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Destination Chain</label>
              <Select value={state.destinationChain} onValueChange={onDestinationChainChange}>
                <SelectTrigger className="glass-effect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS)
                    .filter(([chainId]) => chainId !== state.sourceChain)
                    .map(([chainId, chain]) => (
                      <SelectItem key={chainId} value={chainId}>
                        {chain.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {connected && (
                <div className="mt-2 text-sm text-white/60">
                  Balance: {balance[state.destinationChain] || '0'} {SUPPORTED_CHAINS[state.destinationChain].tokenSymbol}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={state.amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="glass-effect pr-16"
              min="0"
              step="0.000000000000000001"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              onClick={onMaxClick}
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onTransfer}
            disabled={!connected || state.loading || !state.amount}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/10"
          >
            {!connected ? 'Connect Wallet' : 
             state.loading ? 'Processing...' : 
             !state.amount ? 'Enter Amount' : 
             'Initiate Transfer'}
          </Button>

          {connected && (
            <div className="text-sm text-white/60 text-center">
              Estimated Time: ~10-15 minutes
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}