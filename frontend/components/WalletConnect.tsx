import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <Button disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Connecting...
      </Button>
    );
  }

  if (user) {
    return (
      <Button variant="outline" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Disconnect Wallet
      </Button>
    );
  }

  return (
    <Button onClick={signIn}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}