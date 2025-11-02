/*
  # Fix Orders Table Schema for Multi-Item Support

  1. Changes
    - Make old single-tree columns nullable in the orders table
    - These columns are now stored in order_trees, order_stands, and order_wreaths tables
    - Keeps columns for backward compatibility but makes them optional
    
  2. Affected Columns
    - species_id: Now nullable (data in order_trees)
    - fullness_type: Now nullable (data in order_trees)
    - height_feet: Now nullable (data in order_trees)
    - tree_price: Now nullable (data in order_trees)
    - stand_id: Already nullable
    - stand_price: Now nullable (data in order_stands)
    - has_own_stand: Now nullable (data in order_stands)
    - wreath_id: Already nullable
    - wreath_price: Already nullable
    - fresh_cut: Now nullable (data in order_trees)
    
  3. Security
    - No changes to RLS policies needed
*/

-- Make old single-tree columns nullable
ALTER TABLE orders 
  ALTER COLUMN species_id DROP NOT NULL,
  ALTER COLUMN fullness_type DROP NOT NULL,
  ALTER COLUMN height_feet DROP NOT NULL,
  ALTER COLUMN tree_price DROP NOT NULL,
  ALTER COLUMN stand_price DROP NOT NULL,
  ALTER COLUMN has_own_stand DROP NOT NULL,
  ALTER COLUMN fresh_cut DROP NOT NULL;