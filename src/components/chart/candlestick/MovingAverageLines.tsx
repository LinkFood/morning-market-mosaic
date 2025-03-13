
import React from 'react';
import { Line } from 'recharts';

interface MovingAverageLinesProps {
  showMA20: boolean;
  showMA50: boolean;
}

const MovingAverageLines: React.FC<MovingAverageLinesProps> = ({ showMA20, showMA50 }) => {
  return (
    <>
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
    </>
  );
};

export default MovingAverageLines;
