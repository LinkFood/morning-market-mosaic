
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockData } from "@/types/marketTypes";
import { useMajorStocks } from "./useMajorStocks";
import StockFilters from "./StockFilters";
import MajorStocksTable from "./MajorStocksTable";

interface MajorStocksProps {
  stocks: StockData[];
}

const MajorStocks: React.FC<MajorStocksProps> = ({ stocks: stocksData }) => {
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
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle>Major Stocks</CardTitle>
      </CardHeader>
      
      <CardContent>
        <StockFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
        />
      </CardContent>
    </Card>
  );
};

export default MajorStocks;
