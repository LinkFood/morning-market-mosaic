
import React from "react";
import { useTheme } from "@/components/theme-provider";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardLayout from "./DashboardLayout";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
    updateSettings,
    featureFlags
  } = useDashboard();
  
  const { theme } = useTheme();

  // Check if we have limited functionality
  const hasLimitedFunctionality = !featureFlags.useRealTimeData || 
                                 !featureFlags.showMarketMovers || 
                                 !featureFlags.useFredEconomicData;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 px-4">
        {hasLimitedFunctionality && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some features are currently unavailable due to service connectivity issues.
            </AlertDescription>
          </Alert>
        )}
        
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
