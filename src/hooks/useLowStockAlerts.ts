
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LowStockAlert {
  family: string;
  formulation: string;
  version: string | null;
  current_count: number;
  min_quantity: number;
  slabs: Array<{
    slab_id: string;
    quantity: number | null;
  }>;
}

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: async () => {
      console.log('Fetching low stock alerts...');
      
      // First, let's check what we have in slabs table
      const { data: allSlabs, error: allSlabsError } = await supabase
        .from('slabs')
        .select('slab_id, family, formulation, version, quantity, status')
        .eq('status', 'in_stock');
      
      console.log('All in-stock slabs:', allSlabs);
      
      // Check what we have in slab_types
      const { data: slabTypes, error: slabTypesError } = await supabase
        .from('slab_types')
        .select('*');
      
      console.log('All slab types:', slabTypes);
      
      // First get the low stock types from the function
      const { data: lowStockTypes, error: typesError } = await supabase
        .rpc('get_low_stock_alerts');
      
      console.log('Low stock types from function:', lowStockTypes);
      
      if (typesError) {
        console.error('Error fetching low stock alerts:', typesError);
        throw typesError;
      }

      // Then get detailed slab information for each low stock type
      const detailedAlerts: LowStockAlert[] = [];
      
      for (const alert of lowStockTypes) {
        const { data: slabs, error: slabsError } = await supabase
          .from('slabs')
          .select('slab_id, quantity')
          .eq('family', alert.family)
          .eq('formulation', alert.formulation)
          .eq('status', 'in_stock')
          .or(alert.version ? `version.eq.${alert.version}` : 'version.is.null')
          .lte('quantity', 2);

        if (slabsError) {
          console.error('Error fetching slabs for alert:', slabsError);
          continue;
        }

        detailedAlerts.push({
          ...alert,
          slabs: slabs || []
        });
      }
      
      console.log('Detailed low stock alerts:', detailedAlerts);
      return detailedAlerts;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
