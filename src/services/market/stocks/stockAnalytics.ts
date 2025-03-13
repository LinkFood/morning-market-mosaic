
/**
 * Stock Analytics Service
 * Analytics and metrics for stocks
 */
import cacheUtils from "../cacheUtils";
import mockData from "../mockData";
import { getPolygonApiKey } from "../config";
import polygonService from "../../polygon";

// Get 52-week high and low for a stock
async function get52WeekHighLow(ticker: string): Promise<{ high: number; low: number }> {
  return cacheUtils.fetchWithCache(`stock_52week_${ticker}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for 52-week high/low, returning mock data");
        // Return mock data
        return {
          high: 200 + Math.random() * 50,
          low: 100 - Math.random() * 50
        };
      }
      
      // Get end date (today) and start date (1 year ago)
      const now = new Date();
      const yearAgo = new Date();
      yearAgo.setFullYear(now.getFullYear() - 1);
      
      const fromDate = yearAgo.toISOString().split('T')[0];
      const toDate = now.toISOString().split('T')[0];
      
      // Get candle data for the ticker
      const candles = await polygonService.getAggregates(
        ticker,
        1,
        "day",
        fromDate,
        toDate
      );
      
      // Calculate high and low
      const high = Math.max(...candles.map(candle => candle.high));
      const low = Math.min(...candles.map(candle => candle.low));
      
      return { high, low };
    } catch (error) {
      console.error(`Error fetching 52-week high/low for ${ticker}:`, error);
      // Return mock data as fallback
      return {
        high: 200,
        low: 100
      };
    }
  });
}

export default {
  get52WeekHighLow
};
