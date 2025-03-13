
/**
 * Polygon.io Company News Service
 * Provides news articles and press releases for companies
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData } from '../cache';

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
  getCompanyNews
};
