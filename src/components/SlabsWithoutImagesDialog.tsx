import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileImage, Edit, Calendar, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Slab } from "@/types/slab";

interface SlabsWithoutImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SlabsWithoutImagesDialog = ({ open, onOpenChange }: SlabsWithoutImagesDialogProps) => {
  const { data: slabsWithoutImages = [], isLoading, error } = useQuery({
    queryKey: ['slabs-without-images'],
    queryFn: async () => {
      console.log('Fetching slabs without images...');
      
      const { data: slabs, error } = await supabase
        .from('slabs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching slabs without images:', error);
        throw error;
      }

      // Filter slabs that have neither image_url nor box_shared_link
      const slabsWithoutPictures = slabs.filter(slab => 
        (!slab.image_url || slab.image_url.trim() === '') && 
        (!slab.box_shared_link || slab.box_shared_link.trim() === '')
      );

      console.log('Found slabs without images:', slabsWithoutPictures.length);
      return slabsWithoutPictures as Slab[];
    },
    enabled: open, // Only fetch when dialog is open
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      timeZone: 'UTC',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileImage className="h-5 w-5 text-orange-500" />
            <span>Slabs Without Images</span>
          </DialogTitle>
          <DialogDescription>
            These slabs don't have any images or Box shared links. Consider adding images to improve inventory visualization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Loading slabs...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">Error loading slabs without images</p>
            </div>
          )}

          {!isLoading && !error && slabsWithoutImages.length === 0 && (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-600 font-medium">Great! All slabs have images</p>
              <p className="text-sm text-slate-500">Every slab in your inventory has either an image or Box shared link.</p>
            </div>
          )}

          {!isLoading && !error && slabsWithoutImages.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Found <strong>{slabsWithoutImages.length}</strong> slabs without images
                </p>
              </div>

              <div className="grid gap-4">
                {slabsWithoutImages.map((slab) => (
                  <Card key={slab.id} className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg text-slate-800">{slab.family}</h3>
                            <Badge className={getStatusColor(slab.status)}>
                              {slab.status.replace('_', ' ')}
                            </Badge>
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
                              <div>
                                <span className="font-medium">SKU:</span> {slab.sku}
                              </div>
                            )}
                            {slab.quantity && (
                              <div className="flex items-center space-x-1">
                                <Package className="h-3 w-3" />
                                <span className="font-medium">Qty:</span> {slab.quantity}
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">Received:</span> {formatDate(slab.received_date)}
                            </div>
                          </div>

                          {slab.notes && (
                            <div className="text-sm text-slate-600 mb-3">
                              <span className="font-medium">Notes:</span> {slab.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col items-center">
                          <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                            <FileImage className="h-8 w-8 text-orange-400" />
                          </div>
                          <p className="text-xs text-orange-600 text-center">No Image</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlabsWithoutImagesDialog;