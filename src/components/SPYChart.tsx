
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EnhancedChart from "@/components/chart/EnhancedChart";
import { TimeFrame } from "@/components/chart/TimeFrameSelector";

/**
 * SPY Chart Component
 * Shows SPY ETF price data with pre/after market hours toggle
 */
const SPYChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [showExtendedHours, setShowExtendedHours] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Current price and change info
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState({ change: 0, percentage: 0 });
  
  // Generate SPY data on component mount and when timeframe changes
  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      // Generate the mock data
      const mockData = generateMockSPYData(timeFrame, showExtendedHours);
      setChartData(mockData);
      
      // Set current price from latest data point
      if (mockData.length > 0) {
        setCurrentPrice(mockData[mockData.length - 1].value);
        
        // Calculate price change
        const startPrice = mockData[0].value;
        const endPrice = mockData[mockData.length - 1].value;
        const change = endPrice - startPrice;
        const percentage = (change / startPrice) * 100;
        
        setPriceChange({
          change,
          percentage
        });
      }
      
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [timeFrame, showExtendedHours]);
  
  // Handle toggle for pre/after market data
  const handleExtendedHoursToggle = (checked: boolean) => {
    setShowExtendedHours(checked);
  };
  
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

// Helper function to generate mock SPY data
function generateMockSPYData(timeFrame: TimeFrame, includeExtendedHours: boolean): any[] {
  const data: any[] = [];
  const now = new Date();
  const baseValue = 500 + Math.random() * 20; // SPY typically trades around $500
  const volatility = 0.5; // Base volatility
  const trend = Math.random() > 0.5 ? 0.1 : -0.1; // Slight trend bias
  
  let startDate = new Date(now);
  let dataPoints = 30;
  let interval = 24 * 60 * 60 * 1000; // 1 day in ms
  
  // Configure data generation based on timeframe
  switch (timeFrame) {
    case '1D':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      dataPoints = 78; // ~6.5 hours of trading in 5-min intervals
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case '1W':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      dataPoints = 7 * 8; // 7 days with 8 points per day
      interval = 3 * 60 * 60 * 1000; // 3 hours
      break;
    case '1M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      dataPoints = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '3M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      dataPoints = 60;
      interval = 36 * 60 * 60 * 1000; // 1.5 days
      break;
    case '6M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      dataPoints = 120;
      interval = 36 * 60 * 60 * 1000; // 1.5 days
      break;
    case '1Y':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      dataPoints = 252; // ~252 trading days in a year
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '5Y':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 5);
      dataPoints = 60; // Monthly data for 5 years
      interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
    case 'MAX':
      startDate = new Date(2010, 0, 1);
      dataPoints = (now.getFullYear() - 2010) * 12; // Monthly since 2010
      interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
  }
  
  // Generate the data points
  let currentValue = baseValue;
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = startDate.getTime() + (i * interval);
    const date = new Date(timestamp);
    
    // Skip weekends for daily data (except for 1D timeframe)
    if (timeFrame !== '1D' && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }
    
    // Get hour to determine if it's pre-market, regular hours, or after-hours
    const hour = date.getHours();
    const isRegularHours = hour >= 9 && hour < 16;
    const isPreMarket = hour >= 4 && hour < 9;
    const isAfterHours = hour >= 16 && hour < 20;
    
    // Skip extended hours data if not requested
    if (!includeExtendedHours && !isRegularHours) {
      continue;
    }
    
    // Generate price movement with trend bias and volatility
    // More volatility in extended hours, less during regular
    let moveVolatility = volatility;
    if (isPreMarket) moveVolatility *= 1.5;
    if (isAfterHours) moveVolatility *= 1.3;
    
    const move = ((Math.random() * 2) - 1) * moveVolatility; // Random between -vol and +vol
    currentValue = currentValue * (1 + move/100 + trend/100);
    
    // Format time display based on timeFrame
    let displayTime = '';
    if (timeFrame === '1D') {
      displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeFrame === '1W' || timeFrame === '1M') {
      displayTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      displayTime = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
    
    data.push({
      timestamp,
      date: date.toISOString(),
      value: currentValue,
      displayTime
    });
  }
  
  return data.sort((a, b) => a.timestamp - b.timestamp);
}

export default SPYChart;
