
export const normalizeStatus = (status: string): string => {
  // Convert various status formats to our database format
  const statusMap: Record<string, string> = {
    'in-stock': 'in_stock',
    'in stock': 'in_stock',
    'instock': 'in_stock',
    'In-stock': 'in_stock',
    'In stock': 'in_stock',
    'sent': 'sent',
    'Sent': 'sent',
    'reserved': 'reserved',
    'Reserved': 'reserved',
    'sold': 'sold',
    'Sold': 'sold'
  };
  
  return statusMap[status] || status.toLowerCase().replace(/[-\s]/g, '_');
};

export const extractBoxUrl = (boxData: string): string | null => {
  if (!boxData || boxData.toLowerCase() === 'n' || boxData.toLowerCase() === 'no') {
    return null;
  }
  
  // If it's already a clean URL, return it
  if (boxData.startsWith('http')) {
    return boxData;
  }
  
  // If it's an iframe, extract the src URL
  const iframeMatch = boxData.match(/src="([^"]+)"/);
  if (iframeMatch) {
    return iframeMatch[1];
  }
  
  // If it's just "Y" or "Yes", we can't extract a URL
  if (boxData.toLowerCase() === 'y' || boxData.toLowerCase() === 'yes') {
    return null;
  }
  
  return boxData;
};

export const parseCSVDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === '') {
    return new Date().toISOString().split('T')[0]; // Default to today
  }
  
  // Handle various date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]; // Default to today if invalid
  }
  
  return date.toISOString().split('T')[0];
};
