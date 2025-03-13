
import React, { Suspense, lazy, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { StockDetailProvider } from './components/StockDetail';
import { initializeServices, getServiceStatus } from './services/initialization';

// Lazy load pages for code splitting
const Index = lazy(() => import('./pages/Index'));
const FedDashboard = lazy(() => import('./pages/FedDashboard'));
const FredDebug = lazy(() => import('./components/FredDebug'));
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
const ErrorFallback = ({ error }: { error: string }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center p-4">
    <div className="text-destructive text-xl mb-4">Failed to initialize application</div>
    <div className="text-muted-foreground mb-4">{error}</div>
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
  
  useEffect(() => {
    // Capture any errors at the initialization level
    const init = async () => {
      try {
        console.log("Starting service initialization...");
        const success = await initializeServices();
        console.log("Initialization result:", success ? "Success" : "Failed");
        
        if (!success) {
          const status = getServiceStatus();
          setInitError(status.error || "Unknown initialization error");
        }
        
        setInitializing(false);
      } catch (error) {
        console.error("Unhandled error during initialization:", error);
        setInitError(error instanceof Error ? error.message : "Unexpected initialization error");
        setInitializing(false);
      }
    };
    
    // Wrap in a timeout to ensure React has time to render first
    setTimeout(() => {
      init();
    }, 100);
  }, []);
  
  if (initializing) {
    return <LoadingFallback />;
  }
  
  // Check if initialization completely failed
  if (initError) {
    return <ErrorFallback error={initError} />;
  }
  
  // Check if any services managed to initialize
  const serviceStatus = getServiceStatus();
  
  if (!serviceStatus.initialized) {
    return <ErrorFallback error={serviceStatus.error || "Could not initialize services"} />;
  }
  
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
