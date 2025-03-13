
import { calculateRanges } from './calculateRanges';
import { needsNormalization } from './needsNormalization';
import { normalizeData } from './normalizeData';

/**
 * Normalizes chart data to ensure consistent visualization across different scales
 * 
 * @param data - The array of data objects to normalize
 * @param dataKeys - The keys in the data objects that represent different series
 * @param xAxisKey - The key in the data objects that represents the x-axis
 * @returns The normalized data array
 */
export const normalizeChartData = (data: any[], dataKeys: string[], xAxisKey: string) => {
  if (!data || data.length === 0 || !dataKeys || dataKeys.length === 0) return data;
  
  // Calculate ranges for each data series
  const ranges = calculateRanges(data, dataKeys);
  
  // Determine if normalization is needed
  if (!needsNormalization(ranges)) return data;
  
  // Normalize the data
  return normalizeData(data, dataKeys, ranges);
};

// Re-export components for easier imports
export { calculateRanges, needsNormalization, normalizeData };
