
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DuplicateSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  slabId: string;
  currentQuantity: number;
}

const DuplicateSlabDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  slabId,
  currentQuantity
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
            A slab with ID "{slabId}" already exists in your main inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm">
              <div className="font-medium text-orange-800 mb-2">Current quantity: {currentQuantity}</div>
              <div className="text-orange-700">
                Would you like to proceed and add this as a duplicate entry?
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateSlabDialog;
