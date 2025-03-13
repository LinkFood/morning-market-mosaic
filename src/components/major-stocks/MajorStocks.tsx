
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockData } from "@/types/marketTypes";
import { useMajorStocks } from "./useMajorStocks";
import StockFilters from "./StockFilters";
import MajorStocksTable from "./MajorStocksTable";
import { useMediaQuery } from "@/hooks/use-mobile";

interface MajorStocksProps {
  stocks: StockData[];
  compactMode?: boolean;
}

const MajorStocks: React.FC<MajorStocksProps> = ({ 
  stocks: stocksData, 
  compactMode = false 
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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
      <CardHeader className={`flex flex-row justify-between items-center pb-2 ${compactMode && isMobile ? 'py-3' : ''}`}>
        <CardTitle className={compactMode && isMobile ? 'text-base' : ''}>Major Stocks</CardTitle>
      </CardHeader>
      
      <CardContent className={compactMode && isMobile ? 'p-3' : ''}>
        <StockFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          compactMode={compactMode && isMobile}
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
          compactMode={compactMode && isMobile}
        />
      </CardContent>
    </Card>
  );
};

export default MajorStocks;
