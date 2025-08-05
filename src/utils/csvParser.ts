
interface CSVRow {
  [key: string]: string;
}

export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Determine delimiter - check for tabs first, then commas
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  
  console.log('=== CSV PARSING DEBUG ===');
  console.log('First line raw:', JSON.stringify(firstLine));
  console.log('Using delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA');
  
  // Parse headers with better handling of quotes and special characters
  const headers = parseCSVLine(firstLine, delimiter);
  console.log('Parsed headers:', JSON.stringify(headers));
  console.log('Header count:', headers.length);
  
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse values with proper CSV handling
    const values = parseCSVLine(line, delimiter);
    console.log(`Row ${i} raw line:`, JSON.stringify(line));
    console.log(`Row ${i} parsed values (${values.length}):`, JSON.stringify(values));
    
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      row[header] = value;
      if (index < 5) { // Log first 5 columns for debugging
        console.log(`  ${header} = "${value}"`);
      }
    });
    
    console.log(`Row ${i} final object keys:`, Object.keys(row));
    rows.push(row);
  }

  console.log('=== END CSV PARSING DEBUG ===');
  return rows;
};

// Proper CSV line parsing that handles quotes and commas correctly
const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
};
