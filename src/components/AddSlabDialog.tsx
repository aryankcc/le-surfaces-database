
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus } from "lucide-react";

interface AddSlabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSlabDialog = ({ open, onOpenChange }: AddSlabDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    pattern: "",
    thickness: "",
    dimensions: "",
    location: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new slab:", formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      pattern: "",
      thickness: "",
      dimensions: "",
      location: "",
      description: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Slab</DialogTitle>
          <DialogDescription>
            Enter the details for the new quartz slab to add it to the inventory.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Slab Name</Label>
              <Input
                id="name"
                placeholder="e.g., Calacatta Gold Premium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern Type</Label>
              <Select value={formData.pattern} onValueChange={(value) => setFormData({ ...formData, pattern: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calacatta">Calacatta</SelectItem>
                  <SelectItem value="carrara">Carrara</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="subtle">Subtle</SelectItem>
                  <SelectItem value="veined">Veined</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness</Label>
              <Select value={formData.thickness} onValueChange={(value) => setFormData({ ...formData, thickness: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select thickness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20mm">20mm</SelectItem>
                  <SelectItem value="30mm">30mm</SelectItem>
                  <SelectItem value="40mm">40mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                placeholder="e.g., 3200x1600mm"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Storage Location</Label>
            <Input
              id="location"
              placeholder="e.g., Warehouse A-12"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this slab..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Image (Optional)</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Slab
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSlabDialog;
