import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Link, Image, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AddSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: 'current' | 'development';
}

const AddSlabDialog = ({ open, onOpenChange, defaultCategory = 'current' }: AddSlabDialogProps) => {
  const [formData, setFormData] = useState({
    slab_id: "",
    family: "",
    formulation: "",
    version: "",
    received_date: "",
    notes: "",
    sent_to_location: "",
    sent_to_date: "",
    status: "in_stock",
    category: defaultCategory,
    image_url: "",
    box_shared_link: "",
    sku: "",
    quantity: "1"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `slab-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slab-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('slab-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        handleImageUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Adding new slab:", formData);

      const slabData = {
        slab_id: formData.slab_id,
        family: formData.family,
        formulation: formData.formulation,
        version: formData.version || null,
        received_date: formData.received_date,
        notes: formData.notes || null,
        sent_to_location: formData.sent_to_location || null,
        sent_to_date: formData.sent_to_date || null,
        status: formData.sent_to_location ? 'sent' : formData.status,
        category: formData.category,
        image_url: formData.image_url || null,
        box_shared_link: formData.box_shared_link || null,
        sku: formData.sku || null,
        quantity: parseInt(formData.quantity) || 1
      };

      const { data, error } = await supabase
        .from('slabs')
        .insert([slabData])
        .select();

      if (error) {
        console.error('Error adding slab:', error);
        toast({
          title: "Error",
          description: "Failed to add slab. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Slab added successfully:', data);
      
      // Refresh the slabs list
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      
      toast({
        title: "Success",
        description: "Slab added successfully!",
      });
      
      // Reset form
      setFormData({
        slab_id: "",
        family: "",
        formulation: "",
        version: "",
        received_date: "",
        notes: "",
        sent_to_location: "",
        sent_to_date: "",
        status: "in_stock",
        category: defaultCategory,
        image_url: "",
        box_shared_link: "",
        sku: "",
        quantity: "1"
      });
      setImageFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Slab</DialogTitle>
          <DialogDescription>
            Enter the details for the new slab. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slab_id">Slab ID *</Label>
              <Input
                id="slab_id"
                placeholder="e.g., LE-004"
                value={formData.slab_id}
                onChange={(e) => setFormData({ ...formData, slab_id: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="received_date">Received Date *</Label>
              <Input
                id="received_date"
                type="date"
                value={formData.received_date}
                onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Family & Formulation */}
          <div className="space-y-2">
            <Label htmlFor="family">Family *</Label>
            <Input
              id="family"
              placeholder="e.g., Calacatta, Carrara, Statuario"
              value={formData.family}
              onChange={(e) => setFormData({ ...formData, family: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formulation">Formulation (Sub-family) *</Label>
              <Input
                id="formulation"
                placeholder="e.g., Gold, White Classic, Premium White"
                value={formData.formulation}
                onChange={(e) => setFormData({ ...formData, formulation: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., Premium, Standard, Luxury"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              />
            </div>
          </div>

          {/* SKU and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="e.g., CAL-GOLD-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Category</span>
              </Label>
              <Select value={formData.category} onValueChange={(value: 'current' | 'development') => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload and URL */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-800 flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Slab Image</span>
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploadingImage}
              />
              <p className="text-xs text-slate-500">Upload an image file to display in the application</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Or Image URL</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                disabled={isUploadingImage}
              />
              <p className="text-xs text-slate-500">Direct URL to an image for display</p>
            </div>

            {formData.image_url && (
              <div className="mt-2">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Box Shared Link */}
          <div className="space-y-2">
            <Label htmlFor="box_shared_link" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Box Shared Link</span>
            </Label>
            <Input
              id="box_shared_link"
              placeholder="https://app.box.com/s/..."
              value={formData.box_shared_link}
              onChange={(e) => setFormData({ ...formData, box_shared_link: e.target.value })}
            />
            <p className="text-xs text-slate-500">Shared link to Box.com for external file access</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this slab..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Shipping Information */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-800">Shipping Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sent_to_location">Sent To Location</Label>
                <Input
                  id="sent_to_location"
                  placeholder="e.g., Project Site A - Downtown Office"
                  value={formData.sent_to_location}
                  onChange={(e) => setFormData({ ...formData, sent_to_location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sent_to_date">Sent Date</Label>
                <Input
                  id="sent_to_date"
                  type="date"
                  value={formData.sent_to_date}
                  onChange={(e) => setFormData({ ...formData, sent_to_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isUploadingImage}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || isUploadingImage}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : isUploadingImage ? "Uploading..." : "Add Slab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSlabDialog;