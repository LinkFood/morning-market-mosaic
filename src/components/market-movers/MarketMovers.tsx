
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { StockData, MarketStatus } from "@/types/marketTypes";
import apiService from "@/services/apiService";
import { toast } from "sonner";
import StockList from "./StockList";
import { useMediaQuery } from "@/hooks/use-mobile";

interface MarketMoversProps {
  gainers: StockData[];
  losers: StockData[];
  isLoading: boolean;
  error: Error | null;
  marketStatus?: MarketStatus;
  refreshData: () => void;
  compactMode?: boolean;
}

const MarketMovers = ({
  gainers = [],
  losers = [],
  isLoading = false,
  error = null,
  marketStatus,
  refreshData,
  compactMode = false,
}: MarketMoversProps) => {
  const [sparklines, setSparklines] = useState<{ [key: string]: number[] }>({});
  const [activeTab, setActiveTab] = useState<string>("gainers");
  const [loadingSparklines, setLoadingSparklines] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
      <CardHeader className={`pb-3 ${compactMode && isMobile ? 'py-3' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className={compactMode && isMobile ? 'text-base' : ''}>Market Movers</CardTitle>
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
              compactMode={compactMode && isMobile}
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
              compactMode={compactMode && isMobile}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketMovers;
