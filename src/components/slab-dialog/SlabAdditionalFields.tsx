
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "lucide-react";

interface SlabAdditionalFieldsProps {
  formData: {
    box_shared_link: string;
    notes: string;
    sent_to_location: string;
    sent_to_date: string;
  };
  onFormDataChange: (updates: Partial<typeof formData>) => void;
}

const SlabAdditionalFields = ({ formData, onFormDataChange }: SlabAdditionalFieldsProps) => {
  return (
    <>
      {/* Box Shared Link */}
      <div className="space-y-2">
        <Label htmlFor="box_shared_link" className="flex items-center space-x-2">
          <Link className="h-4 w-4" />
          <span>Box Shared Link</span>
        </Label>
        <Input
          id="box_shared_link"
          placeholder="https://app.box.com/s/..."
          value={formData.box_shared_link}
          onChange={(e) => onFormDataChange({ box_shared_link: e.target.value })}
        />
        <p className="text-xs text-slate-500">Shared link to Box.com for external file access</p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes about this slab..."
          value={formData.notes}
          onChange={(e) => onFormDataChange({ notes: e.target.value })}
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
              placeholder="e.g., Spicewood Springs Office"
              value={formData.sent_to_location}
              onChange={(e) => onFormDataChange({ sent_to_location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sent_to_date">Sent Date</Label>
            <Input
              id="sent_to_date"
              type="date"
              value={formData.sent_to_date}
              onChange={(e) => onFormDataChange({ sent_to_date: e.target.value })}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SlabAdditionalFields;
