
import { useState, useEffect, useCallback } from 'react';
import { CandleData } from '@/types/marketTypes';
import { stocks } from '@/services/market';
import { TimeFrame } from '@/components/chart/TimeFrameSelector';
import { toast } from 'sonner';

export const useCandleData = (
  ticker: string, 
  timeFrame: TimeFrame,
  setCandleData: (data: CandleData[]) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadCandleData = useCallback(async (ticker: string, timeFrame: TimeFrame) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endDate = new Date();
      let startDate = new Date();
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
          startDate.setFullYear(endDate.getFullYear() - 20); // Maximum historical data
          timespan = 'month';
          break;
      }
      
      // Format dates for API
      const fromDate = startDate.toISOString().split('T')[0];
      const toDate = endDate.toISOString().split('T')[0];
      
      // Request candle data from API
      console.log(`Fetching ${ticker} data from ${fromDate} to ${toDate} with timespan ${timespan}`);
      const candles = await stocks.getStockCandles(ticker, timespan, fromDate, toDate);
      
      // Ensure data is sorted by timestamp
      const sortedCandles = [...candles].sort((a, b) => a.timestamp - b.timestamp);
      
      // Update state with candle data
      setCandleData(sortedCandles);
      return sortedCandles;
    } catch (err) {
      console.error('Error loading candle data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load chart data'));
      toast.error('Failed to load chart data');
      setCandleData([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setCandleData]);
  
  useEffect(() => {
    if (ticker) {
      loadCandleData(ticker, timeFrame);
    }
  }, [timeFrame, ticker, loadCandleData]);

  return { loadCandleData, isLoading, error };
};
