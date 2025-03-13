
/**
 * Market status service
 * Provides current market status information
 */
import { MarketStatus } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

// Define mock market status data to fix the missing MOCK_MARKET_STATUS error
const MOCK_MARKET_STATUS: MarketStatus = {
  market: "us_equity",
  serverTime: new Date().toISOString(),
  exchanges: {
    nasdaq: "open",
    nyse: "open"
  },
  isOpen: true,
  nextOpeningTime: null
};

// Get current market status (open/closed)
async function getMarketStatus(): Promise<MarketStatus> {
  return cacheUtils.fetchWithCache("market_status", async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market status, returning mock data");
        return MOCK_MARKET_STATUS;
      }
      
      // Get market status from Polygon
      const status = await polygonService.getMarketStatus();
      
      // Properly type cast the response to fix TypeScript errors
      return {
        market: "us_equity",
        serverTime: new Date().toISOString(),
        exchanges: status.exchanges || {},
        isOpen: !!status.isOpen,
        nextOpeningTime: status.nextOpeningTime || null
      };
    } catch (error) {
      console.error("Error fetching market status:", error);
      // Return mock data as fallback
      return MOCK_MARKET_STATUS;
    }
  });
}

export default {
  getMarketStatus
};
