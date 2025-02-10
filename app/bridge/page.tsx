'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransferForm } from '@/components/TransferForm1';
import { Header } from '@/components/Header';
import { useWallet } from '@/hooks/useWallet';
import { Toaster } from '@/components/ui/toaster';

export default function BridgePage() {
  const { connected, account, chainId, balance, connectWallet } = useWallet();
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <Header
          connected={connected}
          account={account}
          balance={balance}
          isLoadingBalance={isLoadingBalance}
          onConnect={connectWallet}
          onRefreshBalance={async () => {}}
        />

        <div className="max-w-4xl mx-auto mt-20">
          {!connected ? (
            <Card className="p-8 card-gradient text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Connect your wallet to start transferring assets across chains</p>
              <Button 
                size="lg" 
                onClick={connectWallet}
                className="glass-effect text-lg py-6 px-8"
              >
                Connect Wallet
              </Button>
            </Card>
          ) : (
            <Card className="p-6 card-gradient">
              <TransferForm />
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}