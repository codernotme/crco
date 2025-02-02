import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/config/chains';

interface NetworkStatusProps {
  chainId: string;
  connected: boolean;
  latency?: number;
}

export function NetworkStatus({ chainId, connected, latency }: NetworkStatusProps) {
  const currentNetwork = Object.values(SUPPORTED_CHAINS).find(
    chain => chain.id.toLowerCase() === chainId.toLowerCase()
  );

  const getLatencyColor = (ms: number) => {
    if (ms < 100) return 'text-green-400';
    if (ms < 300) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="card-gradient p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {connected ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <div>
            <h4 className="text-sm font-medium">Network Status</h4>
            <p className="text-xs text-white/60">
              {currentNetwork?.name || 'Unknown Network'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {connected && latency && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Activity className={`h-3 w-3 ${getLatencyColor(latency)}`} />
                  <span className={`text-xs ${getLatencyColor(latency)}`}>
                    {latency}ms
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Network Latency</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Badge
            variant={connected ? 'default' : 'destructive'}
            className="text-xs"
          >
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}