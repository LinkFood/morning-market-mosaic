
/**
 * Sector performance service
 * Provides performance data for market sectors
 */
import { SectorPerformance } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

// Get sector performance
async function getSectorPerformance(): Promise<SectorPerformance[]> {
  return cacheUtils.fetchWithCache("market_sectors", async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for sector performance, returning mock data");
        return mockData.MOCK_SECTOR_DATA;
      }
      
      // Sector ETFs for the major market sectors
      const sectorTickers = {
        "XLF": "Financials",
        "XLK": "Technology",
        "XLE": "Energy",
        "XLV": "Healthcare",
        "XLY": "Consumer Cyclical",
        "XLP": "Consumer Defensive",
        "XLI": "Industrials",
        "XLB": "Materials",
        "XLU": "Utilities",
        "XLRE": "Real Estate",
        "XLC": "Communication Services"
      };
      
      // Get snapshots for sector ETFs
      const tickers = Object.keys(sectorTickers);
      const stockData = await polygonService.getBatchStockSnapshots(tickers);
      
      // Convert to SectorPerformance format
      return stockData.map(stock => ({
        ticker: stock.ticker,
        name: sectorTickers[stock.ticker as keyof typeof sectorTickers],
        close: stock.close,
        open: stock.open,
        change: stock.change,
        changePercent: stock.changePercent
      }));
    } catch (error) {
      console.error("Error fetching sector performance:", error);
      return mockData.MOCK_SECTOR_DATA; // Fallback to mock data
    }
  });
}

export default {
  getSectorPerformance
};
