
import { useEffect } from 'react';
import { CandleData } from '@/types/marketTypes';
import { stocks } from '@/services/market';
import { TimeFrame } from '@/components/chart/TimeFrameSelector';
import { toast } from 'sonner';

export const useCandleData = (
  ticker: string, 
  timeFrame: TimeFrame,
  setCandleData: (data: CandleData[]) => void
) => {
  const loadCandleData = async (ticker: string, timeFrame: TimeFrame) => {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case "1D":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "1W":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "1M":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "3M":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "6M":
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case "5Y":
          startDate.setFullYear(endDate.getFullYear() - 5);
          break;
        case "MAX":
          startDate.setFullYear(endDate.getFullYear() - 10);
          break;
      }
      
      const fromDate = startDate.toISOString().split('T')[0];
      const toDate = endDate.toISOString().split('T')[0];
      
      let timespan = 'day';
      if (timeFrame === "1D") {
        timespan = 'minute';
      } else if (timeFrame === "1W") {
        timespan = 'hour';
      }
      
      const candles = await stocks.getStockCandles(ticker, timespan, fromDate, toDate);
      setCandleData(candles);
    } catch (err) {
      console.error('Error loading candle data:', err);
      toast.error('Failed to load chart data');
    }
  };
  
  useEffect(() => {
    if (ticker) {
      loadCandleData(ticker, timeFrame);
    }
  }, [timeFrame, ticker]);

  return { loadCandleData };
};
