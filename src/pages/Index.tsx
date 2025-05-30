
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Database, FileImage, Layers } from "lucide-react";
import SlabInventory from "@/components/SlabInventory";
import SlabDetails from "@/components/SlabDetails";
import AddSlabDialog from "@/components/AddSlabDialog";

const Index = () => {
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modified Slabs</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,089</div>
                  <p className="text-xs text-muted-foreground">
                    Available for processing
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">In Progress</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">158</div>
                  <p className="text-xs text-muted-foreground">
                    Currently being modified
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
                  Find slabs by specific modifications, patterns, or characteristics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pattern Type</label>
                    <Input placeholder="e.g., Calacatta, Carrara" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Vein Intensity</label>
                    <Input placeholder="e.g., Subtle, Bold, Dense" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color Modification</label>
                    <Input placeholder="e.g., Warmer tone, Cooler tone" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Thickness</label>
                    <Input placeholder="e.g., 20mm, 30mm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Input placeholder="e.g., In Stock, Processing" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <Input placeholder="e.g., Last 30 days" />
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
