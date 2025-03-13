
// Define API endpoints
export const POLYGON_BASE_URL = "https://api.polygon.io";
export const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

// Import Supabase client to access secrets
import { supabase } from "@/integrations/supabase/client";

// This would be set by user in a real app
export const POLYGON_API_KEY = "DEMO_API_KEY"; // Demo mode will return sample data until we fetch the real key
export const FRED_API_KEY = "DEMO_API_KEY";    // Demo mode will return sample data

// Cache TTL in milliseconds
export const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day

// Function to get the Polygon API key from Supabase
export async function getPolygonApiKey(): Promise<string> {
  try {
    // Try to get the API key from Supabase
    const { data, error } = await supabase.functions.invoke("get-polygon-api-key");
    
    if (error) {
      console.error("Error fetching Polygon API key:", error);
      return POLYGON_API_KEY; // Fall back to demo key
    }
    
    if (data && data.apiKey) {
      return data.apiKey;
    }
    
    return POLYGON_API_KEY; // Fall back to demo key
  } catch (error) {
    console.error("Failed to get Polygon API key:", error);
    return POLYGON_API_KEY; // Fall back to demo key
  }
}
