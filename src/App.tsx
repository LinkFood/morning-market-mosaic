
import React, { Suspense, lazy, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { StockDetailProvider } from './components/StockDetail';
import { initializeServices } from './services/initialization';

// Lazy load pages for code splitting
const Index = lazy(() => import('./pages/Index'));
const FedDashboard = lazy(() => import('./pages/FedDashboard'));
const FredDebug = lazy(() => import('./components/FredDebug'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

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

function App() {
  // Initialize services when the app loads
  useEffect(() => {
    const initialize = async () => {
      await initializeServices();
    };
    
    initialize();
  }, []);

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
