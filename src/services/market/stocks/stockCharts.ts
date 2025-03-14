
/**
 * Stock Charts Service
 * Historical price data and candlestick charts
 */
import cacheUtils from "../cacheUtils";
import mockData from "../mockData";
import { getPolygonApiKey } from "../config";
import polygonService from "../../polygon";

// Get candlestick data for charts
async function getStockCandles(
  ticker: string,
  timeframe: string = "day",
  fromDate: string,
  toDate: string
): Promise<any[]> {
  const cacheKey = `stock_candles_${ticker}_${timeframe}_${fromDate}_${toDate}`;
  
  return cacheUtils.fetchWithCache(cacheKey, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for candle data, returning mock data");
        // Generate mock candle data
        const days = Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
        const mockCandles = [];
        
        let basePrice = 100 + Math.random() * 100;
        const startDate = new Date(fromDate);
        
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          // Skip weekends
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          
          const change = (Math.random() - 0.5) * 5;
          const open = basePrice;
          const close = basePrice + change;
          basePrice = close;
          
          mockCandles.push({
            date: date.toISOString().split("T")[0],
            timestamp: date.getTime(),
            open,
            high: Math.max(open, close) + Math.random() * 2,
            low: Math.min(open, close) - Math.random() * 2,
            close,
            volume: Math.floor(Math.random() * 10000000)
          });
        }
        
        return mockCandles;
      }
      
      // Get candle data from Polygon
      return await polygonService.getAggregates(ticker, 1, timeframe, fromDate, toDate);
    } catch (error) {
      console.error(`Error fetching candles for ${ticker}:`, error);
      // Return empty array as fallback
      return [];
    }
  });
}

export default {
  getStockCandles
};
