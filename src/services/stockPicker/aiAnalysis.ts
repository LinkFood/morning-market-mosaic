/**
 * AI Stock Analysis Service
 * Uses Google's Gemini API through a Supabase Edge Function to enhance stock picks with AI analysis
 */
import { ScoredStock } from "./algorithm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isFeatureEnabled } from "@/services/features";

// Define the response structure
export interface StockAnalysis {
  stockAnalyses: { [ticker: string]: string };
  marketInsight: string;
  generatedAt: string;
  fromFallback?: boolean;
  timestamp?: string;
  functionVersion?: string;
  model?: string;
  modelEndpoint?: string;
  error?: string;
  fromCache?: boolean;
}

// Edge function response error interface
interface EdgeFunctionError {
  error?: string;
  details?: string;
  status?: number;
  stack?: string;
}

// Improved cache with TTL and timestamp tracking
interface CacheEntry {
  data: StockAnalysis;
  timestamp: number;
  stale: boolean;
}

// Use a Map object for more structured caching
const cacheStore = new Map<string, CacheEntry>();
let lastRequestTimestamp: number = 0;

// Cache and retry configuration
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours
const REQUEST_DEBOUNCE = 15 * 1000; // 15 seconds - increased to reduce API pressure
const MAX_RETRIES = 4; // Increased to 4 retries
const RETRY_DELAY = 3000; // 3 seconds
const RETRY_BACKOFF_FACTOR = 1.5; // Increase delay by 50% for each retry
const JITTER_FACTOR = 0.2; // Add 20% random jitter
const EXTENDED_CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours - extended for better fallback availability
const ERROR_CACHE_TTL = 30 * 60 * 1000; // 30 min TTL when errors occur
const API_TIMEOUT = 45000; // 45 seconds - increased from 35s to allow more time for response

// Track consecutive errors to adapt caching strategy
let consecutiveErrorCount = 0;

// Helper function to get cache key
function getCacheKey(stocks: ScoredStock[]): string {
  // Use tickers and rounded timestamp for cache key (15 minute window)
  const timeWindow = Math.floor(Date.now() / (15 * 60 * 1000));
  const tickers = stocks.slice(0, 10).map(s => s.ticker).sort().join(',');
  return `${tickers}-${timeWindow}`;
}

/**
 * Main function to get AI analysis for stock picks
 */
export async function getAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  console.log("getAIAnalysis called with", stocks.length, "stocks");
  
  // Generate a cache key based on the stock tickers
  const cacheKey = getCacheKey(stocks);
  
  // Debounce requests to prevent excessive API calls
  const now = Date.now();
  if (now - lastRequestTimestamp < REQUEST_DEBOUNCE) {
    console.log("Debouncing API request, checking cache...");
    const cachedEntry = cacheStore.get(cacheKey);
    if (cachedEntry) {
      console.log("Found cached data during debounce period");
      return cachedEntry.data;
    }
  }
  lastRequestTimestamp = now;
  
  // First, check if AI analysis is enabled
  if (!isFeatureEnabled('useAIStockAnalysis')) {
    console.log("AI stock analysis feature is disabled");
    return createFallbackAnalysis(stocks, "AI stock analysis is currently disabled.");
  }
  
  // Check cache with normal TTL
  const cachedEntry = cacheStore.get(cacheKey);
  if (cachedEntry && !cachedEntry.stale && (now - cachedEntry.timestamp < CACHE_TTL)) {
    console.log("Using fresh cached AI analysis from", new Date(cachedEntry.timestamp).toISOString());
    return cachedEntry.data;
  }
  
  // Mark any existing cache as stale but still potentially usable
  if (cachedEntry) {
    cachedEntry.stale = true;
    console.log("Marking existing cache as stale");
  }
  
  // Implement retry logic with exponential backoff
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`AI analysis attempt ${attempt} of ${MAX_RETRIES}`);
      
      // Try to get AI analysis
      const analysis = await fetchAIAnalysis(stocks);
      
      // If we detect a model version mismatch, notify the user
      if (analysis.model && analysis.model !== "gemini-1.5-pro") {
        console.warn(`Model version mismatch. Expected gemini-1.5-pro but got ${analysis.model}`);
        toast.warning(`Using ${analysis.model} instead of gemini-1.5-pro for analysis`, {
          duration: 5000,
        });
      }
      
      // Check if this is a fallback response from the edge function
      if (analysis.fromFallback) {
        console.log("Edge function returned fallback analysis");
        if (attempt === MAX_RETRIES) {
          toast.warning("AI-powered analysis is limited right now. Using algorithmic analysis instead.");
        }
      }
      
      // Reset consecutive error count on success
      consecutiveErrorCount = 0;
      
      // Cache successful result
      cacheStore.set(cacheKey, {
        data: analysis,
        timestamp: now,
        stale: false
      });
      
      console.log("Successfully cached new analysis data");
      return analysis;
    } catch (error) {
      lastError = error;
      console.error(`AI analysis attempt ${attempt} failed:`, error);
      
      // Track consecutive errors for adaptive cache strategy
      consecutiveErrorCount++;
      console.log(`Consecutive error count: ${consecutiveErrorCount}`);
      
      if (attempt < MAX_RETRIES) {
        // Calculate backoff with exponential factor and jitter
        const backoffDelay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_FACTOR, attempt - 1);
        const jitter = backoffDelay * JITTER_FACTOR * (Math.random() - 0.5);
        const finalDelay = Math.max(1000, backoffDelay + jitter); // Ensure minimum 1s delay
        
        console.log(`Retrying in ${Math.round(finalDelay/1000)}s (with jitter)...`);
        await new Promise(resolve => setTimeout(resolve, finalDelay));
      } else {
        console.log("All retry attempts failed");
        
        // Calculate adaptive cache TTL based on error frequency
        const adaptiveCacheTTL = consecutiveErrorCount > 3 
          ? Math.min(CACHE_TTL * 2, 8 * 60 * 60 * 1000) // Max 8 hours if many errors
          : EXTENDED_CACHE_TTL;
        
        console.log(`Using adaptive cache TTL: ${Math.round(adaptiveCacheTTL/1000/60)} minutes due to ${consecutiveErrorCount} consecutive errors`);
        
        // Check if we have a stale cache that's still usable in emergency
        if (cachedEntry && (now - cachedEntry.timestamp < adaptiveCacheTTL)) {
          console.log("Using stale cache as fallback from", new Date(cachedEntry.timestamp).toISOString());
          toast.warning("Using cached analysis due to connection issues.");
          return cachedEntry.data;
        }
        
        // Look for any usable cache for these stocks
        const anyUsableCache = findAnyUsableCacheForStocks(stocks);
        if (anyUsableCache) {
          console.log("Found alternative cached data for similar stocks");
          toast.warning("Using similar stock analysis due to connection issues.");
          return anyUsableCache;
        }
        
        // Show error toast only after all retries and fallbacks fail
        toast.error("AI analysis unavailable. Showing algorithmic picks only.");
        const fallback = createFallbackAnalysis(stocks, "Failed to connect to analysis service.");
        
        // Cache the fallback analysis with appropriate TTL
        cacheStore.set(cacheKey, {
          data: fallback,
          timestamp: now,
          stale: true
        });
        
        return fallback;
      }
    }
  }
  
  // This should not be reached due to the retry logic, but just in case
  console.error("Unexpected error in getAIAnalysis", lastError);
  return createFallbackAnalysis(stocks, "An unexpected error occurred while fetching analysis.");
}

/**
 * Find any usable cache entry that contains at least some of the same stocks
 */
function findAnyUsableCacheForStocks(stocks: ScoredStock[]): StockAnalysis | null {
  const targetTickers = new Set(stocks.map(s => s.ticker));
  let bestMatch: StockAnalysis | null = null;
  let bestMatchCount = 0;
  
  // Look through all cache entries
  for (const [key, entry] of cacheStore.entries()) {
    // Skip if too old
    if (Date.now() - entry.timestamp > EXTENDED_CACHE_TTL) {
      continue;
    }
    
    // Count how many tickers match
    const cacheTickers = new Set(Object.keys(entry.data.stockAnalyses || {}));
    let matchCount = 0;
    
    for (const ticker of targetTickers) {
      if (cacheTickers.has(ticker)) {
        matchCount++;
      }
    }
    
    // If this is better than our previous best match, keep it
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestMatch = entry.data;
    }
  }
  
  // Only use it if we have at least 3 matching stocks
  return bestMatchCount >= 3 ? bestMatch : null;
}

/**
 * Helper function to fetch AI analysis from Supabase Edge Function
 */
async function fetchAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  console.log("Calling Supabase Edge Function for stock analysis");
  
  // Prepare request payload
  const payload = { stocks: stocks.slice(0, 10) }; // Limit to 10 stocks to reduce payload size
  console.log("Request payload prepared with", payload.stocks.length, "stocks");
  
  // Set timeout for the function call with improved value
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Function invocation timed out")), API_TIMEOUT);
  });
  
  // Call the Supabase Edge Function
  console.log("Invoking gemini-stock-analysis function");
  const startTime = performance.now();
  
  try {
    // Generate a more structured request ID for better cross-system tracing
    const generatedRequestId = `stock-analysis-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    console.log(`[${generatedRequestId}] Starting API request`);
    
    // Use Promise.race to implement timeout
    const functionCallPromise = supabase.functions.invoke('gemini-stock-analysis', {
      body: payload,
      // Add headers to avoid caching issues
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'x-request-id': generatedRequestId,
        'x-client-timestamp': Date.now().toString()
      }
    });
    
    const result = await Promise.race([functionCallPromise, timeoutPromise]);
    const { data, error } = result;
    
    const endTime = performance.now();
    console.log(`[${generatedRequestId}] Edge function response time: ${Math.round(endTime - startTime)}ms`);
    
    // Log complete response for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${generatedRequestId}] Full response:`, JSON.stringify(result).substring(0, 500) + '...');
    }
    
    if (error) {
      console.error(`[${generatedRequestId}] Supabase function invocation error:`, error);
      throw new Error(`Function invocation error: ${error.message}`);
    }
    
    if (!data) {
      console.error(`[${generatedRequestId}] Empty response from function`);
      throw new Error("Empty response from analysis function");
    }
    
    // Check for error in the response
    const responseError = data as EdgeFunctionError;
    if (responseError.error) {
      console.error(`[${generatedRequestId}] Error in function response:`, responseError);
      throw new Error(`Analysis error: ${responseError.error}${responseError.details ? ` - ${responseError.details}` : ''}`);
    }
    
    // Validate required fields
    if (!data.stockAnalyses || !data.marketInsight) {
      console.error(`[${generatedRequestId}] Invalid response structure:`, data);
      throw new Error("Invalid response structure from analysis function");
    }
    
    // Log model information for debugging
    if (data.model) {
      console.log(`[${generatedRequestId}] Using Gemini model: ${data.model}`);
      console.log(`[${generatedRequestId}] Function version: ${data.functionVersion || 'unknown'}`);
      if (data.modelEndpoint) {
        console.log(`[${generatedRequestId}] Model endpoint: ${data.modelEndpoint}`);
      }
    }
    
    // Create the analysis object with all additional metadata
    const analysis: StockAnalysis = {
      stockAnalyses: data.stockAnalyses,
      marketInsight: data.marketInsight,
      generatedAt: data.generatedAt || new Date().toISOString(),
      fromFallback: data.fromFallback || false,
      timestamp: data.timestamp,
      functionVersion: data.functionVersion,
      model: data.model,
      modelEndpoint: data.modelEndpoint,
      error: data.error,
      fromCache: data.fromCache
    };
    
    console.log(`[${generatedRequestId}] Successfully parsed AI analysis for ${Object.keys(analysis.stockAnalyses).length} stocks`);
    
    return analysis;
  } catch (error) {
    // Improved error logging with more detail and request ID
    console.error(`Error failed to get AI analysis:`, error);
    if (error instanceof Error && error.stack) {
      console.error(`Error stack:`, error.stack);
    }
    throw error;
  }
}

/**
 * Create a fallback analysis when the API is unavailable
 */
function createFallbackAnalysis(stocks: ScoredStock[], reason: string = "AI analysis currently unavailable."): StockAnalysis {
  console.log("Creating fallback analysis with reason:", reason);
  
  const stockAnalyses: { [ticker: string]: string } = {};
  
  // Generate better fallback analyses based on available data
  stocks.forEach(stock => {
    let analysis = `${stock.ticker} was selected by our algorithm based on `;
    
    if (stock.signals && stock.signals.length > 0) {
      analysis += `technical indicators including: ${stock.signals.join(', ')}. `;
    } else {
      analysis += `technical analysis. `;
    }
    
    // Add score-based commentary
    if (stock.scores?.composite !== undefined) {
      if (stock.scores.composite > 80) {
        analysis += `It shows strong potential with a composite score of ${stock.scores.composite}/100. `;
      } else if (stock.scores.composite > 60) {
        analysis += `It shows good potential with a composite score of ${stock.scores.composite}/100. `;
      } else {
        analysis += `It has a moderate composite score of ${stock.scores.composite}/100. `;
      }
    }
    
    // Add closing remarks
    analysis += "Consider further research before making investment decisions.";
    
    stockAnalyses[stock.ticker] = analysis;
  });
  
  return {
    stockAnalyses,
    marketInsight: `${reason} The selected stocks were chosen based on technical indicators and algorithmic screening.`,
    generatedAt: new Date().toISOString(),
    fromFallback: true
  };
}

/**
 * Clear the AI analysis cache
 */
export function clearAIAnalysisCache(): void {
  console.log("Clearing AI analysis cache");
  cacheStore.clear();
  consecutiveErrorCount = 0;
  lastRequestTimestamp = 0;
  toast.success("AI analysis cache cleared");
}

export default {
  getAIAnalysis,
  clearAIAnalysisCache
};
