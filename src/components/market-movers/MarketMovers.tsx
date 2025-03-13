
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStockDetail } from "@/components/stock-detail";
import { StockData, MarketStatus } from "@/types/marketTypes";
import StockList from "./StockList";
import apiService from "@/services/apiService";

interface MarketMoversProps {
  gainers: StockData[];
  losers: StockData[];
  isLoading: boolean;
  error: Error | null;
  marketStatus?: MarketStatus;
  refreshData: () => void;
  compactMode?: boolean;
}

const MarketMovers: React.FC<MarketMoversProps> = ({
  gainers,
  losers,
  isLoading,
  error,
  marketStatus,
  refreshData,
  compactMode = false
}) => {
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");
  const [sparklines, setSparklines] = useState<{ [key: string]: number[] }>({});
  const [loadingSparklines, setLoadingSparklines] = useState(true);
  const { openStockDetail } = useStockDetail();

  // Load sparkline data for all stocks
  const loadSparklines = useCallback(async () => {
    setLoadingSparklines(true);
    const allStocks = [...gainers, ...losers];
    const uniqueTickers = Array.from(new Set(allStocks.map(stock => stock.ticker)));

    try {
      const sparklinePromises = uniqueTickers.map(ticker => 
        apiService.getStockSparkline(ticker, "1D")
      );
      
      const results = await Promise.allSettled(sparklinePromises);
      
      const newSparklines: { [key: string]: number[] } = {};
      
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          newSparklines[uniqueTickers[index]] = result.value;
        }
      });
      
      setSparklines(newSparklines);
    } catch (error) {
      console.error("Failed to load sparklines:", error);
    } finally {
      setLoadingSparklines(false);
    }
  }, [gainers, losers]);

  // Load sparklines when stocks data changes
  useEffect(() => {
    if (gainers.length > 0 || losers.length > 0) {
      loadSparklines();
    }
  }, [gainers.length, losers.length, loadSparklines]);

  // Handle stock click to open detail drawer
  const handleStockClick = useCallback((ticker: string) => {
    openStockDetail(ticker);
  }, [openStockDetail]);

  // Conditional rendering for mobile view
  if (compactMode) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Market Movers</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <Tabs defaultValue="gainers" value={activeTab} onValueChange={(value) => setActiveTab(value as "gainers" | "losers")}>
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
            </TabsList>
            <TabsContent value="gainers" className="mt-0">
              <StockList
                stocks={gainers}
                isLoading={isLoading}
                error={error}
                refreshData={refreshData}
                sparklines={sparklines}
                loadingSparklines={loadingSparklines}
                compactMode={true}
                onStockClick={handleStockClick}
              />
            </TabsContent>
            <TabsContent value="losers" className="mt-0">
              <StockList
                stocks={losers}
                isLoading={isLoading}
                error={error}
                refreshData={refreshData}
                sparklines={sparklines}
                loadingSparklines={loadingSparklines}
                compactMode={true}
                onStockClick={handleStockClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Market Movers</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" value={activeTab} onValueChange={(value) => setActiveTab(value as "gainers" | "losers")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-0">
            <StockList
              stocks={gainers}
              isLoading={isLoading}
              error={error}
              refreshData={refreshData}
              sparklines={sparklines}
              loadingSparklines={loadingSparklines}
              onStockClick={handleStockClick}
            />
          </TabsContent>
          <TabsContent value="losers" className="mt-0">
            <StockList
              stocks={losers}
              isLoading={isLoading}
              error={error}
              refreshData={refreshData}
              sparklines={sparklines}
              loadingSparklines={loadingSparklines}
              onStockClick={handleStockClick}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketMovers;
