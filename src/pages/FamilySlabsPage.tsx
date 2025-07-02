
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Beaker, ExternalLink, FileImage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Slab } from "@/types/slab";

const FamilySlabsPage = () => {
  const { categoryName, familyName } = useParams<{ 
    categoryName: string; 
    familyName: string; 
  }>();

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
    enabled: !!(categoryName && decodedFamilyName)
  });

  const getCategoryDisplay = (category: string) => {
    return category === 'current' ? 'Current Inventory' : 'Development Slabs';
  };

  const getCategoryIcon = (category: string) => {
    return category === 'current' ? Package : Beaker;
  };

  const getCategoryColor = (category: string) => {
    return category === 'current' ? 'green' : 'blue';
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

  const CategoryIcon = getCategoryIcon(categoryName);
  const colorScheme = getCategoryColor(categoryName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link to={`/category/${categoryName}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Families
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <CategoryIcon className={`h-6 w-6 text-${colorScheme}-600`} />
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {getCategoryDisplay(categoryName)}
                  </h1>
                  <p className="text-sm text-slate-600">{decodedFamilyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {decodedFamilyName}
            </h2>
            <p className="text-slate-600">
              All slabs in the {decodedFamilyName} family
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="border-red-200">
              <CardContent className="p-6 text-center text-red-600">
                <p className="mb-4">Failed to load slabs. Please try again.</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && slabs.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center text-slate-600">
                <CategoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No slabs found</p>
                <p>There are no slabs in the {decodedFamilyName} family yet.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && slabs.length > 0 && (
            <>
              <div className="mb-6 text-sm text-slate-600">
                Showing {slabs.length} slab{slabs.length !== 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {slabs.map((slab) => (
                  <Card key={slab.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      {/* Image */}
                      <div className="aspect-square bg-slate-100 rounded-lg mb-4 overflow-hidden relative">
                        {slab.image_url ? (
                          <img 
                            src={slab.image_url} 
                            alt={slab.slab_id}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileImage className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                        
                        {/* Box Link Overlay */}
                        {slab.box_shared_link && (
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(slab.box_shared_link!, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Slab Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {slab.slab_id}
                          </h3>
                          <Badge className={getStatusColor(slab.status)}>
                            {slab.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 truncate">
                          {slab.formulation}
                        </p>
                        
                        {slab.version && (
                          <p className="text-xs text-slate-500">
                            Version: {slab.version}
                          </p>
                        )}

                        {slab.box_shared_link && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => window.open(slab.box_shared_link!, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View in Box
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilySlabsPage;
