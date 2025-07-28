
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
    size: '',
    mold: '',
    buyer: '',
    cost_3cm: '',
    price_3cm: '',
    cost_2cm: '',
    price_2cm: '',
  });

  const duplicateSlabInfo = useSlabDuplicateCheck(formData.slab_id, formData.status, formData.version);

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
    
    if (!formData.family.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the family field.",
        variant: "destructive",
      });
      return;
    }

    // Check for exact duplicate (same slab_id and same status)
    if (duplicateSlabInfo.exists && duplicateSlabInfo.sameStatus) {
      if (formData.status === 'sent') {
        toast({
          title: "Cannot create duplicate sent sample",
          description: "A sent sample with this slab ID already exists. Each sent sample must have a unique identifier.",
          variant: "destructive",
        });
        return;
      } else {
        // For non-sent statuses, combine quantities
        await processSlab();
        return;
      }
    }

    // Check for different status - show confirmation dialog for sent samples
    if (formData.status === 'sent' && duplicateSlabInfo.exists && !duplicateSlabInfo.sameStatus) {
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

    await processSlab();
  };

  const processSlab = async () => {
    setIsLoading(true);

    try {
      console.log('Processing slab with data:', formData);

      // Handle sent samples - reduce quantity from existing in_stock slab
      if (formData.status === 'sent' && duplicateSlabInfo.exists) {
        console.log('Processing sent sample with existing slab');
        
        // Find existing in_stock slab to reduce quantity from
        const { data: existingSlabs, error: fetchError } = await supabase
          .from('slabs')
          .select('*')
          .ilike('slab_id', formData.slab_id.trim())
          .eq('status', 'in_stock')
          .in('category', ['current', 'development']);

        if (fetchError) {
          console.error('Error fetching existing slabs:', fetchError);
          throw fetchError;
        }

        console.log('Found existing slabs:', existingSlabs);

        if (existingSlabs && existingSlabs.length > 0) {
          const existingSlab = existingSlabs[0];
          const sentQuantity = parseInt(formData.quantity) || 1;
          const newQuantity = Math.max(0, (existingSlab.quantity || 0) - sentQuantity);

          console.log(`Reducing quantity from ${existingSlab.quantity} to ${newQuantity}`);

          // Update existing slab quantity
          const { error: updateError } = await supabase
            .from('slabs')
            .update({ 
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSlab.id);

          if (updateError) {
            console.error('Error updating existing slab quantity:', updateError);
            throw updateError;
          }
        }
      }

      // Check if we need to combine quantities (same slab_id and status, but not for sent)
      if (duplicateSlabInfo.exists && duplicateSlabInfo.sameStatus && formData.status !== 'sent') {
        console.log('Combining quantities for existing slab');
        
        // Update existing slab quantity instead of creating new one
        const { data: existingSlabs, error: fetchError } = await supabase
          .from('slabs')
          .select('*')
          .ilike('slab_id', formData.slab_id.trim())
          .eq('status', formData.status)
          .in('category', ['current', 'development']);

        if (fetchError) throw fetchError;

        if (existingSlabs && existingSlabs.length > 0) {
          const existingSlab = existingSlabs[0];
          const newQuantity = (existingSlab.quantity || 0) + parseInt(formData.quantity);

          const { error: updateError } = await supabase
            .from('slabs')
            .update({ 
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSlab.id);

          if (updateError) throw updateError;

          toast({
            title: "Slab quantity updated",
            description: `${formData.slab_id} quantity increased to ${newQuantity}.`,
          });
        }
      } else {
        // Create new slab entry
        const slabData = {
          slab_id: formData.slab_id.trim() || null,
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
          size: formData.size.trim() || null,
          mold: formData.mold.trim() || null,
          buyer: formData.buyer.trim() || null,
          cost_3cm: formData.cost_3cm ? parseFloat(formData.cost_3cm) : null,
          price_3cm: formData.price_3cm ? parseFloat(formData.price_3cm) : null,
          cost_2cm: formData.cost_2cm ? parseFloat(formData.cost_2cm) : null,
          price_2cm: formData.price_2cm ? parseFloat(formData.price_2cm) : null,
        };

        console.log('Adding slab with data:', slabData);

        const { error } = await supabase
          .from('slabs')
          .insert([slabData]);

        if (error) {
          console.error('Error adding slab:', error);
          throw error;
        }

        toast({
          title: "Slab added successfully",
          description: formData.status === 'sent' 
            ? `${formData.slab_id} has been sent and quantities have been automatically adjusted.`
            : `${formData.slab_id} has been added to the inventory.`,
        });
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['outbound-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['all-slabs-landing'] });

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
      size: '',
      mold: '',
      buyer: '',
      cost_3cm: '',
      price_3cm: '',
      cost_2cm: '',
      price_2cm: '',
    });
    setShowDuplicateDialog(false);
    onOpenChange(false);
  };

  const handleDuplicateConfirm = async () => {
    setShowDuplicateDialog(false);
    await processSlab();
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
