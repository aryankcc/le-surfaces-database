
-- Drop the slab_types table since we don't need it
DROP TABLE IF EXISTS public.slab_types CASCADE;

-- Update the get_low_stock_alerts function to work directly with slab quantities
DROP FUNCTION IF EXISTS public.get_low_stock_alerts();
CREATE OR REPLACE FUNCTION public.get_low_stock_alerts()
RETURNS TABLE(
  family text,
  formulation text,
  version text,
  current_count bigint,
  min_quantity integer,
  slab_id text,
  quantity integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.family,
    s.formulation,
    s.version,
    1::bigint as current_count,
    3 as min_quantity,
    s.slab_id,
    COALESCE(s.quantity, 1) as quantity
  FROM public.slabs s
  WHERE s.status = 'in_stock' 
    AND COALESCE(s.quantity, 1) < 3;
END;
$$;

-- Ensure slabs table allows public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.slabs;
CREATE POLICY "Enable read access for all users" 
  ON public.slabs 
  FOR SELECT 
  USING (true);
