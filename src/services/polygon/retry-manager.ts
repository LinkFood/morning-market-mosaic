
/**
 * Polygon.io Retry Manager
 * Handles retries for failed API calls
 */
import client from "./client";

/**
 * Make an API request with retry logic
 * @param endpoint The API endpoint
 * @param retries Number of retries
 * @returns Promise with the API response
 */
export async function polygonRequestWithRetry(
  endpoint: string, 
  params: Record<string, any> = {},
  retries: number = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Use the correct method from the client
      return await client.get(endpoint, params);
    } catch (error) {
      console.warn(`API call failed (attempt ${attempt + 1}/${retries}):`, error);
      lastError = error as Error;
      
      // Don't retry certain errors (like authentication)
      if (error instanceof Error && 
         (error.message.includes("401") || error.message.includes("403"))) {
        console.error("Authentication error, not retrying:", error.message);
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we got here, all retries failed
  throw lastError || new Error("API call failed after multiple retries");
}

export default {
  polygonRequestWithRetry
};
