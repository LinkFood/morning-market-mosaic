
import React from "react";
import { 
  Line, Bar, Area, ComposedChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from "recharts";

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
  dataFrequency = 'monthly'
}) => {
  // Determine how many X-axis ticks to show based on data size and chart width
  const getXAxisTickInterval = () => {
    if (data.length <= 12) return 0; // Show all for small datasets
    if (data.length <= 30) return Math.floor(data.length / 6);
    if (data.length <= 60) return Math.floor(data.length / 5);
    return Math.floor(data.length / 4);
  };
  
  // Format X-axis ticks based on data frequency
  const formatXAxisTick = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      switch (dataFrequency) {
        case 'quarterly':
          return `Q${Math.floor(date.getMonth() / 3) + 1} '${date.getFullYear().toString().substr(2)}`;
        case 'monthly':
          return `${date.toLocaleString('default', { month: 'short' })} '${date.getFullYear().toString().substr(2)}`;
        case 'daily':
        default:
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return dateStr;
    }
  };
  
  const tickInterval = getXAxisTickInterval();
  
  // Only show ticks at regular intervals
  const customTickFormatter = (value: string, index: number) => {
    if (tickInterval === 0 || index % tickInterval === 0) {
      return formatXAxisTick(value);
    }
    return '';
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 11 }}
          stroke={axisColor}
          tickFormatter={customTickFormatter}
          interval={0} // Show all ticks, but we'll hide some with formatter
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          stroke={axisColor}
          ticks={yAxisTicks}
          tickFormatter={yAxisFormatter}
          domain={yAxisTicks ? [yAxisTicks[0], yAxisTicks[yAxisTicks.length - 1]] : ['auto', 'auto']}
        />
        <Tooltip 
          formatter={tooltipFormatter}
          labelFormatter={labelFormatter}
          contentStyle={tooltipStyle}
        />
        <Legend 
          wrapperStyle={{ fontSize: 12 }}
        />
        
        {/* Add horizontal reference line at y=0 for charts that may cross zero */}
        {dataKeys.some(key => data.some(item => parseFloat(item[key.replace('_area', '').replace('_bar', '')]) < 0)) && (
          <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
        )}
        
        {dataKeys.map((key, i) => (
          key.includes('area') ? (
            <Area 
              key={key} 
              type="monotone" 
              dataKey={key.replace('_area', '')} 
              fill={chartColors[i % chartColors.length]}
              stroke={chartColors[i % chartColors.length]}
              fillOpacity={0.3}
              stackId={stacked ? "stack" : undefined}
              name={key.replace('_area', '')}
              connectNulls={true}
            />
          ) : key.includes('bar') ? (
            <Bar
              key={key}
              dataKey={key.replace('_bar', '')}
              fill={chartColors[i % chartColors.length]}
              stackId={stacked ? "stack" : undefined}
              name={key.replace('_bar', '')}
            />
          ) : (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={chartColors[i % chartColors.length]}
              dot={data.length < 30} // Only show dots for smaller datasets
              activeDot={{ r: 5 }}
              name={key}
              connectNulls={true}
            />
          )
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
