/*
  # Fix slab_id column type and add category column

  1. Schema Changes
    - Change slab_id from smallint to text to support alphanumeric IDs
    - Add category column for current/development classification
    - Update constraints and indexes

  2. Data Migration
    - Safely convert existing slab_id values to text
    - Set default category to 'current' for existing slabs

  3. Security
    - Maintain existing RLS policies
    - Add constraint for valid category values
*/

-- First, add the category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slabs' AND column_name = 'category'
  ) THEN
    ALTER TABLE slabs ADD COLUMN category text DEFAULT 'current';
  END IF;
END $$;

-- Add constraint for valid category values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'valid_category' AND table_name = 'slabs'
  ) THEN
    ALTER TABLE slabs ADD CONSTRAINT valid_category CHECK (category = ANY (ARRAY['current'::text, 'development'::text]));
  END IF;
END $$;

-- Now fix the slab_id column type
-- First, drop the unique constraint on slab_id
ALTER TABLE slabs DROP CONSTRAINT IF EXISTS slabs_slab_id_key;

-- Drop the index on slab_id
DROP INDEX IF EXISTS idx_slabs_slab_id;

-- Change the column type from smallint to text
ALTER TABLE slabs ALTER COLUMN slab_id TYPE text USING slab_id::text;

-- Recreate the unique constraint
ALTER TABLE slabs ADD CONSTRAINT slabs_slab_id_key UNIQUE (slab_id);

-- Recreate the index
CREATE INDEX idx_slabs_slab_id ON slabs USING btree (slab_id);

-- Add index for category column for better performance
CREATE INDEX IF NOT EXISTS idx_slabs_category ON slabs USING btree (category);

-- Update any existing slabs to have 'current' category if null
UPDATE slabs SET category = 'current' WHERE category IS NULL;

-- Make category NOT NULL
ALTER TABLE slabs ALTER COLUMN category SET NOT NULL;