
import React from 'react';

// Add proper typing for props
export interface CandlestickBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  open: number;
  close: number;
  high: number;
  low: number;
  payload: {
    open: number;
    close: number;
    high: number;
    low: number;
    date: string;
    timestamp: number;
    volume: number;
  };
}

const CandlestickBar: React.FC<CandlestickBarProps> = (props) => {
  const { x, y, width, high, low, open, close } = props;
  
  // Determine if the candle is rising or falling
  const isRising = close >= open;
  
  // Calculate proper wick and body positions
  const bodyY = isRising ? y + (high - close) : y + (high - open);
  const bodyHeight = isRising ? (close - open) : (open - close);
  const wickY = y;
  const wickHeight = high - low;
  
  // Fill color based on price direction
  const color = isRising ? "#16a34a" : "#dc2626";
  
  const wickWidth = Math.max(1, width / 6);
  const wickX = x + (width / 2) - (wickWidth / 2);
  
  return (
    <g>
      {/* Candle wick */}
      <rect
        x={wickX}
        y={wickY}
        width={wickWidth}
        height={wickHeight}
        fill={color}
      />
      
      {/* Candle body */}
      <rect
        x={x}
        y={bodyY}
        width={width}
        height={Math.max(1, bodyHeight)}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export default CandlestickBar;
