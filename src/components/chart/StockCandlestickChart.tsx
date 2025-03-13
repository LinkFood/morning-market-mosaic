import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  Rectangle
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { formatDailyDate, formatTimeWithDate } from '@/utils/dateUtils';
import TimeFrameSelector, { TimeFrame } from './TimeFrameSelector';
import { CandleData } from '@/types/marketTypes';

// Custom Candlestick Component
const CandlestickBar = (props: any) => {
  const { x, y, width, height, open, close, low, high } = props;
  
  // Determine if the candle is up or down
  const isUp = close > open;
  const color = isUp ? '#10b981' : '#ef4444';
  
  // Calculate positions for the candle body
  const bodyY = isUp ? y + (high - close) / (high - low) * height : y + (high - open) / (high - low) * height;
  const bodyHeight = isUp ? (close - open) / (high - low) * height : (open - close) / (high - low) * height;
  
  // Ensure minimum visible height for the body
  const minBodyHeight = 1;
  const adjustedBodyHeight = Math.max(bodyHeight, minBodyHeight);
  
  // Calculate positions for the wicks
  const wickX = x + width / 2;
  const topWickY = y;
  const topWickHeight = isUp ? (high - close) / (high - low) * height : (high - open) / (high - low) * height;
  const bottomWickY = isUp ? y + (high - open) / (high - low) * height : y + (high - close) / (high - low) * height;
  const bottomWickHeight = isUp ? (open - low) / (high - low) * height : (close - low) / (high - low) * height;
  
  return (
    <g>
      {/* Upper wick */}
      <line
        x1={wickX}
        y1={topWickY}
        x2={wickX}
        y2={topWickY + topWickHeight}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Lower wick */}
      <line
        x1={wickX}
        y1={bottomWickY}
        x2={wickX}
        y2={bottomWickY + bottomWickHeight}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Candle body */}
      <rect
        x={x}
        y={bodyY}
        width={width}
        height={adjustedBodyHeight}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

// Custom tooltip component
const CandlestickTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Card className="border shadow-md">
        <CardContent className="p-3">
          <p className="text-xs font-medium mb-1">{formatTimeWithDate(data.timestamp)}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>Open: <span className="font-medium">${data.open.toFixed(2)}</span></div>
            <div>Close: <span className="font-medium">${data.close.toFixed(2)}</span></div>
            <div>High: <span className="font-medium">${data.high.toFixed(2)}</span></div>
            <div>Low: <span className="font-medium">${data.low.toFixed(2)}</span></div>
            <div className="col-span-2 mt-1">
              Volume: <span className="font-medium">{data.volume.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

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
  
  // Calculate moving averages
  const calculateMovingAverage = (data: CandleData[], period: number) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [`ma${period}`]: null };
      
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + val.close, 0);
      
      return {
        ...item,
        [`ma${period}`]: sum / period
      };
    });
  };
  
  // Add moving averages to data
  const dataWithMA = (() => {
    if (!data || data.length === 0) return [];
    
    let processedData = [...data];
    
    // Only calculate MAs if we have enough data points
    if (data.length >= 20) {
      processedData = calculateMovingAverage(processedData, 20);
    }
    
    if (data.length >= 50) {
      processedData = calculateMovingAverage(processedData, 50);
    }
    
    return processedData;
  })();
  
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
      
      <div className="mb-2 flex justify-end space-x-4">
        <div className="flex items-center space-x-1">
          <input
            type="checkbox"
            id="ma20"
            checked={showMA20}
            onChange={() => setShowMA20(!showMA20)}
            className="h-3 w-3 rounded text-primary"
          />
          <label htmlFor="ma20" className="text-xs cursor-pointer">
            20-day MA
          </label>
        </div>
        <div className="flex items-center space-x-1">
          <input
            type="checkbox"
            id="ma50"
            checked={showMA50}
            onChange={() => setShowMA50(!showMA50)}
            className="h-3 w-3 rounded text-primary"
          />
          <label htmlFor="ma50" className="text-xs cursor-pointer">
            50-day MA
          </label>
        </div>
      </div>
      
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
          {showMA20 && (
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#3b82f6"
              dot={false}
              name="20-day MA"
              strokeWidth={1}
              connectNulls
            />
          )}
          
          {showMA50 && (
            <Line
              type="monotone"
              dataKey="ma50"
              stroke="#8b5cf6"
              dot={false}
              name="50-day MA"
              strokeWidth={1}
              connectNulls
            />
          )}
          
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
    </div>
  );
};

export default StockCandlestickChart;
