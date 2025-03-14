
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockData } from "@/types/marketTypes";
import { useMajorStocks, FilterTab } from "./useMajorStocks";
import StockFilters from "./StockFilters";
import MajorStocksTable from "./MajorStocksTable";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MajorStocksProps {
  stocks: StockData[];
  compactMode?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * Major stocks component displaying a filterable, sortable table of stocks
 * with interactive features like watchlist and details expansion.
 * 
 * @param stocks - Array of stock data
 * @param compactMode - Whether to display in compact mode for mobile
 * @param isLoading - Whether the data is currently loading
 * @param onRefresh - Optional callback to refresh the data
 */
const MajorStocks: React.FC<MajorStocksProps> = ({ 
  stocks: stocksData, 
  compactMode = false,
  isLoading = false,
  onRefresh
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isCompact = compactMode && isMobile;
  const [refreshing, setRefreshing] = React.useState(false);
  
  const {
    sparklines,
    expandedRows,
    stockDetails,
    watchlist,
    sortConfig,
    searchQuery,
    activeFilter,
    loadingDetails,
    filteredAndSortedStocks,
    toggleRowExpansion,
    toggleWatchlist,
    requestSort,
    setSearchQuery,
    setActiveFilter,
  } = useMajorStocks(stocksData);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className={`flex flex-row justify-between items-center pb-2 ${isCompact ? 'py-3' : ''}`}>
        <CardTitle className={isCompact ? 'text-base' : ''}>Major Stocks</CardTitle>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className={isCompact ? 'p-3' : ''}>
        <StockFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          compactMode={isCompact}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="space-y-4 mt-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex space-x-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <MajorStocksTable
            stocks={filteredAndSortedStocks}
            sparklines={sparklines}
            expandedRows={expandedRows}
            stockDetails={stockDetails}
            watchlist={watchlist}
            sortConfig={sortConfig}
            loadingDetails={loadingDetails}
            toggleRowExpansion={toggleRowExpansion}
            toggleWatchlist={toggleWatchlist}
            requestSort={requestSort}
            compactMode={isCompact}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Export memoized component for better performance
export default memo(MajorStocks);
