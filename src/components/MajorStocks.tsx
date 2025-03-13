import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  ExternalLink, 
  Heart, 
  Plus,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  ChevronRight
} from "lucide-react";
import { StockData } from "@/types/marketTypes";
import SparklineChart from "./chart/SparklineChart";
import PriceRangeSlider from "./chart/PriceRangeSlider";
import VolumeIndicator from "./chart/VolumeIndicator";
import { stocks } from "@/services/market";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStockDetail } from "./StockDetail";

interface MajorStocksProps {
  stocks: StockData[];
}

type SortKey = 'ticker' | 'close' | 'change' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';
type FilterTab = 'all' | 'gainers' | 'losers' | 'active';

const MajorStocks = ({ stocks: stocksData }: MajorStocksProps) => {
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

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <SortAsc className="h-4 w-4 inline-block ml-1" /> 
      : <SortDesc className="h-4 w-4 inline-block ml-1" />;
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

  const { openStockDetail } = useStockDetail();

  const handleStockClick = (ticker: string) => {
    openStockDetail(ticker);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle>Major Stocks</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-36 h-8 md:w-48"
            autoComplete="off"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="gainers" className="text-positive">Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="text-negative">Losers</TabsTrigger>
            <TabsTrigger value="active">Most Active</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeFilter} className="mt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground text-sm">
                    <th className="pb-2 cursor-pointer" onClick={() => requestSort('ticker')}>
                      Ticker {getSortIndicator('ticker')}
                    </th>
                    <th className="pb-2 cursor-pointer" onClick={() => requestSort('close')}>
                      Close {getSortIndicator('close')}
                    </th>
                    <th className="pb-2 cursor-pointer" onClick={() => requestSort('change')}>
                      Change {getSortIndicator('change')}
                    </th>
                    <th className="pb-2 cursor-pointer hidden sm:table-cell" onClick={() => requestSort('volume')}>
                      Volume {getSortIndicator('volume')}
                    </th>
                    <th className="pb-2 hidden sm:table-cell">Range</th>
                    <th className="pb-2">Trend</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedStocks.map((stock) => (
                    <React.Fragment key={stock.ticker}>
                      <tr 
                        className={`border-t border-border hover:bg-muted/30 transition-colors 
                          ${watchlist.includes(stock.ticker) ? 'bg-muted/20' : ''}`}
                        onClick={() => handleStockClick(stock.ticker)}
                      >
                        <td className="py-3 font-medium flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 mr-1"
                            onClick={() => toggleWatchlist(stock.ticker)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${watchlist.includes(stock.ticker) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                            />
                          </Button>
                          {stock.ticker}
                        </td>
                        <td className="py-3">${stock.close.toFixed(2)}</td>
                        <td className={`py-3 ${
                          stock.change > 0 
                            ? "text-positive flex items-center gap-1" 
                            : stock.change < 0 
                            ? "text-negative flex items-center gap-1" 
                            : "text-muted-foreground"
                        }`}>
                          {stock.change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                           stock.change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                        </td>
                        <td className="py-3 hidden sm:table-cell">
                          {stock.volume ? 
                            <VolumeIndicator volume={stock.volume} avgVolume={stock.volume * 0.8} /> :
                            "N/A"
                          }
                        </td>
                        <td className="py-3 hidden sm:table-cell">
                          <PriceRangeSlider low={stock.low} high={stock.high} current={stock.close} />
                        </td>
                        <td className="py-3">
                          <div className="h-8 w-24">
                            {sparklines[stock.ticker] && (
                              <SparklineChart 
                                data={sparklines[stock.ticker]} 
                                positive={stock.change >= 0}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => toggleRowExpansion(stock.ticker)}
                          >
                            {expandedRows[stock.ticker] ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </Button>
                        </td>
                      </tr>
                      
                      {expandedRows[stock.ticker] && (
                        <tr className="bg-muted/10">
                          <td colSpan={7} className="py-3 px-4">
                            <div className="animate-fade-in space-y-2">
                              {loadingDetails[stock.ticker] ? (
                                <div className="h-20 flex items-center justify-center">
                                  <div className="animate-pulse text-muted-foreground">Loading details...</div>
                                </div>
                              ) : stockDetails[stock.ticker] ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm">{stockDetails[stock.ticker].name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                                      {stockDetails[stock.ticker].description || "No description available"}
                                    </p>
                                    
                                    {stockDetails[stock.ticker].sector && (
                                      <div className="mt-2">
                                        <Badge variant="outline" className="mr-2">
                                          {stockDetails[stock.ticker].sector}
                                        </Badge>
                                        {stockDetails[stock.ticker].exchange && (
                                          <Badge variant="secondary">
                                            {stockDetails[stock.ticker].exchange}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <div className="text-muted-foreground text-xs">Market Cap</div>
                                      <div>
                                        {stockDetails[stock.ticker].marketCap ? 
                                          `$${(stockDetails[stock.ticker].marketCap / 1_000_000_000).toFixed(2)}B` : 
                                          "N/A"
                                        }
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground text-xs">Employees</div>
                                      <div>
                                        {stockDetails[stock.ticker].employees ? 
                                          stockDetails[stock.ticker].employees.toLocaleString() : 
                                          "N/A"
                                        }
                                      </div>
                                    </div>
                                    {stockDetails[stock.ticker].listDate && (
                                      <div>
                                        <div className="text-muted-foreground text-xs">Listed</div>
                                        <div>{stockDetails[stock.ticker].listDate}</div>
                                      </div>
                                    )}
                                    {stockDetails[stock.ticker].homepageUrl && (
                                      <div>
                                        <div className="text-muted-foreground text-xs">Website</div>
                                        <a 
                                          href={stockDetails[stock.ticker].homepageUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                          Visit <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-sm">
                                  No details available for {stock.ticker}
                                </div>
                              )}
                              
                              <div className="flex justify-end mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openStockDetail(stock.ticker);
                                  }}
                                >
                                  View Details <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {filteredAndSortedStocks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {searchQuery ? 
                          `No stocks found matching "${searchQuery}"` : 
                          "No stocks available"
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MajorStocks;
