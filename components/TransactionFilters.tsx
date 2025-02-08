'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface FilterOptions {
  dateRange: string;
  status: string;
  chain: string;
  type: string;
  minAmount: string;
  maxAmount: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: '24h',
    status: 'all',
    chain: 'all',
    type: 'all',
    minAmount: '',
    maxAmount: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: '24h',
      status: 'all',
      chain: 'all',
      type: 'all',
      minAmount: '',
      maxAmount: ''
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <Card className="card-gradient p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Transaction Filters</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-white/60 hover:text-white"
        >
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">Time Range</label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger className="glass-effect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="glass-effect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Chain</label>
          <Select
            value={filters.chain}
            onValueChange={(value) => handleFilterChange('chain', value)}
          >
            <SelectTrigger className="glass-effect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                <SelectItem key={id} value={id}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Type</label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger className="glass-effect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="token">Tokens</SelectItem>
              <SelectItem value="nft">NFTs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Min Amount</label>
          <Input
            type="number"
            placeholder="0.0"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            className="glass-effect"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Max Amount</label>
          <Input
            type="number"
            placeholder="∞"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            className="glass-effect"
          />
        </div>
      </div>
    </Card>
  );
}