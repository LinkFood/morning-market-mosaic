
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import Index from './pages/Index';
import FedDashboard from './pages/FedDashboard';
import NotFound from './pages/NotFound';
import { StockDetailProvider } from './components/StockDetail';
import FredDebug from './components/FredDebug';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <StockDetailProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/fed-dashboard" element={<FedDashboard />} />
              <Route path="/fred-debug" element={<FredDebug />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="bottom-right" />
        </StockDetailProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
