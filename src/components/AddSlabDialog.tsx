
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus } from "lucide-react";
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
    original_design: "",
    current_design: "",
    thickness: "",
    width: "",
    height: "",
    weight: "",
    quality_grade: "",
    location: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Creating new slab:", formData);
      
      const { data, error } = await supabase
        .from('slabs')
        .insert([
          {
            slab_id: formData.slab_id,
            original_design: formData.original_design,
            current_design: formData.current_design || formData.original_design,
            thickness: parseFloat(formData.thickness),
            width: parseFloat(formData.width),
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            quality_grade: formData.quality_grade,
            location: formData.location,
            status: 'available'
          }
        ])
        .select();

      if (error) {
        console.error('Error creating slab:', error);
        toast({
          title: "Error",
          description: "Failed to create slab. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Slab created successfully:', data);
      
      // Refresh the slabs list
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      
      toast({
        title: "Success",
        description: "Slab created successfully!",
      });
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        slab_id: "",
        original_design: "",
        current_design: "",
        thickness: "",
        width: "",
        height: "",
        weight: "",
        quality_grade: "",
        location: "",
        notes: ""
      });
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Slab</DialogTitle>
          <DialogDescription>
            Enter the details for the new quartz slab to add it to the inventory.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slab_id">Slab ID</Label>
              <Input
                id="slab_id"
                placeholder="e.g., LE-004"
                value={formData.slab_id}
                onChange={(e) => setFormData({ ...formData, slab_id: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality_grade">Quality Grade</Label>
              <Select value={formData.quality_grade} onValueChange={(value) => setFormData({ ...formData, quality_grade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="original_design">Original Design</Label>
            <Input
              id="original_design"
              placeholder="e.g., Calacatta Gold"
              value={formData.original_design}
              onChange={(e) => setFormData({ ...formData, original_design: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_design">Current Design (Optional)</Label>
            <Input
              id="current_design"
              placeholder="Leave empty if same as original"
              value={formData.current_design}
              onChange={(e) => setFormData({ ...formData, current_design: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness (mm)</Label>
              <Input
                id="thickness"
                type="number"
                step="0.1"
                placeholder="e.g., 30"
                value={formData.thickness}
                onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (mm)</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                placeholder="e.g., 3200"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (mm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="e.g., 1600"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 850.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                placeholder="e.g., Warehouse A-12"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this slab..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Slab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSlabDialog;
