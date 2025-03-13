
import { useState, useEffect } from 'react';
import { TickerDetails, StockData, MarketStatus, CandleData } from '@/types/marketTypes';
import { stocks, marketStatus } from '@/services/market';
import { TimeFrame } from '@/components/chart/TimeFrameSelector';
import { toast } from 'sonner';

export const useStockData = (ticker: string) => {
  const [stockDetails, setStockDetails] = useState<TickerDetails | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [weekHighLow, setWeekHighLow] = useState<{ high: number; low: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState<MarketStatus | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const loadStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const marketStatusData = await marketStatus.getMarketStatus();
        setMarket(marketStatusData);
        
        const majorStocks = await stocks.getMajorStocks([ticker]);
        if (majorStocks && majorStocks.length > 0) {
          setStockData(majorStocks[0]);
        }
        
        const highLowData = await stocks.get52WeekHighLow(ticker);
        setWeekHighLow(highLowData);
        
        const details = await stocks.getStockDetails(ticker);
        setStockDetails(details);
      } catch (err) {
        console.error('Error loading stock data:', err);
        setError('Failed to load stock data. Please try again.');
        toast.error('Failed to load stock data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStockData();
  }, [ticker]);

  return {
    stockDetails,
    stockData,
    candleData,
    setCandleData,
    weekHighLow,
    isLoading,
    error,
    market
  };
};
