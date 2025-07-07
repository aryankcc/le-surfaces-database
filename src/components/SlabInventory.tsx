
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlabTable from "@/components/SlabTable";
import { Slab } from "@/types/slab";
import { useSlabs } from "@/hooks/useSlabs";

interface SlabInventoryProps {
  searchTerm: string;
  onSlabSelect: (slab: Slab) => void;
  selectedSlab: Slab | null;
  onEditSlab: (slab: Slab) => void;
  onDeleteSlab: (slab: Slab) => void;
  isAuthenticated: boolean;
  category?: 'current' | 'development';
  status?: string;
}

const SlabInventory = ({ 
  searchTerm, 
  onSlabSelect, 
  selectedSlab, 
  onEditSlab, 
  onDeleteSlab, 
  isAuthenticated,
  category,
  status
}: SlabInventoryProps) => {
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

  if (!error && slabs.length === 0 && !isLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center text-slate-600">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No slabs found</p>
          <p>
            {status === 'sent' ? 'No outbound samples found.' : 
             category ? `No ${category} slabs found.` : 'No slabs found.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <SlabTable
      slabs={slabs}
      onSlabSelect={onSlabSelect}
      selectedSlab={selectedSlab}
      onEditSlab={onEditSlab}
      onDeleteSlab={onDeleteSlab}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      category={category}
    />
  );
};

export default SlabInventory;
