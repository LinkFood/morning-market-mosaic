import { useState, useEffect, useMemo, useRef } from 'react';
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
  const lastFetchRef = useRef<number>(0);
  
  // Cache for mock data to prevent regeneration
  const mockDataCache = useRef<Record<string, StockChartData[]>>({});
  
  // Only fetch data when parameters that affect the query change
  // This prevents unnecessary data fetches during renders
  const fetchKey = useMemo(() => {
    return `${symbol}_${timeFrame}_${options.includePreMarket}_${options.includeAfterHours}_${options.smoothing}`;
  }, [symbol, timeFrame, options.includePreMarket, options.includeAfterHours, options.smoothing]);

  // Fetch mock data when parameters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Throttle fetches to avoid UI flickering
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchRef.current;
        
        // If we fetched less than 500ms ago, delay this fetch
        if (timeSinceLastFetch < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastFetch));
        }
        
        lastFetchRef.current = Date.now();
        
        // Check cache first
        if (mockDataCache.current[fetchKey]) {
          setChartData(mockDataCache.current[fetchKey]);
          setIsLoading(false);
          return;
        }
        
        // Simulate API delay (reduced to minimize flickering)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate mock data
        const data = generateMockSPYData(timeFrame);
        
        // Process data for chart display
        const processedData = processChartData(data, options, timeFrame);
        
        // Store in cache
        mockDataCache.current[fetchKey] = processedData;
        
        // Update state
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
    
    // Cleanup function
    return () => {
      // If we have too many cache entries, clear some older ones
      if (Object.keys(mockDataCache.current).length > 20) {
        mockDataCache.current = {};
      }
    };
  }, [fetchKey, symbol, timeFrame]);

  // Get current price from latest data point with memoization
  const currentPrice = useMemo(() => {
    if (chartData.length > 0) {
      return chartData[chartData.length - 1].close;
    }
    return null;
  }, [chartData]);

  // Calculate daily change and percentage with memoization
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

  // Ensure value property is set for EnhancedChart compatibility
  processedData = processedData.map(item => ({
    ...item,
    value: item.close
  }));
  
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

// Mock data generator for SPY - stabilized for less flickering
function generateMockSPYData(timeFrame: TimeFrame): StockChartData[] {
  const data: StockChartData[] = [];
  const now = new Date();
  
  // Use a stable seed for base value based on the day
  const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const baseValue = 500 + pseudoRandom(dateSeed) * 20;
  
  // Determine trend more consistently
  const trendSeed = Math.floor(dateSeed / 7);
  const trend = pseudoRandom(trendSeed) > 0.5 ? 1 : -1;
  
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

  // Generate price data with consistent volatility
  let currentValue = baseValue;
  let volatility = 0.5; // Base volatility

  // Adjust volatility based on timeframe
  if (timeFrame === '1D') volatility = 0.1;
  if (timeFrame === '1W') volatility = 0.2;
  if (timeFrame === '5Y' || timeFrame === 'MAX') volatility = 1.5;

  // Use a more stable random generator with seed based on index
  const stableRandom = (index: number, offset = 0) => {
    return pseudoRandom(dateSeed + index + offset);
  };

  for (let i = 0; i < dataPoints; i++) {
    const timestamp = startDate.getTime() + (i * timeIncrement);
    const date = new Date(timestamp);
    
    // Skip weekends for daily data
    if (timeFrame !== '1D' && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }

    // Random price movement with trend component
    const changePercent = (stableRandom(i, 1) - 0.5) * volatility + (trend * 0.01);
    currentValue = currentValue * (1 + changePercent);

    // Add some noise to other values
    const open = currentValue * (1 + (stableRandom(i, 2) - 0.5) * 0.01);
    const close = currentValue;
    const high = Math.max(open, close) * (1 + stableRandom(i, 3) * 0.01);
    const low = Math.min(open, close) * (1 - stableRandom(i, 4) * 0.01);

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
      volume: Math.floor(stableRandom(i, 5) * 10000000) + 500000,
      vwap: (open + high + low + close) / 4,
      displayTime,
      value: close // For compatibility with EnhancedChart
    });
  }

  // Sort by timestamp just to be safe
  return data.sort((a, b) => a.timestamp - b.timestamp);
}
