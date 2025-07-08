
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DuplicateSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    slab_id: string;
    quantity: string;
  };
  duplicateSlabInfo: {
    currentQuantity: number;
    slabData?: any;
  };
  onAddToExisting: () => void;
  isSubmitting: boolean;
}

const DuplicateSlabDialog = ({ 
  open, 
  onOpenChange, 
  formData, 
  duplicateSlabInfo, 
  onAddToExisting, 
  isSubmitting 
}: DuplicateSlabDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-orange-600" />
            <span>Slab Already Exists</span>
          </DialogTitle>
          <DialogDescription>
            A slab with ID "{formData.slab_id}" already exists in your main inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm">
              <div className="font-medium text-orange-800 mb-2">Existing Slab Details:</div>
              <div className="text-orange-700">
                <div>ID: {duplicateSlabInfo.slabData?.slab_id}</div>
                <div>Family: {duplicateSlabInfo.slabData?.family}</div>
                <div>Category: {duplicateSlabInfo.slabData?.category}</div>
                <div>Current Quantity: {duplicateSlabInfo.currentQuantity}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Would you like to:</div>
              <div>Add {formData.quantity} to the existing quantity?</div>
              <div className="mt-2 font-medium">
                New total: {duplicateSlabInfo.currentQuantity + parseInt(formData.quantity)} slabs
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onAddToExisting}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Adding..." : `Add ${formData.quantity} to Existing`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateSlabDialog;
