
/**
 * Polygon.io Retry Manager
 * Handles retries for failed API calls
 */
import { polygonRequest } from "./client";

// Configurable retry settings
const DEFAULT_RETRIES = 3;
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 30000; // 30 seconds

// Error categories
const RETRIABLE_ERRORS = ['429', '500', '502', '503', '504', 'timeout', 'network'];
const NON_RETRIABLE_ERRORS = ['401', '403', '404'];

/**
 * Make an API request with retry logic
 * @param endpoint The API endpoint
 * @param retries Number of retries
 * @param params Optional parameters for the request
 * @returns Promise with the API response
 */
export async function polygonRequestWithRetry(
  endpoint: string, 
  retries: number = DEFAULT_RETRIES,
  params?: Record<string, any>
): Promise<any> {
  // Ensure retries is within reasonable bounds
  retries = Math.min(Math.max(1, retries), MAX_RETRIES);
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await polygonRequest(endpoint);
    } catch (error) {
      console.warn(`API call failed (attempt ${attempt + 1}/${retries}):`, error);
      lastError = error as Error;
      const errorMessage = (error as Error).message || '';
      
      // Check if this error should not be retried
      if (NON_RETRIABLE_ERRORS.some(code => errorMessage.includes(code))) {
        console.error(`Non-retriable error detected (${errorMessage}). Aborting retries.`);
        break;
      }
      
      // Check if we've reached the max retries
      if (attempt >= retries - 1) {
        console.error(`Maximum retries (${retries}) reached for endpoint: ${endpoint}`);
        break;
      }
      
      // Wait before retrying (exponential backoff with jitter)
      const delay = Math.min(
        BASE_DELAY * Math.pow(2, attempt) + Math.random() * 1000,
        MAX_DELAY
      );
      
      console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we got here, all retries failed
  throw lastError || new Error(`API call failed after ${retries} retries`);
}

export default {
  polygonRequestWithRetry
};
