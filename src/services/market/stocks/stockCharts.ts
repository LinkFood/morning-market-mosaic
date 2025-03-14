
/**
 * Stock Charts Service
 * Historical price data and candlestick charts
 */
import cacheUtils from "../cacheUtils";
import { getPolygonApiKey } from "../config";
import polygonService from "../../polygon";
import { CandleData } from "@/types/marketTypes";
import { generateMockSPYData } from "@/services/mockdata/spyData";
import { TimeFrame } from "@/components/chart/TimeFrameSelector";

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
      // Special case for SPY - use mock data if needed
      if (ticker === "SPY") {
        console.log("Using enhanced SPY data");
        // Convert timeframe to TimeFrame enum type
        const timeFrameMap: Record<string, TimeFrame> = {
          "minute": "1D",
          "hour": "1W",
          "day": "1M",
          "week": "1Y",
          "month": "5Y"
        };
        
        // Use built-in mock data for SPY
        return generateMockSPYData(timeFrameMap[timeframe] || "1M");
      }
      
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();

      // Get candle data from Polygon
      console.log(`Requesting candle data for ${ticker} from Polygon API`);
      return await polygonService.historical.getStockCandles(ticker, timeframe, fromDate, toDate);
    } catch (error) {
      console.error(`Error fetching candles for ${ticker}:`, error);
      
      // If we can't get real data and it's SPY, return mock data
      if (ticker === "SPY") {
        console.log("Falling back to enhanced SPY mock data");
        // Convert timeframe to TimeFrame enum type
        const timeFrameMap: Record<string, TimeFrame> = {
          "minute": "1D",
          "hour": "1W",
          "day": "1M",
          "week": "1Y",
          "month": "5Y"
        };
        
        return generateMockSPYData(timeFrameMap[timeframe] || "1M");
      }
      
      // Otherwise return empty array
      return [];
    }
  }, 60 * 5); // Cache for 5 minutes to avoid excessive API calls
}

export default {
  getStockCandles
};
