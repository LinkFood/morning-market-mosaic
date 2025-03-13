
/**
 * Market events service
 * Provides upcoming market events data
 */
import { MarketEvent } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";

// Mock data for market events
const MOCK_EVENTS: MarketEvent[] = [
  {
    type: "earnings",
    title: "AAPL Earnings",
    date: "2023-10-31",
    time: "16:30",
    importance: "high"
  },
  {
    type: "economic",
    title: "Fed Interest Rate Decision",
    date: "2023-11-01",
    time: "14:00",
    importance: "high"
  },
  {
    type: "economic",
    title: "Unemployment Report",
    date: "2023-11-03",
    time: "08:30",
    importance: "medium"
  },
  {
    type: "earnings",
    title: "MSFT Earnings",
    date: "2023-11-04",
    time: "16:30",
    importance: "high"
  },
  {
    type: "economic",
    title: "GDP Report",
    date: "2023-11-10",
    time: "08:30",
    importance: "high"
  }
];

// Get market events (earnings, economic releases, etc.)
function getMarketEvents(): Promise<MarketEvent[]> {
  return cacheUtils.fetchWithCache("market_events", async () => {
    // For now, we'll use mock data
    // In a future implementation, this could call an actual API
    return MOCK_EVENTS;
  });
}

export default {
  getMarketEvents
};
