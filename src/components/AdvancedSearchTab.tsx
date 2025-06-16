
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const AdvancedSearchTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
        <CardDescription>
          Find slabs by family, formulation, version, or shipping details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Family</label>
            <Input placeholder="e.g., Calacatta, Carrara" />
          </div>
          <div>
            <label className="text-sm font-medium">Formulation</label>
            <Input placeholder="e.g., Gold, White Classic" />
          </div>
          <div>
            <label className="text-sm font-medium">Version</label>
            <Input placeholder="e.g., Premium, Standard" />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Input placeholder="e.g., in_stock, sent" />
          </div>
          <div>
            <label className="text-sm font-medium">Sent To Location</label>
            <Input placeholder="e.g., Project Site A" />
          </div>
          <div>
            <label className="text-sm font-medium">Received Date</label>
            <Input type="date" />
          </div>
        </div>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
          <Search className="h-4 w-4 mr-2" />
          Search Slabs
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchTab;
