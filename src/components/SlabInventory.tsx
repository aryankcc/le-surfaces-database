
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileImage, Calendar, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Slab {
  id: string;
  slab_id: string;
  original_design: string;
  current_design: string;
  thickness: number;
  width: number;
  height: number;
  weight: number;
  quality_grade: string;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
  modifications?: any[];
}

interface SlabInventoryProps {
  searchTerm: string;
  onSlabSelect: (slab: Slab) => void;
  selectedSlab: Slab | null;
}

const SlabInventory = ({ searchTerm, onSlabSelect, selectedSlab }: SlabInventoryProps) => {
  const { data: slabs = [], isLoading, error } = useQuery({
    queryKey: ['slabs'],
    queryFn: async () => {
      console.log('Fetching slabs from database...');
      const { data, error } = await supabase
        .from('slabs')
        .select(`
          *,
          modifications(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching slabs:', error);
        throw error;
      }
      
      console.log('Fetched slabs:', data);
      return data as Slab[];
    }
  });

  const filteredSlabs = slabs.filter(slab =>
    slab.current_design.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slab.original_design.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slab.slab_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slab.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sold":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Slab Inventory</h2>
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Slab Inventory</h2>
          <span className="text-sm text-red-500">Error loading data</span>
        </div>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center text-red-600">
            Failed to load slabs. Please check your connection.
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <h3 className="font-semibold text-lg text-slate-800">{slab.current_design}</h3>
                    <Badge className={getStatusColor(slab.status)}>
                      {slab.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                    <div>
                      <span className="font-medium">ID:</span> {slab.slab_id}
                    </div>
                    <div>
                      <span className="font-medium">Original:</span> {slab.original_design}
                    </div>
                    <div>
                      <span className="font-medium">Thickness:</span> {slab.thickness}mm
                    </div>
                    <div>
                      <span className="font-medium">Dimensions:</span> {slab.width}x{slab.height}mm
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {slab.location}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Created:</span> {new Date(slab.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                      <Palette className="h-4 w-4" />
                      <span>{slab.modifications?.length || 0} modifications</span>
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
