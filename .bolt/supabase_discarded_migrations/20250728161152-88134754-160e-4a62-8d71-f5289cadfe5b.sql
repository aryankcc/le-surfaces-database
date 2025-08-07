-- Add new fields to slabs table for product information
ALTER TABLE public.slabs 
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS mold text,
ADD COLUMN IF NOT EXISTS buyer text,
ADD COLUMN IF NOT EXISTS cost_3cm numeric(10,2),
ADD COLUMN IF NOT EXISTS price_3cm numeric(10,2),
ADD COLUMN IF NOT EXISTS cost_2cm numeric(10,2),
ADD COLUMN IF NOT EXISTS price_2cm numeric(10,2);

-- Make slab_id nullable since current products won't have slab IDs
ALTER TABLE public.slabs 
ALTER COLUMN slab_id DROP NOT NULL;