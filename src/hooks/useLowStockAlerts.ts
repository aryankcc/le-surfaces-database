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
  category: string;
}

export const useLowStockAlerts = (category?: 'current' | 'development') => {
  return useQuery({
    queryKey: ['low-stock-alerts', category],
    queryFn: async () => {
      console.log('Fetching low stock alerts for category:', category);
      
      // Get low stock slabs directly from the function
      const { data: lowStockSlabs, error } = await supabase
        .rpc('get_low_stock_alerts');
      
      console.log('Low stock slabs from function:', lowStockSlabs);
      
      if (error) {
        console.error('Error fetching low stock alerts:', error);
        throw error;
      }
      
      let filteredSlabs = lowStockSlabs as LowStockAlert[];
      
      // Filter by category if specified
      if (category) {
        filteredSlabs = filteredSlabs.filter(slab => slab.category === category);
        console.log(`Filtered slabs for category ${category}:`, filteredSlabs);
      }
      
      return filteredSlabs;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};