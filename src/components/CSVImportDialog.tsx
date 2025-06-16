
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStatus, extractBoxUrl, parseCSVDate } from "@/utils/csvImport";
import { useQueryClient } from "@tanstack/react-query";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CSVRow {
  'Slab ID': string;
  'Family': string;
  'Formulation': string;
  'Version': string;
  'Status': string;
  'SKU': string;
  'Quantity': string;
  'Received Date': string;
  'Sent To Location': string;
  'Sent Date': string;
  'Notes': string;
  'Has Box Link': string;
  'Box URL': string;
}

const CSVImportDialog = ({ open, onOpenChange }: CSVImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split('\t').map(h => h.trim());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row as CSVRow);
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setImportResults(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);

      console.log('Parsed CSV rows:', rows);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because we start from row 1 and skip header

        try {
          // Validate required fields
          if (!row['Slab ID'] || !row['Family'] || !row['Formulation']) {
            errors.push(`Row ${rowNumber}: Missing required fields (Slab ID, Family, or Formulation)`);
            continue;
          }

          // Transform the data
          const slabData = {
            slab_id: row['Slab ID'],
            family: row['Family'],
            formulation: row['Formulation'],
            version: row['Version'] || null,
            status: normalizeStatus(row['Status'] || 'in_stock'),
            sku: row['SKU'] || null,
            quantity: row['Quantity'] ? parseInt(row['Quantity']) : 1,
            received_date: parseCSVDate(row['Received Date']),
            sent_to_location: row['Sent To Location'] || null,
            sent_to_date: row['Sent Date'] ? parseCSVDate(row['Sent Date']) : null,
            notes: row['Notes'] || null,
            box_url: extractBoxUrl(row['Box URL'])
          };

          console.log('Inserting slab data:', slabData);

          const { error } = await supabase
            .from('slabs')
            .insert(slabData);

          if (error) {
            console.error('Supabase error for row', rowNumber, ':', error);
            errors.push(`Row ${rowNumber}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Error processing row', rowNumber, ':', error);
          errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResults({
        success: successCount,
        errors
      });

      // Refresh the slabs data
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });

      if (successCount > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${successCount} slabs${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
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
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Expected format: Tab-separated values with headers matching your data
            </p>
          </div>

          {file && (
            <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">{file.name}</span>
            </div>
          )}

          {importResults && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Successfully imported: {importResults.success} slabs</span>
              </div>
              
              {importResults.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Errors: {importResults.errors.length}</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs text-red-600 bg-red-50 p-2 rounded">
                    {importResults.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
