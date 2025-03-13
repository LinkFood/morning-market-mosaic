
import { RefreshCw, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LayoutMenu from "./LayoutMenu";
import { UserSettings } from "@/types/marketTypes";
import { useMediaQuery } from "@/hooks/use-mobile";

interface HeaderActionsProps {
  refreshData: () => void;
  isRefreshing: boolean;
  userSettings: UserSettings;
  toggleComponentVisibility: (componentId: string) => void;
  isLayoutMenuOpen: boolean;
  setIsLayoutMenuOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

const HeaderActions = ({
  refreshData,
  isRefreshing,
  userSettings,
  toggleComponentVisibility,
  isLayoutMenuOpen,
  setIsLayoutMenuOpen,
  setIsSettingsOpen
}: HeaderActionsProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
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
      
      {!isMobile && (
        <LayoutMenu
          isOpen={isLayoutMenuOpen}
          onOpenChange={setIsLayoutMenuOpen}
          userSettings={userSettings}
          toggleComponentVisibility={toggleComponentVisibility}
        />
      )}
      
      <ThemeToggle />
      
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
  );
};

export default HeaderActions;
