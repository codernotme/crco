import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SUPPORTED_CHAINS } from '@/config/chains';
import { TransferState } from '@/types';
import { ArrowDownUp, ArrowRight } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';
import { AssetSelector } from './AssetSelector';

interface TransferFormProps {
  state: TransferState;
  connected: boolean;
  balance: Record<string, string>;
  chainId: string;
  onSourceChainChange: (value: string) => void;
  onDestinationChainChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTokenIdChange: (value: string) => void;
  onAssetTypeChange: (isNFT: boolean) => void;
  onTransfer: () => Promise<void>;
  onMaxClick: () => void;
}

export function TransferForm({
  state,
  connected,
  balance,
  chainId,
  onSourceChainChange,
  onDestinationChainChange,
  onAmountChange,
  onTokenIdChange,
  onAssetTypeChange,
  onTransfer,
  onMaxClick
}: TransferFormProps) {
  const [latency, setLatency] = useState<number>();

  const swapChains = () => {
    const temp = state.sourceChain;
    onSourceChainChange(state.destinationChain);
    onDestinationChainChange(temp);
  };

  const handleAssetTypeChange = (type: 'token' | 'nft') => {
    onAssetTypeChange(type === 'nft');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <NetworkStatus
        chainId={chainId}
        connected={connected}
        latency={latency}
      />

      <Card className="card-gradient p-8 border border-white/10">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
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
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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

          <AssetSelector
            balance={balance[state.sourceChain] || '0'}
            tokenSymbol={SUPPORTED_CHAINS[state.sourceChain].tokenSymbol}
            onAssetTypeChange={handleAssetTypeChange}
            onAmountChange={onAmountChange}
            onTokenIdChange={onTokenIdChange}
            onMaxClick={onMaxClick}
            disabled={!connected}
          />

          <div className="space-y-4">
            <Button
              onClick={onTransfer}
              disabled={!connected || state.loading || !state.amount}
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/10 flex items-center justify-center gap-2"
            >
              {!connected ? 'Connect Wallet' : 
               state.loading ? 'Processing...' : 
               !state.amount ? 'Enter Amount' : 
               <>
                 Initiate Transfer
                 <ArrowRight className="h-4 w-4" />
               </>}
            </Button>

            {connected && (
              <div className="text-sm text-white/60 text-center">
                Estimated Time: ~10-15 minutes
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}