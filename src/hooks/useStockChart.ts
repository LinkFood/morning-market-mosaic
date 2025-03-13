
import { useState, useEffect, useMemo } from 'react';
import { TimeFrame } from '@/components/chart/TimeFrameSelector';
import { toast } from 'sonner';

// Type for stock chart data
export interface StockChartData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  transactions?: number;
  displayTime?: string;
  value?: number; // For compatibility with EnhancedChart
}

// Type for stock chart options
export interface StockChartOptions {
  includePreMarket: boolean;
  includeAfterHours: boolean;
  smoothing: boolean;
}

// Mock data generator for SPY
function generateMockSPYData(timeFrame: TimeFrame): StockChartData[] {
  const data: StockChartData[] = [];
  const now = new Date();
  const baseValue = 500 + Math.random() * 20;
  const trend = Math.random() > 0.5 ? 1 : -1;
  let startDate = new Date(now);
  let dataPoints = 30;
  let timeIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  // Configure based on timeframe
  switch (timeFrame) {
    case '1D':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      dataPoints = 78; // ~6.5 hours of trading in 5-min intervals
      timeIncrement = 5 * 60 * 1000; // 5 minutes
      break;
    case '1W':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      dataPoints = 7 * 12; // 7 days with 12 points per day
      timeIncrement = 60 * 60 * 1000; // 1 hour
      break;
    case '1M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      dataPoints = 30;
      timeIncrement = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '3M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      dataPoints = 90;
      timeIncrement = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '6M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      dataPoints = 180;
      timeIncrement = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1Y':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      dataPoints = 260; // ~260 trading days in a year
      timeIncrement = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '5Y':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 5);
      dataPoints = 60; // Monthly data for 5 years
      timeIncrement = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
    case 'MAX':
      startDate = new Date(2010, 0, 1);
      dataPoints = (now.getFullYear() - 2010) * 12; // Monthly since 2010
      timeIncrement = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
  }

  // Generate price data
  let currentValue = baseValue;
  let volatility = 0.5; // Base volatility

  // Adjust volatility based on timeframe
  if (timeFrame === '1D') volatility = 0.1;
  if (timeFrame === '1W') volatility = 0.2;
  if (timeFrame === '5Y' || timeFrame === 'MAX') volatility = 1.5;

  for (let i = 0; i < dataPoints; i++) {
    const timestamp = startDate.getTime() + (i * timeIncrement);
    const date = new Date(timestamp);
    
    // Skip weekends for daily data
    if (timeFrame !== '1D' && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }

    // Random price movement with trend component
    const changePercent = (Math.random() - 0.5) * volatility + (trend * 0.01);
    currentValue = currentValue * (1 + changePercent);

    // Add some noise to other values
    const open = currentValue * (1 + (Math.random() - 0.5) * 0.01);
    const close = currentValue;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

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
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000) + 500000,
      vwap: (open + high + low + close) / 4,
      displayTime,
      value: close // For compatibility with EnhancedChart
    });
  }

  // Sort by timestamp just to be safe
  return data.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Custom hook for fetching and managing stock chart data
 */
export const useStockChart = (
  symbol: string,
  timeFrame: TimeFrame,
  options: StockChartOptions = {
    includePreMarket: true,
    includeAfterHours: true,
    smoothing: false
  }
) => {
  const [chartData, setChartData] = useState<StockChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mock data when parameters change
  // In a real implementation, this would call your API service
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data
        const data = generateMockSPYData(timeFrame);
        
        // Process data for chart display
        const processedData = processChartData(data, options, timeFrame);
        setChartData(processedData);
      } catch (err) {
        console.error(`Error fetching chart data for ${symbol}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
        toast.error(`Failed to load ${symbol} chart data`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeFrame, options]);

  // Get current price from latest data point
  const currentPrice = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].close;
    }
    return null;
  }, [chartData]);

  // Calculate daily change and percentage
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { change: 0, percentage: 0 };

    const firstPoint = getOpeningPrice(chartData, timeFrame);
    const lastPoint = chartData[chartData.length - 1].close;
    
    const change = lastPoint - firstPoint;
    const percentage = (change / firstPoint) * 100;
    
    return {
      change,
      percentage
    };
  }, [chartData, timeFrame]);

  return {
    chartData,
    isLoading,
    error,
    currentPrice,
    priceChange
  };
};

/**
 * Get the appropriate opening price based on timeframe
 */
function getOpeningPrice(data: StockChartData[], timeFrame: TimeFrame): number {
  if (data.length === 0) return 0;
  
  // For 1D charts, use first price of the day
  if (timeFrame === '1D') {
    return data[0].open;
  }
  
  // For other timeframes, find the first price and check if it's valid
  const firstPoint = data[0];
  return firstPoint.open > 0 ? firstPoint.open : firstPoint.close;
}

/**
 * Process raw candle data to format needed for charts
 */
function processChartData(
  data: any[],
  options: StockChartOptions,
  timeFrame: TimeFrame
): StockChartData[] {
  // Early return for empty data
  if (!data || data.length === 0) return [];
  
  let processedData = [...data];
  
  // Filter by market hours if needed
  if (!options.includePreMarket || !options.includeAfterHours) {
    processedData = filterByMarketHours(processedData, options);
  }
  
  // Apply smoothing if enabled
  if (options.smoothing && timeFrame !== '1D' && timeFrame !== '1W') {
    processedData = smoothData(processedData);
  }
  
  return processedData;
}

/**
 * Filter data by regular market hours (9:30 AM - 4:00 PM ET)
 */
function filterByMarketHours(data: any[], options: StockChartOptions): any[] {
  return data.filter(candle => {
    const date = new Date(candle.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Convert to ET (approximation, would need proper timezone handling in production)
    const hoursET = hours; // Simplified for example
    
    // Regular market hours: 9:30 AM - 4:00 PM ET
    const isRegularHours = (hoursET > 9 || (hoursET === 9 && minutes >= 30)) && hoursET < 16;
    
    // Pre-market: 4:00 AM - 9:30 AM ET
    const isPreMarket = hoursET >= 4 && hoursET < 9.5;
    
    // After-hours: 4:00 PM - 8:00 PM ET
    const isAfterHours = hoursET >= 16 && hoursET < 20;
    
    return isRegularHours || 
           (options.includePreMarket && isPreMarket) || 
           (options.includeAfterHours && isAfterHours);
  });
}

/**
 * Apply simple smoothing to price data for cleaner charts
 */
function smoothData(data: any[]): any[] {
  if (data.length <= 2) return data;
  
  const smoothedData = [...data];
  
  for (let i = 1; i < smoothedData.length - 1; i++) {
    // Simple moving average for close price
    smoothedData[i].close = (
      data[i - 1].close + 
      data[i].close + 
      data[i + 1].close
    ) / 3;
  }
  
  return smoothedData;
}
