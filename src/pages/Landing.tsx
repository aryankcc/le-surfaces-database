
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, ArrowRight, Package, Beaker, Send, BarChart3, Search, Upload, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Slab } from "@/types/slab";
import { formatSlabDate } from "@/utils/dateUtils";
import CSVImportDialog from "@/components/CSVImportDialog";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'slab_id' | 'family' | 'created_at'>('slab_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Search across all slabs
  const { data: allSlabs = [], isLoading: isLoadingSlabs } = useQuery({
    queryKey: ['all-slabs-landing'],
    queryFn: async () => {
      console.log('Fetching all slabs for landing page');
      
      const { data, error } = await supabase
        .from('slabs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching slabs:', error);
        throw error;
      }
      
      return data as Slab[];
    },
  });

  // Sort and filter slabs based on search term and sort preferences
  const processedSlabs = React.useMemo(() => {
    let filtered = allSlabs;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = allSlabs.filter(slab => 
        slab.slab_id.toLowerCase().includes(term) ||
        slab.family.toLowerCase().includes(term) ||
        slab.formulation.toLowerCase().includes(term) ||
        (slab.version && slab.version.toLowerCase().includes(term)) ||
        slab.status.toLowerCase().includes(term) ||
        (slab.notes && slab.notes.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (sortBy === 'slab_id') {
        // Custom sorting for slab IDs (alphanumeric)
        const parseSlabId = (id: string) => {
          const match = id.match(/^(\d+)([A-Z])$/);
          if (match) {
            return { num: parseInt(match[1]), letter: match[2] };
          }
          return { num: 0, letter: id };
        };
        
        const aParsed = parseSlabId(a.slab_id);
        const bParsed = parseSlabId(b.slab_id);
        
        if (aParsed.num !== bParsed.num) {
          return sortOrder === 'asc' ? aParsed.num - bParsed.num : bParsed.num - aParsed.num;
        }
        
        aValue = aParsed.letter;
        bValue = bParsed.letter;
      } else if (sortBy === 'created_at') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      } else {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted.slice(0, 10); // Limit to 10 results for display
  }, [allSlabs, searchTerm, sortBy, sortOrder]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "not_in_yet":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "discontinued":
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
            
            {/* Sort Controls */}
            {searchTerm.trim() && (
              <div className="flex items-center space-x-2 mt-2">
                <Select value={sortBy} onValueChange={(value: 'slab_id' | 'family' | 'created_at') => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slab_id">Slab ID</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="created_at">Date Added</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Search Results */}
            {searchTerm.trim() && (
              <div className="mt-4 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto">
                {isLoadingSlabs ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-slate-500 mt-2">Searching...</p>
                  </div>
                ) : processedSlabs.length > 0 ? (
                  <div className="p-2">
                    <div className="text-sm text-slate-600 p-2 border-b">
                      Found {processedSlabs.length} result{processedSlabs.length !== 1 ? 's' : ''} (showing top 10)
                    </div>
                    {processedSlabs.map((slab) => (
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
                            to={`/category/${slab.category}`}
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

        {/* Main Category Selection */}
        <div className="max-w-4xl mx-auto">
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
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/reports">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
                {user && (
                  <Button variant="outline" className="w-full" onClick={handleCSVImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
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

export default Landing;
