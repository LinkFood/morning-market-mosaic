
import { MarketIndex } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { POLYGON_API_KEY, POLYGON_BASE_URL } from "./config";

// Get market indices (S&P 500, Dow Jones, Nasdaq)
async function getMarketIndices(): Promise<MarketIndex[]> {
  return cacheUtils.fetchWithCache("market_indices", async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
      return mockData.MOCK_INDICES_DATA;
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

export default {
  getMarketIndices
};
