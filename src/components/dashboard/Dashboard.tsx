
import React from "react";
import { useTheme } from "@/components/theme-provider";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardLayout from "./DashboardLayout";
import { DashboardProvider, useDashboard } from "./DashboardContext";

/**
 * Main Dashboard component wrapping all dashboard functionality
 */
const Dashboard = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

/**
 * Inner dashboard content component that has access to dashboard context
 */
const DashboardContent = () => {
  const { 
    lastUpdated, 
    loadData, 
    refreshing, 
    settings, 
    updateSettings 
  } = useDashboard();
  
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 px-4">
        <DashboardHeader 
          lastUpdated={lastUpdated}
          refreshData={loadData}
          isRefreshing={refreshing}
          userSettings={settings}
          updateUserSettings={updateSettings}
        />
        
        <DashboardLayout />
      </div>
    </div>
  );
};

export default Dashboard;
