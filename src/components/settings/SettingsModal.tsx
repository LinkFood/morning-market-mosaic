
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UserSettings } from "@/types/marketTypes";
import { realtime } from "@/services/polygon/realtime";
import { useMediaQuery } from "@/hooks/use-mobile";
import WatchlistTab from "./WatchlistTab";
import RefreshTab from "./RefreshTab";
import UpdatesTab from "./UpdatesTab";
import MobileTab from "./MobileTab";
import { RefreshIntervalSettings } from "./types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
}

const defaultRefreshSettings: RefreshIntervalSettings = {
  marketHours: 60,
  afterHours: 300,
  closed: 900
};

const SettingsModal = ({ isOpen, onClose, settings, updateSettings }: SettingsModalProps) => {
  const [watchlistInput, setWatchlistInput] = useState("");
  const [refreshSettings, setRefreshSettings] = useState<RefreshIntervalSettings>(defaultRefreshSettings);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [batteryOptimization, setBatteryOptimization] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Initialize state when settings change or modal opens
  useEffect(() => {
    if (isOpen && settings) {
      // Set watchlist
      setWatchlistInput(settings.watchlist?.join(", ") || "");
      
      // Set refresh intervals
      setRefreshSettings({
        marketHours: settings.refreshInterval?.marketHours || defaultRefreshSettings.marketHours,
        afterHours: settings.refreshInterval?.afterHours || defaultRefreshSettings.afterHours,
        closed: settings.refreshInterval?.closed || defaultRefreshSettings.closed
      });

      // Set compact mode
      setIsCompactMode(settings.compactMode || false);

      // Set battery optimization
      setBatteryOptimization(settings.batteryOptimization || false);
    }
  }, [isOpen, settings]);
  
  // Handle changes to refresh interval settings
  const handleRefreshIntervalChange = (
    field: keyof RefreshIntervalSettings,
    value: number
  ) => {
    setRefreshSettings({
      ...refreshSettings,
      [field]: value
    });
  };
  
  const handleSave = () => {
    // Parse watchlist input
    const watchlist = watchlistInput
      .split(",")
      .map((ticker) => ticker.trim().toUpperCase())
      .filter((ticker) => ticker.length > 0);
    
    // If watchlist is empty, use default
    const finalWatchlist = watchlist.length > 0 ? watchlist : ["AAPL", "MSFT", "GOOGL", "AMZN", "META"];
    
    // Ensure visible components is not empty
    const visibleComponents = settings.visibleComponents && settings.visibleComponents.length > 0 
      ? settings.visibleComponents 
      : ["market-overview", "major-stocks", "economic-data"];
    
    // Update settings
    const updatedSettings = {
      ...settings,
      watchlist: finalWatchlist,
      visibleComponents,
      refreshInterval: refreshSettings,
      compactMode: isCompactMode,
      batteryOptimization: batteryOptimization
    };
    
    // Update settings in realtime service
    realtime.updateSettings({ 
      intervals: refreshSettings,
      batteryOptimization: batteryOptimization
    });
    
    // Update app settings
    updateSettings(updatedSettings);
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isMobile ? "w-[95vw] max-w-md rounded-lg p-4" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="watchlist">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="refresh">Refresh</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="watchlist">
            <WatchlistTab 
              settings={settings}
              onChange={updateSettings}
              watchlistInput={watchlistInput}
              setWatchlistInput={setWatchlistInput}
            />
          </TabsContent>
          
          <TabsContent value="refresh">
            <RefreshTab 
              settings={settings}
              onChange={updateSettings}
              refreshSettings={refreshSettings}
              handleRefreshIntervalChange={handleRefreshIntervalChange}
            />
          </TabsContent>
          
          <TabsContent value="updates">
            <UpdatesTab 
              settings={settings}
              onChange={updateSettings}
            />
          </TabsContent>
          
          <TabsContent value="mobile">
            <MobileTab 
              settings={settings}
              onChange={updateSettings}
              isCompactMode={isCompactMode}
              setIsCompactMode={setIsCompactMode}
              batteryOptimization={batteryOptimization}
              setBatteryOptimization={setBatteryOptimization}
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
