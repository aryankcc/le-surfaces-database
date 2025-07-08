
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

const AddSlabDialog = ({ open, onOpenChange, defaultCategory = 'current', defaultFamily }: AddSlabDialogProps) => {
  const [formData, setFormData] = useState({
    slab_id: "",
    family: defaultFamily || "",
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
    quantity: "1"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const duplicateSlabInfo = useSlabDuplicateCheck(formData.slab_id);

  // Effect to set defaultCategory and defaultFamily when dialog opens/props change
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        category: defaultCategory,
        family: defaultFamily || "",
        status: 'in_stock',
        formulation: "",
        received_date: "",
        version: "",
        notes: "",
        sent_to_location: "",
        sent_to_date: "",
        image_url: "",
        box_shared_link: "",
        quantity: "1"
      }));
      resetForm();
    }
  }, [open, defaultCategory, defaultFamily]);

  const resetForm = () => {
    setFormData({
      slab_id: "",
      family: defaultFamily || "",
      formulation: "",
      version: "",
      received_date: "",
      notes: "",
      sent_to_location: "",
      sent_to_date: "",
      status: 'in_stock',
      category: defaultCategory,
      image_url: "",
      box_shared_link: "",
      quantity: "1"
    });
    setShowDuplicateDialog(false);
  };

  const handleDuplicateAction = async () => {
    if (!duplicateSlabInfo.slabData) return;

    setIsSubmitting(true);
    const quantityToAdd = parseInt(formData.quantity);
    const newQuantity = duplicateSlabInfo.currentQuantity + quantityToAdd;

    try {
      const { error: updateError } = await supabase
        .from('slabs')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', duplicateSlabInfo.slabData.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: `Added ${quantityToAdd} to existing slab. New quantity: ${newQuantity}.`,
      });

      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['search-all-slabs'] });

      resetForm();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error during duplicate action:', error);
      toast({
        title: "Error",
        description: `Failed to perform action: ${error.message || 'An unexpected error occurred.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowDuplicateDialog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation for required fields
    if (!formData.slab_id.trim()) {
      toast({ title: "Validation Error", description: "Slab ID is required.", variant: "destructive" });
      return;
    }
    if (!formData.family.trim()) {
      toast({ title: "Validation Error", description: "Family is required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const isOutboundSample = formData.status === 'sent';

      if (duplicateSlabInfo.exists) {
        if (isOutboundSample) {
          await handleDuplicateAction();
        } else {
          setShowDuplicateDialog(true);
        }
        setIsSubmitting(false);
        return;
      }

      const slabDataToInsert = {
        slab_id: formData.slab_id,
        family: formData.family,
        formulation: formData.formulation || null,
        version: formData.version || null,
        received_date: formData.received_date || null,
        notes: formData.notes || null,
        sent_to_location: formData.sent_to_location || null,
        sent_to_date: formData.sent_to_date || null,
        status: formData.status,
        category: formData.category,
        image_url: formData.image_url || null,
        box_shared_link: formData.box_shared_link || null,
        quantity: parseInt(formData.quantity) || 1,
      };

      console.log("Adding new slab (no duplicate):", slabDataToInsert);

      const { data, error } = await supabase
        .from('slabs')
        .insert([slabDataToInsert])
        .select();

      if (error) {
        console.error('Error adding slab:', error);
        toast({
          title: "Error",
          description: `Failed to add slab: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Slab added successfully:', data);

      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['search-all-slabs'] });

      toast({
        title: "Success",
        description: "Slab added successfully!",
      });

      resetForm();
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

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Slab</DialogTitle>
            <DialogDescription>
              Enter the details for the new slab. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Processing..." : "Add Slab"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DuplicateSlabDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        formData={formData}
        duplicateSlabInfo={duplicateSlabInfo}
        onAddToExisting={handleDuplicateAction}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AddSlabDialog;
