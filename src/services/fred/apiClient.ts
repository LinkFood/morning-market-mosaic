
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_FRED_FUNCTION, FETCH_TIMEOUT } from "./constants";
import { FredFunctionParams } from "./types";

/**
 * Invoke the Supabase Edge Function to get FRED data with timeout handling
 */
export async function invokeFredFunction(params: FredFunctionParams) {
  try {
    console.log("Invoking FRED function with params:", params);
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    try {
      const { data, error } = await supabase.functions.invoke(SUPABASE_FRED_FUNCTION, {
        body: params
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("FRED function error:", error);
        throw error;
      }
      
      console.log("FRED function response:", data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${FETCH_TIMEOUT/1000} seconds`);
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error calling FRED API function:", error);
    
    // Enhanced error handling with specific messages
    let errorMessage = "Failed to fetch FRED data";
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("401")) {
        errorMessage = "API authentication failed. Please check API key.";
      } else if (error.message.includes("429")) {
        errorMessage = "Too many requests. Please wait and try again.";
      }
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Test FRED API connection
 */
export async function testFredConnection(): Promise<boolean> {
  try {
    console.log("Testing FRED API connection...");
    const response = await invokeFredFunction({ 
      seriesId: "FEDFUNDS", 
      timeSpan: 1,
      forceRefresh: true 
    });
    return !!response;
  } catch (error) {
    console.error("FRED API connection test failed:", error);
    return false;
  }
}
