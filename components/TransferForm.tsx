'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SUPPORTED_CHAINS, HIGH_VALUE_THRESHOLD } from '@/config/chains';
import { TransferState } from '@/types';
import { ArrowDownUp, ArrowRight, Shield } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';
import { AssetSelector } from './AssetSelector';
import { NFTPreview } from './NFTPreview';
import { useWallet } from '@/hooks/useWallet';
import { TwoFactorAuth } from './TwoFactorAuth';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

interface TransferFormProps {
  state: TransferState;
  onSourceChainChange: (value: string) => void;
  onDestinationChainChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTokenIdChange: (value: string) => void;
  onAssetTypeChange: (type: 'token' | 'nft') => void;
  onTransfer: () => Promise<void>;
  onMaxClick: () => void;
}

export function TransferForm({
  state,
  onSourceChainChange,
  onDestinationChainChange,
  onAmountChange,
  onTokenIdChange,
  onAssetTypeChange,
  onTransfer,
  onMaxClick
}: TransferFormProps) {
  const { connected, account, chainId, balance, provider } = useWallet();
  const { toast } = useToast();
  const [bridgeFee, setBridgeFee] = useState<string>('0');
  const [requires2FA, setRequires2FA] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const fetchBridgeFee = async () => {
      if (!provider || !state.sourceChain) return;

      try {
        const bridgeContract = new ethers.Contract(
          SUPPORTED_CHAINS[state.sourceChain].bridgeAddress,
          ['function bridgeFee() view returns (uint256)'],
          provider
        );

        const fee = await bridgeContract.bridgeFee();
        setBridgeFee(ethers.utils.formatEther(fee));
      } catch (err) {
        console.error('Failed to fetch bridge fee:', err);
      }
    };

    fetchBridgeFee();
  }, [provider, state.sourceChain]);

  useEffect(() => {
    const amount = ethers.utils.parseEther(state.amount || '0');
    setRequires2FA(amount.gte(ethers.utils.parseEther(HIGH_VALUE_THRESHOLD)));
  }, [state.amount]);

  const handleTransfer = async () => {
    if (requires2FA && !verificationCode) {
      setShow2FA(true);
      return;
    }

    try {
      await onTransfer();
      toast({
        title: 'Transfer Initiated',
        description: 'Your transfer has been initiated successfully.',
      });
    } catch (err) {
      toast({
        title: 'Transfer Failed',
        description: err instanceof Error ? err.message : 'Failed to initiate transfer',
        variant: 'destructive',
      });
    }
  };

  const swapChains = () => {
    const temp = state.sourceChain;
    onSourceChainChange(state.destinationChain);
    onDestinationChainChange(temp);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <NetworkStatus
        chainId={chainId}
        connected={connected}
      />

      <Card className="card-gradient p-8">
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
                      <div className="flex items-center space-x-2">
                        <img src={chain.icon} alt={chain.name} className="w-5 h-5" />
                        <span>{chain.name}</span>
                      </div>
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
                        <div className="flex items-center space-x-2">
                          <img src={chain.icon} alt={chain.name} className="w-5 h-5" />
                          <span>{chain.name}</span>
                        </div>
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
            onAssetTypeChange={(type) => onAssetTypeChange(type ? 'nft' : 'token')}
            onAmountChange={onAmountChange}
            onTokenIdChange={onTokenIdChange}
            onMaxClick={onMaxClick}
            disabled={!connected}
          />

          {state.isNFT && state.tokenId && (
            <NFTPreview
              tokenId={String(state.tokenId)}
              chainId={String(state.sourceChain)}
              contractAddress={SUPPORTED_CHAINS[state.sourceChain].tokenAddress}
            />
          )}

          {requires2FA && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <Shield className="h-4 w-4" />
              <span className="text-sm">2FA required for high-value transfer</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between text-sm text-white/60">
              <span>Bridge Fee</span>
              <span>{bridgeFee} {SUPPORTED_CHAINS[state.sourceChain].nativeCurrency.symbol}</span>
            </div>

            <Button
              onClick={handleTransfer}
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

      <TwoFactorAuth
        open={show2FA}
        onOpenChange={setShow2FA}
        onVerify={(code) => {
          setVerificationCode(code);
          setShow2FA(false);
          handleTransfer();
        }}
      />
    </div>
  );
}