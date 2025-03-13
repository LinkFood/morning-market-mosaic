
/**
 * Normalizes data based on calculated ranges
 * 
 * @param data - The array of data objects to normalize
 * @param dataKeys - The keys in the data objects that represent different series
 * @param ranges - The calculated min/max/range values for each series
 * @returns Normalized data array
 */
export const normalizeData = (
  data: any[],
  dataKeys: string[],
  ranges: Array<{ key: string; min: number; max: number; range: number }>
): any[] => {
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
