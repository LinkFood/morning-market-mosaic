
/**
 * AI Stock Analysis Service
 * Uses Google's Gemini API through a Supabase Edge Function to enhance stock picks with AI analysis
 */
import { ScoredStock } from "./algorithm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the response structure
export interface StockAnalysis {
  stockAnalyses: { [ticker: string]: string };
  marketInsight: string;
  generatedAt: string;
}

// Edge function response error interface
interface EdgeFunctionError {
  error?: string;
  details?: string;
  status?: number;
  stack?: string;
}

// Mock cache to avoid repeated API calls
let cachedAnalysis: StockAnalysis | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Main function to get AI analysis for stock picks
 */
export async function getAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  console.log("getAIAnalysis called with", stocks.length, "stocks");
  
  // Check cache first
  if (cachedAnalysis && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    console.log("Using cached AI analysis from", new Date(cacheTimestamp).toISOString());
    return cachedAnalysis;
  }
  
  try {
    console.log("Cache miss or expired, calling Supabase Edge Function for stock analysis");
    
    // Prepare request payload
    const payload = { stocks };
    console.log("Request payload:", JSON.stringify(payload).substring(0, 200) + "...");
    
    // Call the Supabase Edge Function
    console.log("Invoking gemini-stock-analysis function");
    const startTime = performance.now();
    
    const { data, error } = await supabase.functions.invoke('gemini-stock-analysis', {
      body: payload
    });
    
    const endTime = performance.now();
    console.log(`Edge function response time: ${Math.round(endTime - startTime)}ms`);
    
    if (error) {
      console.error("Supabase function invocation error:", error);
      throw new Error(`Function invocation error: ${error.message}`);
    }
    
    console.log("Edge function response received:", data ? "success" : "empty");
    
    // Validate response structure
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
    
    // Create the analysis object
    const analysis: StockAnalysis = {
      stockAnalyses: data.stockAnalyses,
      marketInsight: data.marketInsight,
      generatedAt: data.generatedAt
    };
    
    console.log("Successfully parsed AI analysis for", Object.keys(analysis.stockAnalyses).length, "stocks");
    
    // Cache the result
    cachedAnalysis = analysis;
    cacheTimestamp = Date.now();
    
    return analysis;
  } catch (error) {
    console.error("Failed to get AI analysis:", error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error type:", typeof error);
    }
    
    toast.error("AI analysis unavailable. Showing algorithmic picks only.");
    
    // Return empty analysis with a note
    return {
      stockAnalyses: stocks.reduce((acc, stock) => {
        acc[stock.ticker] = "AI analysis currently unavailable.";
        return acc;
      }, {} as { [ticker: string]: string }),
      marketInsight: "Market insight unavailable. Please try again later.",
      generatedAt: new Date().toISOString()
    };
  }
}

export default {
  getAIAnalysis
};
