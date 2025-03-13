
import { EconomicIndicator } from "@/types/marketTypes";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";

// Get economic indicators (inflation, unemployment, interest rates, GDP)
async function getEconomicIndicators(): Promise<EconomicIndicator[]> {
  return cacheUtils.fetchWithCache("econ_indicators", async () => {
    // Currently using mock data 
    return mockData.MOCK_ECONOMIC_DATA;
    
    /* When we have a real API implementation, it would look something like this:
    const indicators = [
      { id: "CPIAUCSL", name: "Inflation Rate (CPI)", unit: "%" },
      { id: "UNRATE", name: "Unemployment Rate", unit: "%" },
      { id: "FEDFUNDS", name: "Federal Funds Rate", unit: "%" },
      { id: "GDP", name: "Gross Domestic Product", unit: "B$" }
    ];
    
    const promises = indicators.map(indicator => 
      fetch(`API_URL?series_id=${indicator.id}`)
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
    */
  });
}

export default {
  getEconomicIndicators
};
