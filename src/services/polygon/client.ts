
/**
 * Polygon.io API Client
 * Handles API communication, rate limiting, and error handling
 */
import { toast } from "sonner";

// Set up the Polygon.io API configuration
const POLYGON_BASE_URL = "https://api.polygon.io";
const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key

// API rate limit settings
const RATE_LIMIT = 100; // 100 calls per minute on Stock Starter plan
const MINUTE_IN_MS = 60 * 1000;

// Track API calls for rate limiting
let apiCallCount = 0;
let rateLimitResetTime = Date.now() + MINUTE_IN_MS;

// Queue for pending requests when rate limited
interface QueuedRequest {
  endpoint: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}
const requestQueue: QueuedRequest[] = [];

/**
 * Reset the API call counter every minute
 */
setInterval(() => {
  apiCallCount = 0;
  rateLimitResetTime = Date.now() + MINUTE_IN_MS;
  
  // Process any queued requests if available
  processQueue();
}, MINUTE_IN_MS);

/**
 * Process queued requests when rate limit resets
 */
function processQueue() {
  // Process up to rate limit
  const processCount = Math.min(requestQueue.length, RATE_LIMIT);
  
  if (processCount > 0) {
    console.log(`Processing ${processCount} queued requests`);
    
    // Take requests from the front of the queue
    const requestsToProcess = requestQueue.splice(0, processCount);
    
    // Process each request
    requestsToProcess.forEach(async ({ endpoint, resolve, reject }) => {
      try {
        const data = await makeApiCall(endpoint);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
}

/**
 * Makes the actual API call to Polygon
 */
async function makeApiCall(endpoint: string) {
  try {
    const url = `${POLYGON_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Polygon API Error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Polygon API call failed:", error);
    throw error;
  }
}

/**
 * Make an API request to Polygon.io with rate limiting
 * @param endpoint The API endpoint path (without base URL)
 * @returns Promise with the API response
 */
export async function polygonRequest(endpoint: string): Promise<any> {
  // Check if we're at the rate limit
  if (apiCallCount >= RATE_LIMIT) {
    // Calculate wait time until reset
    const waitTime = rateLimitResetTime - Date.now();
    
    if (waitTime > 0) {
      console.log(`Rate limit reached, queuing request to: ${endpoint}`);
      
      // Queue the request
      return new Promise((resolve, reject) => {
        requestQueue.push({ endpoint, resolve, reject });
      });
    } else {
      // Reset time has passed, reset counter
      apiCallCount = 0;
      rateLimitResetTime = Date.now() + MINUTE_IN_MS;
    }
  }
  
  // Increment call counter
  apiCallCount++;
  
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
        return new Promise((resolve, reject) => {
          requestQueue.push({ endpoint, resolve, reject });
        });
      }
      
      // Handle auth errors
      if (error.message.includes("401") || error.message.includes("403")) {
        toast.error("API authentication error. Please check your API key.");
      }
    }
    
    throw error;
  }
}

export default {
  polygonRequest
};
