
/**
 * Market movers service
 * Provides top gainers and losers data
 */
import { MarketMovers, StockData } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

// Get market movers (top gainers and losers)
async function getMarketMovers(limit: number = 5): Promise<MarketMovers> {
  return cacheUtils.fetchWithCache(`market_movers_${limit}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market movers, returning mock data");
        // Generate mock market movers
        const mockGainers = mockData.MOCK_STOCKS_DATA
          .map(stock => ({
            ...stock,
            change: Math.random() * 5 + 1,
            changePercent: Math.random() * 10 + 1,
            volume: Math.floor(Math.random() * 10000000),
            name: stock.ticker + " Inc" // Add mock name
          }))
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, limit);
          
        const mockLosers = mockData.MOCK_STOCKS_DATA
          .map(stock => ({
            ...stock,
            change: -1 * (Math.random() * 5 + 1),
            changePercent: -1 * (Math.random() * 10 + 1),
            volume: Math.floor(Math.random() * 10000000),
            name: stock.ticker + " Inc" // Add mock name
          }))
          .sort((a, b) => a.changePercent - b.changePercent)
          .slice(0, limit);
          
        return { gainers: mockGainers, losers: mockLosers };
      }
      
      // Get top gainers and losers from polygon
      const gainers = await polygonService.getBatchStockSnapshots([], limit, "gainers");
      const losers = await polygonService.getBatchStockSnapshots([], limit, "losers");
      
      return { 
        gainers: gainers.map(stock => ({
          ...stock,
          volume: stock.volume || Math.floor(Math.random() * 10000000),
          name: stock.name || `${stock.ticker} Inc.`
        })),
        losers: losers.map(stock => ({
          ...stock,
          volume: stock.volume || Math.floor(Math.random() * 10000000),
          name: stock.name || `${stock.ticker} Inc.`
        }))
      };
    } catch (error) {
      console.error("Error fetching market movers:", error);
      // Fallback mock data
      const mockGainers = mockData.MOCK_STOCKS_DATA
        .map(stock => ({
          ...stock,
          change: Math.random() * 5 + 1,
          changePercent: Math.random() * 10 + 1,
          volume: Math.floor(Math.random() * 10000000),
          name: stock.ticker + " Inc" // Add mock name
        }))
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, limit);
        
      const mockLosers = mockData.MOCK_STOCKS_DATA
        .map(stock => ({
          ...stock,
          change: -1 * (Math.random() * 5 + 1),
          changePercent: -1 * (Math.random() * 10 + 1),
          volume: Math.floor(Math.random() * 10000000),
          name: stock.ticker + " Inc" // Add mock name
        }))
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, limit);
        
      return { gainers: mockGainers, losers: mockLosers };
    }
  });
}

export default {
  getMarketMovers
};
