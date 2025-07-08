import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileImage, Search, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import InventoryTab from "@/components/InventoryTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import AdvancedSearchTab from "@/components/AdvancedSearchTab";
import AddSlabDialog from "@/components/AddSlabDialog";
import EditSlabDialog from "@/components/EditSlabDialog";
import DeleteSlabDialog from "@/components/DeleteSlabDialog";
import CSVImportDialog from "@/components/CSVImportDialog";
import SlabsWithoutImagesDialog from "@/components/SlabsWithoutImagesDialog";
import ExportButton from "@/components/ExportButton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Slab } from "@/types/slab";

const CurrentSlabs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSlab, setSelectedSlab] = useState<Slab | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [isSlabsWithoutImagesOpen, setIsSlabsWithoutImagesOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<Slab | null>(null);
  const [deletingSlab, setDeletingSlab] = useState<Slab | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch statistics for current slabs only
  const { data: stats } = useQuery({
    queryKey: ['current-slab-stats'],
    queryFn: async () => {
      console.log('Fetching current slab statistics...');
      
      try {
        // First, check if the category column exists by doing a simple query
        const { data: columnCheck, error: columnError } = await supabase
          .from('slabs')
          .select('*')
          .limit(1);

        let query = supabase
          .from('slabs')
          .select('*');

        // Only filter by category if the column exists
        if (columnCheck && columnCheck.length > 0 && 'category' in columnCheck[0]) {
          query = query.eq('category', 'current');
        }
        
        const { data: slabs, error } = await query;
        
        if (error) {
          console.error('Supabase error fetching stats:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        if (!slabs) {
          return {
            totalSlabs: 0,
            inStock: 0,
            sent: 0,
            notInYet: 0,
            discontinued: 0,
            slabsWithoutPictures: 0
          };
        }

        // If category column doesn't exist, we're showing all slabs
        // Once the migration is applied, this will properly filter by category
        const totalSlabs = slabs.length;
        const inStock = slabs.filter(s => s.status === 'in_stock').length;
        const sent = slabs.filter(s => s.status === 'sent').length;
        const notInYet = slabs.filter(s => s.status === 'not_in_yet').length;
        const discontinued = slabs.filter(s => s.status === 'discontinued').length;
        
        const slabsWithoutPictures = slabs.filter(slab => {
          const hasImageUrl = slab.image_url && slab.image_url.trim() !== '';
          const hasBoxLink = slab.box_shared_link && slab.box_shared_link.trim() !== '';
          return !hasImageUrl && !hasBoxLink;
        });

        return {
          totalSlabs,
          inStock,
          sent,
          notInYet,
          discontinued,
          slabsWithoutPictures: slabsWithoutPictures.length
        };
      } catch (error) {
        console.error('Error in current slabs stats query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

  const handleViewSlabsWithoutImages = () => {
    setIsSlabsWithoutImagesOpen(true);
  };

  const statsData = stats ? {
    totalSlabs: stats.totalSlabs,
    inStock: stats.inStock,
    sent: stats.sent,
    notInYet: stats.notInYet,
    discontinued: stats.discontinued,
    slabsWithoutPictures: stats.slabsWithoutPictures,
  } : {
    totalSlabs: 0,
    inStock: 0,
    sent: 0,
    notInYet: 0,
    discontinued: 0,
    slabsWithoutPictures: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddSlab={handleAddSlab}
        onCSVImport={handleCSVImport}
        isAuthenticated={!!user}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <ExportButton category="current" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Current Slabs</h1>
          <p className="text-slate-600">Production-ready slabs available for projects and sales</p>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <FileImage className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Advanced Search</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <InventoryTab
              searchTerm={searchTerm}
              selectedSlab={selectedSlab}
              onSlabSelect={setSelectedSlab}
              onEditSlab={handleEditSlab}
              onDeleteSlab={handleDeleteSlab}
              isAuthenticated={!!user}
              category="current"
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab 
              stats={stats} 
              onViewSlabsWithoutImages={handleViewSlabsWithoutImages}
            />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <AdvancedSearchTab />
          </TabsContent>
        </Tabs>
      </div>

      {user && (
        <>
          <AddSlabDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            defaultCategory="current"
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

      <SlabsWithoutImagesDialog 
        open={isSlabsWithoutImagesOpen}
        onOpenChange={setIsSlabsWithoutImagesOpen}
      />
    </div>
  );
};

export default CurrentSlabs;
