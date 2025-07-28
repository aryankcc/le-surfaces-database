import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Package } from "lucide-react";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";

interface StockAlertsDialogProps {
  category?: 'current' | 'development';
}

const StockAlertsDialog = ({ category }: StockAlertsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: alerts = [], isLoading, error } = useLowStockAlerts(category);

  const getTitle = () => {
    if (category === 'current') return 'Current Slabs - Stock Alerts';
    if (category === 'development') return 'Development Slabs - Stock Alerts';
    return 'Stock Alerts';
  };

  const getTriggerText = () => {
    if (isLoading) return 'Loading alerts...';
    if (error) return 'Error loading alerts';
    if (alerts.length === 0) return 'All stock levels sufficient';
    return `${alerts.length} low stock alert${alerts.length > 1 ? 's' : ''}`;
  };

  const getTriggerVariant = () => {
    if (alerts.length === 0) return 'outline';
    return 'destructive';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={getTriggerVariant()} size="sm" className="ml-auto">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {getTriggerText()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>{getTitle()}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <p className="text-sm text-slate-500 text-center py-4">Loading alerts...</p>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-4">Error loading alerts</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-sm text-green-600">
                {category 
                  ? `All ${category} slab stock levels are sufficient`
                  : 'All stock levels are sufficient'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
                      <div className="flex space-x-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-orange-300 text-orange-800"
                        >
                          Quantity: {alert.quantity}
                        </Badge>
                        {alert.category && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alert.category === 'current' 
                                ? 'border-green-300 text-green-800' 
                                : 'border-blue-300 text-blue-800'
                            }`}
                          >
                            {alert.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StockAlertsDialog;