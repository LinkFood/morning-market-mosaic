import { toast } from "sonner";

// Define API endpoints
const POLYGON_BASE_URL = "https://api.polygon.io";
const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

// This would be set by user in a real app
const POLYGON_API_KEY = "DEMO_API_KEY"; // Demo mode will return sample data
const FRED_API_KEY = "DEMO_API_KEY";    // Demo mode will return sample data

// Cache TTL in milliseconds (1 day)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Interface for cache items
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Fetch with caching utility
async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    // Check if data exists in cache and is still valid
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
      const now = Date.now();
      
      // If cache is still valid, return the cached data
      if (now - parsedItem.timestamp < CACHE_TTL) {
        console.log(`Using cached data for ${cacheKey}`);
        return parsedItem.data;
      }
    }
    
    // If no valid cache exists, fetch new data
    console.log(`Fetching fresh data for ${cacheKey}`);
    const data = await fetcher();
    
    // Store in cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    
    // If error occurs but we have cached data, return that even if expired
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      toast.error("Using cached data due to API error");
      return JSON.parse(cachedItem).data;
    }
    
    // Otherwise, throw the error to be handled by the caller
    throw error;
  }
}

// Clear all cache data
export function clearAllCacheData() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("market_") || key.startsWith("econ_")) {
      localStorage.removeItem(key);
    }
  });
  toast.success("Cache cleared, refreshing data");
}

// Get cache timestamp for a specific key
export function getCacheTimestamp(cacheKey: string): Date | null {
  const cachedItem = localStorage.getItem(cacheKey);
  if (cachedItem) {
    const parsedItem = JSON.parse(cachedItem);
    return new Date(parsedItem.timestamp);
  }
  return null;
}

// POLYGON API CALLS

// Get market indices (S&P 500, Dow Jones, Nasdaq)
export async function getMarketIndices() {
  return fetchWithCache("market_indices", async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      return MOCK_INDICES_DATA;
    }
    
    const tickers = ["SPY", "DIA", "QQQ"]; // ETFs that track the indices
    const promises = tickers.map(ticker => 
      fetch(`${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`)
        .then(res => res.json())
    );
    
    const results = await Promise.all(promises);
    // Process and return the results
    return results.map((result, index) => ({
      ticker: tickers[index],
      name: index === 0 ? "S&P 500" : index === 1 ? "Dow Jones" : "Nasdaq",
      close: result.results[0].c,
      open: result.results[0].o,
      change: result.results[0].c - result.results[0].o,
      changePercent: ((result.results[0].c - result.results[0].o) / result.results[0].o) * 100
    }));
  });
}

// Get sector performance
export async function getSectorPerformance() {
  return fetchWithCache("market_sectors", async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      return MOCK_SECTOR_DATA;
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
    
    const promises = sectors.map(sector => 
      fetch(`${POLYGON_BASE_URL}/v2/aggs/ticker/${sector.ticker}/prev?apiKey=${POLYGON_API_KEY}`)
        .then(res => res.json())
        .then(data => ({
          ticker: sector.ticker,
          name: sector.name,
          close: data.results[0].c,
          open: data.results[0].o,
          change: data.results[0].c - data.results[0].o,
          changePercent: ((data.results[0].c - data.results[0].o) / data.results[0].o) * 100
        }))
    );
    
    return Promise.all(promises);
  });
}

// Get major stocks data
export async function getMajorStocks(tickers: string[] = ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]) {
  return fetchWithCache(`market_stocks_${tickers.join("_")}`, async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      return MOCK_STOCKS_DATA;
    }
    
    const promises = tickers.map(ticker => 
      fetch(`${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`)
        .then(res => res.json())
        .then(data => ({
          ticker,
          close: data.results[0].c,
          open: data.results[0].o,
          high: data.results[0].h,
          low: data.results[0].l,
          change: data.results[0].c - data.results[0].o,
          changePercent: ((data.results[0].c - data.results[0].o) / data.results[0].o) * 100
        }))
    );
    
    return Promise.all(promises);
  });
}

// Get stock sparkline data (7 day history)
export async function getStockSparkline(ticker: string) {
  return fetchWithCache(`market_sparkline_${ticker}`, async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      // Return mock sparkline data (random trend)
      const trend = Math.random() > 0.5; // random up or down trend
      return generateMockSparkline(trend);
    }
    
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    const fromDate = weekAgo.toISOString().split('T')[0];
    const toDate = now.toISOString().split('T')[0];
    
    const response = await fetch(
      `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?apiKey=${POLYGON_API_KEY}`
    );
    
    const data = await response.json();
    return data.results.map((point: any) => point.c);
  });
}

// Get economic calendar/events
export async function getMarketEvents() {
  return fetchWithCache("market_events", async () => {
    // This would typically come from a real API
    // For demo purposes, we'll return mock data
    return MOCK_EVENTS_DATA;
  });
}

// FRED API CALLS

// Get economic indicators (inflation, unemployment, interest rates, GDP)
export async function getEconomicIndicators() {
  return fetchWithCache("econ_indicators", async () => {
    if (FRED_API_KEY === "DEMO_API_KEY") {
      return MOCK_ECONOMIC_DATA;
    }
    
    const indicators = [
      { id: "CPIAUCSL", name: "Inflation Rate (CPI)", unit: "%" },
      { id: "UNRATE", name: "Unemployment Rate", unit: "%" },
      { id: "FEDFUNDS", name: "Federal Funds Rate", unit: "%" },
      { id: "GDP", name: "Gross Domestic Product", unit: "B$" }
    ];
    
    const promises = indicators.map(indicator => 
      fetch(`${FRED_BASE_URL}/series/observations?series_id=${indicator.id}&api_key=${FRED_API_KEY}&sort_order=desc&limit=2`)
        .then(res => res.json())
        .then(data => {
          const current = parseFloat(data.observations[0].value);
          const previous = parseFloat(data.observations[1].value);
          return {
            id: indicator.id,
            name: indicator.name,
            value: current,
            previous: previous,
            change: current - previous,
            unit: indicator.unit,
            date: data.observations[0].date
          };
        })
    );
    
    return Promise.all(promises);
  });
}

// MOCK DATA FOR DEMO MODE

const MOCK_INDICES_DATA = [
  {
    ticker: "SPY",
    name: "S&P 500",
    close: 4574.86,
    open: 4540.12,
    change: 34.74,
    changePercent: 0.76
  },
  {
    ticker: "DIA",
    name: "Dow Jones",
    close: 38001.95,
    open: 37821.15,
    change: 180.80,
    changePercent: 0.48
  },
  {
    ticker: "QQQ",
    name: "Nasdaq",
    close: 16207.51,
    open: 16035.25,
    change: 172.26,
    changePercent: 1.07
  }
];

const MOCK_SECTOR_DATA = [
  { ticker: "XLF", name: "Financials", close: 42.14, open: 41.78, change: 0.36, changePercent: 0.86 },
  { ticker: "XLK", name: "Technology", close: 198.58, open: 196.45, change: 2.13, changePercent: 1.08 },
  { ticker: "XLE", name: "Energy", close: 87.23, open: 88.01, change: -0.78, changePercent: -0.89 },
  { ticker: "XLV", name: "Healthcare", close: 142.89, open: 141.92, change: 0.97, changePercent: 0.68 },
  { ticker: "XLY", name: "Consumer Cyclical", close: 184.61, open: 183.25, change: 1.36, changePercent: 0.74 },
  { ticker: "XLP", name: "Consumer Defensive", close: 75.18, open: 75.33, change: -0.15, changePercent: -0.20 },
  { ticker: "XLI", name: "Industrials", close: 116.76, open: 115.98, change: 0.78, changePercent: 0.67 },
  { ticker: "XLB", name: "Materials", close: 87.95, open: 87.15, change: 0.80, changePercent: 0.92 },
  { ticker: "XLU", name: "Utilities", close: 65.32, open: 66.01, change: -0.69, changePercent: -1.05 },
  { ticker: "XLRE", name: "Real Estate", close: 43.10, open: 42.85, change: 0.25, changePercent: 0.58 }
];

const MOCK_STOCKS_DATA = [
  { ticker: "AAPL", close: 182.63, open: 180.42, high: 183.12, low: 180.17, change: 2.21, changePercent: 1.23 },
  { ticker: "MSFT", close: 420.55, open: 417.21, high: 422.01, low: 416.89, change: 3.34, changePercent: 0.80 },
  { ticker: "AMZN", close: 178.12, open: 175.63, high: 178.45, low: 175.12, change: 2.49, changePercent: 1.42 },
  { ticker: "GOOGL", close: 153.85, open: 152.24, high: 154.12, low: 151.78, change: 1.61, changePercent: 1.06 },
  { ticker: "META", close: 481.73, open: 475.12, high: 483.92, low: 474.37, change: 6.61, changePercent: 1.39 }
];

const MOCK_ECONOMIC_DATA = [
  { id: "CPIAUCSL", name: "Inflation Rate (CPI)", value: 3.5, previous: 3.7, change: -0.2, unit: "%", date: "2024-04-15" },
  { id: "UNRATE", name: "Unemployment Rate", value: 4.1, previous: 4.2, change: -0.1, unit: "%", date: "2024-04-05" },
  { id: "FEDFUNDS", name: "Federal Funds Rate", value: 5.25, previous: 5.25, change: 0, unit: "%", date: "2024-04-12" },
  { id: "GDP", name: "Gross Domestic Product", value: 28340.5, previous: 28292.2, change: 48.3, unit: "B$", date: "2024-03-28" }
];

const MOCK_EVENTS_DATA = [
  { 
    type: "earnings", 
    title: "Tesla (TSLA) Earnings", 
    date: "2024-04-23", 
    time: "After Market Close",
    importance: "high" 
  },
  { 
    type: "economic", 
    title: "FOMC Meeting Announcement", 
    date: "2024-04-30", 
    time: "2:00 PM ET",
    importance: "high" 
  },
  { 
    type: "earnings", 
    title: "Apple (AAPL) Earnings", 
    date: "2024-05-02", 
    time: "After Market Close",
    importance: "high" 
  },
  { 
    type: "economic", 
    title: "US Unemployment Rate", 
    date: "2024-05-03", 
    time: "8:30 AM ET",
    importance: "medium" 
  },
  { 
    type: "earnings", 
    title: "Microsoft (MSFT) Earnings", 
    date: "2024-04-25", 
    time: "After Market Close",
    importance: "high" 
  }
];

// Helper function to generate mock sparkline data
function generateMockSparkline(uptrend: boolean) {
  const points = 7; // 7 days
  const data = [];
  let value = 100;
  
  for (let i = 0; i < points; i++) {
    // Random movement with trend bias
    const change = (Math.random() * 3) * (uptrend ? 1 : -1) + (Math.random() * 2 - 1);
    value += change;
    value = Math.max(value, 80); // Ensure value doesn't go too low
    data.push(value);
  }
  
  return data;
}

export default {
  getMarketIndices,
  getSectorPerformance,
  getMajorStocks,
  getStockSparkline,
  getMarketEvents,
  getEconomicIndicators,
  clearAllCacheData,
  getCacheTimestamp
};
