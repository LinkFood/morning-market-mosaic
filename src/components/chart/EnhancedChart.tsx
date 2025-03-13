
import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import TimeFrameSelector, { TimeFrame } from "./TimeFrameSelector";
import ChartComponent from "./ChartComponent";
import ChartEmptyState from "./ChartEmptyState";
import { 
  filterDataByTimeFrame, 
  formatChartValue, 
  getChartColors, 
  getTooltipStyle,
  normalizeChartData,
  formatChartDates,
  formatYAxisTick
} from "./utils/index";
import { EnhancedChartProps } from "./types";
import { 
  formatDailyDate, 
  formatMonthlyDate, 
  formatQuarterlyDate, 
  detectDateFrequency 
} from "@/utils/dateUtils";

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  height = 300,
  dataKeys,
  xAxisKey,
  stacked = false,
  title,
  referenceLines = [],
}) => {
  const { theme } = useTheme();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1Y");
  
  // Apply date formatting based on frequency
  const formattedData = useMemo(() => formatChartDates(data || [], xAxisKey), [data, xAxisKey]);
  
  // Filter data based on the selected time frame
  const filteredData = useMemo(() => 
    filterDataByTimeFrame(formattedData, timeFrame, xAxisKey), 
    [formattedData, timeFrame, xAxisKey]
  );
  
  // Normalize data if necessary for better visualization
  const normalizedData = useMemo(() => 
    normalizeChartData(filteredData, dataKeys, xAxisKey),
    [filteredData, dataKeys, xAxisKey]
  );
  
  // Determine data frequency for proper labeling
  const dataFrequency = useMemo(() => 
    formattedData?.length > 1 ? 
    detectDateFrequency(formattedData.map(item => item[xAxisKey])) : 
    'monthly',
    [formattedData, xAxisKey]
  );
  
  // Calculate min and max values for Y axis configuration
  const valueMinMax = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { min: 0, max: 0 };
    
    let allValues: number[] = [];
    dataKeys.forEach(key => {
      const cleanKey = key.replace('_area', '').replace('_bar', '');
      const series = filteredData.map(item => Number(item[cleanKey])).filter(v => !isNaN(v));
      allValues = [...allValues, ...series];
    });
    
    // Also consider reference line values when calculating the range
    const referenceValues = referenceLines.map(line => line.y);
    allValues = [...allValues, ...referenceValues];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    
    // Add padding to min/max for better visualization
    return { 
      min: min - (range * 0.05), 
      max: max + (range * 0.05)
    };
  }, [filteredData, dataKeys, referenceLines]);
  
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
  
  // Add debug logging to trace data flow issues
  useEffect(() => {
    if (data && data.length > 0) {
      console.log(`EnhancedChart data for ${title || 'chart'}:`, {
        dataPoints: data.length,
        timeFrame,
        dateRange: data.length > 0 ? `${data[0][xAxisKey]} to ${data[data.length-1][xAxisKey]}` : 'none',
        filteredCount: filteredData.length,
        frequency: dataFrequency
      });
    }
  }, [data, filteredData, title, xAxisKey, timeFrame, dataFrequency]);
  
  // Handle empty filtered data by falling back to all data
  useEffect(() => {
    // If filtered data is empty but we have original data, show a message and fall back to all data
    if (filteredData.length === 0 && data && data.length > 0) {
      console.warn(`No data available for ${title || 'chart'} in timeframe ${timeFrame}, showing all data instead`);
      setTimeFrame('MAX'); // Fall back to showing all data
    }
  }, [filteredData.length, data, timeFrame, title]);
  
  // Get chart styling properties
  const chartColors = getChartColors();
  const tooltipStyle = getTooltipStyle(theme);
  const axisColor = theme === 'dark' ? '#888888' : '#666666';
  
  // If no data, show placeholder
  if (!data || data.length === 0 || filteredData.length === 0) {
    return <ChartEmptyState title={title} hasData={!!(data && data.length > 0)} />;
  }
  
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
  
  // Enhanced tooltip formatter with more context
  const enhancedTooltipFormatter = (value: number | string, name: string) => {
    // Basic formatting
    const formattedValue = formatChartValue(value as number, name as string, title);
    
    // Add context based on chart type
    let context = '';
    if (title?.toLowerCase().includes('inflation')) {
      context = value > 2 ? ' (Above Target)' : ' (At/Below Target)';
    } else if (title?.toLowerCase().includes('unemployment')) {
      context = value < 4 ? ' (Low)' : value > 6 ? ' (High)' : ' (Moderate)';
    } else if (title?.toLowerCase().includes('interest') && name.includes('rate')) {
      context = value > 4 ? ' (Restrictive)' : value < 1 ? ' (Accommodative)' : ' (Neutral)';
    }
    
    return `${formattedValue}${context}`;
  };
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <TimeFrameSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
      <ChartComponent
        data={normalizedData}
        height={height}
        dataKeys={dataKeys}
        xAxisKey={xAxisKey}
        stacked={stacked}
        tooltipFormatter={enhancedTooltipFormatter}
        labelFormatter={(label) => formatTooltipDate(label as string)}
        tooltipStyle={tooltipStyle}
        axisColor={axisColor}
        chartColors={chartColors}
        yAxisTicks={yAxisTicks}
        yAxisFormatter={(value) => formatYAxisTick(value as number, title)}
        dataFrequency={dataFrequency}
        xAxisTickInterval={xAxisTickSettings.interval}
        referenceLines={referenceLines}
      />
    </div>
  );
};

export default EnhancedChart;
