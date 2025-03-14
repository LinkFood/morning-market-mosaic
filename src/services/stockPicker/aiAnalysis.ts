
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
let cachedAnalysis: StockAnalysis | null = null;
let cacheTimestamp: number = 0;
let lastRequestTimestamp: number = 0;
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour
const REQUEST_DEBOUNCE = 10 * 1000; // 10 seconds

// Maximum retries for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds
const RETRY_BACKOFF_FACTOR = 1.5; // Increase delay by 50% for each retry

// Maximum time to consider cache valid even if expired when API fails
const EXTENDED_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Main function to get AI analysis for stock picks
 */
export async function getAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  console.log("getAIAnalysis called with", stocks.length, "stocks");
  
  // Debounce requests to prevent excessive API calls
  const now = Date.now();
  if (now - lastRequestTimestamp < REQUEST_DEBOUNCE && cachedAnalysis) {
    console.log("Debouncing API request, returning cached data");
    return cachedAnalysis;
  }
  lastRequestTimestamp = now;
  
  // First, check if AI analysis is enabled
  if (!isFeatureEnabled('useAIStockAnalysis')) {
    console.log("AI stock analysis feature is disabled");
    return createFallbackAnalysis(stocks, "AI stock analysis is currently disabled.");
  }
  
  // Check cache first with normal TTL
  if (cachedAnalysis && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    console.log("Using cached AI analysis from", new Date(cacheTimestamp).toISOString());
    return cachedAnalysis;
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
      
      // Cache successful result
      cachedAnalysis = analysis;
      cacheTimestamp = Date.now();
      
      return analysis;
    } catch (error) {
      lastError = error;
      console.error(`AI analysis attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        // Calculate backoff with exponential factor
        const backoffDelay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_FACTOR, attempt - 1);
        console.log(`Retrying in ${Math.round(backoffDelay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      } else {
        console.log("All retry attempts failed");
        
        // Check if we have a stale cache that's still usable in emergency
        if (cachedAnalysis && (Date.now() - cacheTimestamp < EXTENDED_CACHE_TTL)) {
          console.log("Using stale cache as fallback");
          toast.warning("Using cached analysis due to connection issues.");
          return cachedAnalysis;
        }
        
        // Show error toast only after all retries fail
        toast.error("AI analysis unavailable. Showing algorithmic picks only.");
        return createFallbackAnalysis(stocks, "Failed to connect to analysis service.");
      }
    }
  }
  
  // This should not be reached due to the retry logic, but just in case
  console.error("Unexpected error in getAIAnalysis", lastError);
  return createFallbackAnalysis(stocks, "An unexpected error occurred while fetching analysis.");
}

/**
 * Helper function to fetch AI analysis from Supabase Edge Function
 */
async function fetchAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  console.log("Calling Supabase Edge Function for stock analysis");
  
  // Prepare request payload
  const payload = { stocks: stocks.slice(0, 10) }; // Limit to 10 stocks to reduce payload size
  console.log("Request payload prepared with", payload.stocks.length, "stocks");
  
  // Set timeout for the function call
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Function invocation timed out")), 25000); // 25s timeout
  });
  
  // Call the Supabase Edge Function
  console.log("Invoking gemini-stock-analysis function");
  const startTime = performance.now();
  
  try {
    // Use Promise.race to implement timeout
    const functionCallPromise = supabase.functions.invoke('gemini-stock-analysis', {
      body: payload,
      // Add headers to avoid caching issues
      headers: {
        'Cache-Control': 'no-cache',
        'x-request-id': `stock-analysis-${Date.now()}`
      }
    });
    
    const result = await Promise.race([functionCallPromise, timeoutPromise]);
    const { data, error } = result;
    
    const endTime = performance.now();
    console.log(`Edge function response time: ${Math.round(endTime - startTime)}ms`);
    
    if (error) {
      console.error("Supabase function invocation error:", error);
      throw new Error(`Function invocation error: ${error.message}`);
    }
    
    if (!data) {
      console.error("Empty response from function");
      throw new Error("Empty response from analysis function");
    }
    
    // Check for error in the response
    const responseError = data as EdgeFunctionError;
    if (responseError.error) {
      console.error("Error in function response:", responseError);
      throw new Error(`Analysis error: ${responseError.error}${responseError.details ? ` - ${responseError.details}` : ''}`);
    }
    
    // Validate required fields
    if (!data.stockAnalyses || !data.marketInsight) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response structure from analysis function");
    }
    
    // Log model information for debugging
    if (data.model) {
      console.log(`Using Gemini model: ${data.model}`);
      console.log(`Function version: ${data.functionVersion || 'unknown'}`);
      if (data.modelEndpoint) {
        console.log(`Model endpoint: ${data.modelEndpoint}`);
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
    
    console.log("Successfully parsed AI analysis for", Object.keys(analysis.stockAnalyses).length, "stocks");
    
    return analysis;
  } catch (error) {
    // Improved error logging with more detail
    console.error("Failed to get AI analysis:", error);
    if (error instanceof Error && error.stack) {
      console.error("Error stack:", error.stack);
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

export default {
  getAIAnalysis
};
