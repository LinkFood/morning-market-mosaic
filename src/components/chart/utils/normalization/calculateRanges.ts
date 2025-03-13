
/**
 * Calculates min, max, and range values for each data series
 * 
 * @param data - The array of data objects
 * @param dataKeys - The keys in the data objects that represent different series
 * @returns Array of range objects for each series
 */
export const calculateRanges = (
  data: any[], 
  dataKeys: string[]
): Array<{ key: string; min: number; max: number; range: number }> => {
  return dataKeys.map(key => {
    // Strip area/bar suffixes for accurate data access
    const cleanKey = key.replace('_area', '').replace('_bar', '');
    const values = data.map(item => Number(item[cleanKey]));
    const validValues = values.filter(v => !isNaN(v));
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    return { key, min, max, range: max - min };
  });
};
