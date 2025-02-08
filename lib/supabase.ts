import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithMetaMask() {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Get the nonce for this wallet address
    const { data: nonceData } = await supabase
      .from('wallet_nonce')
      .select('nonce')
      .eq('wallet_address', address.toLowerCase())
      .single();

    const nonce = nonceData?.nonce;
    let newNonce: string | undefined;

    // If no nonce exists, create one
    if (!nonce) {
      newNonce = Math.floor(Math.random() * 1000000).toString();
      await supabase
        .from('wallet_nonce')
        .insert([{ wallet_address: address.toLowerCase(), nonce: newNonce }]);
    }

    // Sign the nonce
    const signature = await signer.signMessage(
      `Sign this message to authenticate with CrCo Bridge. Nonce: ${nonce || newNonce}`
    );

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${address.toLowerCase()}@wallet.local`,
      password: signature,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with MetaMask:', error);
    throw error;
  }
}