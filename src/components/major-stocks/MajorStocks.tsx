
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockData } from "@/types/marketTypes";
import { useMajorStocks, FilterTab } from "./useMajorStocks";
import StockFilters from "./StockFilters";
import MajorStocksTable from "./MajorStocksTable";
import { useMediaQuery } from "@/hooks/use-mobile";

interface MajorStocksProps {
  stocks: StockData[];
  compactMode?: boolean;
}

/**
 * Major stocks component displaying a filterable, sortable table of stocks
 * with interactive features like watchlist and details expansion.
 * 
 * @param stocks - Array of stock data
 * @param compactMode - Whether to display in compact mode for mobile
 */
const MajorStocks: React.FC<MajorStocksProps> = ({ 
  stocks: stocksData, 
  compactMode = false 
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isCompact = compactMode && isMobile;
  
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

  return (
    <Card className="animate-fade-in">
      <CardHeader className={`flex flex-row justify-between items-center pb-2 ${isCompact ? 'py-3' : ''}`}>
        <CardTitle className={isCompact ? 'text-base' : ''}>Major Stocks</CardTitle>
      </CardHeader>
      
      <CardContent className={isCompact ? 'p-3' : ''}>
        <StockFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          compactMode={isCompact}
        />
        
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
      </CardContent>
    </Card>
  );
};

// Export memoized component for better performance
export default memo(MajorStocks);
