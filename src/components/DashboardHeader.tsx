
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";
import { BarChart3, RefreshCw, Settings } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import SettingsModal from "@/components/SettingsModal";
import { UserSettings } from "@/types/marketTypes";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  refreshData: () => void;
  isRefreshing: boolean;
  userSettings: UserSettings;
  updateUserSettings: (settings: UserSettings) => void;
}

const DashboardHeader = ({
  lastUpdated,
  refreshData,
  isRefreshing,
  userSettings,
  updateUserSettings,
}: DashboardHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Market Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Link to="/fed-dashboard">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Fed Data
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {theme === 'light' ? (
                  <SunIcon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Real-time market data and analysis
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
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
