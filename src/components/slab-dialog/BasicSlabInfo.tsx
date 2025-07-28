
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface BasicSlabInfoProps {
  formData: {
    slab_id: string;
    received_date: string;
    family: string;
    formulation: string;
    version: string;
    quantity: string;
    status: string;
  };
  onFormDataChange: (updates: Partial<BasicSlabInfoProps['formData']>) => void;
  duplicateSlabInfo: {
    exists: boolean;
    currentQuantity: number;
    sameStatus: boolean;
  };
}

const BasicSlabInfo = ({ formData, onFormDataChange, duplicateSlabInfo }: BasicSlabInfoProps) => {
  // Query to get slab info for autofill (case-insensitive)
  const { data: existingSlabData } = useQuery({
    queryKey: ['slab-autofill', formData.slab_id.toLowerCase()],
    queryFn: async () => {
      if (!formData.slab_id.trim()) return null;
      
      const { data, error } = await supabase
        .from('slabs')
        .select('family, formulation, version')
        .ilike('slab_id', formData.slab_id.trim()) // Case-insensitive search
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching slab for autofill:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!formData.slab_id.trim(),
  });

  // Auto-fill family and formulation when slab data is found
  useEffect(() => {
    if (existingSlabData && formData.slab_id.trim()) {
      // Only autofill if the fields are currently empty
      const updates: Partial<BasicSlabInfoProps['formData']> = {};
      
      if (!formData.family && existingSlabData.family) {
        updates.family = existingSlabData.family;
      }
      
      if (!formData.formulation && existingSlabData.formulation) {
        updates.formulation = existingSlabData.formulation;
      }
      
      if (!formData.version && existingSlabData.version) {
        updates.version = existingSlabData.version;
      }
      
      if (Object.keys(updates).length > 0) {
        onFormDataChange(updates);
      }
    }
  }, [existingSlabData, formData.slab_id, formData.family, formData.formulation, formData.version, onFormDataChange]);

  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slab_id">Slab ID</Label>
          <Input
            id="slab_id"
            placeholder="e.g., 1A or 9C (optional for current products)"
            value={formData.slab_id}
            onChange={(e) => onFormDataChange({ slab_id: e.target.value })}
          />
          {duplicateSlabInfo.exists && duplicateSlabInfo.sameStatus && (
            <p className="text-sm text-orange-600">
              ⚠️ Slab ID exists with same status. Quantities will be combined. Current quantity: {duplicateSlabInfo.currentQuantity}
            </p>
          )}
          {duplicateSlabInfo.exists && !duplicateSlabInfo.sameStatus && (
            <p className="text-sm text-blue-600">
              ℹ️ Slab ID exists with different status. Current total quantity: {duplicateSlabInfo.currentQuantity}
            </p>
          )}
          {existingSlabData && (
            <p className="text-sm text-green-600">
              ✓ Auto-filled from existing slab data
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
