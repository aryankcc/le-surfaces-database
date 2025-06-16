
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
  [key: string]: string;
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

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Determine delimiter - check for tabs first, then commas
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    console.log('First line:', firstLine);
    console.log('Using delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA');
    
    // Parse headers
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    console.log('Parsed headers:', headers);
    
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by delimiter and clean values
      const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
      console.log(`Row ${i} raw values:`, values);
      
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      console.log(`Row ${i} parsed object:`, row);
      rows.push(row);
    }

    return rows;
  };

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
    const errors: string[] = [];
    let successCount = 0;
    let updatedCount = 0;

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);

      console.log('Total parsed rows:', rows.length);

      // Group rows by slab_id to combine quantities
      const slabGroups = new Map<string, CSVRow[]>();
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        // Get the actual field values with multiple possible header variations
        const slabId = row['Slab ID'] || row['slab_id'] || row['SlabID'] || row['ID'] || '';
        const family = row['Family'] || row['family'] || '';
        const formulation = row['Formulation'] || row['formulation'] || '';

        console.log(`Row ${rowNumber} extracted values:`, { slabId, family, formulation });

        // Validate required fields
        if (!slabId || !family || !formulation) {
          const missingFields = [];
          if (!slabId) missingFields.push('Slab ID');
          if (!family) missingFields.push('Family');
          if (!formulation) missingFields.push('Formulation');
          
          errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')} (Found: Slab ID="${slabId}", Family="${family}", Formulation="${formulation}")`);
          continue;
        }

        // Group by slab_id
        if (!slabGroups.has(slabId)) {
          slabGroups.set(slabId, []);
        }
        slabGroups.get(slabId)!.push(row);
      }

      // Process each slab group
      for (const [slabId, groupRows] of slabGroups) {
        try {
          // Use the first row for main data, sum quantities from all rows
          const firstRow = groupRows[0];
          const totalQuantity = groupRows.reduce((sum, row) => {
            const quantity = row['Quantity'] || row['quantity'] || '1';
            return sum + (parseInt(quantity) || 1);
          }, 0);

          // Extract data from first row
          const family = firstRow['Family'] || firstRow['family'] || '';
          const formulation = firstRow['Formulation'] || firstRow['formulation'] || '';
          const version = firstRow['Version'] || firstRow['version'] || '';
          const status = firstRow['Status'] || firstRow['status'] || 'in_stock';
          const sku = firstRow['SKU'] || firstRow['sku'] || '';
          const receivedDate = firstRow['Received Date'] || firstRow['received_date'] || firstRow['ReceivedDate'] || '';
          const sentToLocation = firstRow['Sent To Location'] || firstRow['sent_to_location'] || firstRow['SentToLocation'] || '';
          const sentDate = firstRow['Sent Date'] || firstRow['sent_date'] || firstRow['SentDate'] || '';
          const notes = firstRow['Notes'] || firstRow['notes'] || '';
          const boxUrl = firstRow['Box URL'] || firstRow['box_url'] || firstRow['BoxURL'] || '';

          console.log(`Processing slab ${slabId} with total quantity:`, totalQuantity);

          // Check if slab already exists
          const { data: existingSlab, error: checkError } = await supabase
            .from('slabs')
            .select('id, quantity')
            .eq('slab_id', slabId)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking existing slab:', checkError);
            errors.push(`Slab ${slabId}: Error checking existing record - ${checkError.message}`);
            continue;
          }

          if (existingSlab) {
            // Update existing slab - add to existing quantity
            const newQuantity = (existingSlab.quantity || 0) + totalQuantity;
            
            const { error: updateError } = await supabase
              .from('slabs')
              .update({ 
                quantity: newQuantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSlab.id);

            if (updateError) {
              console.error('Update error for slab', slabId, ':', updateError);
              errors.push(`Slab ${slabId}: ${updateError.message}`);
            } else {
              updatedCount++;
              console.log(`Successfully updated slab ${slabId} quantity to ${newQuantity}`);
            }
          } else {
            // Create new slab
            const slabData = {
              slab_id: slabId,
              family: family,
              formulation: formulation,
              version: version || null,
              status: normalizeStatus(status),
              sku: sku || null,
              quantity: totalQuantity,
              received_date: parseCSVDate(receivedDate),
              sent_to_location: sentToLocation || null,
              sent_to_date: sentDate ? parseCSVDate(sentDate) : null,
              notes: notes || null,
              box_url: extractBoxUrl(boxUrl)
            };

            console.log('Creating new slab data:', slabData);

            const { error: insertError } = await supabase
              .from('slabs')
              .insert(slabData);

            if (insertError) {
              console.error('Insert error for slab', slabId, ':', insertError);
              errors.push(`Slab ${slabId}: ${insertError.message}`);
            } else {
              successCount++;
              console.log(`Successfully created slab ${slabId}`);
            }
          }
        } catch (error) {
          console.error('Error processing slab', slabId, ':', error);
          errors.push(`Slab ${slabId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResults({
        success: successCount,
        updated: updatedCount,
        errors
      });

      // Refresh the slabs data
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });

      if (successCount > 0 || updatedCount > 0) {
        toast({
          title: "Import completed",
          description: `Successfully created ${successCount} slabs and updated ${updatedCount} slabs${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
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
              accept=".csv,.tsv,.txt"
              onChange={handleFileChange}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV, TSV, or tab-separated files with headers. Duplicate Slab IDs will have their quantities combined.
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
              {importResults.success > 0 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Created: {importResults.success} slabs</span>
                </div>
              )}
              
              {importResults.updated > 0 && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Updated: {importResults.updated} slabs</span>
                </div>
              )}
              
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
