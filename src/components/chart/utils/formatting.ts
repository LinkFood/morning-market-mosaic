
import { formatDateByFrequency, determineFrequency } from "@/utils/dateUtils";

/**
 * Formats numeric values for display based on data type and context
 * 
 * @param value - The numeric value to format
 * @param dataKey - The data key/series name for context
 * @param title - Optional chart title for additional context
 * @returns Formatted string representation of the value
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
 * Formats Y-axis tick values based on data context
 * 
 * @param value - The axis tick value to format
 * @param title - Optional chart title for context
 * @returns Formatted string for the axis tick
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

/**
 * Formats chart dates based on the detected frequency
 * 
 * @param data - Array of data objects containing dates
 * @param xAxisKey - The key in the data objects that contains date values
 * @returns Data array with additional formatted date properties
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
