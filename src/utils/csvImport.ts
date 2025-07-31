
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
    'Sold': 'sold',
    'not in yet': 'in_stock',
    'not_in_yet': 'in_stock',
    'discontinued': 'sold'
  };
  
  const normalized = statusMap[status] || status.toLowerCase().replace(/[-\s]/g, '_');
  
  // Ensure only valid statuses are returned
  const validStatuses = ['in_stock', 'sent', 'reserved', 'sold'];
  return validStatuses.includes(normalized) ? normalized : 'in_stock';
};

export const extractBoxUrl = (boxData: string): string | null => {
  if (!boxData || boxData.toLowerCase() === 'n' || boxData.toLowerCase() === 'no') {
    return null;
  }
  
  // If it's already a clean URL, return it
  if (boxData.startsWith('http')) {
    return boxData;
  }
  
  // If it's just "Y" or "Yes", we can't extract a URL
  if (boxData.toLowerCase() === 'y' || boxData.toLowerCase() === 'yes') {
    return null;
  }
  
  return boxData;
};

export const extractImageUrl = (imageData: string): string | null => {
  if (!imageData || imageData.toLowerCase() === 'n' || imageData.toLowerCase() === 'no') {
    return null;
  }
  
  // If it's already a clean URL, return it
  if (imageData.startsWith('http')) {
    return imageData;
  }
  
  // If it's just "Y" or "Yes", we can't extract a URL
  if (imageData.toLowerCase() === 'y' || imageData.toLowerCase() === 'yes') {
    return null;
  }
  
  return imageData;
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
