
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
} from "./chartUtils";
import { EnhancedChartProps } from "./types";
import { formatDate, determineFrequency } from "@/utils/dateUtils";

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  height = 300,
  dataKeys,
  xAxisKey,
  stacked = false,
  title,
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
    determineFrequency(formattedData.map(item => item[xAxisKey])) : 
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
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    
    // Add padding to min/max for better visualization
    return { 
      min: min - (range * 0.05), 
      max: max + (range * 0.05)
    };
  }, [filteredData, dataKeys]);
  
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
  
  // Generate appropriate Y-axis ticks based on data range
  const yAxisTicks = useMemo(() => {
    const { min, max } = valueMinMax;
    const range = max - min;
    const tickCount = 5;
    const step = range / (tickCount - 1);
    
    return Array.from({ length: tickCount }, (_, i) => min + i * step);
  }, [valueMinMax]);
  
  // If no data, show placeholder
  if (!data || data.length === 0 || filteredData.length === 0) {
    return <ChartEmptyState title={title} hasData={!!(data && data.length > 0)} />;
  }
  
  // Format date for tooltip based on frequency
  const formatTooltipDate = (dateStr: string) => {
    switch (dataFrequency) {
      case 'quarterly':
        return formatDate(dateStr, 'monthYear') || dateStr;
      case 'monthly':
        return formatDate(dateStr, 'monthYear') || dateStr;
      case 'daily':
      default:
        return formatDate(dateStr, 'short') || dateStr;
    }
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
        tooltipFormatter={(value, name) => formatChartValue(value as number, name as string, title)}
        labelFormatter={(label) => formatTooltipDate(label as string)}
        tooltipStyle={tooltipStyle}
        axisColor={axisColor}
        chartColors={chartColors}
        yAxisTicks={yAxisTicks}
        yAxisFormatter={(value) => formatYAxisTick(value as number, title)}
        dataFrequency={dataFrequency}
      />
    </div>
  );
};

export default EnhancedChart;
