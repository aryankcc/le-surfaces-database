import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowRight, Package, Beaker } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();

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
                <div className="text-sm text-slate-600">
                  Welcome, {user.email}
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="bg-blue-600 hover:bg-blue-700">
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
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage and track the LE Surfaces quartz slab inventory.
          </p>
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

          {/* Quick Stats */}
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
                    <Link to="/slabs/current">
                      <Button variant="outline" className="w-full">
                        Add New Slab
                      </Button>
                    </Link>
                    <Link to="/slabs/current">
                      <Button variant="outline" className="w-full">
                        Import CSV
                      </Button>
                    </Link>
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
                <Link to="/slabs/current">
                  <Button variant="outline" className="w-full">
                    View Reports
                  </Button>
                </Link>
                <Link to="/slabs/current">
                  <Button variant="outline" className="w-full">
                    Stock Alerts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
