
import { RefreshCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { clearAllCacheData } from "@/services/apiService";
import SettingsModal from "./SettingsModal";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  refreshData: () => void;
  isRefreshing: boolean;
  userSettings: any;
  updateUserSettings: (settings: any) => void;
}

const DashboardHeader = ({
  lastUpdated,
  refreshData,
  isRefreshing,
  userSettings,
  updateUserSettings
}: DashboardHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  
  const handleRefresh = () => {
    clearAllCacheData();
    refreshData();
  };
  
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-4 mb-4 bg-white rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Morning Market Mosaic</h1>
        <p className="text-sm text-muted-foreground">
          {lastUpdated 
            ? `Last updated at ${formatTime(lastUpdated)}`
            : "Loading market data..."}
        </p>
      </div>
      
      <div className="flex space-x-2 mt-3 md:mt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        updateSettings={updateUserSettings}
      />
    </header>
  );
};

export default DashboardHeader;
