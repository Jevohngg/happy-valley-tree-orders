/*
  # Fix RLS Policies for Admin Panel

  ## Changes
  This migration updates RLS policies to allow public (unauthenticated) access
  for managing catalog content in the admin panel. This enables the admin panel
  to function without requiring authentication.

  ## Security Note
  In a production environment, you should:
  1. Add authentication to the admin panel
  2. Restrict these policies to authenticated admin users only
  3. Use service role key for server-side admin operations

  ## Modified Tables
  - fullness_variants: Allow public updates
  - species: Allow public updates
  - species_heights: Allow public updates
  - stands: Allow public updates
  - wreaths: Allow public updates
  - delivery_options: Allow public updates
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage fullness variants" ON fullness_variants;
DROP POLICY IF EXISTS "Authenticated users can manage species" ON species;
DROP POLICY IF EXISTS "Authenticated users can manage heights" ON species_heights;
DROP POLICY IF EXISTS "Authenticated users can manage stands" ON stands;
DROP POLICY IF EXISTS "Authenticated users can manage wreaths" ON wreaths;
DROP POLICY IF EXISTS "Authenticated users can manage delivery options" ON delivery_options;

-- Create new public policies for catalog management
CREATE POLICY "Anyone can manage fullness variants"
  ON fullness_variants FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage species"
  ON species FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage heights"
  ON species_heights FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage stands"
  ON stands FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage wreaths"
  ON wreaths FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can manage delivery options"
  ON delivery_options FOR ALL
  USING (true)
  WITH CHECK (true);
