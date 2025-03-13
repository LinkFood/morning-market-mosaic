
import { useState, useEffect, useMemo } from 'react';
import { getAggregates } from '@/services/polygon/historical';
import { TimeFrame } from '@/components/chart/TimeFrameSelector';

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

  // Calculate time parameters based on timeFrame
  const { multiplier, timespan, startDate, endDate } = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    let mult = 1;
    let span = 'day';

    // Set appropriate time range and interval based on timeFrame
    switch (timeFrame) {
      case '1D':
        start.setDate(now.getDate() - 1);
        mult = 5;
        span = 'minute';
        break;
      case '1W':
        start.setDate(now.getDate() - 7);
        mult = 30;
        span = 'minute';
        break;
      case '1M':
        start.setMonth(now.getMonth() - 1);
        mult = 1;
        span = 'hour';
        break;
      case '3M':
        start.setMonth(now.getMonth() - 3);
        mult = 1;
        span = 'day';
        break;
      case '6M':
        start.setMonth(now.getMonth() - 6);
        mult = 1;
        span = 'day';
        break;
      case '1Y':
        start.setFullYear(now.getFullYear() - 1);
        mult = 1;
        span = 'day';
        break;
      case '5Y':
        start.setFullYear(now.getFullYear() - 5);
        mult = 1;
        span = 'week';
        break;
      case 'MAX':
        start = new Date(2000, 0, 1); // Start from year 2000
        mult = 1;
        span = 'month';
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }

    return {
      multiplier: mult,
      timespan: span,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [timeFrame]);

  // Fetch data when parameters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get candle data from API
        const data = await getAggregates(
          symbol,
          multiplier,
          timespan,
          startDate,
          endDate,
          true, // adjusted
          20000, // limit
          false // include OTC
        );

        // Process data for chart display
        const processedData = processChartData(data, options, timeFrame);
        setChartData(processedData);
      } catch (err) {
        console.error(`Error fetching chart data for ${symbol}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeFrame, multiplier, timespan, startDate, endDate, options]);

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
  
  // Add additional display properties
  return processedData.map(candle => {
    const date = new Date(candle.timestamp);
    
    // Format time display based on timeFrame
    let displayTime = '';
    if (timeFrame === '1D' || timeFrame === '1W') {
      displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeFrame === '1M' || timeFrame === '3M') {
      displayTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      displayTime = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
    
    return {
      ...candle,
      displayTime,
      value: candle.close // For compatibility with EnhancedChart
    };
  });
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
