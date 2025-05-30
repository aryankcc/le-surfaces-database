
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileImage, Calendar, MapPin, Ruler, Palette, Plus, Edit } from "lucide-react";

interface SlabDetailsProps {
  slab: any;
}

const SlabDetails = ({ slab }: SlabDetailsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "Processing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Reserved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{slab.name}</CardTitle>
            <Badge className={getStatusColor(slab.status)}>
              {slab.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Placeholder */}
          <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
            <FileImage className="h-12 w-12 text-slate-400" />
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-slate-600">ID:</span>
              <span className="text-slate-800">{slab.id}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-slate-600">Pattern:</span>
              <span className="text-slate-800">{slab.pattern}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Ruler className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-600">Dimensions:</span>
              <span className="text-slate-800">{slab.dimensions}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-slate-600">Thickness:</span>
              <span className="text-slate-800">{slab.thickness}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-600">Location:</span>
              <span className="text-slate-800">{slab.location}</span>
            </div>
          </div>

          <Separator />

          {/* Modifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-800 flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Modifications</span>
              </h4>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {slab.modifications.map((mod: any, index: number) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-800">{mod.type}</div>
                      <div className="text-sm text-slate-600 mt-1">{mod.description}</div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>{mod.date}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-2">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Slab
            </Button>
            <Button variant="outline" className="flex-1">
              <FileImage className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlabDetails;
