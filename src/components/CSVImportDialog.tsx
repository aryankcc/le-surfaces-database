
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { parseCSV } from "@/utils/csvParser";
import { importCSVData } from "@/services/csvImportService";
import FileSelector from "@/components/csv/FileSelector";
import ImportResults from "@/components/csv/ImportResults";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CSVImportDialog = ({ open, onOpenChange }: CSVImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    updated: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/tab-separated-values')) {
      setFile(selectedFile);
      setImportResults(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or TSV file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);

      const results = await importCSVData(rows);
      setImportResults(results);

      // Refresh the slabs data
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });

      if (results.success > 0 || results.updated > 0) {
        toast({
          title: "Import completed",
          description: `Successfully created ${results.success} slabs and updated ${results.updated} slabs${results.errors.length > 0 ? ` with ${results.errors.length} errors` : ''}`,
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to process the CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import CSV Data</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FileSelector file={file} onFileChange={handleFileChange} />

          {importResults && <ImportResults results={importResults} />}

          <div className="flex space-x-2">
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="flex-1"
            >
              {isImporting ? "Importing..." : "Import Data"}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              {importResults ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportDialog;
