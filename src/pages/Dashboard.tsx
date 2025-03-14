
import React, { useEffect } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { StockDetailProvider } from '@/components/stock-detail/StockDetailContext';
import { initializeServices } from '@/services/initialization';

const DashboardPage = () => {
  // Initialize services when the dashboard page loads
  useEffect(() => {
    initializeServices().catch(console.error);
  }, []);

  return (
    <StockDetailProvider>
      <Dashboard />
    </StockDetailProvider>
  );
};

export default DashboardPage;
