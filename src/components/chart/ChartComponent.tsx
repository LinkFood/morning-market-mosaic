
import React from "react";
import { Line, Bar, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartComponentProps {
  data: any[];
  height: number;
  dataKeys: string[];
  xAxisKey: string;
  stacked?: boolean;
  tooltipFormatter: (value: number, name: string) => string;
  labelFormatter: (label: string) => string;
  tooltipStyle: React.CSSProperties;
  axisColor: string;
  chartColors: string[];
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
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey={xAxisKey} 
          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
          tick={{ fontSize: 11 }}
          stroke={axisColor}
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          stroke={axisColor}
        />
        <Tooltip 
          formatter={tooltipFormatter}
          labelFormatter={labelFormatter}
          contentStyle={tooltipStyle}
        />
        <Legend 
          wrapperStyle={{ fontSize: 12 }}
        />
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
              dot={false}
              activeDot={{ r: 5 }}
              name={key}
            />
          )
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
