
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

interface FileSelectorProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileSelector = ({ file, onFileChange }: FileSelectorProps) => {
  return (
    <div>
      <Label htmlFor="csv-file">Select CSV File</Label>
      <Input
        id="csv-file"
        type="file"
        accept=".csv,.tsv,.txt"
        onChange={onFileChange}
        className="mt-1"
      />
      <p className="text-xs text-slate-500 mt-1">
        Supports CSV, TSV, or tab-separated files with headers. Duplicate Slab IDs will have their quantities combined.
      </p>
      
      {file && (
        <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg mt-2">
          <FileText className="h-4 w-4 text-slate-600" />
          <span className="text-sm text-slate-700">{file.name}</span>
        </div>
      )}
    </div>
  );
};

export default FileSelector;
