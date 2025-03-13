
/**
 * Determines if the chart data needs normalization based on range differences
 * 
 * @param ranges - Array of data range objects for each series
 * @returns Boolean indicating if normalization is needed
 */
export const needsNormalization = (
  ranges: Array<{ key: string; min: number; max: number; range: number }>
): boolean => {
  // Check if the largest range is 10x or more than the smallest range
  const validRanges = ranges.filter(r => r.range > 0);
  
  if (validRanges.length > 1) {
    const maxRange = Math.max(...validRanges.map(r => r.range));
    const minRange = Math.min(...validRanges.map(r => r.range));
    return maxRange / minRange > 10;
  }
  
  return false;
};
