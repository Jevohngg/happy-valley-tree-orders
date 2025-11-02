/*
  # Add Fresh Cut Field to Orders

  ## Changes
  - Add `fresh_cut` boolean field to orders table to track if customer wants a fresh cut on tree bottom
  - Defaults to false (customer will do it themselves)

  ## Details
  This field captures whether the customer wants a complimentary fresh cut (about 0.5 inches) 
  off the bottom of the tree before delivery, which helps the tree absorb water better.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'fresh_cut'
  ) THEN
    ALTER TABLE orders ADD COLUMN fresh_cut boolean NOT NULL DEFAULT false;
  END IF;
END $$;
