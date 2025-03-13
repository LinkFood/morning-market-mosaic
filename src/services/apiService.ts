
import { toast } from "sonner";
import {
  MarketIndex,
  SectorPerformance,
  StockData,
  MarketStatus,
  MarketMovers,
  TickerDetails,
  CandleData,
  NewsItem,
  MarketEvent
} from "@/types/marketTypes";
import mockData from "./market/mockData";
import cacheUtils from "./market/cacheUtils";
import { getPolygonApiKey } from "./market/config";
import polygonService from "./polygon";
import events from "./market/events";

// Get market indices (S&P 500, Dow Jones, Nasdaq)
async function getMarketIndices(): Promise<MarketIndex[]> {
  return cacheUtils.fetchWithCache("market_indices", async () => {
    try {
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

// Get sector performance data
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

// Get major stocks data
async function getMajorStocks(tickers: string[] = ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]): Promise<StockData[]> {
  return cacheUtils.fetchWithCache(`market_stocks_${tickers.join("_")}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for major stocks, returning mock data");
        return mockData.MOCK_STOCKS_DATA;
      }
      
      // Get batch stock snapshots
      const stockData = await polygonService.getBatchStockSnapshots(tickers);
      
      // Add names to stock data if missing
      return stockData.map(stock => ({
        ...stock,
        name: stock.name || stock.ticker // Ensure name is populated
      }));
    } catch (error) {
      console.error("Error fetching major stocks:", error);
      return mockData.MOCK_STOCKS_DATA; // Fallback to mock data
    }
  });
}

// Get stock sparkline data (7 day history)
async function getStockSparkline(ticker: string): Promise<number[]> {
  return cacheUtils.fetchWithCache(`market_sparkline_${ticker}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for sparkline data, returning mock data");
        // Return mock sparkline data
        const trend = Math.random() > 0.5; // Random up or down trend
        return mockData.generateMockSparkline(trend);
      }
      
      // Get end date (today) and start date (7 days ago)
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      
      const fromDate = weekAgo.toISOString().split('T')[0];
      const toDate = now.toISOString().split('T')[0];
      
      // Get candle data for the ticker
      const candles = await polygonService.getAggregates(
        ticker,
        "day",
        fromDate,
        toDate
      );
      
      // Extract close prices
      return candles.map(candle => candle.close);
    } catch (error) {
      console.error(`Error fetching sparkline for ${ticker}:`, error);
      // Generate mock sparkline data as fallback
      const trend = Math.random() > 0.5;
      return mockData.generateMockSparkline(trend);
    }
  });
}

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
      // For production, you would call specific endpoints
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

// Get detailed information about a stock
async function getStockDetails(ticker: string): Promise<TickerDetails> {
  return cacheUtils.fetchWithCache(`stock_details_${ticker}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for stock details, returning mock data");
        // Return mock ticker details
        return {
          ticker,
          name: `${ticker} Inc.`,
          description: `${ticker} is a leading company in its industry.`,
          homepageUrl: `https://www.${ticker.toLowerCase()}.com`,
          phoneNumber: "+1-123-456-7890",
          listDate: "2010-01-01",
          marketCap: 50000000000,
          employees: 10000,
          sector: "Technology",
          exchange: "NASDAQ",
          address: {
            address1: "123 Main Street",
            city: "New York",
            state: "NY",
            postalCode: "10001"
          }
        };
      }
      
      // Get ticker details from Polygon
      const details = await polygonService.getTickerDetails(ticker);
      return details;
    } catch (error) {
      console.error(`Error fetching details for ${ticker}:`, error);
      // Return basic mock data as fallback
      return {
        ticker,
        name: `${ticker}`,
        description: "No description available",
        homepageUrl: "",
        phoneNumber: "",
        listDate: "",
        marketCap: 0,
        employees: 0,
        sector: "",
        exchange: "",
        address: {
          address1: "",
          city: "",
          state: "",
          postalCode: ""
        }
      };
    }
  });
}

// Get market events (earnings, economic releases, etc.)
async function getMarketEvents(): Promise<MarketEvent[]> {
  return cacheUtils.fetchWithCache("market_events", async () => {
    // Use the events module for market events
    return events.getMarketEvents();
  });
}

// Get candlestick data for charts
async function getStockCandles(
  ticker: string,
  timeframe: string = "day",
  fromDate: string,
  toDate: string
): Promise<CandleData[]> {
  const cacheKey = `stock_candles_${ticker}_${timeframe}_${fromDate}_${toDate}`;
  
  return cacheUtils.fetchWithCache(cacheKey, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for candle data, returning mock data");
        // Generate mock candle data
        const days = Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
        const mockCandles: CandleData[] = [];
        
        let basePrice = 100 + Math.random() * 100;
        const startDate = new Date(fromDate);
        
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          // Skip weekends
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          
          const change = (Math.random() - 0.5) * 5;
          const open = basePrice;
          const close = basePrice + change;
          basePrice = close;
          
          mockCandles.push({
            date: date.toISOString().split("T")[0],
            timestamp: date.getTime(),
            open,
            high: Math.max(open, close) + Math.random() * 2,
            low: Math.min(open, close) - Math.random() * 2,
            close,
            volume: Math.floor(Math.random() * 10000000)
          });
        }
        
        return mockCandles;
      }
      
      // Get candle data from Polygon
      return await polygonService.getAggregates(ticker, timeframe, fromDate, toDate);
    } catch (error) {
      console.error(`Error fetching candles for ${ticker}:`, error);
      toast.error(`Failed to load chart data for ${ticker}`);
      
      // Return empty array as fallback
      return [];
    }
  });
}

// Export individual functions for backward compatibility
export {
  getMarketIndices,
  getSectorPerformance,
  getMajorStocks,
  getStockSparkline,
  getMarketStatus,
  getMarketMovers,
  getStockDetails,
  getStockCandles,
  getMarketEvents
};

// Re-export cache utilities for external use
export { cacheUtils };

// Default export with all methods
export default {
  getMarketIndices,
  getSectorPerformance,
  getMajorStocks,
  getStockSparkline,
  getMarketStatus,
  getMarketMovers,
  getStockDetails,
  getStockCandles,
  getMarketEvents,
  ...cacheUtils
};
