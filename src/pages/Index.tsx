import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Beaker, Send, ArrowRight, User, LogOut, BarChart3, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Slab } from "@/types/slab";
import CSVImportDialog from "@/components/CSVImportDialog";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);

  // Fetch combined statistics
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
          return {
            totalSlabs: 0,
            currentSlabs: 0,
            developmentSlabs: 0,
            outboundSlabs: 0
          };
        }

        const totalSlabs = slabs.length;
        const currentSlabs = slabs.filter(slab => slab.category === 'current').length;
        const developmentSlabs = slabs.filter(slab => slab.category === 'development').length;
        const outboundSlabs = slabs.filter(slab => slab.status === 'sent').length;

        return {
          totalSlabs,
          currentSlabs,
          developmentSlabs,
          outboundSlabs
        };
      } catch (error) {
        console.error('Error in slabs stats query:', error);
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

  const handleCSVImport = () => {
    if (!checkAuthForAction("import CSV data")) return;
    setIsCSVImportOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddSlab = () => {
    if (!checkAuthForAction("add slabs")) return;
    toast({
      title: "Add Slab",
      description: "Navigate to a specific category to add slabs.",
    });
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

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Quartz Slab Management System
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Manage and track the LE Surfaces quartz slab inventory.
          </p>
        </div>

        {/* Main Category Selection */}
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Browse Inventory</CardTitle>
              <CardDescription className="text-lg">
                Choose a category to explore our slab collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Current Inventory */}
                <Link to="/category/current">
                  <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                        <Package className="h-12 w-12 text-green-600" />
                      </div>
                      <CardTitle className="text-2xl text-green-700">Current Inventory</CardTitle>
                      <CardDescription className="text-base">
                        Production-ready slabs available for immediate use
                      </CardDescription>
                      {stats && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                          {stats.currentSlabs} slabs available
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                        Explore Current Slabs
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Development Slabs */}
                <Link to="/category/development">
                  <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                        <Beaker className="h-12 w-12 text-blue-600" />
                      </div>
                      <CardTitle className="text-2xl text-blue-700">Development Slabs</CardTitle>
                      <CardDescription className="text-base">
                        Experimental and new formulations in development
                      </CardDescription>
                      {stats && (
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          {stats.developmentSlabs} slabs in development
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                        Explore Development Slabs
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Outbound Samples */}
                <Link to="/outbound-samples">
                  <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                        <Send className="h-12 w-12 text-purple-600" />
                      </div>
                      <CardTitle className="text-2xl text-purple-700">Outbound Samples</CardTitle>
                      <CardDescription className="text-base">
                        Samples sent to customers and locations
                      </CardDescription>
                      {stats && (
                        <div className="mt-2 text-sm font-medium text-purple-600">
                          {stats.outboundSlabs} samples sent
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                        View Outbound Samples
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/category/current">
                  <Button variant="outline" className="w-full">
                    Current Inventory
                  </Button>
                </Link>
                <Link to="/category/development">
                  <Button variant="outline" className="w-full">
                    Development Lab
                  </Button>
                </Link>
                <Link to="/outbound-samples">
                  <Button variant="outline" className="w-full">
                    Outbound Samples
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/reports">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics & Reports
                  </Button>
                </Link>
                <Link to="/stock-alerts">
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Stock Alerts
                  </Button>
                </Link>
                {!user ? (
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Sign In to Manage
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {user && (
        <CSVImportDialog 
          open={isCSVImportOpen}
          onOpenChange={setIsCSVImportOpen}
        />
      )}
    </div>
  );
};

export default Index;
