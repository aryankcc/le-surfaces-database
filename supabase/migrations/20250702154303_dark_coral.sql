/*
  # Fix slab_id column type and add category column

  1. Changes
    - Add category column with proper constraints
    - Replace slab_id (smallint identity) with new text-based slab_id
    - Migrate existing data safely
    - Maintain all indexes and constraints

  2. Security
    - Maintain existing RLS policies
    - Keep all existing constraints
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

-- Update any existing slabs to have 'current' category if null
UPDATE slabs SET category = 'current' WHERE category IS NULL;

-- Make category NOT NULL
ALTER TABLE slabs ALTER COLUMN category SET NOT NULL;

-- Add index for category column for better performance
CREATE INDEX IF NOT EXISTS idx_slabs_category ON slabs USING btree (category);

-- Now handle the slab_id column transformation
-- Step 1: Add a new temporary text column for the new slab_id
ALTER TABLE slabs ADD COLUMN slab_id_new text;

-- Step 2: Populate the new column with text versions of existing slab_ids
-- For existing numeric slab_ids, prefix them with 'LE-' to make them alphanumeric
UPDATE slabs SET slab_id_new = 'LE-' || LPAD(slab_id::text, 3, '0');

-- Step 3: Make the new column NOT NULL
ALTER TABLE slabs ALTER COLUMN slab_id_new SET NOT NULL;

-- Step 4: Add unique constraint to new column
ALTER TABLE slabs ADD CONSTRAINT slabs_slab_id_new_key UNIQUE (slab_id_new);

-- Step 5: Drop the old unique constraint and index on the old slab_id
ALTER TABLE slabs DROP CONSTRAINT IF EXISTS slabs_slab_id_key;
DROP INDEX IF EXISTS idx_slabs_slab_id;

-- Step 6: Rename columns - drop old slab_id and rename new one
ALTER TABLE slabs DROP COLUMN slab_id;
ALTER TABLE slabs RENAME COLUMN slab_id_new TO slab_id;

-- Step 7: Rename the constraint to match the original name
ALTER TABLE slabs RENAME CONSTRAINT slabs_slab_id_new_key TO slabs_slab_id_key;

-- Step 8: Recreate the index with the original name
CREATE INDEX idx_slabs_slab_id ON slabs USING btree (slab_id);