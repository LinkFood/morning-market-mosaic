
import React from "react";
import { 
  Line, Bar, Area, ComposedChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from "recharts";
import { 
  formatDailyDate, 
  formatMonthlyDate, 
  formatQuarterlyDate 
} from "@/utils/dateUtils";

interface ReferenceLine {
  y: number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

interface ChartComponentProps {
  data: any[];
  height: number;
  dataKeys: string[];
  xAxisKey: string;
  stacked?: boolean;
  tooltipFormatter: (value: number | string, name: string) => string;
  labelFormatter: (label: string | number) => string;
  tooltipStyle: React.CSSProperties;
  axisColor: string;
  chartColors: string[];
  yAxisTicks?: number[];
  yAxisFormatter?: (value: number | string) => string;
  dataFrequency?: 'daily' | 'monthly' | 'quarterly';
  xAxisTickInterval?: number;
  referenceLines?: ReferenceLine[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  height,
  dataKeys,
  xAxisKey,
  stacked = false,
  tooltipFormatter,
  labelFormatter,
  tooltipStyle,
  axisColor,
  chartColors,
  yAxisTicks,
  yAxisFormatter,
  dataFrequency = 'monthly',
  xAxisTickInterval,
  referenceLines = [],
}) => {
  // Format X-axis ticks based on data frequency
  const formatXAxisTick = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      switch (dataFrequency) {
        case 'quarterly':
          return formatQuarterlyDate(dateStr).substring(0, 2); // Just "Q#"
        case 'monthly':
          // For monthly data, show month abbreviation and year if it's January or first data point
          const date = new Date(dateStr);
          const isJanuary = date.getMonth() === 0;
          const monthFormat = isJanuary ? "MMM ''yy" : "MMM";
          return formatMonthlyDate(dateStr).split(' ')[0]; // Just month name for brevity
        case 'daily':
        default:
          return formatDailyDate(dateStr).split(',')[0]; // Just day and month for brevity
      }
    } catch (e) {
      return dateStr;
    }
  };
  
  // Only show ticks at regular intervals
  const customTickFormatter = (value: string, index: number) => {
    if (xAxisTickInterval === undefined || index % (xAxisTickInterval + 1) === 0) {
      return formatXAxisTick(value);
    }
    return '';
  };
  
  // Enhance tooltip to show more context
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formattedDate = labelFormatter(label);
      
      return (
        <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-xs font-semibold mb-1">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex justify-between items-center text-xs mb-1">
              <span style={{ color: entry.color }}>● {entry.name}:</span>
              <span className="ml-2 font-medium">
                {tooltipFormatter(entry.value, entry.name)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  // Handle sparse data by adjusting the curve type
  const getCurveType = () => {
    if (dataFrequency === 'quarterly' || data.length < 10) {
      return "linear"; // Use straight lines for sparse data
    }
    return "monotone"; // Use smooth curves for dense data
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 11 }}
          stroke={axisColor}
          tickFormatter={customTickFormatter}
          interval={0} // Show all ticks, but we'll hide some with formatter
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          stroke={axisColor}
          ticks={yAxisTicks}
          tickFormatter={yAxisFormatter}
          domain={yAxisTicks ? [yAxisTicks[0], yAxisTicks[yAxisTicks.length - 1]] : ['auto', 'auto']}
        />
        
        {/* Use custom tooltip for enhanced information */}
        <Tooltip 
          content={customTooltip}
          formatter={tooltipFormatter}
          labelFormatter={labelFormatter}
          contentStyle={tooltipStyle}
        />
        
        <Legend 
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => value.replace('_', ' ')}
        />
        
        {/* Add horizontal reference line at y=0 for charts that may cross zero */}
        {dataKeys.some(key => data.some(item => parseFloat(item[key.replace('_area', '').replace('_bar', '')]) < 0)) && (
          <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
        )}
        
        {/* Add custom reference lines */}
        {referenceLines.map((line, i) => (
          <ReferenceLine 
            key={`ref-line-${i}`}
            y={line.y} 
            stroke={line.color || "#ff7300"} 
            strokeDasharray={line.strokeDasharray || "3 3"}
            label={{ 
              value: line.label, 
              fill: line.color || "#ff7300", 
              fontSize: 10,
              position: 'right' 
            }}
          />
        ))}
        
        {dataKeys.map((key, i) => (
          key.includes('area') ? (
            <Area 
              key={key} 
              type={getCurveType()} 
              dataKey={key.replace('_area', '')} 
              fill={chartColors[i % chartColors.length]}
              stroke={chartColors[i % chartColors.length]}
              fillOpacity={0.3}
              stackId={stacked ? "stack" : undefined}
              name={key.replace('_area', '').replace(/_/g, ' ')}
              connectNulls={true}
            />
          ) : key.includes('bar') ? (
            <Bar
              key={key}
              dataKey={key.replace('_bar', '')}
              fill={chartColors[i % chartColors.length]}
              stackId={stacked ? "stack" : undefined}
              name={key.replace('_bar', '').replace(/_/g, ' ')}
            />
          ) : (
            <Line
              key={key}
              type={getCurveType()}
              dataKey={key}
              stroke={chartColors[i % chartColors.length]}
              dot={data.length < 30} // Only show dots for smaller datasets
              activeDot={{ r: 5 }}
              name={key.replace(/_/g, ' ')}
              connectNulls={true}
            />
          )
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
