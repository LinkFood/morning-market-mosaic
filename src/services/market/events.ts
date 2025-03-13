
import { MarketEvent } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";

// Get economic calendar/events
async function getMarketEvents(): Promise<MarketEvent[]> {
  return cacheUtils.fetchWithCache("market_events", async () => {
    // This would typically come from a real API
    // For demo purposes, we'll return mock data
    return mockData.MOCK_EVENTS_DATA;
  });
}

export default {
  getMarketEvents
};
