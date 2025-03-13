
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/types/marketTypes";
import { useMediaQuery } from "@/hooks/use-mobile";
import SettingsModal from "@/components/settings/SettingsModal";
import UpdateIndicator from "./realtime/UpdateIndicator";
import HeaderActions from "./header/HeaderActions";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const toggleComponentVisibility = (componentId: string) => {
    const visibleComponents = userSettings.visibleComponents || [];
    
    const updatedVisibleComponents = visibleComponents.includes(componentId)
      ? visibleComponents.filter(id => id !== componentId)
      : [...visibleComponents, componentId];
    
    updateUserSettings({
      ...userSettings,
      visibleComponents: updatedVisibleComponents
    });
  };
  
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
        
        <HeaderActions
          refreshData={refreshData}
          isRefreshing={isRefreshing}
          userSettings={userSettings}
          toggleComponentVisibility={toggleComponentVisibility}
          isLayoutMenuOpen={isLayoutMenuOpen}
          setIsLayoutMenuOpen={setIsLayoutMenuOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />
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
