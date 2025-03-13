
/**
 * Market status service
 * Provides current market status information
 */
import { MarketStatus } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

// Get current market status (open/closed)
async function getMarketStatus(): Promise<MarketStatus> {
  return cacheUtils.fetchWithCache("market_status", async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market status, returning mock data");
        return mockData.MOCK_MARKET_STATUS;
      }
      
      // Get market status from Polygon
      const status = await polygonService.getMarketStatus();
      
      return {
        market: "us_equity",
        serverTime: new Date().toISOString(),
        exchanges: status.exchanges || {},
        isOpen: status.isOpen || false,
        nextOpeningTime: status.nextOpeningTime || null
      };
    } catch (error) {
      console.error("Error fetching market status:", error);
      // Return mock data as fallback
      return mockData.MOCK_MARKET_STATUS;
    }
  });
}

export default {
  getMarketStatus
};
