
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

    // Handle both tab-separated and comma-separated values
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const rows: CSVRow[] = [];

    console.log('CSV Headers:', headers);
    console.log('Using delimiter:', delimiter === '\t' ? 'tab' : 'comma');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      console.log(`Row ${i + 1}:`, row);
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
          // Get the actual field values, handling different possible header names
          const slabId = row['Slab ID'] || row['slab_id'] || '';
          const family = row['Family'] || row['family'] || '';
          const formulation = row['Formulation'] || row['formulation'] || '';

          console.log(`Row ${rowNumber} - Slab ID: "${slabId}", Family: "${family}", Formulation: "${formulation}"`);

          // Validate required fields
          if (!slabId || !family || !formulation) {
            errors.push(`Row ${rowNumber}: Missing required fields (Slab ID: "${slabId}", Family: "${family}", Formulation: "${formulation}")`);
            continue;
          }

          // Transform the data
          const slabData = {
            slab_id: slabId,
            family: family,
            formulation: formulation,
            version: row['Version'] || row['version'] || null,
            status: normalizeStatus(row['Status'] || row['status'] || 'in_stock'),
            sku: row['SKU'] || row['sku'] || null,
            quantity: row['Quantity'] || row['quantity'] ? parseInt(row['Quantity'] || row['quantity']) : 1,
            received_date: parseCSVDate(row['Received Date'] || row['received_date']),
            sent_to_location: row['Sent To Location'] || row['sent_to_location'] || null,
            sent_to_date: (row['Sent Date'] || row['sent_date']) ? parseCSVDate(row['Sent Date'] || row['sent_date']) : null,
            notes: row['Notes'] || row['notes'] || null,
            box_url: extractBoxUrl(row['Box URL'] || row['box_url'])
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
              Expected format: Tab-separated or comma-separated values with headers
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
