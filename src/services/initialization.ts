
/**
 * Service Initialization Module
 * Ensures all services are properly initialized before use
 */
import { toast } from "sonner";

// Service health status
export interface ServiceStatus {
  polygonApi: boolean;
  fredApi: boolean;
  initialized: boolean;
  error: string | null;
}

// Global service status
let serviceStatus: ServiceStatus = {
  polygonApi: false,
  fredApi: false,
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
    await Promise.allSettled([
      initializeMarketData(),
      initializeFredData()
    ]);
    
    // Set initialization status - consider success if any API initialized
    serviceStatus.initialized = serviceStatus.polygonApi || serviceStatus.fredApi;
    
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
    
    return serviceStatus.initialized;
  } catch (error) {
    console.error("Unhandled error during service initialization:", error);
    serviceStatus.error = error instanceof Error ? error.message : "Unknown error";
    serviceStatus.initialized = false;
    toast.error("Failed to initialize application services");
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
    serviceStatus.polygonApi = !!status;
    console.log("Polygon API connection test:", status ? "Success" : "Failed");
    return serviceStatus.polygonApi;
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
    serviceStatus.fredApi = !!fedData;
    console.log("FRED API connection test:", fedData ? "Success" : "Failed");
    return serviceStatus.fredApi;
  } catch (e) {
    console.error("Failed to test FRED API connection:", e);
    serviceStatus.fredApi = false;
    // Don't set global error for this one as it's secondary
    return false;
  }
}

/**
 * Get current service status
 */
export function getServiceStatus(): ServiceStatus {
  return { ...serviceStatus };
}
