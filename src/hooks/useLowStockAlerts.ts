
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LowStockAlert {
  family: string;
  formulation: string;
  version: string | null;
  current_count: number;
  min_quantity: number;
  slab_id: string;
  quantity: number;
}

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: async () => {
      console.log('Fetching low stock alerts...');
      
      // Get low stock slabs directly from the function
      const { data: lowStockSlabs, error } = await supabase
        .rpc('get_low_stock_alerts');
      
      console.log('Low stock slabs from function:', lowStockSlabs);
      
      if (error) {
        console.error('Error fetching low stock alerts:', error);
        throw error;
      }
      
      return lowStockSlabs as LowStockAlert[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
