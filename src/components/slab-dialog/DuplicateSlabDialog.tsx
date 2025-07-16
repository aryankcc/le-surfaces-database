
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
            <span>Send Sample from Existing Slab</span>
          </DialogTitle>
          <DialogDescription>
            A slab with ID "{slabId}" already exists in your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-2">Current inventory quantity: {currentQuantity}</div>
              <div className="text-blue-700">
                Sending this sample will automatically reduce the inventory quantity accordingly.
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Send Sample
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateSlabDialog;
