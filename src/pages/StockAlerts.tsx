import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Package, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import ExportButton from "@/components/ExportButton";

const StockAlerts = () => {
  const { data: alerts = [], isLoading, error } = useLowStockAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Stock Alerts</h1>
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
          <h1 className="text-3xl font-bold text-slate-800">Low Stock Alerts</h1>
          <p className="text-slate-600">Monitor inventory levels and identify slabs that need restocking</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-slate-600">Loading stock alerts...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Error loading stock alerts: {error.message}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && alerts.length === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>All Stock Levels Sufficient</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">
                  Great! All slabs in your inventory have sufficient stock levels. No immediate restocking required.
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && alerts.length > 0 && (
            <>
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Low Stock Alerts ({alerts.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 mb-4">
                    The following slabs have quantities below the recommended minimum levels:
                  </p>
                  
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
                      <Alert key={index} className="border-orange-200 bg-white">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <AlertTitle className="text-orange-800">
                          {alert.family} - {alert.formulation}
                          {alert.version && ` (${alert.version})`}
                        </AlertTitle>
                        <AlertDescription className="text-orange-700">
                          <div className="space-y-2">
                            <div>
                              Slab ID: <strong>{alert.slab_id}</strong> has only <strong>{alert.quantity}</strong> remaining 
                              (minimum recommended: {alert.min_quantity})
                            </div>
                            <div className="flex space-x-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs border-orange-300 text-orange-800"
                              >
                                Current: {alert.quantity}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs border-red-300 text-red-800"
                              >
                                Min Required: {alert.min_quantity}
                              </Badge>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;