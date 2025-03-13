
/**
 * Market Status Service
 * Provides information about current market status (open/closed)
 */
import marketService from ".";
import polygonService from "../polygon";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { MarketStatus } from "@/types/marketTypes";

// Get current market status (open/closed)
async function getMarketStatus(): Promise<MarketStatus> {
  return cacheUtils.fetchWithCache("market_status", async () => {
    try {
      // Get API key from config
      const status = await polygonService.getMarketStatus();
      
      // Add type assertion to help TypeScript understand the structure
      const statusData = status as any;
      
      // Transform to our MarketStatus type
      const marketStatus: MarketStatus = {
        market: statusData.market || "closed",
        serverTime: statusData.serverTime || new Date().toISOString(),
        exchanges: statusData.exchanges || {},
        isOpen: statusData.isOpen || false,
        nextOpeningTime: statusData.nextOpeningTime || null
      };
      
      return marketStatus;
    } catch (error) {
      console.error("Error fetching market status:", error);
      return mockData.MOCK_MARKET_STATUS as MarketStatus;
    }
  });
}

// Check if market is currently open
async function isMarketOpen(): Promise<boolean> {
  try {
    const status = await getMarketStatus();
    return status.isOpen;
  } catch (error) {
    console.error("Error checking if market is open:", error);
    return false;
  }
}

// Get formatted next market opening time
async function getNextMarketOpeningTime(): Promise<string | null> {
  try {
    const status = await getMarketStatus();
    return status.nextOpeningTime;
  } catch (error) {
    console.error("Error getting next market opening time:", error);
    return null;
  }
}

export default {
  getMarketStatus,
  isMarketOpen,
  getNextMarketOpeningTime
};
