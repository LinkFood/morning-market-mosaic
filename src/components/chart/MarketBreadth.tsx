
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface MarketBreadthProps {
  advancers: number;
  decliners: number;
  unchanged: number;
  newHighs: number;
  newLows: number;
}

const MarketBreadth: React.FC<MarketBreadthProps> = ({ 
  advancers, 
  decliners, 
  unchanged, 
  newHighs, 
  newLows 
}) => {
  const total = advancers + decliners + unchanged;
  const advancersPct = total > 0 ? (advancers / total) * 100 : 0;
  const declinersPct = total > 0 ? (decliners / total) * 100 : 0;
  
  // Determine market health (simple scoring)
  const marketHealth = advancersPct > 55 ? "bullish" : 
                       advancersPct < 45 ? "bearish" : "neutral";
  
  const healthColor = {
    bullish: "bg-green-500",
    neutral: "bg-yellow-500",
    bearish: "bg-red-500"
  };
  
  return (
    <div className="space-y-2 mt-2 text-xs">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-green-500" />
          <span>{advancers}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{decliners}</span>
          <ArrowDownRight className="h-3 w-3 text-red-500" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Progress value={advancersPct} className="h-1.5" />
      </div>
      
      <div className="flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help flex items-center gap-1">
                <span>New Highs:</span>
                <span>{newHighs}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Stocks reaching 52-week highs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help flex items-center gap-1">
                <span>{newLows}</span>
                <span>:New Lows</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Stocks reaching 52-week lows</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <div className={`h-2 w-2 rounded-full ${healthColor[marketHealth]}`}></div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Market Health: {marketHealth.charAt(0).toUpperCase() + marketHealth.slice(1)}</p>
            <p>Advancers: {advancersPct.toFixed(1)}%</p>
            <p>Decliners: {declinersPct.toFixed(1)}%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MarketBreadth;
