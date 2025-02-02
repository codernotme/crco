import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransferReceipt } from '@/types';
import { FileCheck } from 'lucide-react';

interface TransactionProofProps {
  receipt: TransferReceipt;
  proof?: string[];
}

export function TransactionProof({ receipt, proof }: TransactionProofProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="card-gradient p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Transfer Receipt
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(receipt.transferId)}
          className="text-xs"
        >
          Copy ID
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Transfer ID:</span>
          <span className="font-mono">{receipt.transferId.slice(0, 10)}...{receipt.transferId.slice(-8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">From:</span>
          <span className="font-mono">{receipt.sender.slice(0, 6)}...{receipt.sender.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">To:</span>
          <span className="font-mono">{receipt.recipient.slice(0, 6)}...{receipt.recipient.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Amount:</span>
          <span>{receipt.amount} {receipt.isNFT ? `(NFT #${receipt.tokenId})` : 'CRCO'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Timestamp:</span>
          <span>{formatTime(receipt.timestamp)}</span>
        </div>
      </div>

      {proof && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium mb-2">Merkle Proof</h4>
          <div className="bg-black/20 p-2 rounded-md">
            <pre className="text-xs overflow-x-auto">
              {proof.map((hash, i) => (
                <div key={i} className="font-mono">
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}