/*
  # Update slab image handling

  1. Schema Changes
    - Rename `box_url` to `box_shared_link` for clarity
    - Keep `image_url` for direct image display
    - Update existing data to maintain compatibility

  2. Security
    - Maintain existing RLS policies
*/

-- Rename box_url to box_shared_link for better clarity
ALTER TABLE public.slabs RENAME COLUMN box_url TO box_shared_link;

-- Update any existing data (this is safe as it's just a column rename)
-- The data remains intact, just the column name changes

-- Add a comment to clarify the purpose of each column
COMMENT ON COLUMN public.slabs.image_url IS 'Direct URL to image for display in the application';
COMMENT ON COLUMN public.slabs.box_shared_link IS 'Shared link to Box.com for external file access';