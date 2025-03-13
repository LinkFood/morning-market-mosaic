
import { useState, useEffect, useCallback } from "react";
import { StockData } from "@/types/marketTypes";

export type SortKey = "ticker" | "name" | "price" | "close" | "change" | "volume";
export type SortDirection = "asc" | "desc";
export type FilterTab = "all" | "watchlist" | "gainers" | "losers" | "tech";

export function useMajorStocks(stocksData: StockData[]) {
  const [sparklines, setSparklines] = useState<{ [key: string]: number[] }>({});
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [stockDetails, setStockDetails] = useState<{ [key: string]: any }>({});
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "price",
    direction: "desc"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [loadingDetails, setLoadingDetails] = useState(false);

  const filteredAndSortedStocks = useCallback(() => {
    let filteredStocks = stocksData;

    if (activeFilter === "watchlist") {
      filteredStocks = stocksData.filter((stock) => watchlist.includes(stock.ticker));
    } else if (activeFilter === "gainers") {
      filteredStocks = [...stocksData].sort((a, b) => (b.changePercent - a.changePercent));
    } else if (activeFilter === "losers") {
      filteredStocks = [...stocksData].sort((a, b) => (a.changePercent - b.changePercent));
    } else if (activeFilter === "tech") {
       filteredStocks = stocksData.filter(stock => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].includes(stock.ticker));
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredStocks = filteredStocks.filter((stock) =>
        stock.ticker.toLowerCase().includes(lowerCaseQuery) ||
        (stock.name && stock.name.toLowerCase().includes(lowerCaseQuery))
      );
    }

    if (sortConfig) {
      filteredStocks = [...filteredStocks].sort((a, b) => {
        let sortValue = 0;
        if (sortConfig.key === "ticker") {
          sortValue = a.ticker.localeCompare(b.ticker);
        } else if (sortConfig.key === "name") {
          sortValue = (a.name || '').localeCompare(b.name || '');
        } else if (sortConfig.key === "price" || sortConfig.key === "close") {
          sortValue = a.close - b.close;
        } else if (sortConfig.key === "change") {
          sortValue = a.change - b.change;
        } else if (sortConfig.key === "volume") {
          sortValue = (a.volume || 0) - (b.volume || 0);
        }

        return sortConfig.direction === "asc" ? sortValue : -sortValue;
      });
    }

    return filteredStocks;
  }, [stocksData, activeFilter, searchQuery, sortConfig, watchlist]);

  const toggleRowExpansion = (ticker: string) => {
    setExpandedRows(prev => ({ ...prev, [ticker]: !prev[ticker] }));
    if (!stockDetails[ticker]) {
      loadStockDetails(ticker);
    }
  };

  const toggleWatchlist = (ticker: string) => {
    setWatchlist(prev => {
      if (prev.includes(ticker)) {
        return prev.filter(t => t !== ticker);
      } else {
        return [...prev, ticker];
      }
    });
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const loadStockDetails = async (ticker: string) => {
    setLoadingDetails(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStockDetails(prev => ({
        ...prev,
        [ticker]: {
          description: `Details for ${ticker}`,
          marketCap: 1000000,
          peRatio: 20
        }
      }));
    } catch (error) {
      console.error("Failed to load stock details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSetActiveFilter = (filter: string) => {
    setActiveFilter(filter as FilterTab);
  };

  useEffect(() => {
    const newSparklines: { [key: string]: number[] } = {};
    stocksData.forEach(stock => {
      newSparklines[stock.ticker] = Array.from({ length: 20 }, () => Math.random() * 50);
    });
    setSparklines(newSparklines);
  }, [stocksData]);

  return {
    sparklines,
    expandedRows,
    stockDetails,
    watchlist,
    sortConfig,
    searchQuery,
    activeFilter,
    loadingDetails,
    filteredAndSortedStocks: filteredAndSortedStocks(),
    toggleRowExpansion,
    toggleWatchlist,
    requestSort,
    setSearchQuery,
    setActiveFilter: handleSetActiveFilter,
  };
}
