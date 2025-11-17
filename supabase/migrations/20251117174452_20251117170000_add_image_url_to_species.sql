/*
  # Add image URL directly to species table

  1. Changes
    - Add `image_url` column to `species` table
    - Migrate existing image URLs from fullness_variants (medium variant) to species table
    - This simplifies the data model now that fullness selection has been removed from the UI

  2. Migration Steps
    - Add the new column with a default empty string
    - Copy image URLs from medium fullness variants to their parent species
    - Update any empty image URLs to ensure consistency

  3. Notes
    - The fullness_variants table is not dropped for backward compatibility
    - Future orders will use the species image_url directly
    - Admin panel will be updated to edit species.image_url instead of fullness_variants
*/

DO $$
BEGIN
  -- Add image_url column to species table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'species' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE species ADD COLUMN image_url text DEFAULT '' NOT NULL;
  END IF;
END $$;

-- Migrate existing image URLs from fullness_variants (medium) to species
UPDATE species s
SET image_url = fv.image_url
FROM fullness_variants fv
WHERE fv.species_id = s.id
  AND fv.fullness_type = 'medium'
  AND s.image_url = ''
  AND fv.image_url IS NOT NULL
  AND fv.image_url != '';