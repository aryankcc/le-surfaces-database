
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Database, FileImage, Layers, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SlabInventory from "@/components/SlabInventory";
import SlabDetails from "@/components/SlabDetails";
import AddSlabDialog from "@/components/AddSlabDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, signOut } = useAuth();

  // Fetch statistics for the analytics tab
  const { data: stats } = useQuery({
    queryKey: ['slab-stats'],
    queryFn: async () => {
      console.log('Fetching slab statistics...');
      
      const { data: slabs, error } = await supabase
        .from('slabs')
        .select('status, modifications(id)');
      
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

      return {
        totalSlabs,
        inStock,
        sent,
        reserved,
        sold,
        modifiedSlabs
      };
    }
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Layers className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">LE Surfaces</h1>
                  <p className="text-sm text-slate-500">Quartz Slab Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search slabs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slab
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SlabInventory 
                  searchTerm={searchTerm}
                  onSlabSelect={setSelectedSlab}
                  selectedSlab={selectedSlab}
                />
              </div>
              <div className="lg:col-span-1">
                {selectedSlab ? (
                  <SlabDetails slab={selectedSlab} />
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Slabs</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSlabs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    In inventory system
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.inStock || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for use
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sent</CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Shipped</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.sent || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Delivered to projects
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modified Slabs</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.modifiedSlabs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    With recorded modifications
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>
                  Find slabs by family, formulation, version, or shipping details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Family</label>
                    <Input placeholder="e.g., Calacatta, Carrara" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Formulation</label>
                    <Input placeholder="e.g., Gold, White Classic" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Version</label>
                    <Input placeholder="e.g., Premium, Standard" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Input placeholder="e.g., in_stock, sent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sent To Location</label>
                    <Input placeholder="e.g., Project Site A" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Received Date</label>
                    <Input type="date" />
                  </div>
                </div>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Slabs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddSlabDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};

export default Index;
