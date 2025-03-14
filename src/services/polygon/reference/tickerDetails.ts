
/**
 * Polygon.io Ticker Details Service
 * Provides detailed information about stock tickers
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';

/**
 * Get details for a ticker symbol
 * @param ticker Stock ticker symbol
 * @returns Promise with ticker details
 */
export async function getTickerDetails(ticker: string) {
  const cacheKey = `details_${ticker}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.TICKER_DETAILS);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(`/v3/reference/tickers/${ticker}`);
    
    // Transform to a more useful format
    const tickerDetails = {
      ticker: response.results.ticker,
      name: response.results.name,
      description: response.results.description,
      homepageUrl: response.results.homepage_url,
      phoneNumber: response.results.phone_number,
      listDate: response.results.list_date,
      marketCap: response.results.market_cap,
      employees: response.results.total_employees,
      sector: response.results.sic_description,
      exchange: response.results.primary_exchange,
      address: {
        address1: response.results.address?.address1,
        city: response.results.address?.city,
        state: response.results.address?.state,
        postalCode: response.results.address?.postal_code,
      }
    };
    
    // Cache the result
    cacheData(cacheKey, tickerDetails);
    
    return tickerDetails;
  } catch (error) {
    console.error(`Error fetching ticker details for ${ticker}:`, error);
    throw error;
  }
}

export default {
  getTickerDetails
};
