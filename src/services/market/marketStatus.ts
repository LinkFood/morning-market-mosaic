
/**
 * Market Status Service
 * Provides information about current market status (open/closed)
 */
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { MarketStatus } from "@/types/marketTypes";
import { polygonRequest } from "../polygon/client";

// Get current market status (open/closed)
async function getMarketStatus(): Promise<MarketStatus> {
  return cacheUtils.fetchWithCache("market_status", async () => {
    try {
      // Direct API call to avoid circular dependency
      const status = await polygonRequest("/v1/marketstatus/now");
      
      // Transform to our MarketStatus type
      const marketStatus: MarketStatus = {
        market: status.market || "closed",
        serverTime: status.timestamp || new Date().toISOString(),
        exchanges: status.exchanges || {},
        isOpen: !!status.market && status.market.toLowerCase() === "open",
        nextOpeningTime: status.nextOpeningTime || null
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
