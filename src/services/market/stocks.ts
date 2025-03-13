
import { StockData } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { POLYGON_API_KEY, POLYGON_BASE_URL } from "./config";

// Get major stocks data
async function getMajorStocks(tickers: string[] = ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]): Promise<StockData[]> {
  return cacheUtils.fetchWithCache(`market_stocks_${tickers.join("_")}`, async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      return mockData.MOCK_STOCKS_DATA;
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
async function getStockSparkline(ticker: string): Promise<number[]> {
  return cacheUtils.fetchWithCache(`market_sparkline_${ticker}`, async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      // Return mock sparkline data (random trend)
      const trend = Math.random() > 0.5; // random up or down trend
      return mockData.generateMockSparkline(trend);
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

export default {
  getMajorStocks,
  getStockSparkline
};
