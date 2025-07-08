
import { Slab } from '@/types/slab';
import * as XLSX from 'xlsx';

export const exportToExcel = (slabs: Slab[], filename: string = 'slabs-export') => {
  console.log('Exporting slabs to Excel:', slabs.length);
  
  if (!slabs || slabs.length === 0) {
    console.warn('No slabs to export');
    return;
  }

  // Transform slabs data for Excel export
  const excelData = slabs.map(slab => ({
    'Slab ID': slab.slab_id,
    'Family': slab.family,
    'Formulation': slab.formulation || '',
    'Version': slab.version || '',
    'Category': slab.category,
    'Status': slab.status,
    'Quantity': slab.quantity || 0,
    'Received Date': slab.received_date || '',
    'Sent To Location': slab.sent_to_location || '',
    'Sent Date': slab.sent_to_date || '',
    'Notes': slab.notes || '',
    'Box Shared Link': slab.box_shared_link || '',
    'Image URL': slab.image_url || '',
    'Created At': slab.created_at,
    'Updated At': slab.updated_at
  }));

  console.log('Excel data prepared:', excelData.length, 'rows');

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Slabs');

  // Generate Excel file and trigger download
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;
  
  console.log('Generating Excel file:', finalFilename);
  XLSX.writeFile(wb, finalFilename);
  
  console.log('Excel export completed');
};
