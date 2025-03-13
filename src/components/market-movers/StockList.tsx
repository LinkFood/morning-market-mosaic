
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import StockItem from "./StockItem";
import { StockData } from "@/types/marketTypes";

interface StockListProps {
  stocks: StockData[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => void;
  sparklines: { [key: string]: number[] };
  loadingSparklines: boolean;
  compactMode?: boolean;
}

const StockList: React.FC<StockListProps> = ({
  stocks,
  isLoading,
  error,
  refreshData,
  sparklines,
  loadingSparklines,
  compactMode = false
}) => {
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Failed to load market movers
          </AlertDescription>
        </Alert>
        <Button onClick={refreshData} className="w-full">
          <ReloadIcon className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (!stocks || stocks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  // Calculate max height based on the number of items
  // Fewer items on mobile to show the entire card without scrolling
  const maxItems = compactMode ? 4 : 7;
  const maxHeight = `${Math.min(stocks.length, maxItems) * (compactMode ? 60 : 72)}px`;

  return (
    <ScrollArea className={`max-h-[${maxHeight}]`} type="always">
      <div className="space-y-1">
        {stocks.map((stock) => (
          <StockItem
            key={stock.ticker}
            stock={stock}
            sparklineData={sparklines[stock.ticker]}
            isLoadingSparkline={loadingSparklines}
            compactMode={compactMode}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default StockList;
