import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Slab } from '@/types/slab';

export interface ExportOptions {
  category?: 'current' | 'development' | 'all';
  filename?: string;
}

export const exportSlabsToExcel = async (options: ExportOptions = {}) => {
  try {
    console.log('Starting Excel export with options:', options);
    
    // Build query based on category
    let query = supabase
      .from('slabs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply category filter if specified
    if (options.category && options.category !== 'all') {
      // Check if category column exists first
      const { data: columnCheck } = await supabase
        .from('slabs')
        .select('*')
        .limit(1);

      if (columnCheck && columnCheck.length > 0 && 'category' in columnCheck[0]) {
        query = query.eq('category', options.category);
      }
    }

    const { data: slabs, error } = await query;

    if (error) {
      console.error('Error fetching data for export:', error);
      throw error;
    }

    if (!slabs || slabs.length === 0) {
      throw new Error('No slabs found to export');
    }

    // Prepare data for Excel
    const excelData = slabs.map((slab: Slab) => ({
      'Slab ID': slab.slab_id,
      'Family': slab.family,
      'Formulation': slab.formulation,
      'Version': slab.version || '',
      'Status': slab.status,
      'Category': slab.category || 'current',
      'SKU': slab.sku || '',
      'Quantity': slab.quantity || 1,
      'Received Date': formatDateForExport(slab.received_date),
      'Sent To Location': slab.sent_to_location || '',
      'Sent Date': slab.sent_to_date ? formatDateForExport(slab.sent_to_date) : '',
      'Notes': slab.notes || '',
      'Has Image': slab.image_url ? 'Yes' : 'No',
      'Image URL': slab.image_url || '',
      'Has Box Link': slab.box_shared_link ? 'Yes' : 'No',
      'Box Shared Link': slab.box_shared_link || ''
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
    const sheetName = options.category === 'all' ? 'All Slabs' : 
                     options.category === 'current' ? 'Current Slabs' : 
                     'Development Slabs';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with current date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const categoryStr = options.category === 'all' ? 'All' : 
                       options.category === 'current' ? 'Current' : 
                       'Development';
    const filename = options.filename || `${categoryStr}_Slabs_Export_${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    console.log('Excel export completed successfully');
    return { success: true, filename, count: slabs.length };
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error;
  }
};

const formatDateForExport = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Check for 1/1/1 or similar "unknown" dates
  if (year <= 1 || (year === 1 && month === 1 && day === 1)) {
    return "old";
  }
  
  return date.toLocaleDateString('en-US', { 
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
};