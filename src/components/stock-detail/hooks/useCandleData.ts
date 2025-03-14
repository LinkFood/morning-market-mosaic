
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
  const [lastRequestTimestamp, setLastRequestTimestamp] = useState(0);
  const [requestInProgress, setRequestInProgress] = useState(false);
  
  const loadCandleData = useCallback(async (ticker: string, timeFrame: TimeFrame) => {
    // Prevent duplicate requests within a short time period
    const now = Date.now();
    if (now - lastRequestTimestamp < 500) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Prevent multiple concurrent requests for the same data
    if (requestInProgress) {
      console.log('Request already in progress, skipping duplicate request');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    setLastRequestTimestamp(now);
    setRequestInProgress(true);
    
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
      
      console.log(`Fetching ${ticker} data from ${fromDate} to ${toDate} with timespan ${timespan}`);
      
      // Request candle data from API with retry logic
      let retryCount = 0;
      let candles: CandleData[] = [];
      
      while (retryCount < 3) {
        try {
          candles = await stocks.getStockCandles(ticker, timespan, fromDate, toDate);
          if (candles && candles.length > 0) {
            break; // Successful request with data
          }
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        } catch (err) {
          console.warn(`Retry ${retryCount + 1} failed for ${ticker} candle data`);
          retryCount++;
          if (retryCount >= 3) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      if (!candles || candles.length === 0) {
        console.warn(`No candle data returned for ${ticker}`);
        setCandleData([]);
        return [];
      }
      
      // Ensure data is sorted by timestamp
      const sortedCandles = [...candles].sort((a, b) => a.timestamp - b.timestamp);
      
      // Update state with candle data
      setCandleData(sortedCandles);
      return sortedCandles;
    } catch (err) {
      console.error('Error loading candle data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load chart data'));
      setCandleData([]);
      return [];
    } finally {
      setIsLoading(false);
      setRequestInProgress(false);
    }
  }, [setCandleData, lastRequestTimestamp, requestInProgress]);
  
  useEffect(() => {
    if (ticker) {
      loadCandleData(ticker, timeFrame);
    }
  }, [timeFrame, ticker, loadCandleData]);

  return { loadCandleData, isLoading, error };
};
