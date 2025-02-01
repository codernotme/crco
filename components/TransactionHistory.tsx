import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return variants[status as keyof typeof variants];
  };

  const getExplorerUrl = (tx: Transaction) => {
    const chain = SUPPORTED_CHAINS[tx.sourceChain];
    return `${chain.explorerUrl}/tx/${tx.id}`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono">
                  <a
                    href={getExplorerUrl(tx)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    {tx.id.slice(0, 8)}...
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </TableCell>
                <TableCell className="font-mono">{tx.from.slice(0, 6)}...</TableCell>
                <TableCell className="font-mono">{tx.to.slice(0, 6)}...</TableCell>
                <TableCell>{tx.amount} {SUPPORTED_CHAINS[tx.sourceChain].tokenSymbol}</TableCell>
                <TableCell>
                  {SUPPORTED_CHAINS[tx.sourceChain].name} → {SUPPORTED_CHAINS[tx.destinationChain].name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusBadge(tx.status)}
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatTime(tx.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}