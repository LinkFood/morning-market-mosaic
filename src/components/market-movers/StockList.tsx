
import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockData } from "@/types/marketTypes";
import { Skeleton } from "@/components/ui/skeleton";
import StockItem from "./StockItem";

interface StockListProps {
  stocks: StockData[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => void;
  sparklines: { [key: string]: number[] };
  loadingSparklines: boolean;
}

const StockList: React.FC<StockListProps> = ({
  stocks,
  isLoading,
  error,
  refreshData,
  sparklines,
  loadingSparklines,
}) => {
  // Find max volume for relative bar sizing
  const maxVolume = Math.max(
    ...stocks.map((stock) => stock.volume || 0),
    100000
  );

  if (isLoading) {
    return (
      <>
        {Array(5)
          .fill(0)
          .map((_, idx) => (
            <div key={idx} className="border-b border-border last:border-0 p-3">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-1/3" />
              </div>
            </div>
          ))}
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertOctagon className="h-10 w-10 text-destructive mb-2" />
        <p className="text-muted-foreground mb-4">Failed to load market data</p>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {stocks.map((stock) => (
        <StockItem
          key={stock.ticker}
          stock={stock}
          sparkline={sparklines[stock.ticker]}
          loadingSparklines={loadingSparklines}
          maxVolume={maxVolume}
        />
      ))}
    </div>
  );
};

export default StockList;
