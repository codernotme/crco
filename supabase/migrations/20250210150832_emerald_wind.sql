/*
  # Authentication and Bridge Setup

  1. New Tables
    - `wallet_auth`
      - `address` (text, primary key) - Wallet address
      - `nonce` (text) - Random nonce for signing
      - `last_signed` (timestamptz) - Last signature timestamp
      - `created_at` (timestamptz)
    
    - `bridge_transactions`
      - `id` (uuid, primary key)
      - `tx_hash` (text)
      - `from_chain` (text)
      - `to_chain` (text)
      - `token_address` (text)
      - `amount` (numeric)
      - `sender` (text)
      - `receiver` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `bridge_state`
      - `chain_id` (text, primary key)
      - `locked_tokens` (numeric)
      - `minted_tokens` (numeric)
      - `last_processed_block` (numeric)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Add trigger for updating timestamps
*/

-- Wallet Authentication
CREATE TABLE IF NOT EXISTS wallet_auth (
  address text PRIMARY KEY,
  nonce text NOT NULL,
  last_signed timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallet_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for wallet_auth"
  ON wallet_auth
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own auth"
  ON wallet_auth
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'wallet_address' = address);

-- Bridge Transactions
CREATE TABLE IF NOT EXISTS bridge_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash text,
  from_chain text NOT NULL,
  to_chain text NOT NULL,
  token_address text NOT NULL,
  amount numeric NOT NULL,
  sender text NOT NULL,
  receiver text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  nonce numeric,
  proof jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bridge_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own transactions"
  ON bridge_transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'wallet_address' = sender OR 
    auth.jwt() ->> 'wallet_address' = receiver
  );

CREATE POLICY "Users can insert their own transactions"
  ON bridge_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'wallet_address' = sender);

-- Bridge State
CREATE TABLE IF NOT EXISTS bridge_state (
  chain_id text PRIMARY KEY,
  locked_tokens numeric DEFAULT 0,
  minted_tokens numeric DEFAULT 0,
  last_processed_block numeric DEFAULT 0,
  chain_mappings jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bridge_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for bridge state"
  ON bridge_state
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for better query performance
CREATE INDEX idx_bridge_transactions_sender ON bridge_transactions(sender);
CREATE INDEX idx_bridge_transactions_receiver ON bridge_transactions(receiver);
CREATE INDEX idx_bridge_transactions_status ON bridge_transactions(status);
CREATE INDEX idx_bridge_transactions_created_at ON bridge_transactions(created_at);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bridge_transactions_timestamp
  BEFORE UPDATE ON bridge_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bridge_state_timestamp
  BEFORE UPDATE ON bridge_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();