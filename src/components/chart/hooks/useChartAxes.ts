
import { useMemo } from 'react';
import { formatDailyDate, formatMonthlyDate, formatQuarterlyDate } from "@/utils/dateUtils";
import { formatYAxisTick } from "../utils/formatting";

/**
 * Hook to calculate and configure chart axes
 */
export const useChartAxes = (
  filteredData: any[],
  dataKeys: string[],
  dataFrequency: 'daily' | 'monthly' | 'quarterly',
  timeFrame: string,
  title?: string
) => {
  // Calculate min and max values for Y axis configuration
  const valueMinMax = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { min: 0, max: 0 };
    
    let allValues: number[] = [];
    dataKeys.forEach(key => {
      const cleanKey = key.replace('_area', '').replace('_bar', '');
      const series = filteredData.map(item => Number(item[cleanKey])).filter(v => !isNaN(v));
      allValues = [...allValues, ...series];
    });
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    
    // Add padding to min/max for better visualization
    return { 
      min: min - (range * 0.05), 
      max: max + (range * 0.05)
    };
  }, [filteredData, dataKeys]);
  
  // Generate appropriate Y-axis ticks based on data range
  const yAxisTicks = useMemo(() => {
    const { min, max } = valueMinMax;
    const range = max - min;
    
    // Adjust tick count based on data range
    let tickCount = 5;
    if (range < 1 && range > 0) tickCount = 7; // More ticks for small ranges
    if (range > 1000) tickCount = 4; // Fewer ticks for large ranges
    
    const step = range / (tickCount - 1);
    
    return Array.from({ length: tickCount }, (_, i) => min + i * step);
  }, [valueMinMax]);
  
  // Determine appropriate X-axis ticks based on data frequency and length
  const xAxisTickSettings = useMemo(() => {
    // For sparse data (like quarterly or less frequent), show all points
    if (dataFrequency === 'quarterly' && filteredData.length < 20) {
      return { interval: 0 };
    }
    
    // For monthly data, adjust based on time frame
    if (dataFrequency === 'monthly') {
      if (timeFrame === '1Y') return { interval: 2 }; // Every 3rd month for 1Y
      if (timeFrame === '5Y') return { interval: 11 }; // Roughly yearly for 5Y
      if (filteredData.length > 24) return { interval: Math.floor(filteredData.length / 8) };
      return { interval: 1 }; // Every other month for smaller timeframes
    }
    
    // For daily data, use dynamic interval based on number of points
    if (dataFrequency === 'daily') {
      if (filteredData.length <= 14) return { interval: 1 }; // Every other day for 2 weeks
      if (filteredData.length <= 30) return { interval: 3 }; // Every 4th day for a month
      if (filteredData.length <= 90) return { interval: 6 }; // Weekly for 3 months
      return { interval: Math.floor(filteredData.length / 12) }; // ~12 ticks total
    }
    
    return { interval: 0 }; // Default: let the chart decide
  }, [dataFrequency, filteredData.length, timeFrame]);

  // Format date for tooltip based on frequency
  const formatTooltipDate = (dateStr: string) => {
    switch (dataFrequency) {
      case 'quarterly':
        return formatQuarterlyDate(dateStr);
      case 'monthly':
        return formatMonthlyDate(dateStr);
      case 'daily':
      default:
        return formatDailyDate(dateStr);
    }
  };
  
  // Y-axis formatter
  const yAxisFormatter = (value: number | string) => formatYAxisTick(Number(value), title);
  
  return {
    yAxisTicks,
    xAxisTickInterval: xAxisTickSettings.interval,
    formatTooltipDate,
    yAxisFormatter
  };
};
