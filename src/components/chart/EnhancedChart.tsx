
/**
 * EnhancedChart - A configurable chart component that adapts to different data frequencies
 * and provides consistent formatting and styling
 */
import React, { useState, useEffect } from "react";
import TimeFrameSelector, { TimeFrame } from "./TimeFrameSelector";
import ChartComponent from "./ChartComponent";
import ChartEmptyState from "./ChartEmptyState";
import { EnhancedChartProps } from "./types";
import { ChartConfigProvider, useChartConfig } from "./context/ChartConfigContext";
import { useChartData } from "./hooks/useChartData";
import { useChartAxes } from "./hooks/useChartAxes";
import { useTooltipFormatter } from "./hooks/useTooltipFormatter";

/**
 * A responsive, configurable chart component that adapts to different data frequencies
 * and provides consistent formatting and styling
 */
const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  height = 300,
  dataKeys,
  xAxisKey,
  stacked = false,
  title,
  referenceLines = [],
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1Y");
  
  // Process chart data using our custom hook
  const { 
    filteredData, 
    normalizedData, 
    dataFrequency, 
    isEmpty 
  } = useChartData(data, dataKeys, xAxisKey, timeFrame);
  
  // Configure chart axes using our custom hook
  const { 
    yAxisTicks, 
    xAxisTickInterval, 
    formatTooltipDate, 
    yAxisFormatter 
  } = useChartAxes(filteredData, dataKeys, dataFrequency, timeFrame, title);
  
  // Get tooltip formatters
  const { enhancedTooltipFormatter } = useTooltipFormatter(title);
  
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
  
  // If no data, show placeholder
  if (isEmpty) {
    return <ChartEmptyState title={title} hasData={!!(data && data.length > 0)} />;
  }
  
  return (
    <ChartConfigProvider timeFrame={timeFrame} setTimeFrame={setTimeFrame}>
      <div className="w-full">
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <TimeFrameSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
        
        <ChartWrapper
          normalizedData={normalizedData}
          height={height}
          dataKeys={dataKeys}
          xAxisKey={xAxisKey}
          stacked={stacked}
          dataFrequency={dataFrequency}
          yAxisTicks={yAxisTicks}
          xAxisTickInterval={xAxisTickInterval}
          formatTooltipDate={formatTooltipDate}
          yAxisFormatter={yAxisFormatter}
          enhancedTooltipFormatter={enhancedTooltipFormatter}
          referenceLines={referenceLines}
        />
      </div>
    </ChartConfigProvider>
  );
};

// Chart wrapper component to consume the ChartConfig context
interface ChartWrapperProps {
  normalizedData: any[];
  height: number;
  dataKeys: string[];
  xAxisKey: string;
  stacked: boolean;
  dataFrequency: 'daily' | 'monthly' | 'quarterly';
  yAxisTicks: number[];
  xAxisTickInterval: number;
  formatTooltipDate: (dateStr: string) => string;
  yAxisFormatter: (value: number | string) => string;
  enhancedTooltipFormatter: (value: number | string, name: string) => string;
  referenceLines: any[];
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  normalizedData,
  height,
  dataKeys,
  xAxisKey,
  stacked,
  dataFrequency,
  yAxisTicks,
  xAxisTickInterval,
  formatTooltipDate,
  yAxisFormatter,
  enhancedTooltipFormatter,
  referenceLines
}) => {
  const { chartColors, tooltipStyle, axisColor } = useChartConfig();
  
  return (
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
      yAxisFormatter={yAxisFormatter}
      dataFrequency={dataFrequency}
      xAxisTickInterval={xAxisTickInterval}
      referenceLines={referenceLines}
    />
  );
};

export default EnhancedChart;
