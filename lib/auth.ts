import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithMetaMask() {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Get or create nonce
    const { data: existingNonce } = await supabase
      .from('wallet_auth')
      .select('nonce')
      .eq('address', address.toLowerCase())
      .single();

    let nonce;
    if (!existingNonce) {
      nonce = Math.random().toString(36).substring(2);
      await supabase
        .from('wallet_auth')
        .insert([{ address: address.toLowerCase(), nonce }]);
    } else {
      nonce = existingNonce.nonce;
    }

    // Sign message
    const message = `Sign this message to authenticate with CrCo Bridge\nNonce: ${nonce}`;
    const signature = await signer.signMessage(message);

    // Verify signature on server
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${address.toLowerCase()}@wallet.local`,
      password: signature,
    });

    if (error) throw error;

    // Update last signed timestamp
    await supabase
      .from('wallet_auth')
      .update({ last_signed: new Date().toISOString() })
      .eq('address', address.toLowerCase());

    return data;
  } catch (error) {
    console.error('Error signing in with MetaMask:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}