
/**
 * Polygon.io API Client
 * Handles authentication and base API calls
 */
import { getPolygonApiKey } from "../market/config";

const BASE_URL = 'https://api.polygon.io';

/**
 * Make a request to the Polygon API with proper authentication
 * @param endpoint API endpoint path (starting with /)
 * @param params Optional query parameters
 * @returns Promise with API response
 */
export async function polygonRequest(endpoint: string, params: Record<string, any> = {}) {
  try {
    // Get API key
    const apiKey = await getPolygonApiKey();
    
    // Build URL with query parameters
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    // Add all parameters to URL but NOT the API key
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    // Log request for debugging
    console.log(`Polygon API request: ${endpoint}`);
    
    // Make request with Authorization header instead of query parameter
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Polygon API error (${response.status}): ${errorText}`);
      throw new Error(`Polygon API error (${response.status}): ${errorText}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Check for API-level errors
    if (data.status === 'ERROR') {
      console.error(`Polygon API returned error: ${data.error}`);
      throw new Error(`Polygon API error: ${data.error}`);
    }
    
    return data;
  } catch (error) {
    console.error('Polygon API request failed:', error);
    throw error;
  }
}

export default {
  polygonRequest
};
