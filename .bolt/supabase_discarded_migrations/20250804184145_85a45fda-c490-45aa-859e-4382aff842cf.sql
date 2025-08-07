-- Remove the existing unique constraint on slab_id
ALTER TABLE public.slabs DROP CONSTRAINT IF EXISTS slabs_slab_id_key;

-- Remove the existing unique constraint on formulation  
ALTER TABLE public.slabs DROP CONSTRAINT IF EXISTS slabs_formulation_key;

-- Add a composite unique constraint on slab_id + version
-- This allows same slab_id with different versions
ALTER TABLE public.slabs 
ADD CONSTRAINT slabs_slab_id_version_key 
UNIQUE (slab_id, version);