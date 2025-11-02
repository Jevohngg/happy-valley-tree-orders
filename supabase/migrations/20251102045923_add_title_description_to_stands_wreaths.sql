/*
  # Add Title and Description Fields to Stands and Wreaths

  1. Changes Made
    - Add `title` column to `stands` table (defaults to the `name` value for display)
    - Add `description` column to `stands` table for detailed information
    - Add `title` column to `wreaths` table (defaults to capitalized size)
    - Add `description` column to `wreaths` table for detailed information
    
  2. New Columns
    **stands table:**
    - `title` (text, not null, default ''): Display title shown to customers
    - `description` (text, nullable): Detailed description of the stand
    
    **wreaths table:**
    - `title` (text, not null, default ''): Display title shown to customers
    - `description` (text, nullable): Detailed description of the wreath
    
  3. Data Migration
    - Existing stands: Copy `name` to `title` for backward compatibility
    - Existing wreaths: Set `title` to capitalized `size` (e.g., "Small" → "Small Wreath")
    
  4. Security
    - No RLS policy changes needed
    - Columns follow existing table permissions
*/

-- Add title and description to stands table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stands' AND column_name = 'title'
  ) THEN
    ALTER TABLE stands ADD COLUMN title text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stands' AND column_name = 'description'
  ) THEN
    ALTER TABLE stands ADD COLUMN description text;
  END IF;
END $$;

-- Add title and description to wreaths table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wreaths' AND column_name = 'title'
  ) THEN
    ALTER TABLE wreaths ADD COLUMN title text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wreaths' AND column_name = 'description'
  ) THEN
    ALTER TABLE wreaths ADD COLUMN description text;
  END IF;
END $$;

-- Migrate existing data for stands (copy name to title if title is empty)
UPDATE stands 
SET title = name 
WHERE title = '';

-- Migrate existing data for wreaths (create title from size if title is empty)
UPDATE wreaths 
SET title = CONCAT(UPPER(SUBSTRING(size FROM 1 FOR 1)), SUBSTRING(size FROM 2), ' Wreath')
WHERE title = '';