
import { RefreshCcw, Settings, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { clearAllCacheData } from "@/services/apiService";
import SettingsModal from "./SettingsModal";
import { useTheme } from "./theme-provider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
  const { theme, setTheme } = useTheme();
  
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
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-4 mb-4 bg-card rounded-lg shadow-sm transition-colors duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Morning Market Mosaic</h1>
        <p className="text-sm text-muted-foreground">
          {lastUpdated 
            ? `Last updated at ${formatTime(lastUpdated)}`
            : "Loading market data..."}
        </p>
      </div>
      
      <div className="flex space-x-2 mt-3 md:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {theme === "light" && <Sun className="h-4 w-4 mr-2" />}
              {theme === "dark" && <Moon className="h-4 w-4 mr-2" />}
              {theme === "system" && <Laptop className="h-4 w-4 mr-2" />}
              Theme
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
