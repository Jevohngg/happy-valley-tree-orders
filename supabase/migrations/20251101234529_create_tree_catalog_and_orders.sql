/*
  # Christmas Tree Configurator Database Schema

  ## Overview
  Complete catalog and order management system for a Christmas tree delivery business.
  All catalog content is editable by staff and reflects live without deployments.

  ## New Tables

  ### 1. `species`
  Core tree species catalog (Noble, Douglas, Nordmann, Natural Nordmann)
  - `id` (uuid, primary key)
  - `name` (text) - Display name
  - `description` (text) - Species description shown to customers
  - `sort_order` (integer) - Controls carousel order
  - `visible` (boolean) - Toggle visibility
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `fullness_variants`
  Fullness options per species (Thin/Medium/Full)
  - `id` (uuid, primary key)
  - `species_id` (uuid, foreign key)
  - `fullness_type` (text) - 'thin', 'medium', or 'full'
  - `image_url` (text) - Static product image URL
  - `price_per_foot` (numeric) - Price per foot for this variant
  - `available` (boolean) - Toggle availability
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `species_heights`
  Available heights per species
  - `id` (uuid, primary key)
  - `species_id` (uuid, foreign key)
  - `height_feet` (integer) - Height in feet
  - `available` (boolean) - Toggle availability
  - `created_at` (timestamptz)

  ### 4. `stands`
  Tree stand products (unlimited options)
  - `id` (uuid, primary key)
  - `name` (text) - Stand product name
  - `price` (numeric) - Stand price
  - `fits_up_to_feet` (integer, nullable) - Optional guidance
  - `visible` (boolean) - Toggle visibility
  - `sort_order` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ### 5. `wreaths`
  Wreath add-on products (S/M/L)
  - `id` (uuid, primary key)
  - `size` (text) - 'small', 'medium', or 'large'
  - `price` (numeric) - Wreath price
  - `visible` (boolean) - Toggle visibility
  - `sort_order` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ### 6. `delivery_options`
  Delivery service levels (Doorstep vs In-home setup)
  - `id` (uuid, primary key)
  - `name` (text) - Display name
  - `description` (text, nullable) - Service description
  - `fee` (numeric) - Delivery fee
  - `visible` (boolean) - Toggle visibility
  - `sort_order` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz)

  ### 7. `orders`
  Customer order submissions
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - Display ID for customer
  - `species_id` (uuid, foreign key)
  - `fullness_type` (text) - Selected fullness
  - `height_feet` (integer) - Selected height
  - `tree_price` (numeric) - Calculated tree subtotal
  - `stand_id` (uuid, nullable, foreign key) - Selected stand (if any)
  - `stand_price` (numeric) - Stand price at time of order
  - `has_own_stand` (boolean) - Customer using their own stand
  - `delivery_option_id` (uuid, foreign key)
  - `delivery_fee` (numeric) - Delivery fee at time of order
  - `wreath_id` (uuid, nullable, foreign key) - Selected wreath (if any)
  - `wreath_price` (numeric, nullable) - Wreath price at time of order
  - `preferred_delivery_date` (date, nullable)
  - `preferred_delivery_time` (text, nullable) - Time window
  - `customer_email` (text)
  - `customer_phone` (text)
  - `delivery_street` (text)
  - `delivery_unit` (text, nullable)
  - `delivery_city` (text)
  - `delivery_state` (text)
  - `delivery_zip` (text)
  - `total_amount` (numeric) - Order total
  - `status` (text) - Order status for CRM
  - `notes` (text, nullable) - Internal notes
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access to catalog tables (species, fullness_variants, etc.)
  - Authenticated users (staff) can manage catalog content
  - Public can insert orders (customer submissions)
  - Only authenticated users can read orders (CRM access)

  ## Important Notes
  1. All catalog pricing and content is editable via admin interface
  2. Orders capture snapshot pricing at time of submission
  3. Order numbers are auto-generated with prefix 'XM' + timestamp
  4. No payment processing in this phase
  5. Real-time updates enabled via Supabase subscriptions
*/

-- Species table
CREATE TABLE IF NOT EXISTS species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE species ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible species"
  ON species FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage species"
  ON species FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fullness variants table
CREATE TABLE IF NOT EXISTS fullness_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id uuid NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  fullness_type text NOT NULL CHECK (fullness_type IN ('thin', 'medium', 'full')),
  image_url text NOT NULL,
  price_per_foot numeric(10,2) NOT NULL CHECK (price_per_foot >= 0),
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(species_id, fullness_type)
);

ALTER TABLE fullness_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available fullness variants"
  ON fullness_variants FOR SELECT
  USING (available = true);

CREATE POLICY "Authenticated users can manage fullness variants"
  ON fullness_variants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Species heights table
CREATE TABLE IF NOT EXISTS species_heights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id uuid NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  height_feet integer NOT NULL CHECK (height_feet > 0),
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(species_id, height_feet)
);

ALTER TABLE species_heights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available heights"
  ON species_heights FOR SELECT
  USING (available = true);

CREATE POLICY "Authenticated users can manage heights"
  ON species_heights FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stands table
CREATE TABLE IF NOT EXISTS stands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  fits_up_to_feet integer,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible stands"
  ON stands FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage stands"
  ON stands FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Wreaths table
CREATE TABLE IF NOT EXISTS wreaths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  size text NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(size)
);

ALTER TABLE wreaths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible wreaths"
  ON wreaths FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage wreaths"
  ON wreaths FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Delivery options table
CREATE TABLE IF NOT EXISTS delivery_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  fee numeric(10,2) NOT NULL CHECK (fee >= 0),
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible delivery options"
  ON delivery_options FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated users can manage delivery options"
  ON delivery_options FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  species_id uuid NOT NULL REFERENCES species(id),
  fullness_type text NOT NULL CHECK (fullness_type IN ('thin', 'medium', 'full')),
  height_feet integer NOT NULL CHECK (height_feet > 0),
  tree_price numeric(10,2) NOT NULL CHECK (tree_price >= 0),
  stand_id uuid REFERENCES stands(id),
  stand_price numeric(10,2) DEFAULT 0,
  has_own_stand boolean NOT NULL DEFAULT false,
  delivery_option_id uuid NOT NULL REFERENCES delivery_options(id),
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  wreath_id uuid REFERENCES wreaths(id),
  wreath_price numeric(10,2),
  preferred_delivery_date date,
  preferred_delivery_time text,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_street text NOT NULL,
  delivery_unit text,
  delivery_city text NOT NULL,
  delivery_state text NOT NULL,
  delivery_zip text NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'XM' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_species_updated_at
  BEFORE UPDATE ON species
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fullness_variants_updated_at
  BEFORE UPDATE ON fullness_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stands_updated_at
  BEFORE UPDATE ON stands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wreaths_updated_at
  BEFORE UPDATE ON wreaths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_options_updated_at
  BEFORE UPDATE ON delivery_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_species_sort_order ON species(sort_order) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_fullness_variants_species ON fullness_variants(species_id) WHERE available = true;
CREATE INDEX IF NOT EXISTS idx_species_heights_species ON species_heights(species_id) WHERE available = true;
CREATE INDEX IF NOT EXISTS idx_stands_sort_order ON stands(sort_order) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_wreaths_sort_order ON wreaths(sort_order) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_delivery_options_sort_order ON delivery_options(sort_order) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);