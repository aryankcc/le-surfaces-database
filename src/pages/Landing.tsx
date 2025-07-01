import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Layers, ArrowRight, Package, Beaker, AlertTriangle, BarChart3, Search, Plus, Upload, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Slab } from "@/types/slab";
import { formatSlabDate } from "@/utils/dateUtils";
import AddSlabDialog from "@/components/AddSlabDialog";
import CSVImportDialog from "@/components/CSVImportDialog";
import { useToast } from "@/hooks/use-toast";

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);

  // Search across all slabs
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['search-all-slabs', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      console.log('Searching all slabs with term:', searchTerm);
      
      const term = searchTerm.trim();
      const { data, error } = await supabase
        .from('slabs')
        .select('*')
        .or(`slab_id.ilike.%${term}%,family.ilike.%${term}%,formulation.ilike.%${term}%,version.ilike.%${term}%,status.ilike.%${term}%,notes.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error searching slabs:', error);
        throw error;
      }
      
      return data as Slab[];
    },
    enabled: searchTerm.trim().length > 0,
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

  const handleAddSlab = () => {
    if (!checkAuthForAction("add slabs")) return;
    setIsAddDialogOpen(true);
  };

  const handleCSVImport = () => {
    if (!checkAuthForAction("import CSV data")) return;
    setIsCSVImportOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reserved":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "sold":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "current":
        return "bg-green-100 text-green-800 border-green-200";
      case "development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-800">LE Surfaces</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button onClick={handleAddSlab} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slab
                  </Button>
                  
                  <Button variant="outline" onClick={handleCSVImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>

                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>

                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Quartz Slab Management System
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Manage and track the LE Surfaces quartz slab inventory.
          </p>

          {/* Global Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search all slabs by ID, family, or formulation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Search Results */}
            {searchTerm.trim() && (
              <div className="mt-4 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-sm text-slate-600 p-2 border-b">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.map((slab) => (
                      <div key={slab.id} className="p-3 hover:bg-slate-50 border-b last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-slate-800">{slab.family}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(slab.status)}`}>
                                {slab.status.replace('_', ' ')}
                              </span>
                              {slab.category && (
                                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(slab.category)}`}>
                                  {slab.category}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600">
                              ID: {slab.slab_id} • {slab.formulation}
                              {slab.version && ` • ${slab.version}`}
                            </div>
                            <div className="text-xs text-slate-500">
                              Received: {formatSlabDate(slab.received_date)}
                            </div>
                          </div>
                          <Link 
                            to={slab.category === 'development' ? '/slabs/development' : '/slabs/current'}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    No slabs found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All Slabs Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Package className="h-6 w-6" />
                <span>All Slabs</span>
              </CardTitle>
              <CardDescription>
                Access different categories of slabs in inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Slabs */}
                <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-700 flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Current Slabs</span>
                    </CardTitle>
                    <CardDescription>
                      Production-ready slabs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/slabs/current">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        View Current Slabs
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Development Slabs */}
                <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-700 flex items-center space-x-2">
                      <Beaker className="h-5 w-5" />
                      <span>New / Development Slabs</span>
                    </CardTitle>
                    <CardDescription>
                      Experimental and development slabs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/slabs/development">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Development Slabs
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/slabs/current">
                  <Button variant="outline" className="w-full">
                    Current Inventory
                  </Button>
                </Link>
                <Link to="/slabs/development">
                  <Button variant="outline" className="w-full">
                    Development Lab
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user ? (
                  <>
                    <Button variant="outline" className="w-full" onClick={handleAddSlab}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Slab
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleCSVImport}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-sm text-slate-500">
                    Sign in to manage slabs
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/reports">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
                <Link to="/stock-alerts">
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Stock Alerts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {user && (
        <>
          <AddSlabDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
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

export default Landing;