'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface PriceChartProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

export function PriceChart({ symbol, interval = '1D', theme = 'dark' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [symbol, interval, theme]);

  return (
    <Card className="card-gradient p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{symbol} Price Chart</h3>
        <div className="flex items-center gap-2">
          <span className="text-green-400 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +2.45%
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            24h
          </span>
        </div>
      </div>
      <div className="relative aspect-[16/9]">
        <div
          id={`tradingview_${symbol.toLowerCase()}`}
          ref={containerRef}
          className="w-full h-full"
        />
      </div>
    </Card>
  );
}