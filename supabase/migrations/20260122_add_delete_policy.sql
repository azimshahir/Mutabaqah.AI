-- Add DELETE policy for financing_applications
-- This allows users to delete their own financing applications

CREATE POLICY "Users can delete their own financing applications"
  ON financing_applications FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());
