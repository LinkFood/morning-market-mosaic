
/**
 * Service Initialization Module
 * Ensures all services are properly initialized before use
 */
import { toast } from "sonner";
import { updateFeatureFlags, getFeatureFlags } from "./features";

// Service health status
export interface ServiceStatus {
  polygonApi: boolean;
  fredApi: boolean;
  geminiApi: boolean;
  initialized: boolean;
  error: string | null;
}

// Global service status
let serviceStatus: ServiceStatus = {
  polygonApi: false,
  fredApi: false,
  geminiApi: false,
  initialized: false,
  error: null
};

/**
 * Initialize all application services
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function initializeServices(): Promise<boolean> {
  console.log("Initializing application services...");
  
  try {
    // Initialize API key
    let apiKey = null;
    try {
      const { initializeApiKey } = await import('./market/config');
      apiKey = await initializeApiKey();
      console.log("API key initialized:", apiKey ? "Success" : "Failed");
    } catch (e) {
      console.error("Failed to initialize API key:", e);
      serviceStatus.error = "API key initialization failed";
      // Continue execution - don't throw here
    }
    
    // Initialize services in parallel for better performance
    const results = await Promise.allSettled([
      initializeMarketData(),
      initializeFredData(),
      testGeminiApiConnection()
    ]);
    
    // Extract results
    const marketResult = results[0];
    const fredResult = results[1];
    const geminiResult = results[2];
    
    // Update service status based on results
    serviceStatus.polygonApi = marketResult.status === 'fulfilled' ? marketResult.value : false;
    serviceStatus.fredApi = fredResult.status === 'fulfilled' ? fredResult.value : false;
    serviceStatus.geminiApi = geminiResult.status === 'fulfilled' ? geminiResult.value : false;
    
    // Set initialization status - consider success if any API initialized
    serviceStatus.initialized = serviceStatus.polygonApi || serviceStatus.fredApi;
    
    // Update feature flags based on service availability
    updateFeatureFlags(
      serviceStatus.polygonApi, 
      serviceStatus.fredApi,
      serviceStatus.geminiApi
    );
    
    // Show appropriate toast based on status
    if (serviceStatus.initialized && serviceStatus.error) {
      toast.warning("Some services failed to initialize. Some features may be limited.");
    } else if (serviceStatus.initialized) {
      toast.success("Application services initialized successfully");
    } else {
      // If no services initialized, set a generic error
      serviceStatus.error = serviceStatus.error || "Failed to initialize application services";
      toast.error(serviceStatus.error);
    }
    
    // Log the current feature flags after initialization
    console.log("Current feature flags after initialization:", getFeatureFlags());
    
    return serviceStatus.initialized;
  } catch (error) {
    console.error("Unhandled error during service initialization:", error);
    serviceStatus.error = error instanceof Error ? error.message : "Unknown error";
    serviceStatus.initialized = false;
    toast.error("Failed to initialize application services");
    
    // Make sure feature flags are updated even in case of error
    updateFeatureFlags(false, false, false);
    
    return false;
  }
}

/**
 * Initialize market data services
 */
async function initializeMarketData(): Promise<boolean> {
  try {
    // Test Polygon API connection
    const polygon = await import('./polygon');
    const status = await polygon.default.getMarketStatus();
    const isAvailable = !!status;
    serviceStatus.polygonApi = isAvailable;
    console.log("Polygon API connection test:", isAvailable ? "Success" : "Failed");
    return isAvailable;
  } catch (e) {
    console.error("Failed to test Polygon API connection:", e);
    serviceStatus.polygonApi = false;
    serviceStatus.error = "Failed to connect to market data API";
    return false;
  }
}

/**
 * Initialize FRED economic data services
 */
async function initializeFredData(): Promise<boolean> {
  try {
    // Use dynamic import with destructuring to get the function directly
    const fredModule = await import('./fred');
    // Access the testFredConnection function from the imported module
    const fedData = await fredModule.testFredConnection();
    const isAvailable = !!fedData;
    serviceStatus.fredApi = isAvailable;
    console.log("FRED API connection test:", isAvailable ? "Success" : "Failed");
    return isAvailable;
  } catch (e) {
    console.error("Failed to test FRED API connection:", e);
    serviceStatus.fredApi = false;
    // Don't set global error for this one as it's secondary
    return false;
  }
}

/**
 * Test Gemini API connection via the Supabase Edge Function
 */
async function testGeminiApiConnection(): Promise<boolean> {
  try {
    console.log("Testing Gemini API connection...");
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Send a minimal test request to the edge function
    const { data, error } = await supabase.functions.invoke('gemini-stock-analysis', {
      body: { 
        stocks: [
          {
            ticker: "TEST",
            close: 100,
            changePercent: 0,
            signals: ["test"],
            scores: { composite: 50 }
          }
        ] 
      }
    });
    
    if (error) {
      console.error("Gemini API connection test failed:", error);
      return false;
    }
    
    // Check if we got a proper response structure
    const success = data && !data.error && data.stockAnalyses;
    console.log("Gemini API connection test:", success ? "Success" : "Failed");
    serviceStatus.geminiApi = success;
    return success;
    
  } catch (e) {
    console.error("Failed to test Gemini API connection:", e);
    serviceStatus.geminiApi = false;
    return false;
  }
}

/**
 * Get current service status
 */
export function getServiceStatus(): ServiceStatus {
  return { ...serviceStatus };
}
