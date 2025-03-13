
import { useState, useEffect, useMemo } from "react";
import { StockData } from "@/types/marketTypes";
import { stocks } from "@/services/market";
import { toast } from "sonner";

type SortKey = 'ticker' | 'close' | 'change' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';
type FilterTab = 'all' | 'gainers' | 'losers' | 'active';

export const useMajorStocks = (stocksData: StockData[]) => {
  const [sparklines, setSparklines] = useState<{[key: string]: number[]}>({});
  const [expandedRows, setExpandedRows] = useState<{[key: string]: boolean}>({});
  const [stockDetails, setStockDetails] = useState<{[key: string]: any}>({});
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>(() => {
    const savedSort = localStorage.getItem('major_stocks_sort');
    return savedSort ? JSON.parse(savedSort) : { key: 'changePercent', direction: 'desc' };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [loadingDetails, setLoadingDetails] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stock_watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stock_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('major_stocks_sort', JSON.stringify(sortConfig));
  }, [sortConfig]);

  useEffect(() => {
    const fetchSparklines = async () => {
      const sparklineData: {[key: string]: number[]} = {};
      
      for (const stock of stocksData) {
        try {
          if (!sparklines[stock.ticker]) {
            const data = await stocks.getStockSparkline(stock.ticker);
            sparklineData[stock.ticker] = data;
          }
        } catch (error) {
          console.error(`Failed to fetch sparkline for ${stock.ticker}:`, error);
          sparklineData[stock.ticker] = [100, 101, 102, 101, 102, 103, 104];
        }
      }
      
      setSparklines(prevSparklines => ({
        ...prevSparklines,
        ...sparklineData
      }));
    };
    
    if (stocksData.length > 0) {
      fetchSparklines();
    }
  }, [stocksData]);

  const toggleRowExpansion = async (ticker: string) => {
    setExpandedRows(prev => {
      const isExpanding = !prev[ticker];
      
      if (isExpanding && !stockDetails[ticker] && !loadingDetails[ticker]) {
        loadStockDetails(ticker);
      }
      
      return {
        ...prev,
        [ticker]: isExpanding
      };
    });
  };

  const loadStockDetails = async (ticker: string) => {
    setLoadingDetails(prev => ({ ...prev, [ticker]: true }));
    
    try {
      const details = await stocks.getStockDetails(ticker);
      setStockDetails(prev => ({ ...prev, [ticker]: details }));
    } catch (error) {
      console.error(`Failed to fetch details for ${ticker}:`, error);
      toast.error(`Could not load details for ${ticker}`);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [ticker]: false }));
    }
  };

  const toggleWatchlist = (ticker: string) => {
    setWatchlist(prev => {
      if (prev.includes(ticker)) {
        toast.success(`Removed ${ticker} from watchlist`);
        return prev.filter(t => t !== ticker);
      } else {
        toast.success(`Added ${ticker} to watchlist`);
        return [...prev, ticker];
      }
    });
  };

  const requestSort = (key: SortKey) => {
    setSortConfig(prevConfig => {
      const direction: SortDirection = 
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = [...stocksData];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stock => 
        stock.ticker.toLowerCase().includes(query) || 
        (stock.name && stock.name.toLowerCase().includes(query))
      );
    }
    
    if (activeFilter === 'gainers') {
      filtered = filtered.filter(stock => stock.changePercent > 0);
    } else if (activeFilter === 'losers') {
      filtered = filtered.filter(stock => stock.changePercent < 0);
    } else if (activeFilter === 'active') {
      return [...filtered]
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 5);
    }
    
    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [stocksData, sortConfig, searchQuery, activeFilter]);

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
    setActiveFilter,
  };
};
