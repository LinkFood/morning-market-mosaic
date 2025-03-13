
/**
 * Polygon.io API Key Management
 * Handles API key initialization and retrieval
 */

// Track API key once fetched
let apiKey: string | null = null;
let retrievalAttempts = 0;
const MAX_ATTEMPTS = 3;

/**
 * Initialize API key before use
 * @returns Promise with API key
 */
export async function getApiKey(): Promise<string> {
  // Return cached key if available
  if (apiKey) {
    return apiKey;
  }
  
  try {
    // Increment retrieval attempts
    retrievalAttempts++;
    console.log(`Initializing API key (attempt ${retrievalAttempts}/${MAX_ATTEMPTS})`);
    
    const { initializeApiKey } = await import('../market/config');
    apiKey = await initializeApiKey();
    
    const isSuccess = apiKey && apiKey !== "DEMO_API_KEY";
    console.log("API key initialized:", isSuccess ? "Success" : "Using demo key");
    
    return apiKey || "DEMO_API_KEY";
  } catch (error) {
    console.error("Failed to initialize API key:", error);
    
    // If we haven't exceeded max attempts, we could retry
    if (retrievalAttempts < MAX_ATTEMPTS) {
      console.log(`Retrying API key initialization (${retrievalAttempts}/${MAX_ATTEMPTS})`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getApiKey(); // Recursive retry
    }
    
    // Max attempts reached, use demo key
    console.warn("Maximum API key retrieval attempts reached, falling back to demo key");
    apiKey = "DEMO_API_KEY";
    return "DEMO_API_KEY";
  }
}

/**
 * Check if we're using the demo API key
 */
export function isUsingDemoKey(): boolean {
  return apiKey === "DEMO_API_KEY";
}

/**
 * Reset the API key cache (for testing or after authentication changes)
 */
export function resetApiKey(): void {
  apiKey = null;
  retrievalAttempts = 0;
}

export default {
  getApiKey,
  isUsingDemoKey,
  resetApiKey
};
