
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
    const { initializeApiKey } = await import('./market/config');
    const apiKey = await initializeApiKey();
    console.log("API key initialized:", apiKey ? "Success" : "Failed");
    
    // Test Polygon API connection
    try {
      const polygon = await import('./polygon');
      const status = await polygon.default.getMarketStatus();
      serviceStatus.polygonApi = !!status;
      console.log("Polygon API connection test:", status ? "Success" : "Failed");
    } catch (e) {
      console.error("Failed to test Polygon API connection:", e);
      serviceStatus.polygonApi = false;
      serviceStatus.error = "Failed to connect to market data API";
    }
    
    // Test FRED API if you're using it
    try {
      const fredApi = await import('./fred');
      const fedData = await fredApi.default.testFredConnection();
      serviceStatus.fredApi = !!fedData;
      console.log("FRED API connection test:", fedData ? "Success" : "Failed");
    } catch (e) {
      console.error("Failed to test FRED API connection:", e);
      serviceStatus.fredApi = false;
      // Don't fail initialization for this one as it's secondary
    }
    
    // Set overall initialization status
    serviceStatus.initialized = serviceStatus.polygonApi || serviceStatus.fredApi;
    
    // Show toast if partial initialization
    if (serviceStatus.initialized && serviceStatus.error) {
      toast.warning("Some services failed to initialize. Some features may be limited.");
    } else if (serviceStatus.initialized) {
      toast.success("Application services initialized successfully");
    }
    
    return serviceStatus.initialized;
  } catch (error) {
    console.error("Failed to initialize services:", error);
    serviceStatus.error = error instanceof Error ? error.message : "Unknown error";
    serviceStatus.initialized = false;
    toast.error("Failed to initialize application services");
    return false;
  }
}

/**
 * Get current service status
 */
export function getServiceStatus(): ServiceStatus {
  return { ...serviceStatus };
}
