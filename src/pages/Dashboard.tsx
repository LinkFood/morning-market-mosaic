
import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { StockDetailProvider } from '@/components/stock-detail/StockDetailContext';

const DashboardPage = () => {
  return (
    <StockDetailProvider>
      <Dashboard />
    </StockDetailProvider>
  );
};

export default DashboardPage;
