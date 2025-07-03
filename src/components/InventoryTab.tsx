
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";
import SlabTable from "@/components/SlabTable";
import SlabDetails from "@/components/SlabDetails";
import LowStockAlerts from "@/components/LowStockAlerts";
import { useSlabs } from "@/hooks/useSlabs";
import { Slab } from "@/types/slab";

interface InventoryTabProps {
  searchTerm: string;
  selectedSlab: Slab | null;
  onSlabSelect: (slab: Slab | null) => void;
  onEditSlab: (slab: Slab) => void;
  onDeleteSlab: (slab: Slab) => void;
  isAuthenticated: boolean;
  category?: 'current' | 'development';
}

const InventoryTab = ({ 
  searchTerm, 
  selectedSlab, 
  onSlabSelect, 
  onEditSlab, 
  onDeleteSlab,
  isAuthenticated,
  category
}: InventoryTabProps) => {
  const { data: allSlabs = [], isLoading } = useSlabs();

  // Filter slabs based on category and search term
  const filteredSlabs = allSlabs.filter(slab => {
    // Filter by category if specified
    if (category && slab.category !== category) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (slab.family || '').toLowerCase().includes(searchLower) ||
        (slab.formulation || '').toLowerCase().includes(searchLower) ||
        (slab.slab_id || '').toLowerCase().includes(searchLower) ||
        (slab.version || '').toLowerCase().includes(searchLower) ||
        (slab.sku || '').toLowerCase().includes(searchLower) ||
        (slab.sent_to_location || '').toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SlabTable
          slabs={filteredSlabs}
          onSlabSelect={onSlabSelect}
          selectedSlab={selectedSlab}
          onEditSlab={onEditSlab}
          onDeleteSlab={onDeleteSlab}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          category={category}
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <LowStockAlerts category={category} />
        {selectedSlab ? (
          <SlabDetails 
            slab={selectedSlab} 
            onEditSlab={onEditSlab}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-slate-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a slab to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InventoryTab;
