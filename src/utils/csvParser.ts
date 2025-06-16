
interface CSVRow {
  [key: string]: string;
}

export const parseCSV = (csvText: string): CSVRow[] => {
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
