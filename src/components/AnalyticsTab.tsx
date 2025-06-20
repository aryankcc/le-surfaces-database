import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Layers, FileImage } from "lucide-react";

interface AnalyticsTabProps {
  stats?: {
    totalSlabs: number;
    inStock: number;
    sent: number;
    reserved: number;
    sold: number;
    slabsWithoutPictures: number;
  };
  onViewSlabsWithoutImages?: () => void;
}

const AnalyticsTab = ({ stats, onViewSlabsWithoutImages }: AnalyticsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Slabs</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle className="text-sm font-medium">In Stock</CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.inStock || 0}</div>
          <p className="text-xs text-muted-foreground">
            Ready for use
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sent</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Shipped</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.sent || 0}</div>
          <p className="text-xs text-muted-foreground">
            Delivered to projects
          </p>
        </CardContent>
      </Card>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewSlabsWithoutImages}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">No Pictures</CardTitle>
          <FileImage className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats?.slabsWithoutPictures || 0}</div>
          <p className="text-xs text-muted-foreground mb-2">
            Slabs without images
          </p>
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;