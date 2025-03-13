
/**
 * Polygon.io API Client
 * Main entry point that orchestrates API communication, rate limiting, and error handling
 */
import { toast } from "sonner";
import { makeApiCall } from "./api-client";
import { isRateLimited, queueRequest, incrementCallCount } from "./rate-limiting";
import { polygonRequestWithRetry } from "./retry-manager";

/**
 * Make an API request to Polygon.io with rate limiting
 * @param endpoint The API endpoint path (without base URL)
 * @returns Promise with the API response
 */
export async function polygonRequest(endpoint: string): Promise<any> {
  // Check if we're at the rate limit
  if (isRateLimited()) {
    // Calculate wait time until reset
    console.log(`Rate limit reached, queuing request to: ${endpoint}`);
    
    // Queue the request
    return queueRequest(endpoint);
  }
  
  // Increment call counter
  incrementCallCount();
  
  // Make the API call
  try {
    return await makeApiCall(endpoint);
  } catch (error) {
    // Handle specific API errors
    if (error instanceof Error) {
      // Check for rate limit errors from Polygon
      if (error.message.includes("429")) {
        toast.error("API rate limit exceeded. Please try again later.");
        
        // Queue the request to try again later
        return queueRequest(endpoint);
      }
      
      // Handle auth errors
      if (error.message.includes("401") || error.message.includes("403")) {
        toast.error("API authentication error. Please check your API key.");
      }
    }
    
    throw error;
  }
}

export { polygonRequestWithRetry };

export default {
  polygonRequest,
  polygonRequestWithRetry
};
