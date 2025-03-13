
import { TimeFrame } from "./TimeFrameSelector";
import { formatDateByFrequency, determineFrequency } from "@/utils/dateUtils";

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
  
  const filteredData = data.filter(item => {
    // Ensure proper date parsing with validation
    try {
      const itemDate = new Date(item[xAxisKey]);
      if (isNaN(itemDate.getTime())) {
        console.warn(`Invalid date in chart data: ${item[xAxisKey]}`);
        return false;
      }
      return itemDate >= cutoffDate;
    } catch (e) {
      console.warn(`Error filtering date: ${item[xAxisKey]}`, e);
      return false;
    }
  });
  
  // If filtering results in less than 2 data points, return full dataset
  if (filteredData.length < 2) {
    console.warn(`Filtered data for timeframe ${timeFrame} has insufficient points, using full dataset`);
    return data;
  }
  
  return filteredData;
};

/**
 * Format values based on the data type
 */
export const formatChartValue = (value: number, dataKey: string, title?: string): string => {
  if (dataKey === 'value') {
    // Format based on the chart title or other context
    if (title?.toLowerCase().includes('gdp')) return `$${value.toFixed(1)}T`;
    if (title?.toLowerCase().includes('payrolls')) return `${value.toFixed(1)}M`;
    if (title?.toLowerCase().includes('rate') || title?.toLowerCase().includes('inflation')) return `${value.toFixed(2)}%`;
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(2);
  }
  
  // Handle known special cases
  if (dataKey === 'change') return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  
  return value.toString();
};

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

/**
 * Normalize data for better chart visualization
 */
export const normalizeChartData = (data: any[], dataKeys: string[], xAxisKey: string) => {
  if (!data || data.length === 0 || !dataKeys || dataKeys.length === 0) return data;
  
  // Determine if we need to normalize (look for very different scales across series)
  let needsNormalization = false;
  const ranges = dataKeys.map(key => {
    const values = data.map(item => Number(item[key.replace('_area', '').replace('_bar', '')]));
    const validValues = values.filter(v => !isNaN(v));
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    return { key, min, max, range: max - min };
  });
  
  // Check if the largest range is 10x or more than the smallest range
  const validRanges = ranges.filter(r => r.range > 0);
  if (validRanges.length > 1) {
    const maxRange = Math.max(...validRanges.map(r => r.range));
    const minRange = Math.min(...validRanges.map(r => r.range));
    needsNormalization = maxRange / minRange > 10;
  }
  
  if (!needsNormalization) return data;
  
  // Create a normalized copy of the data
  return data.map(item => {
    const normalized = { ...item };
    
    dataKeys.forEach((key, index) => {
      const cleanKey = key.replace('_area', '').replace('_bar', '');
      const originalValue = Number(item[cleanKey]);
      const range = ranges[index];
      
      // Only normalize if there's a valid range
      if (range.range > 0) {
        const normalizedValue = ((originalValue - range.min) / range.range) * 100;
        normalized[`${cleanKey}_normalized`] = normalizedValue;
      }
    });
    
    return normalized;
  });
};

/**
 * Format chart dates based on frequency
 */
export const formatChartDates = (data: any[], xAxisKey: string): any[] => {
  if (!data || data.length === 0) return data;
  
  // Get dates array to determine frequency
  const dates = data.map(item => item[xAxisKey]);
  const frequency = determineFrequency(dates);
  
  // Format dates based on frequency
  return data.map(item => ({
    ...item,
    [xAxisKey]: item[xAxisKey],
    formattedDate: formatDateByFrequency(item[xAxisKey], frequency)
  }));
};

/**
 * Get appropriate chart marker interval based on data length
 */
export const getChartMarkerInterval = (dataLength: number): number => {
  if (dataLength <= 12) return 1; // Show all points for small datasets
  if (dataLength <= 30) return 2; // Show every other point for medium datasets
  if (dataLength <= 60) return 4; // Show every 4th point for larger datasets
  if (dataLength <= 120) return 8; // Show every 8th point for very large datasets
  return 12; // Show every 12th point for extremely large datasets
};

/**
 * Format tick values for Y axis based on data
 */
export const formatYAxisTick = (value: number, title?: string): string => {
  if (title?.toLowerCase().includes('gdp')) {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}T`;
    return `$${value}B`;
  }
  
  if (title?.toLowerCase().includes('payrolls')) {
    return `${value}M`;
  }
  
  if (title?.toLowerCase().includes('rate') || title?.toLowerCase().includes('inflation')) {
    return `${value}%`;
  }
  
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
  
  return value.toString();
};
