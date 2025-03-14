
/**
 * Polygon.io API Client
 * Handles authentication and base API calls
 */
import { getPolygonApiKey } from "../market/config";

const BASE_URL = 'https://api.polygon.io';

/**
 * Make a GET request to the Polygon API with authentication
 */
async function get(endpoint: string, params: Record<string, any> = {}) {
  try {
    // Get API key
    const apiKey = await getPolygonApiKey();
    
    // Build URL with query parameters
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    // Add all parameters to URL
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    // Add API key as query parameter (this is how Polygon.io expects it)
    url.searchParams.append('apiKey', apiKey);
    
    console.log(`Making Polygon API request to: ${endpoint}`);
    
    // Make request
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Polygon API error (${response.status}): ${errorText} - URL: ${url.toString().replace(apiKey, 'API_KEY_HIDDEN')}`);
      throw new Error(`Polygon API error (${response.status}): ${errorText}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Check for API errors
    if (data.status === 'ERROR') {
      console.error(`Polygon API error: ${data.error || 'Unknown error'}`);
      throw new Error(`Polygon API error: ${data.error || 'Unknown error'}`);
    }
    
    // Debug success
    console.log(`Successfully received data from Polygon API for ${endpoint}`);
    
    return data;
  } catch (error) {
    console.error('Polygon API request failed:', error);
    throw error;
  }
}

export default {
  get
};
