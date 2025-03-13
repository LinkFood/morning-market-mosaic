
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

// Mock cache to avoid repeated API calls
let cachedAnalysis: StockAnalysis | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Main function to get AI analysis for stock picks
 */
export async function getAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  // Check cache first
  if (cachedAnalysis && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    console.log("Using cached AI analysis");
    return cachedAnalysis;
  }
  
  try {
    console.log("Calling Supabase Edge Function for stock analysis");
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-stock-analysis', {
      body: { stocks }
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Function error: ${error.message}`);
    }
    
    if (!data || !data.stockAnalyses || !data.marketInsight) {
      console.error("Invalid response from function:", data);
      
      // Check if there's a detailed error in the response
      if (data?.error && data?.details) {
        throw new Error(`Analysis error: ${data.error} - ${data.details}`);
      } else {
        throw new Error("Invalid response from analysis function");
      }
    }
    
    // Create the analysis object
    const analysis: StockAnalysis = {
      stockAnalyses: data.stockAnalyses,
      marketInsight: data.marketInsight,
      generatedAt: data.generatedAt
    };
    
    // Cache the result
    cachedAnalysis = analysis;
    cacheTimestamp = Date.now();
    
    return analysis;
  } catch (error) {
    console.error("Failed to get AI analysis:", error);
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
