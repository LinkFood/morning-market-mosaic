
import { useState, useEffect, useCallback, useMemo } from "react";
import { StockData } from "@/types/marketTypes";

/**
 * Sort keys for stock data table
 */
export type SortKey = "ticker" | "name" | "price" | "close" | "change" | "volume";

/**
 * Sort direction for stock data table
 */
export type SortDirection = "asc" | "desc";

/**
 * Filter tabs for stock data display
 */
export type FilterTab = "all" | "watchlist" | "gainers" | "losers" | "tech";

/**
 * Custom hook for managing stock data, filtering, sorting, and UI state
 * @param stocksData - Array of stock data objects
 * @returns Object containing stock state and methods
 */
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
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({});

  /**
   * Filter and sort stocks based on current filters and sort configuration
   */
  const filteredAndSortedStocks = useMemo(() => {
    let filteredStocks = stocksData;

    // Apply tab filters
    if (activeFilter === "watchlist") {
      filteredStocks = stocksData.filter((stock) => watchlist.includes(stock.ticker));
    } else if (activeFilter === "gainers") {
      filteredStocks = [...stocksData].sort((a, b) => (b.changePercent - a.changePercent)).slice(0, 10);
    } else if (activeFilter === "losers") {
      filteredStocks = [...stocksData].sort((a, b) => (a.changePercent - b.changePercent)).slice(0, 10);
    } else if (activeFilter === "tech") {
       filteredStocks = stocksData.filter(stock => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].includes(stock.ticker));
    }

    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredStocks = filteredStocks.filter((stock) =>
        stock.ticker.toLowerCase().includes(lowerCaseQuery) ||
        (stock.name && stock.name.toLowerCase().includes(lowerCaseQuery))
      );
    }

    // Apply sorting
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

  /**
   * Toggle expansion state of a row and load details if needed
   * @param ticker - Stock ticker to toggle
   */
  const toggleRowExpansion = useCallback((ticker: string) => {
    setExpandedRows(prev => ({ ...prev, [ticker]: !prev[ticker] }));
    if (!stockDetails[ticker]) {
      loadStockDetails(ticker);
    }
  }, [stockDetails]);

  /**
   * Toggle a stock in the watchlist
   * @param ticker - Stock ticker to toggle
   */
  const toggleWatchlist = useCallback((ticker: string) => {
    setWatchlist(prev => {
      if (prev.includes(ticker)) {
        return prev.filter(t => t !== ticker);
      } else {
        return [...prev, ticker];
      }
    });
  }, []);

  /**
   * Change the sort configuration
   * @param key - Key to sort by
   */
  const requestSort = useCallback((key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  /**
   * Load stock details from API
   * @param ticker - Stock ticker to load details for
   */
  const loadStockDetails = useCallback(async (ticker: string) => {
    setLoadingDetails(prev => ({ ...prev, [ticker]: true }));
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
      setLoadingDetails(prev => ({ ...prev, [ticker]: false }));
    }
  }, []);

  /**
   * Set the active filter tab
   * @param filter - Filter to set
   */
  const handleSetActiveFilter = useCallback((filter: string) => {
    setActiveFilter(filter as FilterTab);
  }, []);

  // Generate random sparkline data for each stock on first load
  useEffect(() => {
    const newSparklines: { [key: string]: number[] } = {};
    stocksData.forEach(stock => {
      if (!sparklines[stock.ticker]) {
        newSparklines[stock.ticker] = Array.from({ length: 20 }, () => Math.random() * 50);
      }
    });
    
    if (Object.keys(newSparklines).length > 0) {
      setSparklines(prev => ({ ...prev, ...newSparklines }));
    }
  }, [stocksData, sparklines]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('stock_watchlist');
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error("Failed to load watchlist from localStorage:", error);
    }
  }, []);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('stock_watchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage:", error);
    }
  }, [watchlist]);

  return {
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
    setActiveFilter: handleSetActiveFilter,
  };
}
