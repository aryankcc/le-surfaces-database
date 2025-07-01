export const formatSlabDate = (dateString: string): string => {
  // Check if the date is 1/1/1 (or variations like 0001-01-01)
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Check for 1/1/1 or similar "unknown" dates
  if (year <= 1 || (year === 1 && month === 1 && day === 1)) {
    return "old";
  }
  
  // Return formatted date
  return date.toLocaleDateString('en-US', { 
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
};