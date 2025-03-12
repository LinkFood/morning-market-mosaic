
import React from "react";
import { generatePath } from "./utils";

interface ChartPathProps {
  data: number[];
  width: number;
  height: number;
  paddedMin: number;
  paddedRange: number;
  positive: boolean;
}

const ChartPath: React.FC<ChartPathProps> = ({ 
  data, 
  width, 
  height, 
  paddedMin, 
  paddedRange, 
  positive 
}) => {
  const pathData = generatePath(data, width, height, paddedMin, paddedRange);
  
  return (
    <>
      {/* Background gradient */}
      <defs>
        <linearGradient id={`sparkline-gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"} />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </linearGradient>
      </defs>
      
      {/* Area under the line */}
      <path
        d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#sparkline-gradient-${positive ? 'up' : 'down'})`}
        opacity="0.5"
      />
      
      {/* Main line */}
      <path
        d={pathData}
        fill="none"
        strokeWidth="1.5"
        stroke={positive ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"}
        className="sparkline"
      />
    </>
  );
};

export default ChartPath;
