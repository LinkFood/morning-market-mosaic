
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import TimeFrameSelector, { TimeFrame } from "./TimeFrameSelector";
import ChartComponent from "./ChartComponent";
import ChartEmptyState from "./ChartEmptyState";
import { filterDataByTimeFrame, formatChartValue, getChartColors, getTooltipStyle } from "./chartUtils";
import { EnhancedChartProps } from "./types";

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
  
  // Filter data based on the selected time frame
  const filteredData = useMemo(() => 
    filterDataByTimeFrame(data, timeFrame, xAxisKey), 
    [data, timeFrame, xAxisKey]
  );
  
  // Add debug logging to trace data flow issues
  useEffect(() => {
    if (data && data.length > 0) {
      console.log(`EnhancedChart data for ${title || 'chart'}:`, {
        dataPoints: data.length,
        timeFrame,
        dateRange: data.length > 0 ? `${data[0][xAxisKey]} to ${data[data.length-1][xAxisKey]}` : 'none',
        filteredCount: filteredData.length
      });
    }
  }, [data, filteredData, title, xAxisKey, timeFrame]);
  
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
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <TimeFrameSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
      <ChartComponent
        data={filteredData}
        height={height}
        dataKeys={dataKeys}
        xAxisKey={xAxisKey}
        stacked={stacked}
        tooltipFormatter={(value, name) => formatChartValue(value as number, name as string, title)}
        labelFormatter={(label) => new Date(label).toLocaleDateString()}
        tooltipStyle={tooltipStyle}
        axisColor={axisColor}
        chartColors={chartColors}
      />
    </div>
  );
};

export default EnhancedChart;
