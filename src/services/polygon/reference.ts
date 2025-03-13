
/**
 * Polygon.io Reference Data Service
 * Provides reference and metadata for stocks and markets
 */
import { polygonRequest } from './client';
import { getCachedData, cacheData, CACHE_TTL } from './cache';
import { SectorPerformance } from '@/types/marketTypes';

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

/**
 * Get sector performance data using sector ETFs
 * @returns Promise with sector performance data
 */
export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  const cacheKey = 'sector_performance';
  const cachedData = getCachedData<SectorPerformance[]>(cacheKey, CACHE_TTL.SECTOR_PERFORMANCE);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
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
    
    const tickersParam = sectors.map(s => s.ticker).join(',');
    
    const response = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickersParam}`);
    
    // Map the response to our data format
    const sectorData: SectorPerformance[] = response.tickers.map((item: any) => {
      const sector = sectors.find(s => s.ticker === item.ticker);
      
      return {
        ticker: item.ticker,
        name: sector?.name || item.ticker,
        close: item.day.c,
        open: item.day.o,
        change: item.todaysChange,
        changePercent: item.todaysChangePerc
      };
    });
    
    // Cache the result
    cacheData(cacheKey, sectorData);
    
    return sectorData;
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    throw error;
  }
}

/**
 * Get upcoming market holidays
 * @param year Optional year (defaults to current year)
 * @returns Promise with market holidays
 */
export async function getMarketHolidays(year?: number) {
  const currentYear = year || new Date().getFullYear();
  const cacheKey = `market_holidays_${currentYear}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_HOLIDAYS);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(`/v1/marketstatus/upcoming`);
    
    // Filter for the requested year
    const holidays = response
      .filter((holiday: any) => new Date(holiday.date).getFullYear() === currentYear)
      .map((holiday: any) => ({
        name: holiday.name,
        date: holiday.date,
        status: holiday.status,
        exchange: holiday.exchange
      }));
    
    // Cache the result
    cacheData(cacheKey, holidays);
    
    return holidays;
  } catch (error) {
    console.error(`Error fetching market holidays for ${currentYear}:`, error);
    throw error;
  }
}

/**
 * Get company news and press releases
 * @param ticker Stock ticker symbol
 * @param limit Number of news items to return
 * @returns Promise with company news
 */
export async function getCompanyNews(ticker: string, limit: number = 10) {
  const cacheKey = `news_${ticker}_${limit}`;
  // Short cache time for news
  const NEWS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  const cachedData = getCachedData(cacheKey, NEWS_CACHE_TTL);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Calculate date range (last 30 days)
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const fromDate = from.toISOString().split('T')[0];
    
    const response = await polygonRequest(
      `/v2/reference/news?ticker=${ticker}&order=desc&limit=${limit}&sort=published_utc&published_utc.gte=${fromDate}&published_utc.lte=${to}`
    );
    
    // Format the news data
    const newsData = response.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      source: item.publisher.name,
      url: item.article_url,
      imageUrl: item.image_url,
      description: item.description,
      publishedDate: item.published_utc,
      tickers: item.tickers,
      keywords: item.keywords
    }));
    
    // Cache the result
    cacheData(cacheKey, newsData);
    
    return newsData;
  } catch (error) {
    console.error(`Error fetching news for ${ticker}:`, error);
    throw error;
  }
}

export default {
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews
};
