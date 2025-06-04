
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Modification {
  id: string;
  modification_type: string;
  description: string;
  performed_by: string;
  notes: string;
}

interface SlabModificationFormProps {
  modifications: Modification[];
  onModificationsChange: (modifications: Modification[]) => void;
}

const SlabModificationForm = ({ modifications, onModificationsChange }: SlabModificationFormProps) => {
  const addModification = () => {
    const newModification: Modification = {
      id: Date.now().toString(),
      modification_type: "",
      description: "",
      performed_by: "",
      notes: ""
    };
    onModificationsChange([...modifications, newModification]);
  };

  const updateModification = (id: string, field: keyof Modification, value: string) => {
    const updated = modifications.map(mod => 
      mod.id === id ? { ...mod, [field]: value } : mod
    );
    onModificationsChange(updated);
  };

  const removeModification = (id: string) => {
    const filtered = modifications.filter(mod => mod.id !== id);
    onModificationsChange(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Modifications</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addModification}>
            <Plus className="h-4 w-4 mr-2" />
            Add Modification
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {modifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No modifications added yet. Click "Add Modification" to record any work done on this slab.
          </p>
        ) : (
          modifications.map((mod, index) => (
            <div key={mod.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Modification {index + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeModification(mod.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={mod.modification_type} 
                    onValueChange={(value) => updateModification(mod.id, 'modification_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cutting">Cutting</SelectItem>
                      <SelectItem value="polishing">Polishing</SelectItem>
                      <SelectItem value="edge_work">Edge Work</SelectItem>
                      <SelectItem value="drilling">Drilling</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="surface_treatment">Surface Treatment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Performed By</Label>
                  <Input
                    value={mod.performed_by}
                    onChange={(e) => updateModification(mod.id, 'performed_by', e.target.value)}
                    placeholder="Who performed this work?"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={mod.description}
                  onChange={(e) => updateModification(mod.id, 'description', e.target.value)}
                  placeholder="Describe the modification..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={mod.notes}
                  onChange={(e) => updateModification(mod.id, 'notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SlabModificationForm;
