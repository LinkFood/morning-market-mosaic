
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartPoint } from "./types";
import { formatNumber } from "./utils";

interface ChartDataPointProps {
  point: ChartPoint;
  positive: boolean;
  showLabels?: boolean;
}

const ChartDataPoint: React.FC<ChartDataPointProps> = ({ point, positive, showLabels = false }) => {
  return (
    <g>
      <Tooltip>
        <TooltipTrigger asChild>
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="2.5" 
            fill={positive ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"} 
            stroke="white"
            strokeWidth="0.5"
            className="cursor-pointer hover:r-3 transition-all duration-200"
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          <div>
            <span className="font-semibold">Value:</span> {formatNumber(point.value)}
            {point.date && (
              <div>
                <span className="font-semibold">Date:</span> {point.date}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
      
      {/* Value labels (when showLabels is true) */}
      {showLabels && (
        <text 
          x={point.x} 
          y={point.y - 5} 
          fontSize="6" 
          textAnchor="middle" 
          fill="currentColor"
          fontWeight="medium"
        >
          {formatNumber(point.value)}
        </text>
      )}
    </g>
  );
};

export default ChartDataPoint;
