/*
  # Allow Public Access to Delete Orders

  ## Changes
  - Add RLS policy to allow public (unauthenticated) access to delete orders
  - This enables the admin panel to delete orders without authentication

  ## Security Note
  In a production environment, you should:
  1. Add authentication to the admin panel
  2. Restrict this policy to authenticated admin users only
  3. Consider soft-deletes instead of hard-deletes for audit purposes

  ## Modified Policies
  - Create new public DELETE policy for orders
*/

-- Create public policy for order deletion
CREATE POLICY "Anyone can delete orders"
  ON orders FOR DELETE
  USING (true);