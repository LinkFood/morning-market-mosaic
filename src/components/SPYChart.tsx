
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EnhancedChart from "@/components/chart/EnhancedChart";
import { TimeFrame } from "@/components/chart/TimeFrameSelector";
import { useStockChart, StockChartOptions } from '@/hooks/useStockChart';

/**
 * SPY Chart Component
 * Specialized component showing the SPY ETF chart with pre/after market data
 */
const SPYChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [chartOptions, setChartOptions] = useState<StockChartOptions>({
    includePreMarket: true,
    includeAfterHours: true,
    smoothing: false
  });
  
  // Use our custom hook to fetch chart data
  const { chartData, isLoading, error, currentPrice, priceChange } = useStockChart(
    'SPY',
    timeFrame,
    chartOptions
  );
  
  // Handle toggle for pre/after market data
  const handleExtendedHoursToggle = (checked: boolean) => {
    setChartOptions(prev => ({
      ...prev,
      includePreMarket: checked,
      includeAfterHours: checked
    }));
  };
  
  // Determine color based on price change
  const isPositive = priceChange.change >= 0;
  const tickerClass = isPositive ? 'text-green-500' : 'text-red-500';
  
  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
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
          ) : error ? (
            <div className="text-right">
              <span className="text-red-500">Error loading data</span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold">
                {currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${tickerClass}`}>
                {priceChange.change >= 0 ? '+' : ''}
                {priceChange.change.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] w-full bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Failed to load chart data</p>
          </div>
        ) : (
          <div className="space-y-2">
            <EnhancedChart
              data={chartData}
              height={300}
              dataKeys={["close"]}
              xAxisKey="date"
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
            />
            
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Switch
                id="extended-hours"
                checked={chartOptions.includePreMarket && chartOptions.includeAfterHours}
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
