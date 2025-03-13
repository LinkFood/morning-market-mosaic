
/**
 * Stock Charts Service
 * Historical price data and candlestick charts
 */
import cacheUtils from "../cacheUtils";
import mockData from "../mockData";
import { getPolygonApiKey } from "../config";
import polygonService from "../../polygon";
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
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();

      // Get candle data from Polygon
      console.log(`Requesting candle data for ${ticker} from Polygon API`);
      return await polygonService.historical.getStockCandles(ticker, timeframe, fromDate, toDate);
    } catch (error) {
      console.error(`Error fetching candles for ${ticker}:`, error);
      
      // If we can't get real data, return empty array instead of mock data
      // so the UI can properly handle the error state
      return [];
    }
  }, 60 * 5); // Cache for 5 minutes to avoid excessive API calls
}

export default {
  getStockCandles
};
