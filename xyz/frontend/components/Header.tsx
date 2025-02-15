import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Wallet, LogOut, Loader2 } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  account: string;
  balance: Record<string, string>;
  isLoadingBalance: boolean;
  onConnect: () => Promise<void>;
  onRefreshBalance: () => Promise<void>;
  isInitializing?: boolean;
}

export function Header({
  connected,
  account,
  onConnect,
  isInitializing = false
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-2">
        <ArrowRightLeft className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Cross-Chain Bridge</h1>
      </div>
      
      {isInitializing ? (
        <Button disabled className="glass-effect">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </Button>
      ) : connected ? (
        <Button 
          variant="secondary"
          className="glass-effect"
          onClick={onConnect}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </Button>
      ) : (
        <Button 
          onClick={onConnect}
          className="glass-effect"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}