
import { supabase } from "@/integrations/supabase/client";

/**
 * Polygon API Key Service
 * Provides methods for securely accessing the Polygon API key
 */

/**
 * Get Polygon API key from Supabase
 */
export async function getPolygonApiKey(): Promise<string> {
  try {
    // Call Supabase function to get API key
    const { data, error } = await supabase.functions.invoke('get-polygon-api-key');
    
    if (error) {
      console.error("Error fetching Polygon API key from Supabase:", error);
      return process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'DEMO_API_KEY';
    }
    
    // Check if the function returned a valid API key
    if (data && data.apiKey) {
      return data.apiKey;
    } else {
      console.warn("Polygon API key is missing in Supabase function response, using demo key");
      return process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'DEMO_API_KEY';
    }
  } catch (error) {
    console.error("Error invoking Supabase function:", error);
    return process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'DEMO_API_KEY';
  }
}

export default {
  getPolygonApiKey
};
