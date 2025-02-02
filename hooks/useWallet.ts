import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, TransferReceipt } from '@/types';
import { SUPPORTED_CHAINS } from '@/config/chains';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: '',
    chainId: '',
    balance: {},
    provider: null,
    signer: null
  });

  // Ensure safe access to `window.ethereum`
  const isEthereumAvailable = typeof window !== 'undefined' && (window as any).ethereum;

  // Connect Wallet
  const connectWallet = useCallback(async () => {
    if (!isEthereumAvailable) {
      console.error('MetaMask not detected');
      return;
    }

    try {
      const ethereum = (window as any).ethereum;
      await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      setState(prev => ({
        ...prev,
        connected: true,
        account: accounts[0],
        chainId: `0x${network.chainId.toString(16)}`,
        provider,
        signer
      }));

      await updateBalances(accounts[0], provider);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  }, [isEthereumAvailable]);

  // Switch Network
  const switchNetwork = useCallback(async (chainId: string) => {
    if (!isEthereumAvailable) return;

    const ethereum = (window as any).ethereum;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
        if (chain) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chain.id,
              rpcUrls: [chain.rpcUrl],
              chainName: chain.name,
              nativeCurrency: {
                name: chain.tokenSymbol,
                symbol: chain.tokenSymbol,
                decimals: 18
              },
              blockExplorerUrls: [chain.explorerUrl]
            }],
          });
        }
      } else {
        console.error('Error switching network:', error);
      }
    }
  }, [isEthereumAvailable]);

  // Update Balances
  const updateBalances = useCallback(async (account: string, provider?: ethers.providers.Web3Provider) => {
    if (!provider && !state.provider) return;

    const currentProvider = provider || state.provider!;
    const balances: Record<string, string> = {};

    for (const [chainId, chain] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        const tokenAddress = process.env[`NEXT_PUBLIC_${chain.name.toUpperCase()}_TOKEN_ADDRESS`];
        if (!tokenAddress) throw new Error(`Token address not found for chain ${chain.name}`);
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          currentProvider
        );
        const balance = await tokenContract.balanceOf(account);
        balances[chainId] = ethers.utils.formatUnits(balance, 18);
      } catch (err) {
        console.error(`Failed to fetch balance for ${chainId}:`, err);
        balances[chainId] = '0';
      }
    }

    setState(prev => ({ ...prev, balance: balances }));
  }, [state.provider]);

  // Initiate Transfer
  const initiateTransfer = useCallback(async (
    recipient: string,
    amount: string,
    sourceChain: string,
    destinationChain: string,
    isNFT: boolean = false,
    tokenId?: number
  ) => {
    if (!state.signer || !SUPPORTED_CHAINS[sourceChain]) {
      console.error('Wallet not connected or invalid chain');
      return;
    }

    await switchNetwork(SUPPORTED_CHAINS[sourceChain].id);

    const bridgeAddress = process.env[`NEXT_PUBLIC_${SUPPORTED_CHAINS[sourceChain].name.toUpperCase()}_BRIDGE_ADDRESS`];
    if (!bridgeAddress) throw new Error(`Bridge address not found for chain ${SUPPORTED_CHAINS[sourceChain].name}`);

    const bridgeContract = new ethers.Contract(
      bridgeAddress,
      [
        'function initiateTransfer(address,uint256,uint256,bool,uint256) external',
        'function getTransferReceipt(bytes32) view returns (tuple(bytes32,address,address,uint256,uint256,bool,uint256))'
      ],
      state.signer
    );

    try {
      const tx = await bridgeContract.initiateTransfer(
        recipient,
        ethers.utils.parseUnits(amount, 18),
        parseInt(SUPPORTED_CHAINS[destinationChain].id, 16),
        isNFT,
        tokenId || 0
      );

      const receipt = await tx.wait();
      const transferEvent = receipt.events?.find((e: any) => e.event === 'TransferInitiated');

      if (transferEvent) {
        const transferId = transferEvent.args.transferId;
        const transferReceipt = await bridgeContract.getTransferReceipt(transferId);
        return { transferId, receipt: transferReceipt };
      }
    } catch (err) {
      console.error('Transfer failed:', err);
    }

    throw new Error('Transfer failed');
  }, [state.signer, switchNetwork]);

  // Handle Account and Network Changes
  useEffect(() => {
    if (!isEthereumAvailable) return;

    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState({
          connected: false,
          account: '',
          chainId: '',
          balance: {},
          provider: null,
          signer: null
        });
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
        if (state.provider) updateBalances(accounts[0], state.provider);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
      if (state.account && state.provider) {
        updateBalances(state.account, state.provider);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isEthereumAvailable, state.account, state.provider, updateBalances]);

  return {
    ...state,
    connectWallet,
    updateBalances,
    switchNetwork,
    initiateTransfer
  };
}
