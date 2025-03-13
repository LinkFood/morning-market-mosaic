
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { formatDailyDate } from '@/utils/dateUtils';
import TimeFrameSelector, { TimeFrame } from './TimeFrameSelector';
import { CandleData } from '@/types/marketTypes';
import CandlestickBar from './candlestick/CandlestickBar';
import CandlestickTooltip from './candlestick/CandlestickTooltip';
import VolumeChart from './candlestick/VolumeChart';
import MovingAverageLines from './candlestick/MovingAverageLines';
import MovingAverageControls from './candlestick/MovingAverageControls';
import { useMovingAverages } from './candlestick/hooks/useMovingAverages';

interface StockCandlestickChartProps {
  data: CandleData[];
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const StockCandlestickChart: React.FC<StockCandlestickChartProps> = ({
  data,
  timeFrame,
  setTimeFrame
}) => {
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  
  const { dataWithMA } = useMovingAverages(data);
  
  // Find previous close for reference line
  const previousClose = data.length > 0 ? data[0].close : null;
  
  // Format X axis ticks based on timeframe
  const formatXAxis = (timestamp: number) => {
    if (timeFrame === "1D") {
      // For 1D, show time only (hour:minute)
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (timeFrame === "1W" || timeFrame === "1M") {
      // For 1W and 1M, show day and month
      return formatDailyDate(new Date(timestamp).toISOString()).split(',')[0];
    } else {
      // For longer timeframes, show month and year
      const date = new Date(timestamp);
      return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    }
  };
  
  // Determine interval for X axis ticks based on data density
  const calculateTickInterval = () => {
    if (data.length <= 10) return 0; // Show all ticks for small datasets
    if (data.length <= 30) return 2; // Every 3rd tick
    if (data.length <= 60) return 4; // Every 5th tick
    if (data.length <= 100) return 9; // Every 10th tick
    return 19; // Every 20th tick for large datasets
  };
  
  return (
    <div>
      <TimeFrameSelector timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
      
      <MovingAverageControls 
        showMA20={showMA20}
        showMA50={showMA50}
        setShowMA20={setShowMA20}
        setShowMA50={setShowMA50}
      />
      
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart
          data={dataWithMA}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            interval={calculateTickInterval()}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fontSize: 10 }}
            width={60}
          />
          <Tooltip content={<CandlestickTooltip />} />
          
          {/* Candlesticks */}
          <Bar
            dataKey="close"
            shape={<CandlestickBar />}
            name="Price"
            unit="$"
          />
          
          {/* Moving Averages */}
          <MovingAverageLines showMA20={showMA20} showMA50={showMA50} />
          
          {/* Previous close reference line */}
          {previousClose && (
            <ReferenceLine
              y={previousClose}
              stroke="#888"
              strokeDasharray="3 3"
              label={{
                value: `Prev: $${previousClose.toFixed(2)}`,
                fill: '#888',
                fontSize: 10,
                position: 'insideBottomRight'
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Volume Chart */}
      <VolumeChart 
        data={data}
        formatXAxis={formatXAxis}
        calculateTickInterval={calculateTickInterval}
      />
    </div>
  );
};

export default StockCandlestickChart;
