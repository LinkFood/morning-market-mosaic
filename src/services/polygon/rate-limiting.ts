
/**
 * Polygon.io Rate Limiting
 * Handles API rate limiting and queuing
 */

// API rate limit settings
const RATE_LIMIT = 100; // 100 calls per minute on Stock Starter plan
const MINUTE_IN_MS = 60 * 1000;

// Rate limiting state
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
        const { makeApiCall } = await import('./api-client');
        const data = await makeApiCall(endpoint);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
}

/**
 * Check if we're currently rate limited
 * @returns True if rate limited, false otherwise
 */
export function isRateLimited(): boolean {
  return apiCallCount >= RATE_LIMIT && (rateLimitResetTime - Date.now() > 0);
}

/**
 * Add a request to the queue
 * @param endpoint The API endpoint
 * @returns Promise that resolves when the request is processed
 */
export function queueRequest(endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    requestQueue.push({ endpoint, resolve, reject });
  });
}

/**
 * Increment the API call counter
 */
export function incrementCallCount(): void {
  apiCallCount++;
}

export default {
  isRateLimited,
  queueRequest,
  incrementCallCount
};
