'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SUPPORTED_CHAINS } from '@/config/chains';
import { TransferState } from '@/types';
import { Lock, Unlock, Send, Loader2 } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

interface TransferFormProps {
  state: TransferState;
  onSourceChainChange: (value: string) => void;
  onDestinationChainChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTokenIdChange: (value: string) => void;
  onTransfer: () => Promise<void>;
}

interface FormState {
  // Lock and Mint
  lockAssetType: 'ERC20' | 'ERC721';
  lockAsset: string;
  lockAmount: string;
  lockReceiverAddress: string;
  lockDestinationChain: string;

  // Burn and Unlock
  burnAssetType: 'ERC20' | 'ERC721';
  burnAsset: string;
  burnAmount: string;
  burnTokenId: string;

  // Token Transfer
  transferAssetType: 'ERC20' | 'ERC721';
  transferAsset: string;
  transferSourceChain: string;
  transferDestinationChain: string;
  transferAmount: string;
  transferReceiverAddress: string;
  transferTokenId: string;
}

export function TransferForm({
  state,
  onSourceChainChange,
  onDestinationChainChange,
  onAmountChange,
  onTokenIdChange,
  onTransfer
}: TransferFormProps) {
  const { connected, account, chainId } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeOperation, setActiveOperation] = useState<'lock' | 'burn' | 'transfer'>('lock');
  const [formState, setFormState] = useState<FormState>({
    // Lock and Mint
    lockAssetType: 'ERC20',
    lockAsset: '',
    lockAmount: '',
    lockReceiverAddress: '',
    lockDestinationChain: '',

    // Burn and Unlock
    burnAssetType: 'ERC20',
    burnAsset: '',
    burnAmount: '',
    burnTokenId: '',

    // Token Transfer
    transferAssetType: 'ERC20',
    transferAsset: '',
    transferSourceChain: '',
    transferDestinationChain: '',
    transferAmount: '',
    transferReceiverAddress: '',
    transferTokenId: ''
  });

  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validateForm = (operation: 'lock' | 'burn' | 'transfer'): boolean => {
    const newErrors: Partial<FormState> = {};

    switch (operation) {
      case 'lock':
        if (!formState.lockAsset) {
          newErrors.lockAsset = 'Please select an asset';
        }
        if (!formState.lockAmount || parseFloat(formState.lockAmount) <= 0) {
          newErrors.lockAmount = 'Please enter a valid amount';
        }
        if (!formState.lockReceiverAddress || !formState.lockReceiverAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          newErrors.lockReceiverAddress = 'Please enter a valid address';
        }
        if (!formState.lockDestinationChain) {
          newErrors.lockDestinationChain = 'Please select a destination chain';
        }
        break;

      case 'burn':
        if (!formState.burnAsset) {
          newErrors.burnAsset = 'Please select an asset';
        }
        if (formState.burnAssetType === 'ERC20' && (!formState.burnAmount || parseFloat(formState.burnAmount) <= 0)) {
          newErrors.burnAmount = 'Please enter a valid amount';
        }
        if (formState.burnAssetType === 'ERC721' && !formState.burnTokenId) {
          newErrors.burnTokenId = 'Please enter a token ID';
        }
        break;

      case 'transfer':
        if (!formState.transferAsset) {
          newErrors.transferAsset = 'Please select an asset';
        }
        if (!formState.transferSourceChain) {
          newErrors.transferSourceChain = 'Please select a source chain';
        }
        if (!formState.transferDestinationChain) {
          newErrors.transferDestinationChain = 'Please select a destination chain';
        }
        if (!formState.transferAmount || parseFloat(formState.transferAmount) <= 0) {
          newErrors.transferAmount = 'Please enter a valid amount';
        }
        if (!formState.transferReceiverAddress || !formState.transferReceiverAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          newErrors.transferReceiverAddress = 'Please enter a valid address';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (operation: 'lock' | 'burn' | 'transfer') => {
    if (!validateForm(operation)) {
      return;
    }
    setActiveOperation(operation);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      await onTransfer();
      toast({
        title: 'Success',
        description: 'Transaction completed successfully',
      });

      // Clear form fields
      setFormState(prev => ({
        ...prev,
        [`${activeOperation}Amount`]: '',
        [`${activeOperation}TokenId`]: '',
        [`${activeOperation}ReceiverAddress`]: '',
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Transaction failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <NetworkStatus
        chainId={chainId}
        connected={connected}
      />

      <Card className="card-gradient p-8">
        <Tabs defaultValue="lock">
          <TabsList className="grid grid-cols-3 gap-4 mb-6">
            <TabsTrigger value="lock" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Lock & Mint
            </TabsTrigger>
            <TabsTrigger value="burn" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Burn & Unlock
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Token Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lock" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Asset Type</Label>
                <Select
                  value={formState.lockAssetType}
                  onValueChange={(value: 'ERC20' | 'ERC721') => 
                    setFormState(prev => ({ ...prev, lockAssetType: value }))
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC20">ERC-20</SelectItem>
                    <SelectItem value="ERC721">ERC-721</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Asset</Label>
                <Select
                  value={formState.lockAsset}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, lockAsset: value }))}
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="POLY">POLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formState.lockAmount}
                  onChange={(e) => setFormState(prev => ({ ...prev, lockAmount: e.target.value }))}
                  className="glass-effect"
                  error={errors.lockAmount}
                />
                {errors.lockAmount && <p className="text-red-500 text-sm mt-1">{errors.lockAmount}</p>}
              </div>

              <div>
                <Label>Receiver Address on Chain B</Label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={formState.lockReceiverAddress}
                  onChange={(e) => setFormState(prev => ({ ...prev, lockReceiverAddress: e.target.value }))}
                  className="glass-effect"
                  error={errors.lockReceiverAddress}
                />
                {errors.lockReceiverAddress && <p className="text-red-500 text-sm mt-1">{errors.lockReceiverAddress}</p>}
              </div>

              <div>
                <Label>Destination Chain</Label>
                <Select
                  value={formState.lockDestinationChain}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, lockDestinationChain: value }))}
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amoy">Amoy Testnet</SelectItem>
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.lockDestinationChain && <p className="text-red-500 text-sm mt-1">{errors.lockDestinationChain}</p>}
              </div>

              <Button
                onClick={() => handleSubmit('lock')}
                disabled={!connected || loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Lock & Mint
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="burn" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Asset Type</Label>
                <Select
                  value={formState.burnAssetType}
                  onValueChange={(value: 'ERC20' | 'ERC721') => 
                    setFormState(prev => ({ ...prev, burnAssetType: value }))
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC20">ERC-20</SelectItem>
                    <SelectItem value="ERC721">ERC-721</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Asset</Label>
                <Select
                  value={formState.burnAsset}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, burnAsset: value }))}
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="POLY">POLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formState.burnAssetType === 'ERC20' ? (
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={formState.burnAmount}
                    onChange={(e) => setFormState(prev => ({ ...prev, burnAmount: e.target.value }))}
                    className="glass-effect"
                    error={errors.burnAmount}
                  />
                  {errors.burnAmount && <p className="text-red-500 text-sm mt-1">{errors.burnAmount}</p>}
                </div>
              ) : (
                <div>
                  <Label>Token ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter token ID"
                    value={formState.burnTokenId}
                    onChange={(e) => setFormState(prev => ({ ...prev, burnTokenId: e.target.value }))}
                    className="glass-effect"
                    error={errors.burnTokenId}
                  />
                  {errors.burnTokenId && <p className="text-red-500 text-sm mt-1">{errors.burnTokenId}</p>}
                </div>
              )}

              <Button
                onClick={() => handleSubmit('burn')}
                disabled={!connected || loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlock className="h-4 w-4 mr-2" />
                )}
                Burn & Unlock
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Asset Type</Label>
                <Select
                  value={formState.transferAssetType}
                  onValueChange={(value: 'ERC20' | 'ERC721') => 
                    setFormState(prev => ({ ...prev, transferAssetType: value }))
                  }
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC20">ERC-20</SelectItem>
                    <SelectItem value="ERC721">ERC-721</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Asset</Label>
                <Select
                  value={formState.transferAsset}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, transferAsset: value }))}
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="POLY">POLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Source Chain</Label>
                <Select
                  value={formState.transferSourceChain}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, transferSourceChain: value }))}
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amoy">Amoy Testnet</SelectItem>
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Chain</Label>
                <Select
                  value={formState.transferDestinationChain}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, transferDestinationChain: value }))}
                >
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amoy">Amoy Testnet</SelectItem>
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formState.transferAmount}
                  onChange={(e) => setFormState(prev => ({ ...prev, transferAmount: e.target.value }))}
                  className="glass-effect"
                  error={errors.transferAmount}
                />
                {errors.transferAmount && <p className="text-red-500 text-sm mt-1">{errors.transferAmount}</p>}
              </div>

              <div>
                <Label>Receiver Address</Label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={formState.transferReceiverAddress}
                  onChange={(e) => setFormState(prev => ({ ...prev, transferReceiverAddress: e.target.value }))}
                  className="glass-effect"
                  error={errors.transferReceiverAddress}
                />
                {errors.transferReceiverAddress && <p className="text-red-500 text-sm mt-1">{errors.transferReceiverAddress}</p>}
              </div>

              {formState.transferAssetType === 'ERC721' && (
                <div>
                  <Label>Token ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter token ID"
                    value={formState.transferTokenId}
                    onChange={(e) => setFormState(prev => ({ ...prev, transferTokenId: e.target.value }))}
                    className="glass-effect"
                  />
                </div>
              )}

              <Button
                onClick={() => handleSubmit('transfer')}
                disabled={!connected || loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Transfer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to proceed with this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}