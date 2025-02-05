import { ArrowRightLeft, Wallet, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface HeaderProps {
  connected: boolean;
  account: string;
  balance: Record<string, string>;
  isLoadingBalance: boolean;
  onConnect: () => Promise<void>;
  onRefreshBalance: () => Promise<void>;
}

export function Header({
  connected,
  account,
  balance,
  isLoadingBalance,
  onConnect,
  onRefreshBalance
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-2">
        <ArrowRightLeft className="h-8 w-8" />
        <h1 className="text-2xl font-bold">CrCo Bridge</h1>
      </div>
      <div className="flex items-center space-x-4">
        {connected && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Balances</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your Balances</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => (
                  <div key={chainId} className="flex justify-between items-center">
                    <span>{chain.name}:</span>
                    {isLoadingBalance ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span>{balance[chainId] || '0'} {chain.tokenSymbol}</span>
                    )}
                  </div>
                ))}
                <Button onClick={onRefreshBalance} className="w-full">
                  Refresh Balances
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <Button
          onClick={onConnect}
          variant={connected ? "secondary" : "default"}
          className="flex items-center space-x-2"
        >
          <Wallet className="h-4 w-4" />
          <span>{connected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}</span>
          {connected && <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}