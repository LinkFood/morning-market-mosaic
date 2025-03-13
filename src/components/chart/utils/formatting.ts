
import { formatDateByFrequency, determineFrequency } from "@/utils/dateUtils";

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
