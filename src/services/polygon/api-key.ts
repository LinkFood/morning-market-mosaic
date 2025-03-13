
/**
 * Polygon.io API Key Management
 * Handles API key initialization and retrieval
 */

// Track API key once fetched
let apiKey: string | null = null;

/**
 * Initialize API key before use
 * @returns Promise with API key
 */
export async function getApiKey(): Promise<string> {
  if (!apiKey) {
    try {
      const { initializeApiKey } = await import('../market/config');
      apiKey = await initializeApiKey();
      const isSuccess = apiKey && apiKey !== "DEMO_API_KEY";
      console.log("API key initialized:", isSuccess ? "Success" : "Using demo key");
    } catch (error) {
      console.error("Failed to initialize API key:", error);
      apiKey = "DEMO_API_KEY";
    }
  }
  return apiKey || "DEMO_API_KEY";
}

export default {
  getApiKey
};
