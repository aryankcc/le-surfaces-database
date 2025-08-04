import { supabase } from "@/integrations/supabase/client";
import { normalizeStatus, extractBoxUrl, extractImageUrl, parseCSVDate } from "@/utils/csvImport";

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

  // Group rows by slab_id + version to combine quantities
  const slabGroups = new Map<string, CSVRow[]>();
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    // Get the actual field values using exact headers
    const slabId = row['slab_id'] || '';
    const family = row['family'] || '';
    const formulation = row['formulation'] || '';
    const version = row['version'] || '';

    console.log(`Row ${rowNumber} extracted values:`, { slabId, family, formulation, version });

    // Validate required fields (only family is required now)
    if (!family) {
      errors.push(`Row ${rowNumber}: Missing required field: Family (Found: Family="${family}")`);
      continue;
    }

    // Group by slab_id + version combination
    const groupKey = `${slabId}_${version || 'null'}`;
    if (!slabGroups.has(groupKey)) {
      slabGroups.set(groupKey, []);
    }
    slabGroups.get(groupKey)!.push(row);
  }

  // Process each slab group
  for (const [groupKey, groupRows] of slabGroups) {
    const slabId = groupRows[0]['slab_id'] || '';
    try {
      // Use the first row for main data, sum quantities from all rows
      const firstRow = groupRows[0];
      const totalQuantity = groupRows.reduce((sum, row) => {
        const quantity = row['quantity'] || '1';
        return sum + (parseInt(quantity) || 1);
      }, 0);

      // Extract data from first row using exact headers
      const family = firstRow['family'] || '';
      const formulation = firstRow['formulation'] || '';
      const version = firstRow['version'] || '';
      const status = firstRow['status'] || 'in_stock';
      const categoryRaw = firstRow['category'] || 'current';
      const category = categoryRaw.toLowerCase().trim();
      
      console.log(`Slab ${slabId} category processing:`, { raw: categoryRaw, processed: category });
      const receivedDate = firstRow['received_date'] || '';
      const sentToLocation = firstRow['sent_to_location'] || '';
      const sentDate = firstRow['sent_to_date'] || '';
      const notes = firstRow['notes'] || '';
      const boxSharedLink = firstRow['box_shared_link'] || '';
      const imageUrl = firstRow['image_url'] || '';
      const size = firstRow['size'] || '';

      console.log(`Processing slab ${slabId} with total quantity:`, totalQuantity);

      // Check if slab already exists with same slab_id AND version
      const { data: existingSlab, error: checkError } = await supabase
        .from('slabs')
        .select('id, quantity')
        .eq('slab_id', slabId)
        .eq('version', version || null)
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
          slab_id: slabId || null,
          family: family,
          formulation: formulation || null,
          version: version || null,
          status: normalizeStatus(status),
          category: category === 'development' ? 'development' : 'current',
          quantity: totalQuantity,
          received_date: receivedDate ? parseCSVDate(receivedDate) : new Date().toISOString().split('T')[0],
          sent_to_location: sentToLocation || null,
          sent_to_date: sentDate ? parseCSVDate(sentDate) : null,
          notes: notes || null,
          box_shared_link: extractBoxUrl(boxSharedLink),
          image_url: extractImageUrl(imageUrl),
          size: size || null
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