
// Calculate the percentage change between two values
export function calculatePercentChange(newer: number, older: number): number {
  if (older === 0) return 0;
  return ((newer - older) / older) * 100;
}

// Format date to display as friendly string
export function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
