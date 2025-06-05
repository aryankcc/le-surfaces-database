import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Slab {
  id: string;
  slab_id: string;
  family: string;
  formulation: string;
  version: string | null;
  received_date: string;
  notes: string | null;
  image_url: string | null;
  sent_to_location: string | null;
  sent_to_date: string | null;
  status: string;
  box_url: string | null;
}

interface EditSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slab: Slab | null;
}

const EditSlabDialog = ({ open, onOpenChange, slab }: EditSlabDialogProps) => {
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
    box_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (slab) {
      setFormData({
        slab_id: slab.slab_id,
        family: slab.family,
        formulation: slab.formulation,
        version: slab.version || "",
        received_date: slab.received_date,
        notes: slab.notes || "",
        sent_to_location: slab.sent_to_location || "",
        sent_to_date: slab.sent_to_date || "",
        status: slab.status,
        box_url: slab.box_url || ""
      });
    }
  }, [slab]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File, slabId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${slabId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('slab-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('slab-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slab) return;

    setIsSubmitting(true);

    try {
      console.log("Updating slab:", formData);
      
      let imageUrl = slab.image_url;
      
      // Upload new image if one was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, slab.slab_id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

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
        image_url: imageUrl,
        box_url: formData.box_url || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('slabs')
        .update(slabData)
        .eq('id', slab.id)
        .select();

      if (error) {
        console.error('Error updating slab:', error);
        toast({
          title: "Error",
          description: "Failed to update slab. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Slab updated successfully:', data);
      
      // Refresh the slabs list
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      
      toast({
        title: "Success",
        description: "Slab updated successfully!",
      });
      
      onOpenChange(false);
      setImageFile(null);
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

  if (!slab) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Slab</DialogTitle>
          <DialogDescription>
            Update the details for slab {slab.slab_id}.
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

          {/* Status */}
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Slab Image</Label>
            <div className="flex items-center space-x-4">
              {slab.image_url && (
                <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                  <img 
                    src={slab.image_url} 
                    alt={slab.family}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-slate-500 mt-1">Upload a new image to replace the current one</p>
              </div>
            </div>
          </div>

          {/* Box.com URL */}
          <div className="space-y-2">
            <Label htmlFor="box_url">Box.com URL</Label>
            <Input
              id="box_url"
              type="url"
              placeholder="https://app.box.com/..."
              value={formData.box_url}
              onChange={(e) => setFormData({ ...formData, box_url: e.target.value })}
            />
            <p className="text-xs text-slate-500">Link to the slab image on Box.com</p>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSlabDialog;
