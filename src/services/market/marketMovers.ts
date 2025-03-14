
/**
 * Market movers service
 * Provides top gainers and losers data
 */
import { MarketMovers, StockData } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

/**
 * Filter out penny stocks and other low-quality stocks
 * @param stocks Array of stock data to filter
 * @returns Filtered array of stocks
 */
function filterQualityStocks(stocks: StockData[]): StockData[] {
  return stocks.filter(stock => {
    // Filter out stocks with price under $10 (avoid penny stocks)
    if (stock.close < 10) {
      console.log(`Filtering out ${stock.ticker} - price $${stock.close} is too low`);
      return false;
    }
    
    // Filter out stocks with very low volume (< 500,000 shares)
    if (!stock.volume || stock.volume < 500000) {
      console.log(`Filtering out ${stock.ticker} - volume ${stock.volume || 0} is too low`);
      return false;
    }
    
    // Filter based on dollar volume (price * volume) for better liquidity
    const dollarVolume = (stock.volume || 0) * stock.close;
    if (dollarVolume < 5000000) { // At least $5M in dollar volume
      console.log(`Filtering out ${stock.ticker} - dollar volume $${(dollarVolume/1000000).toFixed(2)}M is too low`);
      return false;
    }
    
    // Pass all criteria
    return true;
  });
}

// Get market movers (top gainers and losers)
async function getMarketMovers(limit: number = 10): Promise<MarketMovers> {
  // Request more stocks than needed to account for filtering
  const requestLimit = limit * 3; 
  
  return cacheUtils.fetchWithCache(`market_movers_${limit}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for market movers, returning mock data");
        // Generate mock market movers - now filtered for quality
        const mockGainers = mockData.MOCK_STOCKS_DATA
          .map(stock => ({
            ...stock,
            change: Math.random() * 5 + 1,
            changePercent: Math.random() * 10 + 1,
            volume: Math.floor(Math.random() * 10000000) + 1000000, // Ensure decent volume
            name: stock.ticker + " Inc", // Add mock name
            close: Math.random() * 50 + 15, // Ensure price is above penny stock range
          }))
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, limit);
          
        const mockLosers = mockData.MOCK_STOCKS_DATA
          .map(stock => ({
            ...stock,
            change: -1 * (Math.random() * 5 + 1),
            changePercent: -1 * (Math.random() * 10 + 1),
            volume: Math.floor(Math.random() * 10000000) + 1000000, // Ensure decent volume
            name: stock.ticker + " Inc", // Add mock name
            close: Math.random() * 50 + 15, // Ensure price is above penny stock range
          }))
          .sort((a, b) => a.changePercent - b.changePercent)
          .slice(0, limit);
          
        return { gainers: mockGainers, losers: mockLosers };
      }
      
      // Get top gainers and losers from polygon - requesting more than needed for filtering
      const gainers = await polygonService.getBatchStockSnapshots([], requestLimit, "gainers");
      const losers = await polygonService.getBatchStockSnapshots([], requestLimit, "losers");
      
      // Process stock data and add missing fields
      const processedGainers = gainers.map(stock => ({
        ...stock,
        volume: stock.volume || Math.floor(Math.random() * 10000000),
        name: stock.name || `${stock.ticker} Inc.`
      }));
      
      const processedLosers = losers.map(stock => ({
        ...stock,
        volume: stock.volume || Math.floor(Math.random() * 10000000),
        name: stock.name || `${stock.ticker} Inc.`
      }));
      
      // Apply quality filtering and limit to requested number
      const filteredGainers = filterQualityStocks(processedGainers).slice(0, limit);
      const filteredLosers = filterQualityStocks(processedLosers).slice(0, limit);
      
      console.log(`Filtered market movers - gainers: ${filteredGainers.length}/${processedGainers.length}, losers: ${filteredLosers.length}/${processedLosers.length}`);
      
      return { 
        gainers: filteredGainers,
        losers: filteredLosers
      };
    } catch (error) {
      console.error("Error fetching market movers:", error);
      // Fallback mock data
      const mockGainers = mockData.MOCK_STOCKS_DATA
        .map(stock => ({
          ...stock,
          change: Math.random() * 5 + 1,
          changePercent: Math.random() * 10 + 1,
          volume: Math.floor(Math.random() * 10000000) + 1000000, // Ensure decent volume
          name: stock.ticker + " Inc", // Add mock name
          close: Math.random() * 50 + 15, // Ensure price is above penny stock range
        }))
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, limit);
        
      const mockLosers = mockData.MOCK_STOCKS_DATA
        .map(stock => ({
          ...stock,
          change: -1 * (Math.random() * 5 + 1),
          changePercent: -1 * (Math.random() * 10 + 1),
          volume: Math.floor(Math.random() * 10000000) + 1000000, // Ensure decent volume
          name: stock.ticker + " Inc", // Add mock name
          close: Math.random() * 50 + 15, // Ensure price is above penny stock range
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
