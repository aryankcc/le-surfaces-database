/*
  # Add category column to slabs table

  1. Schema Changes
    - Add `category` column to slabs table with default value 'current'
    - Update existing slabs to have 'current' category
    - Add check constraint to ensure only valid categories

  2. Security
    - Maintain existing RLS policies
*/

-- Add category column to slabs table
ALTER TABLE public.slabs 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'current';

-- Add check constraint to ensure only valid categories
ALTER TABLE public.slabs 
ADD CONSTRAINT valid_category CHECK (category IN ('current', 'development'));

-- Update existing slabs to have 'current' category (safe default)
UPDATE public.slabs 
SET category = 'current' 
WHERE category IS NULL;

-- Add comment to clarify the purpose of the category column
COMMENT ON COLUMN public.slabs.category IS 'Categorizes slabs as either current (production-ready) or development (experimental/R&D)';