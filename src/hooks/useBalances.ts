import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, getContract } from 'viem';
import { useNetwork } from '../contexts/NetworkContext';
import { useWallet } from '../contexts/WalletContext';
import { erc20ABI } from '../contracts/abi/erc20';

interface Balances {
  [networkId: string]: {
    [tokenSymbol: string]: bigint;
  };
}

// Token addresses for each network
const TOKEN_ADDRESSES = {
  sepolia: {
    USDC: import.meta.env.VITE_USDC_ADDRESS_SEPOLIA as `0x${string}`,
    USDT: import.meta.env.VITE_USDT_ADDRESS_SEPOLIA as `0x${string}`,
  },
  amoy: {
    USDC: import.meta.env.VITE_USDC_ADDRESS_AMOY as `0x${string}`,
    USDT: import.meta.env.VITE_USDT_ADDRESS_AMOY as `0x${string}`,
  },
};

export function useBalances() {
  const { networks } = useNetwork();
  const { account } = useWallet();
  const [balances, setBalances] = useState<Balances>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    if (!account) {
      setBalances({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const newBalances: Balances = {};

    try {
      await Promise.all(
        networks.map(async (network) => {
          const client = createPublicClient({
            chain: { id: network.chainId, name: network.name, rpcUrls: { default: { http: [network.rpcUrl] } }, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
            transport: http(network.rpcUrl)
          });

          // Fetch native token balance
          const ethBalance = await client.getBalance({ address: account as `0x${string}` });
          newBalances[network.id] = {
            ETH: ethBalance,
          };

          // Fetch ERC20 token balances
          const networkTokens = TOKEN_ADDRESSES[network.id as keyof typeof TOKEN_ADDRESSES];
          if (networkTokens) {
            await Promise.all(
              Object.entries(networkTokens).map(async ([symbol, address]) => {
                const tokenContract = getContract({
                  address,
                  abi: erc20ABI,
                  client,
                });

                const balance = await tokenContract.read.balanceOf([account as `0x${string}`]);
                newBalances[network.id][symbol] = balance;
              })
            );
          }
        })
      );

      setBalances(newBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, networks]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    refetch: fetchBalances,
    getTokenAddress: (networkId: string, symbol: string) => {
      return TOKEN_ADDRESSES[networkId as keyof typeof TOKEN_ADDRESSES]?.[symbol as keyof typeof TOKEN_ADDRESSES['sepolia']];
    }
  };
}