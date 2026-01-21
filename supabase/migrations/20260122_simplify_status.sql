-- Migration: Simplify financing status from 9 to 4 values
-- Run this in Supabase SQL Editor

-- Step 1: Add new enum values
ALTER TYPE financing_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE financing_status ADD VALUE IF NOT EXISTS 'rejected';

-- Step 2: Update existing records to new status values
UPDATE financing_applications
SET status = 'pending'
WHERE status IN ('draft', 'submitted', 't1_pending', 't1_validated', 't2_pending', 't2_validated');

UPDATE financing_applications
SET status = 'rejected'
WHERE status = 'blocked';

-- Note: 'approved' and 'disbursed' remain unchanged

-- Step 3: Add is_admin column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 4: Add rejection_reason column to financing_applications
ALTER TABLE financing_applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Optional: Set a specific user as admin (update with actual user email)
-- UPDATE customers SET is_admin = TRUE WHERE email = 'admin@example.com';
