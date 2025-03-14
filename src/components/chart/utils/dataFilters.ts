
import { TimeFrame } from "../TimeFrameSelector";

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
 * Get appropriate chart marker interval based on data length
 */
export const getChartMarkerInterval = (dataLength: number): number => {
  if (dataLength <= 12) return 1; // Show all points for small datasets
  if (dataLength <= 30) return 2; // Show every other point for medium datasets
  if (dataLength <= 60) return 4; // Show every 4th point for larger datasets
  if (dataLength <= 120) return 8; // Show every 8th point for very large datasets
  return 12; // Show every 12th point for extremely large datasets
};
