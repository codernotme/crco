import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, CreditCard } from 'lucide-react';

interface AssetSelectorProps {
  balance: string;
  tokenSymbol: string;
  onAssetTypeChange: (type: 'token' | 'nft') => void;
  onAmountChange: (amount: string) => void;
  onTokenIdChange?: (tokenId: string) => void;
  onMaxClick: () => void;
  disabled?: boolean;
}

export function AssetSelector({
  balance,
  tokenSymbol,
  onAssetTypeChange,
  onAmountChange,
  onTokenIdChange,
  onMaxClick,
  disabled
}: AssetSelectorProps) {
  const [assetType, setAssetType] = useState<'token' | 'nft'>('token');

  const handleAssetTypeChange = (value: string) => {
    const type = value as 'token' | 'nft';
    setAssetType(type);
    onAssetTypeChange(type);
  };

  return (
    <Card className="card-gradient p-6">
      <Tabs defaultValue="token" onValueChange={handleAssetTypeChange}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="token" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="nft" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            NFTs
          </TabsTrigger>
        </TabsList>

        {assetType === 'token' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => onAmountChange(e.target.value)}
                  className="glass-effect pr-16"
                  disabled={disabled}
                  min="0"
                  step="0.000000000000000001"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={onMaxClick}
                  disabled={disabled}
                >
                  MAX
                </Button>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Balance: {balance} {tokenSymbol}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">NFT ID</label>
              <Input
                type="number"
                placeholder="Enter NFT ID"
                onChange={(e) => onTokenIdChange?.(e.target.value)}
                className="glass-effect"
                disabled={disabled}
                min="0"
              />
            </div>
          </div>
        )}
      </Tabs>
    </Card>
  );
}