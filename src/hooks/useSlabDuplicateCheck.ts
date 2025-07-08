
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateSlabInfo {
  exists: boolean;
  currentQuantity: number;
  slabData?: any;
}

export const useSlabDuplicateCheck = (slabId: string) => {
  const [duplicateSlabInfo, setDuplicateSlabInfo] = useState<DuplicateSlabInfo>({
    exists: false,
    currentQuantity: 0
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedSlabId = slabId.trim();
      if (trimmedSlabId) {
        checkForDuplicateSlab(trimmedSlabId);
      } else {
        setDuplicateSlabInfo({ exists: false, currentQuantity: 0 });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slabId]);

  const checkForDuplicateSlab = async (slabId: string) => {
    try {
      const { data: existingSlab, error } = await supabase
        .from('slabs')
        .select('*')
        .eq('slab_id', slabId)
        .in('category', ['current', 'development'])
        .maybeSingle();

      if (error) {
        console.error('Error checking for duplicate slab:', error);
        return;
      }

      if (existingSlab) {
        setDuplicateSlabInfo({
          exists: true,
          currentQuantity: existingSlab.quantity || 0,
          slabData: existingSlab
        });
      } else {
        setDuplicateSlabInfo({ exists: false, currentQuantity: 0 });
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    }
  };

  return duplicateSlabInfo;
};
