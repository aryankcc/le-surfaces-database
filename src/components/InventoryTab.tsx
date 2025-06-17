
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";
import SlabInventory from "@/components/SlabInventory";
import SlabDetails from "@/components/SlabDetails";
import LowStockAlerts from "@/components/LowStockAlerts";
import { Slab } from "@/types/slab";

interface InventoryTabProps {
  searchTerm: string;
  selectedSlab: Slab | null;
  onSlabSelect: (slab: Slab | null) => void;
  onEditSlab: (slab: Slab) => void;
  onDeleteSlab: (slab: Slab) => void;
  isAuthenticated: boolean;
}

const InventoryTab = ({ 
  searchTerm, 
  selectedSlab, 
  onSlabSelect, 
  onEditSlab, 
  onDeleteSlab,
  isAuthenticated
}: InventoryTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SlabInventory 
          searchTerm={searchTerm}
          onSlabSelect={onSlabSelect}
          selectedSlab={selectedSlab}
          onEditSlab={onEditSlab}
          onDeleteSlab={onDeleteSlab}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <LowStockAlerts />
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
