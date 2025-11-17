/*
  # Add price per foot to species heights

  1. Changes
    - Add `price_per_foot` column to `species_heights` table
    - This allows each height to have its own pricing (e.g., 7ft trees at $20/ft, 8ft trees at $25/ft)
    - Default to 0 for existing records
  
  2. Notes
    - Pricing is now height-specific rather than species-specific
    - Admin panel will need to configure price for each height option
    - Front-end will use this for accurate per-height pricing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'species_heights' AND column_name = 'price_per_foot'
  ) THEN
    ALTER TABLE species_heights ADD COLUMN price_per_foot numeric DEFAULT 0 NOT NULL;
    ALTER TABLE species_heights ADD CONSTRAINT species_heights_price_check CHECK (price_per_foot >= 0);
  END IF;
END $$;