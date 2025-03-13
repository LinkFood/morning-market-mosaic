
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, AlertOctagon } from "lucide-react";
import { StockData, MarketStatus } from "@/types/marketTypes";
import SparklineChart from "./chart/SparklineChart";
import { Skeleton } from "@/components/ui/skeleton";
import apiService from "@/services/apiService";
import { toast } from "sonner";

interface MarketMoversProps {
  gainers: StockData[];
  losers: StockData[];
  isLoading: boolean;
  error: Error | null;
  marketStatus?: MarketStatus;
  refreshData: () => void;
}

const MarketMovers = ({
  gainers = [],
  losers = [],
  isLoading = false,
  error = null,
  marketStatus,
  refreshData,
}: MarketMoversProps) => {
  const [sparklines, setSparklines] = useState<{ [key: string]: number[] }>({});
  const [activeTab, setActiveTab] = useState<string>("gainers");
  const [loadingSparklines, setLoadingSparklines] = useState<boolean>(false);

  // Load sparkline data for stocks
  useEffect(() => {
    const loadSparklines = async () => {
      if (!gainers.length && !losers.length) return;
      
      setLoadingSparklines(true);
      try {
        const tickers = [...gainers, ...losers].map(stock => stock.ticker);
        const sparklineData: { [key: string]: number[] } = {};
        
        // Load sparklines in parallel
        await Promise.all(
          tickers.map(async (ticker) => {
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
        
        setSparklines(sparklineData);
      } catch (error) {
        console.error("Failed to load sparklines:", error);
        toast.error("Failed to load stock charts");
      } finally {
        setLoadingSparklines(false);
      }
    };

    loadSparklines();
  }, [gainers, losers]);

  const isMarketClosed = marketStatus && !marketStatus.isOpen;

  const formatChange = (change: number) => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
  };

  const formatPercentChange = (changePercent: number) => {
    return `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
  };

  // Format the volume as K or M
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  // Calculate volume percentage for the volume indicator bar
  const getVolumePercentage = (volume: number, maxVolume: number) => {
    return Math.min(100, Math.max(5, (volume / maxVolume) * 100));
  };

  const renderStocksList = (stocks: StockData[]) => {
    // Find max volume for relative bar sizing
    const maxVolume = Math.max(
      ...stocks.map((stock) => stock.volume || 0),
      100000
    );

    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, idx) => (
          <div key={idx} className="border-b border-border last:border-0 p-3">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        ));
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertOctagon className="h-10 w-10 text-destructive mb-2" />
          <p className="text-muted-foreground mb-4">
            Failed to load market data
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    if (stocks.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    return stocks.map((stock) => (
      <div
        key={stock.ticker}
        className="border-b border-border last:border-0 p-3 transition-colors hover:bg-accent/10 cursor-pointer"
        onClick={() => toast.info(`Details for ${stock.ticker}`)}
      >
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-semibold text-sm">{stock.ticker}</h4>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {stock.name || "Stock"}
            </p>
          </div>
          <div className="text-right">
            <div className="font-medium">${stock.close.toFixed(2)}</div>
            <div
              className={
                stock.change >= 0
                  ? "text-xs text-positive flex items-center justify-end"
                  : "text-xs text-negative flex items-center justify-end"
              }
            >
              {stock.change >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              <span>
                {formatChange(stock.change)} ({formatPercentChange(stock.changePercent)})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {/* Volume indicator */}
          <div className="flex flex-col flex-shrink-0 w-12">
            <div className="text-xs text-muted-foreground mb-1">Vol</div>
            <div className="h-2 bg-muted rounded-full w-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  stock.change >= 0 ? "bg-positive" : "bg-negative"
                }`}
                style={{
                  width: `${getVolumePercentage(stock.volume || 0, maxVolume)}%`,
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatVolume(stock.volume || 0)}
            </div>
          </div>

          {/* Sparkline */}
          <div className="flex-1 h-14">
            {loadingSparklines ? (
              <Skeleton className="h-full w-full" />
            ) : sparklines[stock.ticker] ? (
              <SparklineChart
                data={sparklines[stock.ticker]}
                positive={stock.change >= 0}
                height={40}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">No chart data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Market Movers</CardTitle>
          {isMarketClosed && (
            <div className="text-xs font-medium bg-muted px-2 py-1 rounded-md">
              Market Closed
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs
          defaultValue="gainers"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="gainers" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex-1">
              <TrendingDown className="h-4 w-4 mr-2" />
              Top Losers
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="gainers"
            className="mt-0 animate-fade-in"
          >
            <div className="divide-y divide-border">
              {renderStocksList(gainers)}
            </div>
          </TabsContent>
          <TabsContent
            value="losers"
            className="mt-0 animate-fade-in"
          >
            <div className="divide-y divide-border">
              {renderStocksList(losers)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketMovers;
