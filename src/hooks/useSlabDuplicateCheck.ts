
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateSlabInfo {
  exists: boolean;
  currentQuantity: number;
  slabData?: any;
  sameStatus: boolean;
}

export const useSlabDuplicateCheck = (slabId: string, status?: string) => {
  const [duplicateSlabInfo, setDuplicateSlabInfo] = useState<DuplicateSlabInfo>({
    exists: false,
    currentQuantity: 0,
    sameStatus: false
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedSlabId = slabId.trim();
      if (trimmedSlabId) {
        checkForDuplicateSlab(trimmedSlabId, status);
      } else {
        setDuplicateSlabInfo({ exists: false, currentQuantity: 0, sameStatus: false });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slabId, status]);

  const checkForDuplicateSlab = async (slabId: string, status?: string) => {
    try {
      // Case-insensitive search for existing slabs
      const { data: existingSlabs, error } = await supabase
        .from('slabs')
        .select('*')
        .ilike('slab_id', slabId) // Case-insensitive match
        .in('category', ['current', 'development']);

      if (error) {
        console.error('Error checking for duplicate slab:', error);
        return;
      }

      if (existingSlabs && existingSlabs.length > 0) {
        // Check if any existing slab has the same status
        const sameStatusSlab = existingSlabs.find(slab => slab.status === status);
        const totalQuantity = existingSlabs.reduce((sum, slab) => sum + (slab.quantity || 0), 0);
        
        setDuplicateSlabInfo({
          exists: true,
          currentQuantity: totalQuantity,
          slabData: existingSlabs[0],
          sameStatus: !!sameStatusSlab
        });
      } else {
        setDuplicateSlabInfo({ exists: false, currentQuantity: 0, sameStatus: false });
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    }
  };

  return duplicateSlabInfo;
};
