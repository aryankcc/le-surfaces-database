
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileImage, Calendar, Palette } from "lucide-react";

const mockSlabs = [
  {
    id: "SLB-001",
    name: "Calacatta Gold Premium",
    pattern: "Calacatta",
    thickness: "30mm",
    dimensions: "3200x1600mm",
    status: "In Stock",
    location: "Warehouse A-12",
    modifications: [
      { type: "Vein Enhancement", description: "Increased vein prominence by 15%", date: "2024-05-15" },
      { type: "Color Adjustment", description: "Warmed gold tones by 8%", date: "2024-05-18" }
    ],
    image: "/placeholder.svg",
    lastModified: "2024-05-18"
  },
  {
    id: "SLB-002",
    name: "Carrara Marble Look",
    pattern: "Carrara",
    thickness: "20mm",
    dimensions: "3200x1600mm",
    status: "Processing",
    location: "Workshop B-3",
    modifications: [
      { type: "Vein Softening", description: "Reduced vein intensity by 20%", date: "2024-05-20" }
    ],
    image: "/placeholder.svg",
    lastModified: "2024-05-20"
  },
  {
    id: "SLB-003",
    name: "Dramatic Noir",
    pattern: "Dramatic",
    thickness: "20mm",
    dimensions: "3200x1600mm",
    status: "In Stock",
    location: "Warehouse C-8",
    modifications: [
      { type: "Contrast Enhancement", description: "Increased contrast by 25%", date: "2024-05-12" },
      { type: "Vein Widening", description: "Expanded primary veins by 12%", date: "2024-05-14" }
    ],
    image: "/placeholder.svg",
    lastModified: "2024-05-14"
  }
];

interface SlabInventoryProps {
  searchTerm: string;
  onSlabSelect: (slab: any) => void;
  selectedSlab: any;
}

const SlabInventory = ({ searchTerm, onSlabSelect, selectedSlab }: SlabInventoryProps) => {
  const filteredSlabs = mockSlabs.filter(slab =>
    slab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slab.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slab.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Slab Inventory</h2>
        <span className="text-sm text-slate-500">{filteredSlabs.length} slabs found</span>
      </div>
      
      <div className="grid gap-4">
        {filteredSlabs.map((slab) => (
          <Card 
            key={slab.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSlab?.id === slab.id ? 'ring-2 ring-blue-500 shadow-md' : ''
            }`}
            onClick={() => onSlabSelect(slab)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-800">{slab.name}</h3>
                    <Badge className={getStatusColor(slab.status)}>
                      {slab.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                    <div>
                      <span className="font-medium">ID:</span> {slab.id}
                    </div>
                    <div>
                      <span className="font-medium">Pattern:</span> {slab.pattern}
                    </div>
                    <div>
                      <span className="font-medium">Thickness:</span> {slab.thickness}
                    </div>
                    <div>
                      <span className="font-medium">Dimensions:</span> {slab.dimensions}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {slab.location}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Modified:</span> {slab.lastModified}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                      <Palette className="h-4 w-4" />
                      <span>{slab.modifications.length} modifications</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="h-8">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SlabInventory;
