
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export const exportInventoryToExcel = async () => {
  try {
    console.log('Starting Excel export...');
    
    // Fetch all slabs with their modifications
    const { data: slabs, error } = await supabase
      .from('slabs')
      .select(`
        *,
        modifications(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data for export:', error);
      throw error;
    }

    // Prepare data for Excel matching the CSV structure:
    // Slab ID, Family, Formulation, Version, Status, SKU, Quantity, Received Date, Sent To Location, Sent Date, Notes, Has Box Link, Box URL
    const excelData = slabs.map(slab => ({
      'Slab ID': slab.slab_id,
      'Family': slab.family,
      'Formulation': slab.formulation,
      'Version': slab.version || '',
      'Status': slab.status,
      'SKU': slab.sku || '',
      'Quantity': slab.quantity || 1,
      'Received Date': new Date(slab.received_date).toLocaleDateString(),
      'Sent To Location': slab.sent_to_location || '',
      'Sent Date': slab.sent_to_date ? new Date(slab.sent_to_date).toLocaleDateString() : '',
      'Notes': slab.notes || '',
      'Has Box Link': slab.box_url ? 'Yes' : 'No',
      'Box URL': slab.box_url || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = excelData.reduce((acc, row) => {
      Object.keys(row).forEach((key, index) => {
        const value = String(row[key as keyof typeof row] || '');
        acc[index] = Math.max(acc[index] || 10, Math.min(value.length + 2, 50));
      });
      return acc;
    }, {} as Record<number, number>);

    ws['!cols'] = Object.values(colWidths).map(width => ({ width }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Slab Inventory');

    // Generate filename with current date
    const now = new Date();
    const filename = `Slab_Inventory_Export_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    console.log('Excel export completed successfully');
    return { success: true, filename };
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error;
  }
};
