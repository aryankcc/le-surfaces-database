
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";

const LowStockAlerts = () => {
  const { data: alerts = [], isLoading, error } = useLowStockAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Stock Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Stock Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error loading alerts</p>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>Stock Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">All stock levels are sufficient</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Low Stock Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert key={index} className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-800">
              Low Stock: {alert.family} - {alert.formulation}
              {alert.version && ` (${alert.version})`}
            </AlertTitle>
            <AlertDescription className="text-orange-700">
              Only {alert.current_count} slab{alert.current_count !== 1 ? 's' : ''} remaining 
              (minimum: {alert.min_quantity})
              
              {alert.slabs.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Slabs needing replacement (qty ≤ 2):</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.slabs.map((slab, slabIndex) => (
                      <Badge 
                        key={slabIndex} 
                        variant="outline" 
                        className="text-xs border-orange-300 text-orange-800"
                      >
                        {slab.slab_id} (qty: {slab.quantity || 0})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;
