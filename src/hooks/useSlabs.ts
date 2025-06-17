
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Slab } from '@/types/slab';

export const useSlabs = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['slabs', searchTerm],
    queryFn: async () => {
      console.log('Fetching slabs with search term:', searchTerm);
      
      let query = supabase
        .from('slabs')
        .select('*')
        .order('created_at', { ascending: false });

      // If there's a search term, filter by slab_id first, then other fields
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.trim();
        query = query.or(`slab_id.ilike.%${term}%,family.ilike.%${term}%,formulation.ilike.%${term}%,version.ilike.%${term}%,status.ilike.%${term}%,notes.ilike.%${term}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching slabs:', error);
        throw error;
      }
      
      console.log('Fetched slabs:', data?.length);
      return data as Slab[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
