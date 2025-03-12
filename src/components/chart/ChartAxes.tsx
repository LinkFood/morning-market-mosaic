
import React from "react";

interface ChartAxesProps {
  width: number;
  height: number;
  showAxis: boolean;
}

const ChartAxes: React.FC<ChartAxesProps> = ({ width, height, showAxis }) => {
  if (!showAxis) return null;
  
  return (
    <>
      <line 
        x1="0" 
        y1={height} 
        x2={width} 
        y2={height} 
        stroke="currentColor" 
        strokeOpacity="0.2" 
        strokeWidth="0.5" 
      />
      <line 
        x1="0" 
        y1="0" 
        x2="0" 
        y2={height} 
        stroke="currentColor" 
        strokeOpacity="0.2" 
        strokeWidth="0.5" 
      />
    </>
  );
};

export default ChartAxes;
