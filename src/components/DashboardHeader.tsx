
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  MoonIcon, 
  SunIcon, 
  BarChart3, 
  RefreshCw, 
  Settings, 
  ChevronDown, 
  X,
  Check,
  Layout,
  ListOrdered,
  PlusCircle
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import SettingsModal from "@/components/SettingsModal";
import { UserSettings } from "@/types/marketTypes";
import UpdateIndicator from "./realtime/UpdateIndicator";

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
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  
  // Toggle component visibility in settings
  const toggleComponentVisibility = (componentId: string) => {
    // Ensure we have a valid array to work with
    const visibleComponents = userSettings.visibleComponents || [];
    
    const updatedVisibleComponents = visibleComponents.includes(componentId)
      ? visibleComponents.filter(id => id !== componentId)
      : [...visibleComponents, componentId];
    
    updateUserSettings({
      ...userSettings,
      visibleComponents: updatedVisibleComponents
    });
  };
  
  // Components that can be toggled
  const dashboardComponents = [
    { id: 'market-overview', label: 'Market Overview' },
    { id: 'es1-futures', label: 'S&P 500 Futures' },
    { id: 'major-stocks', label: 'Watchlist' },
    { id: 'economic-data', label: 'Economic Indicators' },
    { id: 'sector-performance', label: 'Sector Performance' },
    { id: 'market-events', label: 'Market Events' },
    { id: 'market-movers', label: 'Market Movers' }
  ];
  
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
          
          {/* Layout Customization Menu */}
          <DropdownMenu open={isLayoutMenuOpen} onOpenChange={setIsLayoutMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="h-4 w-4 mr-2" />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Dashboard Components</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dashboardComponents.map(component => (
                <DropdownMenuItem 
                  key={component.id}
                  onClick={() => toggleComponentVisibility(component.id)}
                >
                  {(userSettings.visibleComponents || []).includes(component.id) ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                  {component.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
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
        <UpdateIndicator onRefresh={refreshData} />
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
