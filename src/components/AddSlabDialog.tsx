
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AddSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSlabDialog = ({ open, onOpenChange }: AddSlabDialogProps) => {
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
    box_url: "",
    sku: "",
    quantity: "1"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        image_url: null, // No longer using image_url
        box_url: formData.box_url || null,
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
        box_url: "",
        sku: "",
        quantity: "1"
      });
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

          {/* Box Widget Code */}
          <div className="space-y-2">
            <Label htmlFor="box_url">Box Widget Code</Label>
            <Textarea
              id="box_url"
              placeholder="Paste Box widget embed code here (e.g., <iframe src='...' width='500' height='400'></iframe>)"
              value={formData.box_url}
              onChange={(e) => setFormData({ ...formData, box_url: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-slate-500">Paste the complete Box widget iframe code to display interactive Box content</p>
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
              {isSubmitting ? "Adding..." : "Add Slab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSlabDialog;
