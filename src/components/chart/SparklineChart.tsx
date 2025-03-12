
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SparklineChartProps } from "./types";
import { calculateChartParams, generatePoints } from "./utils";
import ChartPath from "./ChartPath";
import ChartDataPoint from "./ChartDataPoint";
import ChartAxes from "./ChartAxes";

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  dates,
  positive,
  height = 40,
  width = 100,
  showAxis = false,
  showLabels = false,
  labelCount = 6
}) => {
  if (!data || data.length === 0) {
    return <div className="h-full w-full bg-muted/30 rounded animate-pulse-light"></div>;
  }
  
  // Calculate chart scaling parameters
  const { min, max, paddedMin, paddedMax, paddedRange } = calculateChartParams(data);
  
  // Generate points for data markers
  const points = generatePoints(data, dates, width, height, paddedMin, paddedRange, labelCount);
  
  return (
    <TooltipProvider>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <ChartPath 
          data={data}
          width={width}
          height={height}
          paddedMin={paddedMin}
          paddedRange={paddedRange}
          positive={positive}
        />
        
        <ChartAxes 
          width={width}
          height={height}
          showAxis={showAxis}
        />
        
        {/* Data points with tooltips */}
        {points.map((point, i) => (
          <ChartDataPoint 
            key={i}
            point={point}
            positive={positive}
            showLabels={showLabels}
          />
        ))}
      </svg>
    </TooltipProvider>
  );
};

export default SparklineChart;
