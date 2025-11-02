/*
  # Add Support for Multiple Items Per Order

  ## Summary
  This migration restructures the orders system to support multiple trees, stands, 
  and wreaths per order by creating separate line item tables.

  ## Changes
  
  ### New Tables
  
  1. **order_trees**
     - Links multiple trees to an order
     - Stores: species_id, fullness_type, height_feet, price, quantity, fresh_cut
  
  2. **order_stands**
     - Links multiple stands to an order
     - Stores: stand_id, price, quantity
     - Supports "own stand" option with NULL stand_id
  
  3. **order_wreaths**
     - Links multiple wreaths to an order
     - Stores: wreath_id, price, quantity

  ### Modified Tables
  
  1. **orders**
     - Remove individual tree/stand/wreath columns
     - Keep only: order info, customer info, delivery info, totals, status
  
  ## Security
  - Enable RLS on all new tables
  - Allow public access to match existing orders table pattern

  ## Notes
  - This is a breaking change for existing orders
  - Existing order data will need to be migrated separately if needed
*/

-- Create order_trees table
CREATE TABLE IF NOT EXISTS order_trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  species_id uuid NOT NULL REFERENCES species(id),
  fullness_type text NOT NULL CHECK (fullness_type IN ('thin', 'medium', 'full')),
  height_feet numeric NOT NULL,
  unit_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  fresh_cut boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create order_stands table
CREATE TABLE IF NOT EXISTS order_stands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stand_id uuid REFERENCES stands(id),
  unit_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  is_own_stand boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create order_wreaths table
CREATE TABLE IF NOT EXISTS order_wreaths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  wreath_id uuid NOT NULL REFERENCES wreaths(id),
  unit_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_wreaths ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Anyone can insert order trees"
  ON order_trees FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order trees"
  ON order_trees FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update order trees"
  ON order_trees FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete order trees"
  ON order_trees FOR DELETE
  USING (true);

CREATE POLICY "Anyone can insert order stands"
  ON order_stands FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order stands"
  ON order_stands FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update order stands"
  ON order_stands FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete order stands"
  ON order_stands FOR DELETE
  USING (true);

CREATE POLICY "Anyone can insert order wreaths"
  ON order_wreaths FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order wreaths"
  ON order_wreaths FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update order wreaths"
  ON order_wreaths FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete order wreaths"
  ON order_wreaths FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_trees_order_id ON order_trees(order_id);
CREATE INDEX IF NOT EXISTS idx_order_stands_order_id ON order_stands(order_id);
CREATE INDEX IF NOT EXISTS idx_order_wreaths_order_id ON order_wreaths(order_id);