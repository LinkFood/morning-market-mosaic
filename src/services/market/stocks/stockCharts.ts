
/**
 * Stock Charts Service
 * Historical price data and candlestick charts
 */
import cacheUtils from "../cacheUtils";
import { getPolygonApiKey } from "../config";
import { getStockCandles as polygonGetStockCandles } from "../../polygon/historical";
import { CandleData } from "@/types/marketTypes";

// Get candlestick data for charts
async function getStockCandles(
  ticker: string,
  timeframe: string = "day",
  fromDate: string,
  toDate: string
): Promise<CandleData[]> {
  const cacheKey = `stock_candles_${ticker}_${timeframe}_${fromDate}_${toDate}`;
  
  return cacheUtils.fetchWithCache(cacheKey, async () => {
    try {
      // Get API key from config (not used here but initializes the key)
      await getPolygonApiKey();
      
      // Request candle data from API with direct call to Polygon service
      console.log(`Requesting ${ticker} candle data for ${timeframe} from ${fromDate} to ${toDate}`);
      
      // Make the request with proper error handling
      try {
        const candles = await polygonGetStockCandles(ticker, timeframe, fromDate, toDate);
        
        if (!candles || candles.length === 0) {
          console.warn(`No data returned for ${ticker}`);
          return [];
        }
        
        console.log(`Received ${candles.length} candles for ${ticker}`);
        return candles;
      } catch (apiError) {
        console.error(`API error for ${ticker}:`, apiError);
        throw apiError;
      }
    } catch (error) {
      console.error(`Error fetching candles for ${ticker}:`, error);
      
      // Generate empty array on error - UI should handle this
      return [];
    }
  });
}

export default {
  getStockCandles
};
