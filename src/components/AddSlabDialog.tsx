
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import BasicSlabInfo from "./slab-dialog/BasicSlabInfo";
import SlabStatusCategory from "./slab-dialog/SlabStatusCategory";
import SlabImageUpload from "./slab-dialog/SlabImageUpload";
import SlabAdditionalFields from "./slab-dialog/SlabAdditionalFields";
import DuplicateSlabDialog from "./slab-dialog/DuplicateSlabDialog";
import { useSlabDuplicateCheck } from "@/hooks/useSlabDuplicateCheck";

interface AddSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: 'current' | 'development';
  defaultFamily?: string;
}

const AddSlabDialog = ({ open, onOpenChange, defaultCategory = 'current', defaultFamily = '' }: AddSlabDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    slab_id: '',
    received_date: new Date().toISOString().split('T')[0],
    family: defaultFamily,
    formulation: '',
    version: '',
    quantity: '1',
    image_url: '',
    status: 'in_stock',
    category: defaultCategory,
    box_shared_link: '',
    notes: '',
    sent_to_location: '',
    sent_to_date: '',
  });

  const duplicateSlabInfo = useSlabDuplicateCheck(formData.slab_id);

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        family: defaultFamily,
        category: defaultCategory,
      }));
    }
  }, [open, defaultCategory, defaultFamily]);

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.slab_id.trim() || !formData.family.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate if adding to current/development categories
    if ((formData.category === 'current' || formData.category === 'development') && duplicateSlabInfo.exists) {
      setShowDuplicateDialog(true);
      return;
    }

    // If status is 'sent', validate that sent_to_location and sent_to_date are provided
    if (formData.status === 'sent') {
      if (!formData.sent_to_location || !formData.sent_to_date) {
        toast({
          title: "Missing shipping information",
          description: "When sending samples, please provide both location and date.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const slabData = {
        slab_id: formData.slab_id.trim(),
        received_date: formData.received_date || null,
        family: formData.family.trim(),
        formulation: formData.formulation.trim() || null,
        version: formData.version.trim() || null,
        quantity: parseInt(formData.quantity) || 1,
        image_url: formData.image_url.trim() || null,
        status: formData.status,
        category: formData.category,
        box_shared_link: formData.box_shared_link.trim() || null,
        notes: formData.notes.trim() || null,
        sent_to_location: formData.sent_to_location.trim() || null,
        sent_to_date: formData.sent_to_date || null,
      };

      console.log('Adding slab with data:', slabData);

      const { error } = await supabase
        .from('slabs')
        .insert([slabData]);

      if (error) {
        console.error('Error adding slab:', error);
        throw error;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['outbound-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['all-slabs-landing'] });

      toast({
        title: "Slab added successfully",
        description: formData.status === 'sent' 
          ? `${formData.slab_id} has been sent and quantities have been automatically adjusted.`
          : `${formData.slab_id} has been added to the inventory.`,
      });

      handleClose();
    } catch (error) {
      console.error('Failed to add slab:', error);
      toast({
        title: "Error",
        description: "Failed to add slab. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      slab_id: '',
      received_date: new Date().toISOString().split('T')[0],
      family: defaultFamily,
      formulation: '',
      version: '',
      quantity: '1',
      image_url: '',
      status: 'in_stock',
      category: defaultCategory,
      box_shared_link: '',
      notes: '',
      sent_to_location: '',
      sent_to_date: '',
    });
    setShowDuplicateDialog(false);
    onOpenChange(false);
  };

  const handleDuplicateConfirm = async () => {
    setShowDuplicateDialog(false);
    setIsLoading(true);

    try {
      const slabData = {
        slab_id: formData.slab_id.trim(),
        received_date: formData.received_date || null,
        family: formData.family.trim(),
        formulation: formData.formulation.trim() || null,
        version: formData.version.trim() || null,
        quantity: parseInt(formData.quantity) || 1,
        image_url: formData.image_url.trim() || null,
        status: formData.status,
        category: formData.category,
        box_shared_link: formData.box_shared_link.trim() || null,
        notes: formData.notes.trim() || null,
        sent_to_location: formData.sent_to_location.trim() || null,
        sent_to_date: formData.sent_to_date || null,
      };

      const { error } = await supabase
        .from('slabs')
        .insert([slabData]);

      if (error) {
        console.error('Error adding duplicate slab:', error);
        throw error;
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['all-slabs-landing'] });

      toast({
        title: "Slab added successfully",
        description: formData.status === 'sent' 
          ? `${formData.slab_id} has been sent and quantities have been automatically adjusted.`
          : `${formData.slab_id} has been added to the inventory.`,
      });

      handleClose();
    } catch (error) {
      console.error('Failed to add duplicate slab:', error);
      toast({
        title: "Error",
        description: "Failed to add slab. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Slab</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicSlabInfo
              formData={formData}
              onFormDataChange={handleFormDataChange}
              duplicateSlabInfo={duplicateSlabInfo}
            />

            <SlabStatusCategory
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />

            <SlabImageUpload
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />

            <SlabAdditionalFields
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Slab"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DuplicateSlabDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        onConfirm={handleDuplicateConfirm}
        slabId={formData.slab_id}
        currentQuantity={duplicateSlabInfo.currentQuantity}
      />
    </>
  );
};

export default AddSlabDialog;
