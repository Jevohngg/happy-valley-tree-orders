/*
  # Add Customer Name Fields to Orders

  ## Changes
  - Add `customer_first_name` text field to orders table
  - Add `customer_last_name` text field to orders table
  
  ## Details
  These fields capture the customer's first and last name for better order management
  and customer identification.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_first_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_first_name text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_last_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_last_name text NOT NULL DEFAULT '';
  END IF;
END $$;