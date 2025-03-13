
// Re-export the refactored services under the old apiService name for backward compatibility
import marketService from './market';
import { toast } from "sonner";
import { MarketIndex, SectorPerformance, StockData, MarketStatus, MarketMovers, TickerDetails, CandleData } from "@/types/marketTypes";
import polygonService from "./polygon";
import mockData from "./market/mockData";
import cacheUtils from "./market/cacheUtils";
import { getPolygonApiKey } from "./market/config";

// Re-export all the original market service functions for backward compatibility
export default {
  ...marketService,
  
  // Enhanced and new methods using Polygon.io data
  
  // Get market indices (S&P 500, Dow Jones, Nasdaq)
  async getMarketIndices(): Promise<MarketIndex[]> {
    return cacheUtils.fetchWithCache("market_indices", async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for market indices");
          return mockData.MOCK_INDICES_DATA;
        }
        
        // Get the ticker snapshots from Polygon
        const tickers = ["SPY", "DIA", "QQQ"]; // ETFs that track the indices
        const snapshots = await polygonService.marketData.getSnapshots(tickers);
        
        // Convert to our standard format
        return snapshots.map((snapshot, index) => ({
          ticker: tickers[index],
          name: index === 0 ? "S&P 500" : index === 1 ? "Dow Jones" : "Nasdaq",
          close: snapshot.day.c,
          open: snapshot.day.o,
          change: snapshot.day.c - snapshot.day.o,
          changePercent: ((snapshot.day.c - snapshot.day.o) / snapshot.day.o) * 100
        }));
      } catch (error) {
        console.error("Error fetching market indices from Polygon:", error);
        toast.error("Error loading market data. Using fallback data.");
        return mockData.MOCK_INDICES_DATA;
      }
    });
  },
  
  // Get sector performance
  async getSectorPerformance(): Promise<SectorPerformance[]> {
    return cacheUtils.fetchWithCache("market_sectors", async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for sector performance");
          return mockData.MOCK_SECTOR_DATA;
        }
        
        // Sector ETFs
        const sectors = [
          { ticker: "XLF", name: "Financials" },
          { ticker: "XLK", name: "Technology" },
          { ticker: "XLE", name: "Energy" },
          { ticker: "XLV", name: "Healthcare" },
          { ticker: "XLY", name: "Consumer Cyclical" },
          { ticker: "XLP", name: "Consumer Defensive" },
          { ticker: "XLI", name: "Industrials" },
          { ticker: "XLB", name: "Materials" },
          { ticker: "XLU", name: "Utilities" },
          { ticker: "XLRE", name: "Real Estate" }
        ];
        
        const sectorTickers = sectors.map(s => s.name);
        const snapshots = await polygonService.marketData.getSnapshots(sectors.map(s => s.ticker));
        
        // Map to our format
        return snapshots.map((snapshot, index) => ({
          ticker: sectors[index].ticker,
          name: sectors[index].name,
          close: snapshot.day.c,
          open: snapshot.day.o,
          change: snapshot.day.c - snapshot.day.o,
          changePercent: ((snapshot.day.c - snapshot.day.o) / snapshot.day.o) * 100
        }));
      } catch (error) {
        console.error("Error fetching sector performance from Polygon:", error);
        toast.error("Error loading sector data. Using fallback data.");
        return mockData.MOCK_SECTOR_DATA;
      }
    });
  },
  
  // Get major stocks data
  async getMajorStocks(tickers: string[] = ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]): Promise<StockData[]> {
    return cacheUtils.fetchWithCache(`market_stocks_${tickers.join("_")}`, async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for major stocks");
          return mockData.MOCK_STOCKS_DATA;
        }
        
        const snapshots = await polygonService.marketData.getSnapshots(tickers);
        
        // Map to our format
        return snapshots.map((snapshot, index) => ({
          ticker: tickers[index],
          close: snapshot.day.c,
          open: snapshot.day.o,
          high: snapshot.day.h,
          low: snapshot.day.l,
          change: snapshot.day.c - snapshot.day.o,
          changePercent: ((snapshot.day.c - snapshot.day.o) / snapshot.day.o) * 100
        }));
      } catch (error) {
        console.error("Error fetching major stocks from Polygon:", error);
        toast.error("Error loading stock data. Using fallback data.");
        return mockData.MOCK_STOCKS_DATA;
      }
    });
  },
  
  // Get stock sparkline data (7 day history)
  async getStockSparkline(ticker: string): Promise<number[]> {
    return cacheUtils.fetchWithCache(`market_sparkline_${ticker}`, async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for stock sparkline");
          // Return mock sparkline data
          const trend = Math.random() > 0.5; // random up or down trend
          return mockData.generateMockSparkline(trend);
        }
        
        // Calculate date range for 7 days
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        
        const fromDate = weekAgo.toISOString().split('T')[0];
        const toDate = now.toISOString().split('T')[0];
        
        // Get daily candles for the last 7 days
        const candles = await polygonService.historicalData.getAggregates(
          ticker, 
          "day", 
          1, 
          fromDate, 
          toDate
        );
        
        // Extract close prices for sparkline
        return candles.map(candle => candle.c);
      } catch (error) {
        console.error(`Error fetching sparkline data for ${ticker} from Polygon:`, error);
        // Return mock sparkline data as fallback
        const trend = Math.random() > 0.5; // random up or down trend
        return mockData.generateMockSparkline(trend);
      }
    });
  },
  
  // NEW METHODS
  
  // Get market status (open/closed)
  async getMarketStatus(): Promise<MarketStatus> {
    return cacheUtils.fetchWithCache("market_status", async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for market status");
          // Generate mock market status
          const now = new Date();
          const isWeekend = now.getDay() === 0 || now.getDay() === 6;
          const hour = now.getHours();
          const isMarketHours = hour >= 9 && hour < 16;
          
          return {
            market: "stocks",
            serverTime: now.toISOString(),
            exchanges: {
              nasdaq: isWeekend ? "closed" : (isMarketHours ? "open" : "closed"),
              nyse: isWeekend ? "closed" : (isMarketHours ? "open" : "closed")
            },
            isOpen: !isWeekend && isMarketHours,
            nextOpeningTime: isWeekend ? "Monday 9:30 AM ET" : (isMarketHours ? null : "Tomorrow 9:30 AM ET")
          };
        }
        
        // Get market status from Polygon
        const status = await polygonService.marketData.getMarketStatus();
        
        // Convert to our format
        return {
          market: "stocks",
          serverTime: status.serverTime,
          exchanges: status.exchanges,
          isOpen: status.market === "open",
          nextOpeningTime: status.nextOpen || null
        };
      } catch (error) {
        console.error("Error fetching market status from Polygon:", error);
        
        // Generate fallback mock market status
        const now = new Date();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        const hour = now.getHours();
        const isMarketHours = hour >= 9 && hour < 16;
        
        return {
          market: "stocks",
          serverTime: now.toISOString(),
          exchanges: {
            nasdaq: isWeekend ? "closed" : (isMarketHours ? "open" : "closed"),
            nyse: isWeekend ? "closed" : (isMarketHours ? "open" : "closed")
          },
          isOpen: !isWeekend && isMarketHours,
          nextOpeningTime: isWeekend ? "Monday 9:30 AM ET" : (isMarketHours ? null : "Tomorrow 9:30 AM ET")
        };
      }
    });
  },
  
  // Get market movers (top gainers and losers)
  async getMarketMovers(): Promise<MarketMovers> {
    return cacheUtils.fetchWithCache("market_movers", async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for market movers");
          
          // Generate mock gainers and losers
          const mockGainers = mockData.MOCK_STOCKS_DATA.map(stock => ({
            ...stock,
            changePercent: Math.random() * 5 + 2 // 2% to 7%
          })).sort((a, b) => b.changePercent - a.changePercent);
          
          const mockLosers = mockData.MOCK_STOCKS_DATA.map(stock => ({
            ...stock,
            changePercent: -1 * (Math.random() * 5 + 2) // -2% to -7%
          })).sort((a, b) => a.changePercent - b.changePercent);
          
          return {
            gainers: mockGainers,
            losers: mockLosers
          };
        }
        
        // Get market movers from Polygon
        const snapshots = await polygonService.marketData.getSnapshots(["SPY", "AAPL", "MSFT", "AMZN", "GOOGL", "META"]);
        
        // Sort them by percent change
        const sortedByChange = snapshots.map((snapshot, index) => {
          const ticker = ["SPY", "AAPL", "MSFT", "AMZN", "GOOGL", "META"][index];
          return {
            ticker,
            close: snapshot.day.c,
            open: snapshot.day.o,
            high: snapshot.day.h,
            low: snapshot.day.l,
            change: snapshot.day.c - snapshot.day.o,
            changePercent: ((snapshot.day.c - snapshot.day.o) / snapshot.day.o) * 100
          };
        }).sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        
        // Split into gainers and losers
        const gainers = sortedByChange.filter(stock => stock.changePercent > 0);
        const losers = sortedByChange.filter(stock => stock.changePercent < 0);
        
        return {
          gainers,
          losers
        };
      } catch (error) {
        console.error("Error fetching market movers from Polygon:", error);
        
        // Generate fallback mock data
        const mockGainers = mockData.MOCK_STOCKS_DATA.map(stock => ({
          ...stock,
          changePercent: Math.random() * 5 + 2 // 2% to 7%
        })).sort((a, b) => b.changePercent - a.changePercent);
        
        const mockLosers = mockData.MOCK_STOCKS_DATA.map(stock => ({
          ...stock,
          changePercent: -1 * (Math.random() * 5 + 2) // -2% to -7%
        })).sort((a, b) => a.changePercent - b.changePercent);
        
        return {
          gainers: mockGainers,
          losers: mockLosers
        };
      }
    });
  },
  
  // Get detailed stock information
  async getStockDetails(ticker: string): Promise<TickerDetails> {
    return cacheUtils.fetchWithCache(`stock_details_${ticker}`, async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for stock details");
          
          // Generate mock ticker details
          return {
            ticker,
            name: ticker === "AAPL" ? "Apple Inc." : 
                 ticker === "MSFT" ? "Microsoft Corporation" : 
                 ticker === "AMZN" ? "Amazon.com Inc." : 
                 ticker === "GOOGL" ? "Alphabet Inc." : 
                 ticker === "META" ? "Meta Platforms Inc." : "Demo Company",
            description: `This is a demo description for ${ticker}.`,
            homepageUrl: `https://www.${ticker.toLowerCase()}.com`,
            phoneNumber: "+1-800-555-1234",
            listDate: "2000-01-01",
            marketCap: 2000000000000,
            employees: 100000,
            sector: "Technology",
            exchange: "NASDAQ",
            address: {
              address1: "123 Main Street",
              city: "San Francisco",
              state: "CA",
              postalCode: "94105"
            }
          };
        }
        
        // Get ticker details from Polygon
        const details = await polygonService.reference.getTickerDetails(ticker);
        
        // Convert to our format
        return {
          ticker: details.ticker,
          name: details.name,
          description: details.description || `No description available for ${ticker}`,
          homepageUrl: details.homepage_url || "",
          phoneNumber: details.phone_number || "",
          listDate: details.list_date || "",
          marketCap: details.market_cap || 0,
          employees: details.total_employees || 0,
          sector: details.sic_description || "",
          exchange: details.primary_exchange || "",
          address: {
            address1: details.address?.address1 || "",
            city: details.address?.city || "",
            state: details.address?.state || "",
            postalCode: details.address?.postal_code || ""
          }
        };
      } catch (error) {
        console.error(`Error fetching details for ${ticker} from Polygon:`, error);
        
        // Return fallback mock data
        return {
          ticker,
          name: ticker === "AAPL" ? "Apple Inc." : 
               ticker === "MSFT" ? "Microsoft Corporation" : 
               ticker === "AMZN" ? "Amazon.com Inc." : 
               ticker === "GOOGL" ? "Alphabet Inc." : 
               ticker === "META" ? "Meta Platforms Inc." : "Company",
          description: `Fallback description for ${ticker} due to API error.`,
          homepageUrl: `https://www.${ticker.toLowerCase()}.com`,
          phoneNumber: "+1-800-555-1234",
          listDate: "2000-01-01",
          marketCap: 1000000000000,
          employees: 50000,
          sector: "Technology",
          exchange: "NASDAQ",
          address: {
            address1: "123 Main Street",
            city: "San Francisco",
            state: "CA",
            postalCode: "94105"
          }
        };
      }
    });
  },
  
  // Get candlestick data for charts
  async getStockCandles(ticker: string, timeframe: string = "1D"): Promise<CandleData[]> {
    return cacheUtils.fetchWithCache(`stock_candles_${ticker}_${timeframe}`, async () => {
      try {
        // Get the API key
        const apiKey = await getPolygonApiKey();
        
        // If we're still using the demo key, return mock data
        if (apiKey === "DEMO_API_KEY") {
          console.log("Using demo API key, returning mock data for stock candles");
          
          // Generate mock candle data
          const now = new Date();
          const mockCandles: CandleData[] = [];
          let basePrice = 100 + Math.random() * 100;
          
          // Number of data points based on timeframe
          const dataPoints = 
            timeframe === "1D" ? 78 : // 5-minute candles for 1 day (6.5 hours)
            timeframe === "1W" ? 5 : // Daily candles for 1 week
            timeframe === "1M" ? 22 : // Daily candles for 1 month
            timeframe === "3M" ? 65 : // Daily candles for 3 months
            timeframe === "1Y" ? 252 : // Daily candles for 1 year
            timeframe === "5Y" ? 60 : // Monthly candles for 5 years
            30; // Default to 30 data points
          
          for (let i = 0; i < dataPoints; i++) {
            const date = new Date(now);
            
            // Adjust date based on timeframe
            if (timeframe === "1D") {
              date.setMinutes(date.getMinutes() - (i * 5));
            } else if (timeframe === "1W" || timeframe === "1M" || timeframe === "3M" || timeframe === "1Y") {
              date.setDate(date.getDate() - i);
            } else {
              date.setMonth(date.getMonth() - i);
            }
            
            // Generate random price movements
            const volatility = 0.02; // 2% price movement
            const change = basePrice * volatility * (Math.random() * 2 - 1);
            basePrice += change;
            
            const open = basePrice;
            const close = basePrice + (basePrice * volatility * (Math.random() * 2 - 1));
            const high = Math.max(open, close) + (basePrice * volatility * Math.random());
            const low = Math.min(open, close) - (basePrice * volatility * Math.random());
            const volume = Math.floor(100000 + Math.random() * 900000);
            
            mockCandles.push({
              date: date.toISOString().split('T')[0],
              timestamp: date.getTime(),
              open,
              high,
              low,
              close,
              volume
            });
          }
          
          // Return candles in chronological order
          return mockCandles.reverse();
        }
        
        // Parse timeframe to determine multiplier and timespan
        let multiplier = 1;
        let timespan = "day";
        let from: Date;
        const now = new Date();
        
        switch (timeframe) {
          case "1D":
            timespan = "minute";
            multiplier = 5;
            from = new Date(now);
            from.setDate(now.getDate() - 1);
            break;
          case "1W":
            timespan = "day";
            multiplier = 1;
            from = new Date(now);
            from.setDate(now.getDate() - 7);
            break;
          case "1M":
            timespan = "day";
            multiplier = 1;
            from = new Date(now);
            from.setMonth(now.getMonth() - 1);
            break;
          case "3M":
            timespan = "day";
            multiplier = 1;
            from = new Date(now);
            from.setMonth(now.getMonth() - 3);
            break;
          case "1Y":
            timespan = "day";
            multiplier = 1;
            from = new Date(now);
            from.setFullYear(now.getFullYear() - 1);
            break;
          case "5Y":
            timespan = "month";
            multiplier = 1;
            from = new Date(now);
            from.setFullYear(now.getFullYear() - 5);
            break;
          default:
            timespan = "day";
            multiplier = 1;
            from = new Date(now);
            from.setMonth(now.getMonth() - 1);
        }
        
        const fromDate = from.toISOString().split('T')[0];
        const toDate = now.toISOString().split('T')[0];
        
        // Get candles from Polygon
        const candles = await polygonService.historicalData.getAggregates(
          ticker,
          timespan as any,
          multiplier,
          fromDate,
          toDate
        );
        
        // Convert to our format
        return candles.map(candle => ({
          date: new Date(candle.t).toISOString().split('T')[0],
          timestamp: candle.t,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c,
          volume: candle.v
        }));
      } catch (error) {
        console.error(`Error fetching candles for ${ticker} with timeframe ${timeframe} from Polygon:`, error);
        
        // Generate fallback mock data
        const now = new Date();
        const mockCandles: CandleData[] = [];
        let basePrice = 100 + Math.random() * 100;
        
        // Number of data points based on timeframe
        const dataPoints = 
          timeframe === "1D" ? 78 : // 5-minute candles for 1 day (6.5 hours)
          timeframe === "1W" ? 5 : // Daily candles for 1 week
          timeframe === "1M" ? 22 : // Daily candles for 1 month
          timeframe === "3M" ? 65 : // Daily candles for 3 months
          timeframe === "1Y" ? 252 : // Daily candles for 1 year
          timeframe === "5Y" ? 60 : // Monthly candles for 5 years
          30; // Default to 30 data points
        
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(now);
          
          // Adjust date based on timeframe
          if (timeframe === "1D") {
            date.setMinutes(date.getMinutes() - (i * 5));
          } else if (timeframe === "1W" || timeframe === "1M" || timeframe === "3M" || timeframe === "1Y") {
            date.setDate(date.getDate() - i);
          } else {
            date.setMonth(date.getMonth() - i);
          }
          
          // Generate random price movements
          const volatility = 0.02; // 2% price movement
          const change = basePrice * volatility * (Math.random() * 2 - 1);
          basePrice += change;
          
          const open = basePrice;
          const close = basePrice + (basePrice * volatility * (Math.random() * 2 - 1));
          const high = Math.max(open, close) + (basePrice * volatility * Math.random());
          const low = Math.min(open, close) - (basePrice * volatility * Math.random());
          const volume = Math.floor(100000 + Math.random() * 900000);
          
          mockCandles.push({
            date: date.toISOString().split('T')[0],
            timestamp: date.getTime(),
            open,
            high,
            low,
            close,
            volume
          });
        }
        
        // Return candles in chronological order
        return mockCandles.reverse();
      }
    });
  }
};

// Re-export the cacheUtils functions for backward compatibility
export const { getCacheTimestamp, clearAllCacheData } = marketService;
