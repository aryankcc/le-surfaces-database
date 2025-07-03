import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Database, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Slab } from "@/types/slab";
import SlabDetails from "@/components/SlabDetails";
import LowStockAlerts from "@/components/LowStockAlerts";
import ExportButton from "@/components/ExportButton";
import AddSlabDialog from "@/components/AddSlabDialog";
import EditSlabDialog from "@/components/EditSlabDialog";
import DeleteSlabDialog from "@/components/DeleteSlabDialog";
import CSVImportDialog from "@/components/CSVImportDialog";
import SlabInventory from "@/components/SlabInventory";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const FamilySlabsPage = () => {
  const { categoryName, familyName } = useParams<{ 
    categoryName: string; 
    familyName: string; 
  }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedSlab, setSelectedSlab] = useState<Slab | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<Slab | null>(null);
  const [deletingSlab, setDeletingSlab] = useState<Slab | null>(null);

  const decodedFamilyName = familyName ? decodeURIComponent(familyName) : '';

  const { data: slabs = [], isLoading, error } = useQuery({
    queryKey: ['family-slabs', categoryName, decodedFamilyName],
    queryFn: async () => {
      console.log('Fetching slabs for category:', categoryName, 'family:', decodedFamilyName);
      
      const { data, error } = await supabase
        .from('slabs')
        .select('*')
        .eq('category', categoryName)
        .eq('family', decodedFamilyName)
        .order('slab_id');
      
      if (error) {
        console.error('Error fetching slabs:', error);
        throw error;
      }
      
      console.log('Found slabs:', data?.length);
      return data as Slab[];
    },
    enabled: !!categoryName && !!decodedFamilyName
  });

  const checkAuthForAction = (action: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: `Please sign in to ${action}. You can browse the inventory without signing in.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleEditSlab = (slab: Slab) => {
    if (!checkAuthForAction("edit slabs")) return;
    setEditingSlab(slab);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSlab = (slab: Slab) => {
    if (!checkAuthForAction("delete slabs")) return;
    setDeletingSlab(slab);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSlab = () => {
    if (!checkAuthForAction("add slabs")) return;
    setIsAddDialogOpen(true);
  };

  const handleCSVImport = () => {
    if (!checkAuthForAction("import CSV data")) return;
    setIsCSVImportOpen(true);
  };

  const getCategoryDisplay = (category: string) => {
    return category === 'current' ? 'Current Inventory' : 'Development Slabs';
  };

  if (!categoryName || !familyName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Invalid Parameters</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/category/${categoryName}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Families
                </Button>
              </Link>
              <div>
                <div className="text-sm text-slate-500">
                  {getCategoryDisplay(categoryName)}
                </div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {decodedFamilyName}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ExportButton category={categoryName as 'current' | 'development'} />
              {user && (
                <>
                  <Button onClick={handleAddSlab}>
                    Add Slab
                  </Button>
                  <Button variant="outline" onClick={handleCSVImport}>
                    Import CSV
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {error && (
              <Card className="border-red-200 mb-6">
                <CardContent className="p-6 text-center text-red-600">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p className="mb-4">Failed to load slabs. Please try again.</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {!error && slabs.length === 0 && !isLoading && (
              <Card className="border-slate-200 mb-6">
                <CardContent className="p-6 text-center text-slate-600">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No slabs found</p>
                  <p>There are no slabs in this family yet.</p>
                  {user && (
                    <Button onClick={handleAddSlab} className="mt-4">
                      Add First Slab
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Use the card-based SlabInventory component */}
            <SlabInventory
              searchTerm=""
              onSlabSelect={setSelectedSlab}
              selectedSlab={selectedSlab}
              onEditSlab={handleEditSlab}
              onDeleteSlab={handleDeleteSlab}
              isAuthenticated={!!user}
              category={categoryName as 'current' | 'development'}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <LowStockAlerts category={categoryName as 'current' | 'development'} />
            {selectedSlab ? (
              <SlabDetails 
                slab={selectedSlab} 
                onEditSlab={handleEditSlab}
                isAuthenticated={!!user}
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
      </div>

      {user && (
        <>
          <AddSlabDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            defaultCategory={categoryName as 'current' | 'development'}
            defaultFamily={decodedFamilyName}
          />

          <EditSlabDialog 
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            slab={editingSlab}
          />

          <DeleteSlabDialog 
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            slab={deletingSlab}
          />

          <CSVImportDialog 
            open={isCSVImportOpen}
            onOpenChange={setIsCSVImportOpen}
          />
        </>
      )}
    </div>
  );
};

export default FamilySlabsPage;