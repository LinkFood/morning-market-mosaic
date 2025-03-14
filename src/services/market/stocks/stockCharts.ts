/**
 * Stock Charts Service
 * Historical price data and candlestick charts
 */
import cacheUtils from "../cacheUtils";
import { getPolygonApiKey } from "../config";
import { CandleData } from "@/types/marketTypes";
import { TimeFrame } from "@/components/chart/TimeFrameSelector";
import { generateMockSPYData } from "@/services/mockdata/spyData";
import { getAggregates } from "@/services/polygon/historical/aggregates";

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
      // Map timeframe to Polygon parameters
      const { multiplier, timespan } = mapTimeframeToParams(timeframe);
      
      console.log(`Requesting candle data for ${ticker} from Polygon API`);
      // Use direct import from the historical module
      const data = await getAggregates(ticker, multiplier, timespan, fromDate, toDate);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`No data returned for ${ticker} candles`);
        
        // Fallback to mock data for SPY if real data fails
        if (ticker === "SPY") {
          console.log("Falling back to enhanced SPY mock data");
          const timeFrameMap: Record<string, TimeFrame> = {
            "minute": "1D",
            "hour": "1W",
            "day": "1M",
            "week": "1Y",
            "month": "5Y"
          };
          
          return generateMockSPYData(timeFrameMap[timespan] || "1M");
        }
        
        return [] as CandleData[];
      }
      
      // Data is already in the correct format from getAggregates
      return data;
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
      return [] as CandleData[];
    }
  });
}

// Map timeframe string to Polygon parameters
function mapTimeframeToParams(timeframe: string): { multiplier: number; timespan: string } {
  switch (timeframe) {
    case 'minute':
      return { multiplier: 1, timespan: 'minute' };
    case '5min':
      return { multiplier: 5, timespan: 'minute' };
    case '15min':
      return { multiplier: 15, timespan: 'minute' };
    case '30min':
      return { multiplier: 30, timespan: 'minute' };
    case 'hour':
      return { multiplier: 1, timespan: 'hour' };
    case '4hour':
      return { multiplier: 4, timespan: 'hour' };
    case 'day':
      return { multiplier: 1, timespan: 'day' };
    case 'week':
      return { multiplier: 1, timespan: 'week' };
    case 'month':
      return { multiplier: 1, timespan: 'month' };
    default:
      return { multiplier: 1, timespan: 'day' };
  }
}

export default {
  getStockCandles
};
