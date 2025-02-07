'use client';

import { useState } from 'react';
import { BridgeStats } from '@/components/BridgeStats';
import { TransferForm } from '@/components/TransferForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Header } from '@/components/Header';
import { useWallet } from '@/hooks/useWallet';
import { Transaction, TransferState } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { initiateTransfer } from '@/utils/initiateTransfer';
import { SUPPORTED_CHAINS } from '@/config/chains';

export default function Home() {
  const { connected, account, chainId, balance, connectWallet, updateBalances } = useWallet();
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferState, setTransferState] = useState<TransferState>({
    amount: '',
    sourceChain: 'ethereum',
    destinationChain: 'polygon',
    loading: false,
    error: null,
    isNFT: false,
    tokenId: '',
  });

  const handleRefreshBalance = async () => {
    if (!account) return;
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

    setTransferState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const tx = await initiateTransfer({
        account,
        amount: transferState.amount,
        sourceChain: transferState.sourceChain,
        destinationChain: transferState.destinationChain,
        isNFT: transferState.isNFT,
        tokenId: transferState.tokenId
      });

      setTransactions((prev) => [
        {
          id: tx.transactionHash,
          from: account,
          to: account,
          amount: transferState.amount,
          sourceChain: transferState.sourceChain,
          destinationChain: transferState.destinationChain,
          status: 'pending',
          timestamp: Date.now(),
          isNFT: transferState.isNFT,
          tokenId: transferState.tokenId ? parseInt(transferState.tokenId) : undefined,
        },
        ...prev,
      ]);

      setTransferState((prev) => ({ ...prev, amount: '' }));
    } catch (err) {
      setTransferState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Transfer failed',
      }));
    } finally {
      setTransferState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-gradient-to-b from-background to-accent">
        <div className="container mx-auto px-4 py-8">
          <Header
            connected={connected}
            account={account}
            balance={balance}
            isLoadingBalance={isLoadingBalance}
            onConnect={connectWallet}
            onRefreshBalance={handleRefreshBalance}
          />

          <BridgeStats />

          <TransferForm
            state={transferState}
            onSourceChainChange={(value) => setTransferState((prev) => ({ ...prev, sourceChain: value }))}
            onDestinationChainChange={(value) => setTransferState((prev) => ({ ...prev, destinationChain: value }))}
            onAmountChange={(value) => setTransferState((prev) => ({ ...prev, amount: value }))}
            onTokenIdChange={(value) => setTransferState((prev) => ({ ...prev, tokenId: value }))}
            onAssetTypeChange={(isNFT) => setTransferState((prev) => ({ ...prev, isNFT }))}
            onTransfer={handleTransfer}
            onMaxClick={() =>
              setTransferState((prev) => ({
                ...prev,
                amount: balance?.[prev.sourceChain] || '0',
              }))
            }
          />

          <div className="mt-8">
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}