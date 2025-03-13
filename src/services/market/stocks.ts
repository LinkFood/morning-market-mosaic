
/**
 * Stock market data service
 * Provides data for individual stocks
 */
import { StockData } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { getPolygonApiKey } from "./config";
import polygonService from "../polygon";

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
        1,
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

// Get detailed information about a stock
async function getStockDetails(ticker: string): Promise<any> {
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

// Get candlestick data for charts
async function getStockCandles(
  ticker: string,
  timeframe: string = "day",
  fromDate: string,
  toDate: string
): Promise<any[]> {
  const cacheKey = `stock_candles_${ticker}_${timeframe}_${fromDate}_${toDate}`;
  
  return cacheUtils.fetchWithCache(cacheKey, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for candle data, returning mock data");
        // Generate mock candle data
        const days = Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
        const mockCandles = [];
        
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
      return await polygonService.getAggregates(ticker, 1, timeframe, fromDate, toDate);
    } catch (error) {
      console.error(`Error fetching candles for ${ticker}:`, error);
      // Return empty array as fallback
      return [];
    }
  });
}

export default {
  getMajorStocks,
  getStockSparkline,
  getStockDetails,
  getStockCandles
};
