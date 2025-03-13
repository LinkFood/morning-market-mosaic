
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './App.css';

// Import pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import FedDashboard from './pages/FedDashboard';
import ApiDiagnostics from './pages/ApiDiagnostics';
import Dashboard from './pages/Dashboard';
import { initializeServices } from './services/initialization';

function App() {
  useEffect(() => {
    // Initialize services when the app loads
    initializeServices().catch(console.error);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <Toaster position="top-right" closeButton richColors />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fed-dashboard" element={<FedDashboard />} />
          <Route path="/api-diagnostics" element={<ApiDiagnostics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
