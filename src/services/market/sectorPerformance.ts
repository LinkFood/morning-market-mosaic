
import { SectorPerformance } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";
import { POLYGON_API_KEY, POLYGON_BASE_URL } from "./config";

// Get sector performance
async function getSectorPerformance(): Promise<SectorPerformance[]> {
  return cacheUtils.fetchWithCache("market_sectors", async () => {
    if (POLYGON_API_KEY === "DEMO_API_KEY") {
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

export default {
  getSectorPerformance
};
