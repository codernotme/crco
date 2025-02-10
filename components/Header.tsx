import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';

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
  onConnect
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-2">
        <ArrowRightLeft className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Cross-Chain Bridge</h1>
      </div>
      
      <Button
        onClick={onConnect}
        variant={connected ? "secondary" : "default"}
        className="glass-effect"
      >
        {connected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
      </Button>
    </div>
  );
}