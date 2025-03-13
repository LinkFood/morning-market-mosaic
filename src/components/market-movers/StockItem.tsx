
import React from "react";
import { ChevronRight } from "lucide-react";
import SparklineChart from "@/components/chart/SparklineChart";
import { StockData } from "@/types/marketTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface StockItemProps {
  stock: StockData;
  sparklineData?: number[];
  isLoadingSparkline?: boolean;
  compactMode?: boolean;
}

const StockItem: React.FC<StockItemProps> = ({
  stock,
  sparklineData,
  isLoadingSparkline = false,
  compactMode = false
}) => {
  const formatPercentChange = (change: number) => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  return (
    <div className={`flex items-center justify-between p-2 ${compactMode ? 'py-2' : 'py-3'} px-4 hover:bg-secondary/40 cursor-pointer transition-colors`}>
      <div className="flex-grow">
        <div className="flex items-center">
          <p className={`font-semibold ${compactMode ? 'text-sm' : ''} mr-1`}>{stock.ticker}</p>
          {stock.name && !compactMode && (
            <p className="text-xs text-muted-foreground truncate max-w-[110px] hidden sm:inline-block">
              {stock.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`${compactMode ? 'text-sm' : ''}`}>${stock.close.toFixed(2)}</span>
          <span className={`text-xs ${stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatPercentChange(stock.changePercent)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`w-16 ${compactMode ? 'h-8' : 'h-10'}`}>
          {isLoadingSparkline ? (
            <Skeleton className={`w-full ${compactMode ? 'h-8' : 'h-10'}`} />
          ) : (
            sparklineData && (
              <SparklineChart 
                data={sparklineData} 
                positive={stock.changePercent >= 0} 
                showLabels={false}
                showAxis={false}
                height={compactMode ? 32 : 40}
              />
            )
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default StockItem;
