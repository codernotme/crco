/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_address` (text)
      - `source_chain` (text)
      - `destination_chain` (text)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `hash` (text)
      - `is_nft` (boolean)
      - `token_id` (numeric)
      
  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  source_chain text NOT NULL,
  destination_chain text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  hash text,
  is_nft boolean DEFAULT false,
  token_id numeric,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'wallet_address' = user_address);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'wallet_address' = user_address);

-- Create index for faster queries
CREATE INDEX idx_transactions_user_address ON transactions(user_address);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();