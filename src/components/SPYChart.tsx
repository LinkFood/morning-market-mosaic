
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { TimeFrame } from "@/components/chart/TimeFrameSelector";
import StockCandlestickChart from "@/components/chart/StockCandlestickChart";
import { CandleData } from "@/types/marketTypes";
import { initializeApiKey } from '@/services/market/config';
import { stocks } from "@/services/market";
import { toast } from 'sonner';

/**
 * SPY Chart Component
 * Shows SPY ETF price data using candlestick chart
 */
const SPYChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1D");
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExtendedHours, setShowExtendedHours] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate current price and change
  const currentPrice = candleData.length > 0 ? candleData[candleData.length - 1].close : null;
  const openPrice = candleData.length > 0 ? candleData[0].open : null;
  const priceChange = {
    change: currentPrice && openPrice ? currentPrice - openPrice : 0,
    percentage: currentPrice && openPrice ? ((currentPrice - openPrice) / openPrice) * 100 : 0
  };
  
  // Filter extended hours data if needed
  const filteredData = React.useMemo(() => {
    if (showExtendedHours || timeFrame !== "1D") {
      return candleData;
    }
    
    // Filter to only include regular market hours (9:30 AM - 4:00 PM ET)
    return candleData.filter(candle => {
      const date = new Date(candle.timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Regular market hours: 9:30 AM - 4:00 PM ET
      return (hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16;
    });
  }, [candleData, showExtendedHours, timeFrame]);
  
  // Load data function
  const loadSPYData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure API key is initialized
      await initializeApiKey();
      
      const endDate = new Date();
      // Make sure we're using correct year (not 2025 from console logs)
      if (endDate.getFullYear() > 2024) {
        endDate.setFullYear(2024);
      }
      
      let startDate = new Date(endDate);
      let timespan = 'day';
      
      // Determine appropriate timespan and start date based on timeFrame
      switch (timeFrame) {
        case "1D":
          startDate.setDate(endDate.getDate() - 1);
          timespan = 'minute';
          break;
        case "1W":
          startDate.setDate(endDate.getDate() - 7);
          timespan = 'hour';
          break;
        case "1M":
          startDate.setMonth(endDate.getMonth() - 1);
          timespan = 'day';
          break;
        case "3M":
          startDate.setMonth(endDate.getMonth() - 3);
          timespan = 'day';
          break;
        case "6M":
          startDate.setMonth(endDate.getMonth() - 6);
          timespan = 'day';
          break;
        case "1Y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          timespan = 'day';
          break;
        case "5Y":
          startDate.setFullYear(endDate.getFullYear() - 5);
          timespan = 'week';
          break;
        case "MAX":
          startDate.setFullYear(endDate.getFullYear() - 20);
          timespan = 'month';
          break;
      }
      
      // Format dates for API
      const fromDate = startDate.toISOString().split('T')[0];
      const toDate = endDate.toISOString().split('T')[0];
      
      console.log(`Loading SPY data from ${fromDate} to ${toDate} with timespan ${timespan}`);
      
      // Fetch real data from API
      const data = await stocks.getStockCandles("SPY", timespan, fromDate, toDate);
      
      if (!data || data.length === 0) {
        console.warn('No SPY data returned from API');
        setError('No data available for the selected time period');
        setCandleData([]);
        return;
      }
      
      // Sort by timestamp ascending
      const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
      console.log(`Loaded ${sortedData.length} SPY data points`);
      
      setCandleData(sortedData);
    } catch (err) {
      console.error('Error loading SPY data:', err);
      setError('Failed to load chart data. Please try again.');
      toast.error('Error loading chart data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    loadSPYData();
  };
  
  // Handle toggle for extended hours
  const handleExtendedHoursToggle = (checked: boolean) => {
    setShowExtendedHours(checked);
  };
  
  // Load data on component mount or when timeframe changes
  useEffect(() => {
    loadSPYData();
  }, [timeFrame]);
  
  // Determine color class based on price change
  const isPositive = priceChange.change >= 0;
  const tickerClass = isPositive ? 'text-positive' : 'text-negative';
  
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
            
            {isLoading ? (
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : currentPrice ? (
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold">
                  {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-medium ${tickerClass}`}>
                  {priceChange.change >= 0 ? '+' : ''}
                  {priceChange.change.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-muted">---.--</span>
                <span className="text-sm font-medium text-muted">no data</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20 rounded-md gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-2">
            <StockCandlestickChart
              data={filteredData}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
            />
            
            {timeFrame === "1D" && (
              <div className="flex items-center justify-end space-x-2 pt-2">
                <Switch
                  id="extended-hours"
                  checked={showExtendedHours}
                  onCheckedChange={handleExtendedHoursToggle}
                />
                <Label htmlFor="extended-hours" className="text-xs">
                  Show Pre/After Market
                </Label>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
            <p className="text-muted-foreground">No data available for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(SPYChart);
