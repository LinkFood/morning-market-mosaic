
import React, { Suspense, lazy, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { StockDetailProvider } from './components/StockDetail';
import { initializeServices, getServiceStatus } from './services/initialization';
import { initializeFeatureFlags } from './services/features';

// Lazy load pages for code splitting
const Index = lazy(() => import('./pages/Index'));
const FedDashboard = lazy(() => import('./pages/FedDashboard'));
const FredDebug = lazy(() => import('./components/FredDebug'));
const ApiDiagnostics = lazy(() => import('./pages/ApiDiagnostics'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Loading fallback
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

// Error fallback
const ErrorFallback = ({ error, featureFlags }: { error: string, featureFlags?: any }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center p-4">
    <div className="text-destructive text-xl mb-4">Limited functionality available</div>
    <div className="text-muted-foreground mb-4">{error}</div>
    {featureFlags && (
      <div className="text-sm text-muted-foreground mb-4">
        <p>Some features may be disabled due to service availability.</p>
      </div>
    )}
    <button 
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  </div>
);

function App() {
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState<any>(null);
  
  useEffect(() => {
    // Initialize feature flags first
    initializeFeatureFlags();
    
    // Capture any errors at the initialization level
    const init = async () => {
      try {
        console.log("Starting service initialization...");
        
        // Allow UI to render first
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const success = await initializeServices();
        console.log("Initialization result:", success ? "Success" : "Partial failure");
        
        // Update feature flags from the latest state
        setFeatureFlags(window.__FEATURE_FLAGS__);
        
        if (!success) {
          const status = getServiceStatus();
          setInitError(status.error || "Some services failed to initialize");
        }
        
        setInitializing(false);
      } catch (error) {
        console.error("Unhandled error during initialization:", error);
        setInitError(error instanceof Error ? error.message : "Unexpected initialization error");
        setFeatureFlags(window.__FEATURE_FLAGS__);  // Make sure we have latest feature flags even during errors
        setInitializing(false);
      }
    };
    
    // Wrap in a timeout to ensure React has time to render first
    init();
  }, []);
  
  if (initializing) {
    return <LoadingFallback />;
  }
  
  // Check if initialization completely failed with no graceful degradation possible
  if (initError && featureFlags && !featureFlags.enableDataRefresh && !featureFlags.useRealTimeData && !featureFlags.useFredEconomicData) {
    return <ErrorFallback error={initError} />;
  }
  
  // If there's a partial failure but some features are still available, show a toast but continue
  if (initError) {
    // We'll continue with limited functionality
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <StockDetailProvider>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {featureFlags && featureFlags.useFredEconomicData && (
                    <Route path="/fed-dashboard" element={<FedDashboard />} />
                  )}
                  {featureFlags && featureFlags.useFredEconomicData && (
                    <Route path="/fred-debug" element={<FredDebug />} />
                  )}
                  <Route path="/api-diagnostics" element={<ApiDiagnostics />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
            <div className="fixed top-0 left-0 right-0 bg-amber-400 text-black text-sm py-1 px-4 text-center z-50">
              Limited functionality: Some services are unavailable. <a href="/api-diagnostics" className="underline font-medium">Run diagnostics</a>
            </div>
            <Toaster position="bottom-right" />
          </StockDetailProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }
  
  // Normal flow - all services initialized successfully
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <StockDetailProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/fed-dashboard" element={<FedDashboard />} />
                <Route path="/fred-debug" element={<FredDebug />} />
                <Route path="/api-diagnostics" element={<ApiDiagnostics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster position="bottom-right" />
        </StockDetailProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
