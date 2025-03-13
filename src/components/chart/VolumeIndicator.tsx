
import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VolumeIndicatorProps {
  volume: number;
  avgVolume: number;
}

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({ volume, avgVolume }) => {
  // Calculate volume compared to average
  const ratio = avgVolume > 0 ? volume / avgVolume : 1;
  const isHigh = ratio > 1.2;
  const isLow = ratio < 0.8;
  
  const volumeFormatted = formatVolume(volume);
  const avgVolumeFormatted = formatVolume(avgVolume);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <span>{volumeFormatted}</span>
            {isHigh && <ArrowUp className="h-3 w-3 text-green-500" />}
            {isLow && <ArrowDown className="h-3 w-3 text-red-500" />}
            {!isHigh && !isLow && <Minus className="h-3 w-3 text-gray-500" />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <p>Volume: {volume.toLocaleString()}</p>
            <p>Avg Volume: {avgVolume.toLocaleString()}</p>
            <p>Ratio: {ratio.toFixed(2)}x</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper to format volume
const formatVolume = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export default VolumeIndicator;
