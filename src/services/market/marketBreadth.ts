
/**
 * Market breadth service
 * Provides market breadth information (advancers, decliners, etc.)
 */
import { MarketBreadthData } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

// Mock market breadth data
const MOCK_MARKET_BREADTH: MarketBreadthData = {
  advancers: 250,
  decliners: 180,
  unchanged: 70,
  newHighs: 15,
  newLows: 8,
  timestamp: new Date().toISOString()
};

// Get current market breadth data
async function getMarketBreadth(): Promise<MarketBreadthData> {
  return cacheUtils.fetchWithCache("market_breadth", async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market breadth, returning mock data");
        return MOCK_MARKET_BREADTH;
      }
      
      // Get market breadth from Polygon
      const breadthData = await polygonService.getMarketBreadth();
      
      return breadthData;
    } catch (error) {
      console.error("Error fetching market breadth:", error);
      // Return mock data as fallback
      return MOCK_MARKET_BREADTH;
    }
  });
}

export default {
  getMarketBreadth
};
