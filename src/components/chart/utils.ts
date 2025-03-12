
import { ChartPoint } from "./types";

/**
 * Calculate Y position for a data point
 */
export const getY = (value: number, height: number, paddedMin: number, paddedRange: number): number => {
  // Invert the Y-axis (SVG 0,0 is top-left)
  return height - ((value - paddedMin) / paddedRange) * height;
};

/**
 * Calculate X position for a data point
 */
export const getX = (index: number, dataLength: number, width: number): number => {
  return (index / (dataLength - 1)) * width;
};

/**
 * Format number for display in tooltips and labels
 */
export const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (Math.abs(num) >= 10) {
    return num.toFixed(1);
  } else {
    return num.toFixed(2);
  }
};

/**
 * Generate the SVG path data for the sparkline
 */
export const generatePath = (data: number[], width: number, height: number, paddedMin: number, paddedRange: number): string => {
  return data
    .map((value, index) => {
      const x = getX(index, data.length, width);
      const y = getY(value, height, paddedMin, paddedRange);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

/**
 * Calculate chart scaling parameters
 */
export const calculateChartParams = (data: number[]) => {
  if (!data || data.length === 0) {
    return { min: 0, max: 0, range: 0, paddedMin: 0, paddedMax: 0, paddedRange: 0 };
  }
  
  // Calculate the min and max values for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // Add padding to the top and bottom
  const paddingFactor = 0.1;
  const paddedMin = min - range * paddingFactor;
  const paddedMax = max + range * paddingFactor;
  const paddedRange = paddedMax - paddedMin;
  
  return { min, max, range, paddedMin, paddedMax, paddedRange };
};

/**
 * Generate points for data markers
 */
export const generatePoints = (
  data: number[], 
  dates: string[] | undefined, 
  width: number, 
  height: number, 
  paddedMin: number, 
  paddedRange: number, 
  labelCount: number
): ChartPoint[] => {
  const points: ChartPoint[] = [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  // Always show first and last points
  points.push({
    x: getX(0, data.length, width),
    y: getY(data[0], height, paddedMin, paddedRange),
    value: data[0],
    date: dates ? dates[0] : undefined,
    index: 0
  });
  
  points.push({
    x: getX(data.length - 1, data.length, width),
    y: getY(data[data.length - 1], height, paddedMin, paddedRange),
    value: data[data.length - 1],
    date: dates ? dates[data.length - 1] : undefined,
    index: data.length - 1
  });
  
  // Show additional points based on labelCount
  if (data.length > 2 && labelCount > 2) {
    const step = Math.max(1, Math.floor(data.length / (labelCount - 1)));
    
    // Add intermediate points at regular intervals
    for (let i = step; i < data.length - 1; i += step) {
      if (points.length < labelCount - 1) { // Ensure we don't add too many points
        points.push({
          x: getX(i, data.length, width),
          y: getY(data[i], height, paddedMin, paddedRange),
          value: data[i],
          date: dates ? dates[i] : undefined,
          index: i
        });
      }
    }
    
    // Always add min and max points if they're not already included
    const minIndex = data.indexOf(min);
    const maxIndex = data.indexOf(max);
    
    // Only add min/max if they're not the first or last point
    if (minIndex !== 0 && minIndex !== data.length - 1) {
      // Check if this point or a nearby point is already included
      if (!points.some(p => Math.abs(p.x - getX(minIndex, data.length, width)) < width / (labelCount * 2))) {
        points.push({
          x: getX(minIndex, data.length, width),
          y: getY(min, height, paddedMin, paddedRange),
          value: min,
          date: dates ? dates[minIndex] : undefined,
          index: minIndex
        });
      }
    }
    
    if (maxIndex !== 0 && maxIndex !== data.length - 1) {
      // Check if this point or a nearby point is already included
      if (!points.some(p => Math.abs(p.x - getX(maxIndex, data.length, width)) < width / (labelCount * 2))) {
        points.push({
          x: getX(maxIndex, data.length, width),
          y: getY(max, height, paddedMin, paddedRange),
          value: max,
          date: dates ? dates[maxIndex] : undefined,
          index: maxIndex
        });
      }
    }
  }
  
  // Sort points by x-coordinate for consistent rendering
  return points.sort((a, b) => a.x - b.x);
};
