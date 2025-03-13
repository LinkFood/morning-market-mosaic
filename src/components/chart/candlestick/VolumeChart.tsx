
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { CandleData } from '@/types/marketTypes';
import { formatTimeWithDate } from '@/utils/dateUtils';

interface VolumeChartProps {
  data: CandleData[];
  formatXAxis: (timestamp: number) => string;
  calculateTickInterval: () => number;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ 
  data, 
  formatXAxis, 
  calculateTickInterval 
}) => {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <ComposedChart
        data={data}
        margin={{ top: 0, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          axisLine={false}
          tickLine={false}
          interval={calculateTickInterval()}
          tick={{ fontSize: 10 }}
          height={15}
        />
        <YAxis
          domain={[0, 'auto']}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => {
            if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
          }}
          width={40}
        />
        
        <Tooltip
          formatter={(value: any) => [new Intl.NumberFormat().format(value), 'Volume']}
          labelFormatter={(label) => formatTimeWithDate(label)}
        />
        
        <Bar
          dataKey="volume"
          name="Volume"
          fill="#6b7280"
          opacity={0.5}
          barSize={5}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default VolumeChart;
