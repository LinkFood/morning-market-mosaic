
/**
 * Market indices service
 * Provides data for major market indices
 */
import { MarketIndex } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";
import { isFeatureEnabled } from "@/services/featureFlags";

// Get market indices (S&P 500, Dow Jones, Nasdaq)
async function getMarketIndices(): Promise<MarketIndex[]> {
  return cacheUtils.fetchWithCache("market_indices", async () => {
    try {
      // Skip real API call if feature flag is disabled
      if (!isFeatureEnabled('useRealTimeData')) {
        console.log("Using mock data for market indices due to feature flag");
        return mockData.MOCK_INDICES_DATA;
      }
      
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market indices, returning mock data");
        return mockData.MOCK_INDICES_DATA;
      }
      
      // Use tickers for ETFs that track major indices
      const tickers = ["SPY", "DIA", "QQQ"];
      const indexNames = ["S&P 500", "Dow Jones", "Nasdaq"];
      
      // Get batch snapshots of these tickers
      const stockData = await polygonService.getBatchStockSnapshots(tickers);
      
      // Convert to MarketIndex format
      return stockData.map((stock, index) => ({
        ticker: stock.ticker,
        name: indexNames[index],
        close: stock.close,
        open: stock.open,
        change: stock.change,
        changePercent: stock.changePercent
      }));
    } catch (error) {
      console.error("Error fetching market indices:", error);
      return mockData.MOCK_INDICES_DATA; // Fallback to mock data
    }
  });
}

export default {
  getMarketIndices
};
