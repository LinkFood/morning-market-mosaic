
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EnhancedChart from "@/components/chart/EnhancedChart";
import { TimeFrame } from "@/components/chart/TimeFrameSelector";
import { useStockChart } from "@/hooks/useStockChart";

/**
 * SPY Chart Component
 * Shows SPY ETF price data with pre/after market hours toggle
 */
const SPYChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [showExtendedHours, setShowExtendedHours] = useState(true);
  
  // Use the stock chart hook instead of manually generating data
  const {
    chartData,
    isLoading,
    currentPrice,
    priceChange
  } = useStockChart('SPY', timeFrame, {
    includePreMarket: showExtendedHours,
    includeAfterHours: showExtendedHours,
    smoothing: false
  });
  
  // Handle toggle for pre/after market data
  const handleExtendedHoursToggle = (checked: boolean) => {
    setShowExtendedHours(checked);
  };
  
  // Determine color class based on price change
  const isPositive = priceChange?.change >= 0;
  const tickerClass = isPositive ? 'text-positive' : 'text-negative';
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">SPY</CardTitle>
            <CardDescription>SPDR S&P 500 ETF Trust</CardDescription>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold">
                {currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${tickerClass}`}>
                {priceChange?.change >= 0 ? '+' : ''}
                {priceChange?.change.toFixed(2)} ({priceChange?.percentage.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : (
          <div className="space-y-2">
            <EnhancedChart
              data={chartData}
              height={300}
              dataKeys={["value"]}
              xAxisKey="date"
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
            />
            
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SPYChart;
