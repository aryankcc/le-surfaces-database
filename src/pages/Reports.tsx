import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Package, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ExportButton from "@/components/ExportButton";

const Reports = () => {
  // Fetch comprehensive statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: async () => {
      const { data: slabs, error } = await supabase
        .from('slabs')
        .select('*');
      
      if (error) throw error;
      if (!slabs) return null;

      // Calculate various statistics
      const totalSlabs = slabs.length;
      const currentSlabs = slabs.filter(s => s.category === 'current' || !s.category).length;
      const developmentSlabs = slabs.filter(s => s.category === 'development').length;
      
      const statusCounts = {
        in_stock: slabs.filter(s => s.status === 'in_stock').length,
        sent: slabs.filter(s => s.status === 'sent').length,
        not_in_yet: slabs.filter(s => s.status === 'not_in_yet').length,
        discontinued: slabs.filter(s => s.status === 'discontinued').length,
      };

      const familyCounts = slabs.reduce((acc, slab) => {
        acc[slab.family] = (acc[slab.family] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topFamilies = Object.entries(familyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      const slabsWithImages = slabs.filter(s => s.image_url || s.box_shared_link).length;
      const slabsWithoutImages = totalSlabs - slabsWithImages;

      return {
        totalSlabs,
        currentSlabs,
        developmentSlabs,
        statusCounts,
        topFamilies,
        slabsWithImages,
        slabsWithoutImages,
        imageCompletionRate: totalSlabs > 0 ? Math.round((slabsWithImages / totalSlabs) * 100) : 0
      };
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
            <ExportButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Inventory Reports</h1>
          <p className="text-slate-600">Comprehensive analytics and insights for your slab inventory</p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Slabs</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
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
                  <CardTitle className="text-sm font-medium">Current Slabs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.currentSlabs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Production-ready
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Development Slabs</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.developmentSlabs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Experimental/R&D
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Image Completion</CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats?.imageCompletionRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Slabs with images
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current status of all slabs in inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.statusCounts.in_stock || 0}</div>
                    <div className="text-sm text-green-700">In Stock</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.statusCounts.sent || 0}</div>
                    <div className="text-sm text-blue-700">Sent</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats?.statusCounts.not_in_yet || 0}</div>
                    <div className="text-sm text-orange-700">Not In Yet</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats?.statusCounts.discontinued || 0}</div>
                    <div className="text-sm text-red-700">Discontinued</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Families */}
            <Card>
              <CardHeader>
                <CardTitle>Top Slab Families</CardTitle>
                <CardDescription>Most common slab families in inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topFamilies.map(([family, count], index) => (
                    <div key={family} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{family}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-700">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Image Status */}
            <Card>
              <CardHeader>
                <CardTitle>Image Documentation Status</CardTitle>
                <CardDescription>Track visual documentation completion across inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats?.slabsWithImages || 0}</div>
                    <div className="text-green-700 font-medium">Slabs with Images</div>
                    <div className="text-sm text-green-600 mt-1">Have photos or Box links</div>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{stats?.slabsWithoutImages || 0}</div>
                    <div className="text-orange-700 font-medium">Slabs without Images</div>
                    <div className="text-sm text-orange-600 mt-1">Need photo documentation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;