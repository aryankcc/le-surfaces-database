import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileImage, Calendar, Palette, Trash2, Hash, Archive, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Slab } from "@/types/slab";

interface SlabInventoryProps {
  searchTerm: string;
  onSlabSelect: (slab: Slab) => void;
  selectedSlab: Slab | null;
  onEditSlab: (slab: Slab) => void;
  onDeleteSlab: (slab: Slab) => void;
  isAuthenticated: boolean;
  category?: 'current' | 'development';
}

const SlabInventory = ({ searchTerm, onSlabSelect, selectedSlab, onEditSlab, onDeleteSlab, isAuthenticated, category }: SlabInventoryProps) => {
  const { data: slabs = [], isLoading, error } = useQuery({
    queryKey: ['slabs', category],
    queryFn: async () => {
      console.log('Fetching slabs from database with category:', category);
      
      try {
        // First, check if the category column exists
        const { data: columnCheck, error: columnError } = await supabase
          .from('slabs')
          .select('*')
          .limit(1);

        let query = supabase
          .from('slabs')
          .select('*')
          .order('created_at', { ascending: false });

        // Only filter by category if the column exists and category is specified
        if (category && columnCheck && columnCheck.length > 0 && 'category' in columnCheck[0]) {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching slabs:', error);
          throw error;
        }
        
        console.log('Fetched slabs:', data);
        
        // If category filtering is requested but column doesn't exist, return all slabs
        // This is a temporary fallback until the migration is applied
        return data as Slab[];
      } catch (error) {
        console.error('Error in slabs query:', error);
        throw error;
      }
    }
  });

  const filteredSlabs = slabs.filter(slab => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (slab.family || '').toLowerCase().includes(searchLower) ||
      (slab.formulation || '').toLowerCase().includes(searchLower) ||
      (slab.slab_id || '').toLowerCase().includes(searchLower) ||
      (slab.version || '').toLowerCase().includes(searchLower) ||
      (slab.sku || '').toLowerCase().includes(searchLower) ||
      (slab.sent_to_location || '').toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reserved":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "sold":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "current":
        return "bg-green-100 text-green-800 border-green-200";
      case "development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    // Parse the date string and format it correctly in UTC
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      timeZone: 'UTC',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
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
        <h2 className="text-xl font-semibold text-slate-800">
          {category === 'current' ? 'Current Slabs' : 
           category === 'development' ? 'Development Slabs' : 
           'Slab Inventory'}
        </h2>
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
                    <h3 className="font-semibold text-lg text-slate-800">{slab.family}</h3>
                    <Badge className={getStatusColor(slab.status)}>
                      {slab.status.replace('_', ' ')}
                    </Badge>
                    {/* Only show category badge if the category property exists */}
                    {slab.category && (
                      <Badge className={getCategoryColor(slab.category)} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {slab.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                    <div>
                      <span className="font-medium">ID:</span> {slab.slab_id}
                    </div>
                    <div>
                      <span className="font-medium">Formulation:</span> {slab.formulation}
                    </div>
                    {slab.version && (
                      <div>
                        <span className="font-medium">Version:</span> {slab.version}
                      </div>
                    )}
                    {slab.sku && (
                      <div className="flex items-center space-x-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-medium">SKU:</span> {slab.sku}
                      </div>
                    )}
                    {slab.quantity && (
                      <div className="flex items-center space-x-1">
                        <Archive className="h-3 w-3" />
                        <span className="font-medium">Qty:</span> {slab.quantity}
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Received:</span> {formatDate(slab.received_date)}
                    </div>
                    {slab.sent_to_location && (
                      <div className="col-span-2">
                        <span className="font-medium">Sent to:</span> {slab.sent_to_location}
                        {slab.sent_to_date && ` (${formatDate(slab.sent_to_date)})`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {slab.notes && (
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <Palette className="h-4 w-4" />
                        <span>Has notes</span>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlabSelect(slab);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {isAuthenticated && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSlab(slab);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-red-600 hover:text-red-700 hover:border-red-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSlab(slab);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {slab.image_url ? (
                      <img 
                        src={slab.image_url} 
                        alt={slab.family}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileImage className="h-8 w-8 text-slate-400" />
                    )}
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