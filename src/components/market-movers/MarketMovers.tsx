
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { StockData, MarketStatus } from "@/types/marketTypes";
import apiService from "@/services/apiService";
import { toast } from "sonner";
import StockList from "./StockList";

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
            <StockList
              stocks={gainers}
              isLoading={isLoading}
              error={error}
              refreshData={refreshData}
              sparklines={sparklines}
              loadingSparklines={loadingSparklines}
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
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketMovers;
