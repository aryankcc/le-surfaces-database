
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Beaker } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CategoryPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();

  const { data: families = [], isLoading, error } = useQuery({
    queryKey: ['families', categoryName],
    queryFn: async () => {
      console.log('Fetching families for category:', categoryName);
      
      const { data, error } = await supabase
        .from('slabs')
        .select('family')
        .eq('category', categoryName)
        .not('family', 'is', null)
        .order('family');
      
      if (error) {
        console.error('Error fetching families:', error);
        throw error;
      }
      
      // Get unique families
      const uniqueFamilies = [...new Set(data.map(item => item.family))];
      console.log('Found families:', uniqueFamilies);
      
      return uniqueFamilies;
    },
    enabled: !!categoryName
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

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Invalid Category</h1>
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
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <CategoryIcon className={`h-6 w-6 text-${colorScheme}-600`} />
                <h1 className="text-2xl font-bold text-slate-800">
                  {getCategoryDisplay(categoryName)}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Browse by Family
            </h2>
            <p className="text-slate-600">
              Select a family to view all slabs in that collection
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="border-red-200">
              <CardContent className="p-6 text-center text-red-600">
                <p className="mb-4">Failed to load families. Please try again.</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && families.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center text-slate-600">
                <CategoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No families found</p>
                <p>There are no slab families in this category yet.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && families.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <Link 
                  key={family} 
                  to={`/category/${categoryName}/${encodeURIComponent(family)}`}
                >
                  <Card className={`border-2 border-${colorScheme}-200 hover:border-${colorScheme}-400 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                    <CardHeader className="text-center">
                      <CardTitle className={`text-xl text-${colorScheme}-700 group-hover:text-${colorScheme}-800`}>
                        {family}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button 
                        className={`w-full bg-${colorScheme}-600 hover:bg-${colorScheme}-700`}
                        size="lg"
                      >
                        View Slabs
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
