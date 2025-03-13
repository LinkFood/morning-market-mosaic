
/**
 * Stock Details Service
 * Detailed information about stocks
 */
import cacheUtils from "../cacheUtils";
import mockData from "../mockData";
import { getPolygonApiKey } from "../config";
import polygonService from "../../polygon";

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

export default {
  getStockDetails
};
