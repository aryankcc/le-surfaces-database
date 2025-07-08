import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileImage, Search, Package, Beaker } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import InventoryTab from "@/components/InventoryTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import AdvancedSearchTab from "@/components/AdvancedSearchTab";
import AddSlabDialog from "@/components/AddSlabDialog";
import EditSlabDialog from "@/components/EditSlabDialog";
import DeleteSlabDialog from "@/components/DeleteSlabDialog";
import CSVImportDialog from "@/components/CSVImportDialog";
import SlabsWithoutImagesDialog from "@/components/SlabsWithoutImagesDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Slab } from "@/types/slab";

const Index = () => {
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

  const { data: stats } = useQuery({
    queryKey: ['slab-stats'],
    queryFn: async () => {
      console.log('Fetching slab statistics...');
      
      try {
        const { data: slabs, error } = await supabase
          .from('slabs')
          .select('*');
        
        if (error) {
          console.error('Supabase error fetching stats:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        if (!slabs) {
          console.warn('No slabs data returned from database');
          return {
            totalSlabs: 0,
            inStock: 0,
            sent: 0,
            reserved: 0,
            sold: 0,
            slabsWithoutPictures: 0
          };
        }

        console.log('Raw slabs data for analytics:', slabs);

        const totalSlabs = slabs.length;
        const inStock = slabs.filter(s => s.status === 'in_stock').length;
        const sent = slabs.filter(s => s.status === 'sent').length;
        const notInYet = slabs.filter(s => s.status === 'not_in_yet').length;
        const discontinued = slabs.filter(s => s.status === 'discontinued').length;
        const reserved = slabs.filter(s => s.status === 'reserved').length;
        const sold = slabs.filter(s => s.status === 'sold').length;
        
        // More thorough check for slabs without pictures
        const slabsWithoutPictures = slabs.filter(slab => {
          const hasImageUrl = slab.image_url && slab.image_url.trim() !== '';
          const hasBoxLink = slab.box_shared_link && slab.box_shared_link.trim() !== '';
          const hasNoPictures = !hasImageUrl && !hasBoxLink;
          
          console.log(`Slab ${slab.slab_id} check:`, {
            image_url: slab.image_url,
            box_shared_link: slab.box_shared_link,
            hasImageUrl,
            hasBoxLink,
            hasNoPictures
          });
          
          return hasNoPictures;
        });

        console.log('Slabs without pictures:', slabsWithoutPictures.map(s => s.slab_id));
        console.log('Analytics results:', {
          totalSlabs,
          inStock,
          sent,
          reserved,
          sold,
          slabsWithoutPictures: slabsWithoutPictures.length
        });

        return {
          totalSlabs,
          inStock,
          sent,
          reserved,
          sold,
          notInYet,
          discontinued,
          slabsWithoutPictures: slabsWithoutPictures.length
        };
      } catch (error) {
        console.error('Error in stats query function:', error);
        
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the database. Please check your internet connection and try again.",
            variant: "destructive",
          });
          throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
        }
        
        // Show toast for other errors
        toast({
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to load statistics. Please try again.",
          variant: "destructive",
        });
        
        // Re-throw other errors
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
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
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            LE Surfaces Slab Inventory
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Manage and track your quartz slab inventory with ease
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/category/current">
            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">Current Slabs</CardTitle>
                <CardDescription>
                  Production-ready slabs available for projects
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/category/development">
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Beaker className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-700">Development Slabs</CardTitle>
                <CardDescription>
                  Experimental and R&D formulations
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/outbound">
            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                  <Database className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-700">Outbound Samples</CardTitle>
                <CardDescription>
                  Track samples sent to customers
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
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

export default Index;
