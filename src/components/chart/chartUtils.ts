
import { TimeFrame } from "./TimeFrameSelector";

/**
 * Filter data based on the selected time frame
 */
export const filterDataByTimeFrame = (
  data: any[],
  timeFrame: TimeFrame,
  xAxisKey: string
): any[] => {
  if (!data || data.length === 0) return [];
  
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timeFrame) {
    case "1M":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "3M":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6M":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case "1Y":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case "5Y":
      cutoffDate.setFullYear(now.getFullYear() - 5);
      break;
    case "MAX":
    default:
      return data;
  }
  
  return data.filter(item => {
    // Ensure proper date parsing with validation
    const itemDate = new Date(item[xAxisKey]);
    if (isNaN(itemDate.getTime())) {
      console.warn(`Invalid date in chart data: ${item[xAxisKey]}`);
      return false;
    }
    return itemDate >= cutoffDate;
  });
};

/**
 * Format values based on the data type
 */
export const formatChartValue = (value: number, dataKey: string, title?: string): string => {
  if (dataKey === 'value') {
    // Format based on the chart title or other context
    if (title?.includes('GDP')) return `$${value.toFixed(1)}B`;
    if (title?.includes('Rate') || title?.includes('Inflation')) return `${value.toFixed(2)}%`;
    return value.toFixed(2);
  }
  return value.toString();
};

/**
 * Get chart colors array
 */
export const getChartColors = (): string[] => [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // olive
  '#17becf'  // teal
];

/**
 * Get tooltip style based on theme
 */
export const getTooltipStyle = (theme: string): React.CSSProperties => ({
  backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
  borderColor: theme === 'dark' ? '#555555' : '#e2e8f0',
  color: theme === 'dark' ? '#ffffff' : '#000000',
});
