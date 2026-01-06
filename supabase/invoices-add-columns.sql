-- Add missing columns to invoices table for simplified Stripe link system

-- Add user_id column (if it doesn't exist, check first)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
  END IF;
END $$;

-- Add stripe_link column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'stripe_link'
  ) THEN
    ALTER TABLE invoices ADD COLUMN stripe_link TEXT;
  END IF;
END $$;

-- Add receipt_url column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE invoices ADD COLUMN receipt_url TEXT;
  END IF;
END $$;

-- Add description column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'description'
  ) THEN
    ALTER TABLE invoices ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add updated_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Update status check constraint to only allow 'pending' and 'paid'
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('pending', 'paid'));

-- Add trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

