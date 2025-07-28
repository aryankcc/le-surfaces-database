
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateSlabInfo {
  exists: boolean;
  currentQuantity: number;
  slabData?: any;
  sameStatus: boolean;
}

export const useSlabDuplicateCheck = (slabId: string, status?: string, version?: string) => {
  const [duplicateSlabInfo, setDuplicateSlabInfo] = useState<DuplicateSlabInfo>({
    exists: false,
    currentQuantity: 0,
    sameStatus: false
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedSlabId = slabId.trim();
      if (trimmedSlabId) {
        checkForDuplicateSlab(trimmedSlabId, status, version);
      } else {
        setDuplicateSlabInfo({ exists: false, currentQuantity: 0, sameStatus: false });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slabId, status, version]);

  const checkForDuplicateSlab = async (slabId: string, status?: string, version?: string) => {
    try {
      // Case-insensitive search for existing slabs with same ID and version
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
        // Check if any existing slab has the same slab_id AND version (true duplicate)
        const exactDuplicate = existingSlabs.find(slab => 
          slab.slab_id?.toLowerCase() === slabId.toLowerCase() && 
          slab.version === version
        );
        
        // Check if any existing slab has the same status AND version
        const sameStatusAndVersion = existingSlabs.find(slab => 
          slab.status === status && 
          slab.version === version &&
          slab.slab_id?.toLowerCase() === slabId.toLowerCase()
        );
        
        const totalQuantity = existingSlabs.reduce((sum, slab) => sum + (slab.quantity || 0), 0);
        
        setDuplicateSlabInfo({
          exists: !!exactDuplicate,
          currentQuantity: totalQuantity,
          slabData: existingSlabs[0],
          sameStatus: !!sameStatusAndVersion
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
