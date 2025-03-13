
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
