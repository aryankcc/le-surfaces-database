/*
  # Update low stock alerts function to include category

  1. Changes
    - Update get_low_stock_alerts function to return category information
    - This allows filtering by category in the frontend
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_low_stock_alerts();

-- Recreate the function with category included
CREATE OR REPLACE FUNCTION get_low_stock_alerts()
RETURNS TABLE (
  family text,
  formulation text,
  version text,
  current_count bigint,
  min_quantity integer,
  slab_id text,
  quantity integer,
  category text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.family,
    s.formulation,
    s.version,
    COUNT(*) as current_count,
    3 as min_quantity, -- Minimum recommended quantity
    s.slab_id,
    s.quantity,
    s.category
  FROM slabs s
  WHERE s.status = 'in_stock' 
    AND (s.quantity IS NULL OR s.quantity <= 3)
  GROUP BY s.family, s.formulation, s.version, s.slab_id, s.quantity, s.category
  ORDER BY s.quantity ASC, s.family, s.formulation;
END;
$$;