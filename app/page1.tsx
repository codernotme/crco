'use client';

import { useState } from 'react';
import { BridgeStats } from '@/components/BridgeStats';
import { TransferForm } from '@/components/TransferForm1';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Header } from '@/components/Header';
import { PriceChart } from '@/components/PriceChart';
import { GasTracker } from '@/components/GasTracker';
import { TransactionSpeedEstimator } from '@/components/TransactionSpeedEstimator';
import { BridgeFeeCalculator } from '@/components/BridgeFeeCalculator';
import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';
import { TransactionFilters } from '@/components/TransactionFilters';
import { PriceFeed } from '@/components/PriceFeed';
import { Guide } from '@/components/Guide';
import { useWallet } from '@/hooks/useWallet';
import { Transaction, TransferState } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { initiateTransfer } from '@/utils/initiateTransfer';

export default function Home() {
  const { connected, account, chainId, balance, connectWallet, updateBalances } = useWallet();
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferState, setTransferState] = useState<TransferState>({
    amount: '',
    sourceChain: 'ethereum' as 'ethereum' | 'polygon',
    destinationChain: 'polygon' as 'ethereum' | 'polygon',
    loading: false,
    error: null,
    isNFT: false,
    tokenId: undefined
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
        sourceChain: transferState.sourceChain as 'ethereum' | 'polygon',
        destinationChain: transferState.destinationChain as 'ethereum' | 'polygon',
        isNFT: transferState.isNFT,
        tokenId: transferState.tokenId?.toString()
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
          tokenId: transferState.tokenId ? transferState.tokenId : undefined,
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
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <Header
            connected={connected}
            account={account}
            balance={balance}
            isLoadingBalance={isLoadingBalance}
            onConnect={connectWallet}
            onRefreshBalance={handleRefreshBalance}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PriceChart symbol="ETHUSDT" />
            </div>
            <div>
              <GasTracker />
            </div>
          </div>

          <PriceFeed />
          <div className="my-8">
            <PortfolioAnalytics />
          </div>

          <BridgeStats />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <TransferForm
                state={transferState}
                onSourceChainChange={(value) => setTransferState((prev) => ({ ...prev, sourceChain: value }))}
                onDestinationChainChange={(value) => setTransferState((prev) => ({ ...prev, destinationChain: value }))}
                onAmountChange={(value) => setTransferState((prev) => ({ ...prev, amount: value }))}
                onTokenIdChange={(value) => setTransferState((prev) => ({ ...prev, tokenId: Number(value) }))}
                onAssetTypeChange={(isNFT) => setTransferState((prev) => ({ ...prev, isNFT: isNFT === 'nft' }))}
                onTransfer={handleTransfer}
                onMaxClick={() =>
                  setTransferState((prev) => ({
                    ...prev,
                    amount: balance?.[prev.sourceChain] || '0',
                  }))
                }
              />
            </div>
            <div>
              <div className="space-y-6">
                <TransactionSpeedEstimator />
                <BridgeFeeCalculator />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <TransactionFilters
              onFilterChange={(filters) => {
                console.log('Filters:', filters);
              }}
            />
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        <Guide />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}