
-- Drop the existing function that references non-existent products table
DROP FUNCTION IF EXISTS public.get_low_stock_alerts();

-- Create a new function that works with our slab inventory system
CREATE OR REPLACE FUNCTION public.get_low_stock_alerts()
RETURNS TABLE(
  family text,
  formulation text,
  version text,
  current_count bigint,
  min_quantity integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.family,
    st.formulation,
    st.version,
    COALESCE(slab_counts.count, 0) as current_count,
    st.min_quantity
  FROM public.slab_types st
  LEFT JOIN (
    SELECT 
      s.family,
      s.formulation,
      s.version,
      COUNT(*) as count
    FROM public.slabs s
    WHERE s.status = 'in_stock'
    GROUP BY s.family, s.formulation, s.version
  ) slab_counts ON (
    st.family = slab_counts.family 
    AND st.formulation = slab_counts.formulation 
    AND COALESCE(st.version, '') = COALESCE(slab_counts.version, '')
  )
  WHERE COALESCE(slab_counts.count, 0) < st.min_quantity;
END;
$$;
