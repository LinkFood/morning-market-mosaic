
/**
 * Get chart colors array with better contrast
 */
export const getChartColors = (): string[] => [
  '#2563eb', // blue
  '#f97316', // orange
  '#16a34a', // green
  '#dc2626', // red
  '#8b5cf6', // purple
  '#9a3412', // brown
  '#db2777', // pink
  '#475569', // gray
  '#ca8a04', // yellow
  '#0891b2'  // teal
];

/**
 * Get tooltip style based on theme
 */
export const getTooltipStyle = (theme: string): React.CSSProperties => ({
  backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
  borderColor: theme === 'dark' ? '#555555' : '#e2e8f0',
  color: theme === 'dark' ? '#ffffff' : '#000000',
});
