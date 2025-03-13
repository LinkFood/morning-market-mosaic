
import { MarketIndex } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { POLYGON_BASE_URL, getPolygonApiKey } from "./config";

// Get market indices (S&P 500, Dow Jones, Nasdaq)
async function getMarketIndices(): Promise<MarketIndex[]> {
  return cacheUtils.fetchWithCache("market_indices", async () => {
    // Get the API key
    const apiKey = await getPolygonApiKey();
    
    // If we're still using the demo key, return mock data
    if (apiKey === "DEMO_API_KEY") {
      console.log("Using demo API key, returning mock data");
      return mockData.MOCK_INDICES_DATA;
    }
    
    try {
      const tickers = ["SPY", "DIA", "QQQ"]; // ETFs that track the indices
      const promises = tickers.map(ticker => 
        fetch(`${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Polygon API error: ${res.status} ${res.statusText}`);
            }
            return res.json();
          })
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
    } catch (error) {
      console.error("Error fetching market indices:", error);
      // Fall back to mock data in case of errors
      console.log("Falling back to mock data due to error");
      return mockData.MOCK_INDICES_DATA;
    }
  });
}

export default {
  getMarketIndices
};
