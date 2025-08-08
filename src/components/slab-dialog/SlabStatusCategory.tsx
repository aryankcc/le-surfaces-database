
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "lucide-react";

interface SlabStatusCategoryProps {
  formData: {
    status: string;
    category: 'current' | 'development' | 'outbound';
  };
  onFormDataChange: (updates: Partial<SlabStatusCategoryProps['formData']>) => void;
}

const SlabStatusCategory = ({ formData, onFormDataChange }: SlabStatusCategoryProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => onFormDataChange({ status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="not_in_yet">Not In Yet</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category" className="flex items-center space-x-2">
          <Tag className="h-4 w-4" />
          <span>Category</span>
        </Label>
        <Select value={formData.category} onValueChange={(value: 'current' | 'development' | 'outbound') => onFormDataChange({ category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SlabStatusCategory;
