"use client";

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from '@/components/Header';
import { TransferForm } from '@/components/TransferForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useWallet } from '@/hooks/useWallet';
import { Transaction, TransferState } from '@/types';

export default function Home() {
  const { connected, account, balance, connectWallet, updateBalances } = useWallet();
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferState, setTransferState] = useState<TransferState>({
    amount: '',
    sourceChain: 'amoy',
    destinationChain: 'sepolia',
    loading: false,
    error: null
  });

  const handleRefreshBalance = async () => {
    setIsLoadingBalance(true);
    try {
      await updateBalances(account);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleTransfer = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }

    if (!transferState.amount || parseFloat(transferState.amount) <= 0) {
      setTransferState(prev => ({ 
        ...prev, 
        error: 'Please enter a valid amount' 
      }));
      return;
    }

    setTransferState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Bridge contract interaction would go here
      setTransactions(prev => [{
        id: `0x${Math.random().toString(16).slice(2)}`,
        from: account,
        to: account,
        amount: transferState.amount,
        sourceChain: transferState.sourceChain,
        destinationChain: transferState.destinationChain,
        status: 'pending',
        timestamp: Date.now()
      }, ...prev]);
      
      setTransferState(prev => ({ ...prev, amount: '' }));
    } catch (err) {
      setTransferState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Transfer failed' 
      }));
    } finally {
      setTransferState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen gradient-bg text-white">
      <div className="container mx-auto px-4 py-8">
        <Header
          connected={connected}
          account={account}
          balance={balance}
          isLoadingBalance={isLoadingBalance}
          onConnect={connectWallet}
          onRefreshBalance={handleRefreshBalance}
        />

        <Tabs defaultValue="bridge" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 glass-effect">
            <TabsTrigger value="bridge" className="text-lg data-[state=active]:bg-white/10">
              Bridge Assets
            </TabsTrigger>
            <TabsTrigger value="history" className="text-lg data-[state=active]:bg-white/10">
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bridge">
            <TransferForm
              state={transferState}
              connected={connected}
              balance={balance}
              onSourceChainChange={(value) => setTransferState(prev => ({ ...prev, sourceChain: value }))}
              onDestinationChainChange={(value) => setTransferState(prev => ({ ...prev, destinationChain: value }))}
              onAmountChange={(value) => setTransferState(prev => ({ ...prev, amount: value }))}
              onMaxClick={() => setTransferState(prev => ({ 
                ...prev, 
                amount: balance[prev.sourceChain] || '0' 
              }))}
              onTransfer={handleTransfer}
            />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory transactions={transactions} />
          </TabsContent>
        </Tabs>

        {transferState.error && (
          <Alert variant="destructive" className="mt-4 max-w-4xl mx-auto glass-effect border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{transferState.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}