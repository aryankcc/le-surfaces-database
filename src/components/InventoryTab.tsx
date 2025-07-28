
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlabInventory from "@/components/SlabInventory";
import SlabDetails from "@/components/SlabDetails";
import StockAlertsDialog from "@/components/StockAlertsDialog";
import { Slab } from "@/types/slab";
import { useSlabs } from "@/hooks/useSlabs";

interface InventoryTabProps {
  searchTerm: string;
  selectedSlab: Slab | null;
  onSlabSelect: (slab: Slab) => void;
  onEditSlab: (slab: Slab) => void;
  onDeleteSlab: (slab: Slab) => void;
  isAuthenticated: boolean;
  category?: 'current' | 'development';
  status?: string;
}

const InventoryTab = ({ 
  searchTerm, 
  selectedSlab, 
  onSlabSelect, 
  onEditSlab, 
  onDeleteSlab, 
  isAuthenticated,
  category,
  status
}: InventoryTabProps) => {
  const { data: slabs = [], isLoading, error } = useSlabs(searchTerm, category, status);

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center text-red-600">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p className="mb-4">Failed to load slabs. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          category={category}
          status={status}
        />
      </div>

      <div className="lg:col-span-1 space-y-6">
        {!status && (
          <div className="flex justify-end">
            <StockAlertsDialog category={category} />
          </div>
        )}
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
