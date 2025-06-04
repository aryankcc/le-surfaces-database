
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Slab {
  id: string;
  slab_id: string;
  family: string;
  formulation: string;
}

interface DeleteSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slab: Slab | null;
}

const DeleteSlabDialog = ({ open, onOpenChange, slab }: DeleteSlabDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!slab) return;

    setIsDeleting(true);

    try {
      console.log("Deleting slab:", slab.id);
      
      const { error } = await supabase
        .from('slabs')
        .delete()
        .eq('id', slab.id);

      if (error) {
        console.error('Error deleting slab:', error);
        toast({
          title: "Error",
          description: "Failed to delete slab. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Slab deleted successfully');
      
      // Refresh the slabs list
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      
      toast({
        title: "Success",
        description: "Slab deleted successfully!",
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
      setIsDeleting(false);
    }
  };

  if (!slab) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete Slab</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this slab? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-800">{slab.family} - {slab.formulation}</div>
            <div className="text-sm text-slate-600">ID: {slab.slab_id}</div>
          </div>
          
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <div className="font-medium">Warning</div>
                <div>This will permanently delete the slab and all associated modifications. This action cannot be undone.</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Slab"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSlabDialog;
