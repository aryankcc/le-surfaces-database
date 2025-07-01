
-- Add missing columns to the slabs table to match CSV structure
ALTER TABLE public.slabs 
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Update the modifications table to ensure proper foreign key relationship
-- (This might already exist but ensuring it's correct)
ALTER TABLE public.modifications 
DROP CONSTRAINT IF EXISTS modifications_slab_id_fkey;

ALTER TABLE public.modifications 
ADD CONSTRAINT modifications_slab_id_fkey 
FOREIGN KEY (slab_id) REFERENCES public.slabs(id) ON DELETE CASCADE;
