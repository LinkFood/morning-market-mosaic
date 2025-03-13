
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { StockData } from "@/types/marketTypes";
import SparklineChart from "../chart/SparklineChart";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface StockItemProps {
  stock: StockData;
  sparkline?: number[];
  loadingSparklines: boolean;
  maxVolume: number;
}

export const formatChange = (change: number) => {
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
};

export const formatPercentChange = (changePercent: number) => {
  return `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
};

// Format the volume as K or M
export const formatVolume = (volume: number) => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

// Calculate volume percentage for the volume indicator bar
export const getVolumePercentage = (volume: number, maxVolume: number) => {
  return Math.min(100, Math.max(5, (volume / maxVolume) * 100));
};

const StockItem: React.FC<StockItemProps> = ({
  stock,
  sparkline,
  loadingSparklines,
  maxVolume,
}) => {
  return (
    <div
      className="border-b border-border last:border-0 p-3 transition-colors hover:bg-accent/10 cursor-pointer"
      onClick={() => toast.info(`Details for ${stock.ticker}`)}
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <h4 className="font-semibold text-sm">{stock.ticker}</h4>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">
            {stock.name || "Stock"}
          </p>
        </div>
        <div className="text-right">
          <div className="font-medium">${stock.close.toFixed(2)}</div>
          <div
            className={
              stock.change >= 0
                ? "text-xs text-positive flex items-center justify-end"
                : "text-xs text-negative flex items-center justify-end"
            }
          >
            {stock.change >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>
              {formatChange(stock.change)} ({formatPercentChange(stock.changePercent)})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {/* Volume indicator */}
        <div className="flex flex-col flex-shrink-0 w-12">
          <div className="text-xs text-muted-foreground mb-1">Vol</div>
          <div className="h-2 bg-muted rounded-full w-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                stock.change >= 0 ? "bg-positive" : "bg-negative"
              }`}
              style={{
                width: `${getVolumePercentage(stock.volume || 0, maxVolume)}%`,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatVolume(stock.volume || 0)}
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex-1 h-14">
          {loadingSparklines ? (
            <Skeleton className="h-full w-full" />
          ) : sparkline ? (
            <SparklineChart
              data={sparkline}
              positive={stock.change >= 0}
              height={40}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted-foreground">No chart data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockItem;
