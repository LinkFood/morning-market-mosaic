
/**
 * Polygon.io API Client
 * Handles basic API communication and error handling
 */
import { getPolygonApiKey } from "../market/config";

const BASE_URL = 'https://api.polygon.io';
const DEBUG_MODE = true; // Set to false in production

/**
 * Makes an API call to Polygon
 */
export async function makeApiCall(endpoint: string) {
  try {
    const apiKey = await getPolygonApiKey();
    
    // Build URL and add API key
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apiKey=${apiKey}`;
    
    if (DEBUG_MODE) console.log(`📡 API Request: ${endpoint}`);
    const startTime = performance.now();
    
    const response = await fetch(url);
    const endTime = performance.now();
    
    if (DEBUG_MODE) {
      console.log(`⏱️ API Response Time: ${Math.round(endTime - startTime)}ms`);
      console.log(`📊 API Status: ${response.status}`);
    }
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      if (DEBUG_MODE) console.error(`❌ API Error: ${errorText}`);
      throw new Error(`Polygon API Error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (DEBUG_MODE) {
      console.log(`✅ API Response: ${endpoint}`, {
        status: response.status,
        dataPreview: data.results ? `${data.results.length} results` : 'No results property'
      });
    }
    
    return data;
  } catch (error) {
    console.error("Polygon API call failed:", error);
    throw error;
  }
}

export default {
  makeApiCall
};
