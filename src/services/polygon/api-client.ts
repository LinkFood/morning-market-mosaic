
/**
 * Polygon.io API Client
 * Handles basic API communication and error handling
 */
import { POLYGON_BASE_URL } from "../market/config";
import { getApiKey } from "./api-key";

const DEBUG_MODE = true; // Set to false in production

/**
 * Makes the actual API call to Polygon
 */
export async function makeApiCall(endpoint: string) {
  try {
    const key = await getApiKey();
    const url = `${POLYGON_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apiKey=${key}`;
    
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
        dataPreview: JSON.stringify(data).slice(0, 200) + '...'
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
