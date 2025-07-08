/*
  # Update status constraints to reflect new status options

  1. Changes
    - Update status check constraint to include new status values
    - Change "reserved" to "not_in_yet" 
    - Change "sold" to "discontinued"
    - Keep "in_stock" and "sent" as they are

  2. Data Migration
    - Update existing records with old status values to new ones
*/

-- First, update existing data
UPDATE slabs SET status = 'not_in_yet' WHERE status = 'reserved';
UPDATE slabs SET status = 'discontinued' WHERE status = 'sold';

-- Drop the existing status constraint
ALTER TABLE slabs DROP CONSTRAINT IF EXISTS slabs_status_check;

-- Add the new status constraint with updated values
ALTER TABLE slabs ADD CONSTRAINT slabs_status_check 
  CHECK (status = ANY (ARRAY['in_stock'::text, 'sent'::text, 'not_in_yet'::text, 'discontinued'::text]));