
/**
 * Market data configuration
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// API configuration for Polygon.io
export const POLYGON_BASE_URL = "https://api.polygon.io";

// Current working API key for development/testing
// Your free tier API key
const POLYGON_DEV_KEY = "kCopX5axh7_aHzSDUWQ4PXMvH9HrXWev";

// Demo key for fallback (very limited functionality)
const DEMO_KEY = "DEMO_API_KEY";

// Maximum retries for API key retrieval
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Flag to use the dev key directly (for faster development)
const USE_DEV_KEY = true;

// Get API key from Supabase with retries
export async function getPolygonApiKey(): Promise<string> {
  // During development, use the dev key directly to avoid delays
  if (USE_DEV_KEY) {
    console.log("Using development Polygon API key");
    return POLYGON_DEV_KEY;
  }
  
  console.log("Attempting to retrieve Polygon API key from Supabase");
  
  // Try multiple times if needed
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Polygon API key retrieval attempt ${attempt} of ${MAX_RETRIES}`);
      
      const { data, error } = await supabase.functions.invoke("get-polygon-api-key");
      
      if (error) {
        console.error(`Error fetching Polygon API key (attempt ${attempt}):`, error);
        
        if (attempt === MAX_RETRIES) {
          console.warn("Maximum retries reached, falling back to dev key");
          return POLYGON_DEV_KEY; // Fall back to dev key instead of demo key
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      
      // Validate response
      if (!data?.apiKey) {
        console.error(`Invalid response format (attempt ${attempt}):`, data);
        
        if (attempt === MAX_RETRIES) {
          console.warn("Maximum retries reached, falling back to dev key");
          return POLYGON_DEV_KEY; // Fall back to dev key instead of demo key
        }
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      
      console.log("Successfully retrieved Polygon API key");
      return data.apiKey;
    } catch (error) {
      console.error(`Unexpected error during API key retrieval (attempt ${attempt}):`, error);
      
      if (attempt === MAX_RETRIES) {
        console.warn("Maximum retries reached due to unexpected error, falling back to dev key");
        return POLYGON_DEV_KEY; // Fall back to dev key instead of demo key
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  // Fall back to dev key instead of demo key
  return POLYGON_DEV_KEY;
}

// Store API key once fetched
let POLYGON_API_KEY: string | null = null;
let keyRetrievalInProgress = false;
let keyRetrievalPromise: Promise<string> | null = null;

// Initialize API key with concurrency control
export const initializeApiKey = async (): Promise<string> => {
  // Return existing key if available
  if (POLYGON_API_KEY) {
    return POLYGON_API_KEY;
  }
  
  // If key retrieval is already in progress, wait for that promise
  if (keyRetrievalInProgress && keyRetrievalPromise) {
    return keyRetrievalPromise;
  }
  
  // Start new key retrieval
  try {
    keyRetrievalInProgress = true;
    keyRetrievalPromise = getPolygonApiKey();
    
    POLYGON_API_KEY = await keyRetrievalPromise;
    
    // Check if we got the demo key
    if (POLYGON_API_KEY === DEMO_KEY) {
      toast.warning("Using limited demo API key. Some features will be restricted.");
    }
    
    return POLYGON_API_KEY;
  } catch (error) {
    console.error("Failed to initialize API key:", error);
    toast.error("Failed to retrieve API key. Using dev mode.");
    return POLYGON_DEV_KEY; // Fall back to dev key instead of demo key
  } finally {
    keyRetrievalInProgress = false;
    keyRetrievalPromise = null;
  }
};

export { POLYGON_API_KEY };
