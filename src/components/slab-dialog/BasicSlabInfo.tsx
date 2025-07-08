
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BasicSlabInfoProps {
  formData: {
    slab_id: string;
    received_date: string;
    family: string;
    formulation: string;
    version: string;
    quantity: string;
  };
  onFormDataChange: (updates: Partial<typeof formData>) => void;
  duplicateSlabInfo: {
    exists: boolean;
    currentQuantity: number;
  };
}

const BasicSlabInfo = ({ formData, onFormDataChange, duplicateSlabInfo }: BasicSlabInfoProps) => {
  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slab_id">Slab ID *</Label>
          <Input
            id="slab_id"
            placeholder="e.g., 1A or 9C"
            value={formData.slab_id}
            onChange={(e) => onFormDataChange({ slab_id: e.target.value })}
            required
          />
          {duplicateSlabInfo.exists && (
            <p className="text-sm text-orange-600">
              ⚠️ Slab ID exists in Current/Development inventory. Current quantity: {duplicateSlabInfo.currentQuantity}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="received_date">Received Date</Label>
          <Input
            id="received_date"
            type="date"
            value={formData.received_date}
            onChange={(e) => onFormDataChange({ received_date: e.target.value })}
          />
        </div>
      </div>

      {/* Family & Formulation */}
      <div className="space-y-2">
        <Label htmlFor="family">Family *</Label>
        <Input
          id="family"
          placeholder="e.g., Fundamental Calacatta, Taj Mahal, etc"
          value={formData.family}
          onChange={(e) => onFormDataChange({ family: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="formulation">Formulation (Sub-family)</Label>
          <Input
            id="formulation"
            placeholder="e.g., Green, Petro Grigio, etc"
            value={formData.formulation}
            onChange={(e) => onFormDataChange({ formulation: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            placeholder="e.g., 1, 2, 3, etc"
            value={formData.version}
            onChange={(e) => onFormDataChange({ version: e.target.value })}
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          placeholder="1"
          value={formData.quantity}
          onChange={(e) => onFormDataChange({ quantity: e.target.value })}
        />
      </div>
    </>
  );
};

export default BasicSlabInfo;
