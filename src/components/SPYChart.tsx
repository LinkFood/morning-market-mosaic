
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TimeFrame } from "@/components/chart/TimeFrameSelector";
import StockCandlestickChart from "@/components/chart/StockCandlestickChart";
import { CandleData } from "@/types/marketTypes";
import { useCandleData } from "@/components/stock-detail/hooks/useCandleData";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Memoized price display component to prevent re-renders
const PriceDisplay = React.memo(({ 
  currentPrice,
  priceChange,
  isLoading
}: { 
  currentPrice: number | null,
  priceChange: { change: number, percentage: number },
  isLoading: boolean
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }
  
  // Determine color class based on price change
  const isPositive = priceChange?.change >= 0;
  const tickerClass = isPositive ? 'text-positive' : 'text-negative';
  
  return (
    <div className="flex flex-col items-end">
      <span className="text-2xl font-bold">
        {currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={`text-sm font-medium ${tickerClass}`}>
        {priceChange?.change >= 0 ? '+' : ''}
        {priceChange?.change.toFixed(2)} ({priceChange?.percentage.toFixed(2)}%)
      </span>
    </div>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

/**
 * SPY Chart Component
 * Shows SPY ETF price data using real-time candlestick data
 */
const SPYChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1D");
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the candleData hook to fetch real data
  const { loadCandleData } = useCandleData("SPY", timeFrame, setCandleData);
  
  // Calculate current price and change
  const currentPrice = candleData.length > 0 ? candleData[candleData.length - 1].close : null;
  const openPrice = candleData.length > 0 ? candleData[0].open : null;
  const priceChange = {
    change: currentPrice && openPrice ? currentPrice - openPrice : 0,
    percentage: currentPrice && openPrice ? ((currentPrice - openPrice) / openPrice) * 100 : 0
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    loadCandleData("SPY", timeFrame).finally(() => {
      setIsLoading(false);
    });
  };
  
  // Set loading state based on data
  useEffect(() => {
    if (candleData.length > 0) {
      setIsLoading(false);
    }
  }, [candleData]);
  
  // Load data on component mount or when timeframe changes
  useEffect(() => {
    setIsLoading(true);
    loadCandleData("SPY", timeFrame).finally(() => {
      setIsLoading(false);
    });
  }, [timeFrame]);
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">SPY</CardTitle>
            <CardDescription>SPDR S&P 500 ETF Trust</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            
            <PriceDisplay 
              currentPrice={currentPrice} 
              priceChange={priceChange} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : (
          <div className="space-y-2">
            {candleData.length > 0 ? (
              <StockCandlestickChart
                data={candleData}
                timeFrame={timeFrame}
                setTimeFrame={setTimeFrame}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(SPYChart);
