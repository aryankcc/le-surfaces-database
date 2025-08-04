
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { parseCSV } from "@/utils/csvParser";
import { importCSVData, previewCSVData } from "@/services/csvImportService";
import FileSelector from "@/components/csv/FileSelector";
import ImportResults from "@/components/csv/ImportResults";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CSVImportDialog = ({ open, onOpenChange }: CSVImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<{
    willCreate: number;
    willUpdate: number;
    errors: string[];
  } | null>(null);
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
      setPreviewResults(null);
      setImportResults(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or TSV file.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsPreviewLoading(true);

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);

      const preview = await previewCSVData(rows);
      setPreviewResults(preview);

    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: "Failed to preview the CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewLoading(false);
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
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['outbound-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['all-slabs-landing'] });

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
    setPreviewResults(null);
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

          {previewResults && !importResults && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
              <h4 className="font-medium text-slate-800">Import Preview</h4>
              
              <div className="space-y-2">
                {previewResults.willCreate > 0 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Will create: {previewResults.willCreate} new slabs</span>
                  </div>
                )}
                
                {previewResults.willUpdate > 0 && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Will update: {previewResults.willUpdate} existing slabs</span>
                  </div>
                )}
                
                {previewResults.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Errors found: {previewResults.errors.length}</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto text-xs text-red-600 bg-red-50 p-2 rounded">
                      {previewResults.errors.slice(0, 10).map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                      {previewResults.errors.length > 10 && (
                        <div className="font-medium">... and {previewResults.errors.length - 10} more errors</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-slate-600">
                Review the preview above. Click "Confirm Import" to proceed or "Cancel" to make changes to your CSV file.
              </div>
            </div>
          )}

          {importResults && <ImportResults results={importResults} />}

          {!previewResults && !importResults && (
            <div className="flex space-x-2">
              <Button
                onClick={handlePreview}
                disabled={!file || isPreviewLoading}
                className="flex-1"
              >
                {isPreviewLoading ? "Analyzing..." : "Preview Import"}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          )}

          {previewResults && !importResults && (
            <div className="flex space-x-2">
              <Button
                onClick={handleImport}
                disabled={isImporting || previewResults.errors.length > 0}
                className="flex-1"
              >
                {isImporting ? "Importing..." : "Confirm Import"}
              </Button>
              <Button variant="outline" onClick={() => setPreviewResults(null)}>
                Back to File Selection
              </Button>
            </div>
          )}

          {importResults && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportDialog;
