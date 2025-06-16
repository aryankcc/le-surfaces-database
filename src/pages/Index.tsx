
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileImage, Search } from "lucide-react";
import Header from "@/components/Header";
import InventoryTab from "@/components/InventoryTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import AdvancedSearchTab from "@/components/AdvancedSearchTab";
import AddSlabDialog from "@/components/AddSlabDialog";
import EditSlabDialog from "@/components/EditSlabDialog";
import DeleteSlabDialog from "@/components/DeleteSlabDialog";
import CSVImportDialog from "@/components/CSVImportDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Slab } from "@/types/slab";

const Index = () => {
  const [selectedSlab, setSelectedSlab] = useState<Slab | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<Slab | null>(null);
  const [deletingSlab, setDeletingSlab] = useState<Slab | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch statistics for the analytics tab
  const { data: stats } = useQuery({
    queryKey: ['slab-stats'],
    queryFn: async () => {
      console.log('Fetching slab statistics...');
      
      const { data: slabs, error } = await supabase
        .from('slabs')
        .select('status, image_url, box_url, modifications(id)');
      
      if (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }

      const totalSlabs = slabs.length;
      const inStock = slabs.filter(s => s.status === 'in_stock').length;
      const sent = slabs.filter(s => s.status === 'sent').length;
      const reserved = slabs.filter(s => s.status === 'reserved').length;
      const sold = slabs.filter(s => s.status === 'sold').length;
      const modifiedSlabs = slabs.filter(s => s.modifications && s.modifications.length > 0).length;
      const slabsWithoutPictures = slabs.filter(s => !s.image_url && !s.box_url).length;

      return {
        totalSlabs,
        inStock,
        sent,
        reserved,
        sold,
        modifiedSlabs,
        slabsWithoutPictures
      };
    }
  });

  const handleEditSlab = (slab: Slab) => {
    setEditingSlab(slab);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSlab = (slab: Slab) => {
    setDeletingSlab(slab);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddSlab={() => setIsAddDialogOpen(true)}
        onCSVImport={() => setIsCSVImportOpen(true)}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
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
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab stats={stats} />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <AdvancedSearchTab />
          </TabsContent>
        </Tabs>
      </div>

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
    </div>
  );
};

export default Index;
