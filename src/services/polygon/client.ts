
/**
 * Polygon.io API Client
 * Handles API communication, rate limiting, and error handling
 */
import { toast } from "sonner";
import { POLYGON_BASE_URL } from "../market/config";

// API rate limit settings
const RATE_LIMIT = 100; // 100 calls per minute on Stock Starter plan
const MINUTE_IN_MS = 60 * 1000;
const DEBUG_MODE = true; // Set to false in production

// Track API calls for rate limiting
let apiCallCount = 0;
let rateLimitResetTime = Date.now() + MINUTE_IN_MS;
let apiKey: string | null = null;

// Queue for pending requests when rate limited
interface QueuedRequest {
  endpoint: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}
const requestQueue: QueuedRequest[] = [];

// Initialize API key before use
async function getApiKey(): Promise<string> {
  if (!apiKey) {
    try {
      const { initializeApiKey } = await import('../market/config');
      apiKey = await initializeApiKey();
      if (DEBUG_MODE) console.log("API key initialized:", apiKey ? "Success" : "Using demo key");
    } catch (error) {
      console.error("Failed to initialize API key:", error);
      apiKey = "DEMO_API_KEY";
    }
  }
  return apiKey || "DEMO_API_KEY";
}

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

/**
 * Make an API request with retry logic
 */
export async function polygonRequestWithRetry(
  endpoint: string, 
  retries: number = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await polygonRequest(endpoint);
    } catch (error) {
      console.warn(`API call failed (attempt ${attempt + 1}/${retries}):`, error);
      lastError = error as Error;
      
      // Don't retry certain errors (like authentication)
      if (error instanceof Error && 
         (error.message.includes("401") || error.message.includes("403"))) {
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
  polygonRequest,
  polygonRequestWithRetry
};
