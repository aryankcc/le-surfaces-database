
-- Add the new "not_in_yet" status as a valid option
-- Update any existing check constraints or validation if they exist
-- Note: We're keeping the existing status values and adding the new one

-- First, let's add an index on status for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_slabs_status ON slabs(status);

-- Add an index on sent_to_location for the outbound samples page
CREATE INDEX IF NOT EXISTS idx_slabs_sent_to_location ON slabs(sent_to_location) WHERE sent_to_location IS NOT NULL;

-- Update the quantity column to allow 0 (remove any constraints that prevent 0)
-- The column already allows NULL and has a default of 1, so we just need to ensure 0 is allowed
ALTER TABLE slabs ALTER COLUMN quantity DROP DEFAULT;
ALTER TABLE slabs ALTER COLUMN quantity SET DEFAULT 0;

-- Add a function to handle automatic quantity subtraction when samples are sent
CREATE OR REPLACE FUNCTION handle_sent_sample_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an update and the status changed to 'sent'
  IF TG_OP = 'UPDATE' AND OLD.status != 'sent' AND NEW.status = 'sent' THEN
    -- Find other slabs with the same slab_id that are in_stock
    UPDATE slabs 
    SET quantity = GREATEST(0, quantity - COALESCE(NEW.quantity, 1))
    WHERE slab_id = NEW.slab_id 
      AND status = 'in_stock' 
      AND id != NEW.id
      AND quantity > 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_handle_sent_sample_quantity ON slabs;
CREATE TRIGGER trigger_handle_sent_sample_quantity
  AFTER UPDATE ON slabs
  FOR EACH ROW
  EXECUTE FUNCTION handle_sent_sample_quantity();
