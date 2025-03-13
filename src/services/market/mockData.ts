import { MarketIndex, SectorPerformance, StockData, EconomicIndicator, MarketEvent, MarketStatus } from "@/types/marketTypes";

// Mock data for DEMO mode

const MOCK_INDICES_DATA: MarketIndex[] = [
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

const MOCK_SECTOR_DATA: SectorPerformance[] = [
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

const MOCK_STOCKS_DATA: StockData[] = [
  { ticker: "AAPL", close: 182.63, open: 180.42, high: 183.12, low: 180.17, change: 2.21, changePercent: 1.23 },
  { ticker: "MSFT", close: 420.55, open: 417.21, high: 422.01, low: 416.89, change: 3.34, changePercent: 0.80 },
  { ticker: "AMZN", close: 178.12, open: 175.63, high: 178.45, low: 175.12, change: 2.49, changePercent: 1.42 },
  { ticker: "GOOGL", close: 153.85, open: 152.24, high: 154.12, low: 151.78, change: 1.61, changePercent: 1.06 },
  { ticker: "META", close: 481.73, open: 475.12, high: 483.92, low: 474.37, change: 6.61, changePercent: 1.39 }
];

const MOCK_ECONOMIC_DATA: EconomicIndicator[] = [
  { id: "CPIAUCSL", name: "Inflation Rate (CPI)", value: 3.5, previous: 3.7, change: -0.2, unit: "%", date: "2024-04-15" },
  { id: "UNRATE", name: "Unemployment Rate", value: 4.1, previous: 4.2, change: -0.1, unit: "%", date: "2024-04-05" },
  { id: "FEDFUNDS", name: "Federal Funds Rate", value: 5.25, previous: 5.25, change: 0, unit: "%", date: "2024-04-12" },
  { id: "GDP", name: "Gross Domestic Product", value: 28340.5, previous: 28292.2, change: 48.3, unit: "B$", date: "2024-03-28" }
];

const MOCK_EVENTS_DATA: MarketEvent[] = [
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

// Mock market status data
const MOCK_MARKET_STATUS: MarketStatus = {
  market: "closed",
  serverTime: new Date().toISOString(),
  exchanges: {
    nasdaq: "closed",
    nyse: "closed",
    otc: "closed"
  },
  isOpen: false,
  nextOpeningTime: "09:30 ET"
};

// Helper function to generate mock sparkline data
function generateMockSparkline(uptrend: boolean): number[] {
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
  MOCK_INDICES_DATA,
  MOCK_SECTOR_DATA,
  MOCK_STOCKS_DATA,
  MOCK_ECONOMIC_DATA,
  MOCK_EVENTS_DATA,
  MOCK_MARKET_STATUS,
  generateMockSparkline
};
