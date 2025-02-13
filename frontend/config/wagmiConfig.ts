import { createConfig } from '@wagmi/core';
import { mainnet, polygon, bsc, avalanche } from 'viem/chains';
import { http } from 'viem';

export const config = createConfig({
  chains: [mainnet, polygon, bsc, avalanche],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
  },
});