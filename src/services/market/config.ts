
/**
 * Market data configuration
 */
import { getSupabaseClient } from "@/integrations/supabase/client";

// API configuration for Polygon.io
export const POLYGON_BASE_URL = "https://api.polygon.io";

// Get API key from Supabase
export async function getPolygonApiKey(): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke("get-polygon-api-key");
    
    if (error) {
      console.error("Error fetching Polygon API key:", error);
      return "DEMO_API_KEY";
    }
    
    return data?.apiKey || "DEMO_API_KEY";
  } catch (error) {
    console.error("Failed to get Polygon API key:", error);
    return "DEMO_API_KEY";
  }
}

// Store API key once fetched
let POLYGON_API_KEY: string | null = null;

// Initialize API key
export const initializeApiKey = async (): Promise<string> => {
  if (!POLYGON_API_KEY) {
    POLYGON_API_KEY = await getPolygonApiKey();
  }
  return POLYGON_API_KEY;
};

export { POLYGON_API_KEY };
