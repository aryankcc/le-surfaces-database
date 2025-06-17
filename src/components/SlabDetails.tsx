
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileImage, Calendar, MapPin, Edit, Package, Hash, Archive, StickyNote } from "lucide-react";
import BoxWidget from "./BoxWidget";
import { Slab } from "@/types/slab";

interface SlabDetailsProps {
  slab: Slab;
}

const SlabDetails = ({ slab }: SlabDetailsProps) => {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{slab.family}</CardTitle>
            <Badge className={getStatusColor(slab.status)}>
              {slab.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image or Box Widget */}
          <div className="w-full">
            {slab.box_url ? (
              <BoxWidget widgetCode={slab.box_url} slabName={slab.family} />
            ) : slab.image_url ? (
              <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
                <img 
                  src={slab.image_url} 
                  alt={slab.family}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileImage className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">No image or Box content available</p>
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-slate-600">Slab ID:</span>
              <span className="text-slate-800">{slab.slab_id}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-slate-600">Family:</span>
              <span className="text-slate-800">{slab.family}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-slate-600">Formulation:</span>
              <span className="text-slate-800">{slab.formulation}</span>
            </div>
            {slab.version && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-slate-600">Version:</span>
                <span className="text-slate-800">{slab.version}</span>
              </div>
            )}
            {slab.sku && (
              <div className="flex items-center space-x-2 text-sm">
                <Hash className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-600">SKU:</span>
                <span className="text-slate-800">{slab.sku}</span>
              </div>
            )}
            {slab.quantity && (
              <div className="flex items-center space-x-2 text-sm">
                <Archive className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-600">Quantity:</span>
                <span className="text-slate-800">{slab.quantity}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-600">Received:</span>
              <span className="text-slate-800">{new Date(slab.received_date).toLocaleDateString()}</span>
            </div>
          </div>

          <Separator />

          {/* Sent To Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800 flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Shipping Information</span>
            </h4>
            
            {slab.sent_to_location || slab.sent_to_date ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                {slab.sent_to_location && (
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Location:</span>
                    <span className="text-blue-700">{slab.sent_to_location}</span>
                  </div>
                )}
                {slab.sent_to_date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Sent Date:</span>
                    <span className="text-blue-700">{new Date(slab.sent_to_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed text-center text-slate-500">
                Not yet shipped
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800 flex items-center space-x-2">
              <StickyNote className="h-4 w-4" />
              <span>Notes</span>
            </h4>
            
            {slab.notes ? (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{slab.notes}</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed text-center text-slate-500">
                No notes recorded
              </div>
            )}
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
