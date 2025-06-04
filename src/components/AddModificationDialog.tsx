
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AddModificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slabId: string;
}

const AddModificationDialog = ({ open, onOpenChange, slabId }: AddModificationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    modification_type: "",
    description: "",
    performed_by: "",
    notes: ""
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Adding modification for slab:', slabId);
      
      const { error } = await supabase
        .from('modifications')
        .insert({
          slab_id: slabId,
          modification_type: formData.modification_type,
          description: formData.description,
          performed_by: formData.performed_by || null,
          notes: formData.notes || null
        });

      if (error) {
        console.error('Error adding modification:', error);
        toast({
          title: "Error",
          description: "Failed to add modification. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Modification added successfully');
      
      // Refresh the slabs data
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      
      toast({
        title: "Success",
        description: "Modification added successfully!",
      });

      // Reset form and close dialog
      setFormData({
        modification_type: "",
        description: "",
        performed_by: "",
        notes: ""
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Modification</span>
          </DialogTitle>
          <DialogDescription>
            Record a modification made to this slab.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modification_type">Modification Type</Label>
            <Select 
              value={formData.modification_type} 
              onValueChange={(value) => setFormData({...formData, modification_type: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select modification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cutting">Cutting</SelectItem>
                <SelectItem value="polishing">Polishing</SelectItem>
                <SelectItem value="edge_work">Edge Work</SelectItem>
                <SelectItem value="drilling">Drilling</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="surface_treatment">Surface Treatment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the modification performed..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="performed_by">Performed By</Label>
            <Input
              id="performed_by"
              value={formData.performed_by}
              onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
              placeholder="Who performed this modification?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional notes or comments..."
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Modification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddModificationDialog;
