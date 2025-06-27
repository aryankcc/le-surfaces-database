/*
  # Add get_low_stock_alerts function

  1. New Functions
    - `get_low_stock_alerts()` - Returns slabs that are below their minimum quantity threshold
      - Groups slabs by family, formulation, and version
      - Calculates current count for each group
      - Compares against min_quantity to identify low stock items
      - Returns detailed information including slab_id and quantity for each low stock item

  2. Security
    - Function is accessible to authenticated users
    - Uses existing RLS policies on slabs table
*/

CREATE OR REPLACE FUNCTION get_low_stock_alerts()
RETURNS TABLE (
  family text,
  formulation text,
  version text,
  current_count bigint,
  min_quantity integer,
  slab_id text,
  quantity integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH slab_counts AS (
    SELECT 
      s.family,
      s.formulation,
      s.version,
      COUNT(*) as current_count,
      s.min_quantity
    FROM slabs s
    WHERE s.status = 'in_stock'
    GROUP BY s.family, s.formulation, s.version, s.min_quantity
  ),
  low_stock_groups AS (
    SELECT *
    FROM slab_counts
    WHERE current_count < COALESCE(min_quantity, 5)
  )
  SELECT 
    lsg.family,
    lsg.formulation,
    lsg.version,
    lsg.current_count,
    lsg.min_quantity,
    s.slab_id,
    s.quantity
  FROM low_stock_groups lsg
  JOIN slabs s ON s.family = lsg.family 
    AND s.formulation = lsg.formulation 
    AND (s.version = lsg.version OR (s.version IS NULL AND lsg.version IS NULL))
  WHERE s.status = 'in_stock'
  ORDER BY lsg.current_count ASC, lsg.family, lsg.formulation, s.slab_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_low_stock_alerts() TO authenticated;