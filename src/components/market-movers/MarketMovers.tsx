
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RotateCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { StockData, MarketStatus } from "@/types/marketTypes";
import apiService from "@/services/apiService";
import { toast } from "sonner";
import StockList from "./StockList";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useStockDetail } from "../StockDetail";

interface MarketMoversProps {
  gainers: StockData[];
  losers: StockData[];
  isLoading: boolean;
  error: Error | null;
  marketStatus?: MarketStatus;
  refreshData: () => void;
  compactMode?: boolean;
}

/**
 * Displays top gaining and losing stocks in a tabbed interface
 */
const MarketMovers: React.FC<MarketMoversProps> = ({
  gainers = [],
  losers = [],
  isLoading = false,
  error = null,
  marketStatus,
  refreshData,
  compactMode = false,
}) => {
  const [sparklines, setSparklines] = useState<{ [key: string]: number[] }>({});
  const [activeTab, setActiveTab] = useState<string>("gainers");
  const [loadingSparklines, setLoadingSparklines] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isCompact = compactMode && isMobile;
  const { openStockDetail } = useStockDetail();

  // Get all tickers from both gainers and losers
  const allTickers = useMemo(() => {
    return [...gainers, ...losers].map(stock => stock.ticker);
  }, [gainers, losers]);

  /**
   * Handle click on a stock item
   */
  const handleStockClick = useCallback((ticker: string) => {
    openStockDetail(ticker);
  }, [openStockDetail]);

  /**
   * Manually refresh the data
   */
  const handleRefresh = useCallback(() => {
    refreshData();
    toast.info("Refreshing market movers data...");
  }, [refreshData]);

  // Load sparkline data for stocks
  useEffect(() => {
    const loadSparklines = async () => {
      if (!allTickers.length) return;
      
      setLoadingSparklines(true);
      try {
        const sparklineData: { [key: string]: number[] } = {};
        
        // Batch load sparklines to avoid too many parallel requests
        const batchSize = 5;
        const batches = Math.ceil(allTickers.length / batchSize);
        
        for (let i = 0; i < batches; i++) {
          const batchTickers = allTickers.slice(i * batchSize, (i + 1) * batchSize);
          await Promise.all(
            batchTickers.map(async (ticker) => {
              try {
                const data = await apiService.getStockSparkline(ticker);
                sparklineData[ticker] = data;
              } catch (error) {
                console.error(`Failed to load sparkline for ${ticker}:`, error);
                // Provide fallback data
                sparklineData[ticker] = [100, 101, 99, 102, 101, 103];
              }
            })
          );
        }
        
        setSparklines(sparklineData);
      } catch (error) {
        console.error("Failed to load sparklines:", error);
        toast.error("Failed to load stock charts");
      } finally {
        setLoadingSparklines(false);
      }
    };

    loadSparklines();
  }, [allTickers]);

  const isMarketClosed = marketStatus && !marketStatus.isOpen;

  return (
    <Card className="animate-fade-in">
      <CardHeader className={`pb-3 ${isCompact ? 'py-3' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className={isCompact ? 'text-base' : ''}>Market Movers</CardTitle>
          <div className="flex items-center gap-2">
            {isMarketClosed && (
              <div className="text-xs font-medium bg-muted px-2 py-1 rounded-md">
                Market Closed
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh market movers data"
              className="h-8 w-8"
            >
              <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 font-medium">Failed to load market data</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">{error.message}</p>
            <Button onClick={handleRefresh}>
              <RotateCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <Tabs
            defaultValue="gainers"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="gainers" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className={isMobile && compactMode ? 'text-xs' : ''}>Top Gainers</span>
              </TabsTrigger>
              <TabsTrigger value="losers" className="flex-1">
                <TrendingDown className="h-4 w-4 mr-2" />
                <span className={isMobile && compactMode ? 'text-xs' : ''}>Top Losers</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="gainers"
              className="mt-0 animate-fade-in"
            >
              <StockList
                stocks={gainers}
                isLoading={isLoading}
                error={error}
                refreshData={refreshData}
                sparklines={sparklines}
                loadingSparklines={loadingSparklines}
                compactMode={isCompact}
                onStockClick={handleStockClick}
              />
            </TabsContent>
            <TabsContent
              value="losers"
              className="mt-0 animate-fade-in"
            >
              <StockList
                stocks={losers}
                isLoading={isLoading}
                error={error}
                refreshData={refreshData}
                sparklines={sparklines}
                loadingSparklines={loadingSparklines}
                compactMode={isCompact}
                onStockClick={handleStockClick}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Export memoized component for better performance
export default memo(MarketMovers);
