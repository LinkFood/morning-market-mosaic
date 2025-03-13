
/**
 * Market status service
 * Provides information about market open/close status
 */
import { MarketStatus } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

// Check if market is open or closed
async function getMarketStatus(): Promise<MarketStatus> {
  return cacheUtils.fetchWithCache("market_status", async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market status, returning mock data");
        // Generate mock market status based on current time
        const now = new Date();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        const hour = now.getHours();
        const isMarketHours = hour >= 9 && hour < 16;
        
        return {
          market: "stocks",
          serverTime: now.toISOString(),
          exchanges: {
            nyse: isWeekend ? "closed" : (isMarketHours ? "open" : "closed"),
            nasdaq: isWeekend ? "closed" : (isMarketHours ? "open" : "closed"),
          },
          isOpen: !isWeekend && isMarketHours,
          nextOpeningTime: isWeekend 
            ? null 
            : (isMarketHours ? null : new Date(now.setHours(9, 30, 0, 0)).toISOString())
        };
      }
      
      // Get actual market status from polygon
      const status = await polygonService.getMarketStatus();
      return status;
    } catch (error) {
      console.error("Error fetching market status:", error);
      // Fallback mock status
      const now = new Date();
      return {
        market: "stocks",
        serverTime: now.toISOString(),
        exchanges: { nyse: "unknown", nasdaq: "unknown" },
        isOpen: false,
        nextOpeningTime: null
      };
    }
  });
}

export default {
  getMarketStatus
};
