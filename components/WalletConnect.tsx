import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {

  return (
    <Button>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}