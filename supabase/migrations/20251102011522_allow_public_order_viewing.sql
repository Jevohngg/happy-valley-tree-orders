/*
  # Allow Public Access to View Orders in Admin Panel

  ## Changes
  - Update RLS policies to allow public (unauthenticated) access to view and update orders
  - This enables the admin panel to display and manage orders without authentication

  ## Security Note
  In a production environment, you should:
  1. Add authentication to the admin panel
  2. Restrict these policies to authenticated admin users only
  3. Never expose order data publicly in production

  ## Modified Policies
  - Drop existing authenticated-only SELECT policy
  - Drop existing authenticated-only UPDATE policy
  - Create new public SELECT policy for orders
  - Create new public UPDATE policy for orders
*/

-- Drop existing restrictive policies for orders
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

-- Create new public policies for order viewing and management
CREATE POLICY "Anyone can view all orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);