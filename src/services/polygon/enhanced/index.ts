/**
 * Enhanced Polygon.io Service
 * Provides advanced functionality using Polygon APIs
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData } from '../cache';
import { StockData } from '@/types/marketTypes';

// Define cache TTLs specific to enhanced data
const ENHANCED_CACHE_TTL = {
  REFERENCE_DATA: 24 * 60 * 60 * 1000, // 24 hours
  MARKET_DATA: 5 * 60 * 1000,          // 5 minutes
  NEWS: 30 * 60 * 1000                 // 30 minutes
};

// Define new interfaces for enhanced data
export interface StockFundamentals {
  ticker: string;
  marketCap: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  sector?: string;
  industry?: string;
  beta?: number;
  sharesOutstanding?: number;
  lastUpdated: string;
}

export interface EarningsData {
  ticker: string;
  fiscalQuarter: number;
  fiscalYear: number;
  reportDate: string;
  epsActual: number;
  epsEstimate?: number;
  revenueActual?: number;
  revenueEstimate?: number;
  surprisePercent?: number;
}

export interface OptionChain {
  ticker: string;
  underlying: string;
  expirationDate: string;
  strikePrice: number;
  type: 'call' | 'put';
  openInterest?: number;
  volume?: number;
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
}

/**
 * Get fundamentals data for a stock
 */
export async function getStockFundamentals(ticker: string): Promise<StockFundamentals | null> {
  const cacheKey = `fundamentals_${ticker}`;
  const cachedData = getCachedData<StockFundamentals>(cacheKey, ENHANCED_CACHE_TTL.REFERENCE_DATA);
  
  if (cachedData) return cachedData;
  
  try {
    // Call Polygon ticker details endpoint
    const tickerDetails = await polygonRequest(`/v3/reference/tickers/${ticker}`);
    
    if (!tickerDetails || !tickerDetails.results) {
      console.error(`No ticker details found for ${ticker}`);
      return null;
    }
    
    // Extract and format fundamentals data
    const result: StockFundamentals = {
      ticker,
      marketCap: tickerDetails.results.market_cap || 0,
      peRatio: tickerDetails.results.pe_ratio,
      eps: tickerDetails.results.eps,
      dividendYield: tickerDetails.results.dividend_yield,
      sector: tickerDetails.results.sic_description,
      industry: tickerDetails.results.standard_industrial_classification?.industry,
      sharesOutstanding: tickerDetails.results.share_class_shares_outstanding,
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the result
    cacheData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching fundamentals for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get latest earnings data for a stock
 */
export async function getStockEarnings(ticker: string): Promise<EarningsData | null> {
  const cacheKey = `earnings_${ticker}`;
  const cachedData = getCachedData<EarningsData>(cacheKey, ENHANCED_CACHE_TTL.REFERENCE_DATA);
  
  if (cachedData) return cachedData;
  
  try {
    // Call Polygon earnings endpoint
    const earningsData = await polygonRequest(`/v3/reference/earnings/${ticker}?limit=1`);
    
    if (!earningsData || !earningsData.results || earningsData.results.length === 0) {
      console.error(`No earnings data found for ${ticker}`);
      return null;
    }
    
    const latestEarnings = earningsData.results[0];
    
    // Extract and format earnings data
    const result: EarningsData = {
      ticker,
      fiscalQuarter: latestEarnings.fiscal_quarter,
      fiscalYear: latestEarnings.fiscal_year,
      reportDate: latestEarnings.report_date,
      epsActual: latestEarnings.eps || 0,
      epsEstimate: latestEarnings.eps_estimate,
      revenueActual: latestEarnings.revenue,
      revenueEstimate: latestEarnings.revenue_estimate,
      surprisePercent: latestEarnings.surprise_percent
    };
    
    // Cache the result
    cacheData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching earnings for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get enhanced market movers with better filtering and additional data
 */
export async function getEnhancedMarketMovers(
  minPrice: number = 10,
  minVolume: number = 1000000,
  limit: number = 10
): Promise<{ gainers: StockData[]; losers: StockData[] }> {
  // Request more stocks than needed for filtering
  const requestLimit = limit * 3;
  const cacheKey = `enhanced_movers_${minPrice}_${minVolume}_${limit}`;
  
  const cachedData = getCachedData<{ gainers: StockData[]; losers: StockData[] }>(cacheKey, ENHANCED_CACHE_TTL.REFERENCE_DATA / 2); // Shorter TTL for enhanced data
  if (cachedData) return cachedData;
  
  try {
    // Get raw movers data
    const gainersResponse = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/gainers?limit=${requestLimit}`);
    const losersResponse = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/losers?limit=${requestLimit}`);
    
    // Process and filter gainers
    const gainers = await processAndFilterMovers(gainersResponse.tickers, minPrice, minVolume, limit);
    
    // Process and filter losers  
    const losers = await processAndFilterMovers(losersResponse.tickers, minPrice, minVolume, limit);
    
    const result = { gainers, losers };
    
    // Cache the filtered results
    cacheData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error("Error fetching enhanced market movers:", error);
    return { gainers: [], losers: [] };
  }
}

/**
 * Helper function to process and filter mover stocks
 */
async function processAndFilterMovers(
  tickers: any[],
  minPrice: number,
  minVolume: number,
  limit: number
): Promise<StockData[]> {
  // Map raw data to StockData format
  const stocks: StockData[] = tickers.map((item: any) => ({
    ticker: item.ticker,
    name: item.ticker, // Will be enhanced later
    close: item.day?.c || 0,
    open: item.day?.o || 0,
    high: item.day?.h || 0,
    low: item.day?.l || 0,
    change: item.todaysChange || 0,
    changePercent: item.todaysChangePerc || 0,
    volume: item.day?.v || 0
  }));
  
  // Filter stocks based on criteria
  const filteredStocks = stocks.filter(stock => {
    if (stock.close < minPrice) return false;
    if (stock.volume < minVolume) return false;
    return true;
  });
  
  console.log(`Filtered ${stocks.length} movers down to ${filteredStocks.length} stocks`);
  
  // Try to enhance the top stocks with company names and other data
  const enhancedStocks = await Promise.all(
    filteredStocks.slice(0, limit).map(async (stock) => {
      try {
        // Try to get ticker details for the name
        const details = await polygonRequest(`/v3/reference/tickers/${stock.ticker}`);
        if (details && details.results) {
          stock.name = details.results.name || stock.ticker;
          
          // Add market cap if available
          if (details.results.market_cap) {
            stock.marketCap = details.results.market_cap;
          }
          
          // Add sector if available
          if (details.results.sic_description) {
            stock.sector = details.results.sic_description;
          }
        }
      } catch (error) {
        console.error(`Failed to enhance data for ${stock.ticker}:`, error);
      }
      return stock;
    })
  );
  
  return enhancedStocks.slice(0, limit);
}

/**
 * Get option chain data for a stock
 */
export async function getOptionsData(ticker: string): Promise<OptionChain[]> {
  const cacheKey = `options_${ticker}`;
  const cachedData = getCachedData<OptionChain[]>(cacheKey, ENHANCED_CACHE_TTL.MARKET_DATA);
  
  if (cachedData) return cachedData;
  
  try {
    // Get the nearest expiration options data
    const optionsResponse = await polygonRequest(`/v3/reference/options/contracts?underlying_ticker=${ticker}&limit=100&expiration_date.gte=${new Date().toISOString().split('T')[0]}`);
    
    if (!optionsResponse || !optionsResponse.results || optionsResponse.results.length === 0) {
      console.error(`No options data found for ${ticker}`);
      return [];
    }
    
    // Process options data
    const options: OptionChain[] = optionsResponse.results.map((option: any) => ({
      ticker: option.ticker,
      underlying: ticker,
      expirationDate: option.expiration_date,
      strikePrice: option.strike_price,
      type: option.contract_type.toLowerCase(),
      openInterest: option.open_interest,
      impliedVolatility: option.implied_volatility
    }));
    
    // Group by expiration date to get the nearest date with sufficient data
    const optionsByExpiry: { [key: string]: OptionChain[] } = {};
    options.forEach(option => {
      if (!optionsByExpiry[option.expirationDate]) {
        optionsByExpiry[option.expirationDate] = [];
      }
      optionsByExpiry[option.expirationDate].push(option);
    });
    
    // Find the nearest expiration date with at least 10 options
    const expiryDates = Object.keys(optionsByExpiry).sort();
    let selectedOptions: OptionChain[] = [];
    
    for (const date of expiryDates) {
      if (optionsByExpiry[date].length >= 10) {
        selectedOptions = optionsByExpiry[date];
        break;
      }
    }
    
    if (selectedOptions.length === 0 && expiryDates.length > 0) {
      // If no date has at least 10 options, use the nearest date
      selectedOptions = optionsByExpiry[expiryDates[0]];
    }
    
    // Cache the result
    cacheData(cacheKey, selectedOptions);
    
    return selectedOptions;
  } catch (error) {
    console.error(`Error fetching options data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get recent news for a stock
 */
export async function getStockNews(ticker: string, limit: number = 5): Promise<any[]> {
  const cacheKey = `news_${ticker}_${limit}`;
  const cachedData = getCachedData<any[]>(cacheKey, ENHANCED_CACHE_TTL.NEWS);
  
  if (cachedData) return cachedData;
  
  try {
    // Call Polygon news endpoint
    const newsResponse = await polygonRequest(`/v2/reference/news?ticker=${ticker}&limit=${limit}`);
    
    if (!newsResponse || !newsResponse.results) {
      console.error(`No news found for ${ticker}`);
      return [];
    }
    
    // Process news data
    const news = newsResponse.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      source: item.publisher.name,
      summary: item.description,
      url: item.article_url,
      publishedAt: item.published_utc,
      keywords: item.keywords || [],
      imageUrl: item.image_url || null
    }));
    
    // Cache the result
    cacheData(cacheKey, news);
    
    return news;
  } catch (error) {
    console.error(`Error fetching news for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get insider trading data for a stock
 */
export async function getInsiderTransactions(ticker: string, limit: number = 10): Promise<any[]> {
  const cacheKey = `insider_${ticker}_${limit}`;
  const cachedData = getCachedData<any[]>(cacheKey, ENHANCED_CACHE_TTL.REFERENCE_DATA);
  
  if (cachedData) return cachedData;
  
  try {
    // Call Polygon insider transactions endpoint
    const insiderResponse = await polygonRequest(`/v3/reference/tickers/${ticker}/insider-transactions?limit=${limit}`);
    
    if (!insiderResponse || !insiderResponse.results) {
      console.error(`No insider transactions found for ${ticker}`);
      return [];
    }
    
    // Process insider transactions data
    const transactions = insiderResponse.results.map((item: any) => ({
      ticker,
      filingDate: item.filing_date,
      transactionDate: item.transaction_date,
      reportingName: item.insider_name,
      title: item.insider_title,
      transactionType: item.transaction_type,
      sharesTraded: item.shares_transacted,
      price: item.share_price,
      sharesOwned: item.shares_owned
    }));
    
    // Cache the result
    cacheData(cacheKey, transactions);
    
    return transactions;
  } catch (error) {
    console.error(`Error fetching insider transactions for ${ticker}:`, error);
    return [];
  }
}

export default {
  getStockFundamentals,
  getStockEarnings,
  getEnhancedMarketMovers,
  getOptionsData,
  getStockNews,
  getInsiderTransactions
};
