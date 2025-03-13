
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
  PlusCircle,
  Menu
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import SettingsModal from "@/components/SettingsModal";
import { UserSettings } from "@/types/marketTypes";
import UpdateIndicator from "./realtime/UpdateIndicator";
import { useMediaQuery } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  refreshData: () => void;
  isRefreshing: boolean;
  userSettings: UserSettings;
  updateUserSettings: (settings: UserSettings) => void;
  toggleMobileMenu?: () => void;
}

const DashboardHeader = ({
  lastUpdated,
  refreshData,
  isRefreshing,
  userSettings,
  updateUserSettings,
  toggleMobileMenu
}: DashboardHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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
    <header className="mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className="flex items-center">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          )}
          <h1 className="text-xl md:text-3xl font-bold">Market Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {!isMobile && (
            <Link to="/fed-dashboard">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Fed Data
              </Button>
            </Link>
          )}
          
          {/* Layout Customization Menu */}
          {!isMobile && (
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
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9">
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
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 md:h-9 md:w-9"
          >
            <Settings className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </Button>
          
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground hidden md:block">
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
