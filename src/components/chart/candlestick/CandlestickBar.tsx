
import React from 'react';

interface CandlestickBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  open: number;
  close: number;
  low: number;
  high: number;
}

const CandlestickBar: React.FC<CandlestickBarProps> = (props) => {
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

export default CandlestickBar;
