
import { supabase } from "@/integrations/supabase/client";
import { normalizeStatus, extractBoxUrl, parseCSVDate } from "@/utils/csvImport";

interface CSVRow {
  [key: string]: string;
}

interface ImportResults {
  success: number;
  updated: number;
  errors: string[];
}

export const importCSVData = async (rows: CSVRow[]): Promise<ImportResults> => {
  const errors: string[] = [];
  let successCount = 0;
  let updatedCount = 0;

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

  return {
    success: successCount,
    updated: updatedCount,
    errors
  };
};
