
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
              <div className="space-y-2">
                <div>
                  Slab ID: <strong>{alert.slab_id}</strong> has only <strong>{alert.quantity}</strong> remaining 
                  (minimum recommended: {alert.min_quantity})
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs border-orange-300 text-orange-800"
                >
                  Quantity: {alert.quantity}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;
