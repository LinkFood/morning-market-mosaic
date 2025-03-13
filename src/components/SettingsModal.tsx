
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSettings } from "@/types/marketTypes";
import { realtime } from "@/services/polygon/realtime";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
}

const defaultRefreshSettings = {
  marketHours: 60,
  afterHours: 300,
  closed: 900
};

const SettingsModal = ({ isOpen, onClose, settings, updateSettings }: SettingsModalProps) => {
  const [watchlistInput, setWatchlistInput] = useState("");
  const [refreshSettings, setRefreshSettings] = useState(defaultRefreshSettings);
  
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
    }
  }, [isOpen, settings]);
  
  // Handle changes to refresh interval settings
  const handleRefreshIntervalChange = (
    field: 'marketHours' | 'afterHours' | 'closed',
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
      refreshInterval: refreshSettings
    };
    
    // Update settings in realtime service
    realtime.updateSettings({ intervals: refreshSettings });
    
    // Update app settings
    updateSettings(updatedSettings);
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="watchlist">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="refresh">Data Refresh</TabsTrigger>
            <TabsTrigger value="updates">Live Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="watchlist" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="watchlist">Stock Watchlist</Label>
              <Input
                id="watchlist"
                placeholder="AAPL, MSFT, AMZN, GOOGL, META"
                value={watchlistInput}
                onChange={(e) => setWatchlistInput(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter stock tickers separated by commas
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="refresh" className="space-y-4">
            <div className="space-y-4">
              <Label>Refresh Intervals</Label>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">During Market Hours</CardTitle>
                  <CardDescription className="text-xs">
                    9:30 AM - 4:00 PM ET on trading days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={refreshSettings.marketHours.toString()} 
                    onValueChange={(value) => handleRefreshIntervalChange('marketHours', parseInt(value))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="market-30" />
                      <Label htmlFor="market-30">30 seconds</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="60" id="market-60" />
                      <Label htmlFor="market-60">1 minute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="300" id="market-300" />
                      <Label htmlFor="market-300">5 minutes</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pre-Market & After Hours</CardTitle>
                  <CardDescription className="text-xs">
                    4:00 AM - 9:30 AM & 4:00 PM - 8:00 PM ET
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={refreshSettings.afterHours.toString()} 
                    onValueChange={(value) => handleRefreshIntervalChange('afterHours', parseInt(value))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="60" id="after-60" />
                      <Label htmlFor="after-60">1 minute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="300" id="after-300" />
                      <Label htmlFor="after-300">5 minutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="600" id="after-600" />
                      <Label htmlFor="after-600">10 minutes</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Market Closed</CardTitle>
                  <CardDescription className="text-xs">
                    Outside of trading hours and weekends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={refreshSettings.closed.toString()} 
                    onValueChange={(value) => handleRefreshIntervalChange('closed', parseInt(value))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="600" id="closed-600" />
                      <Label htmlFor="closed-600">10 minutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="900" id="closed-900" />
                      <Label htmlFor="closed-900">15 minutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1800" id="closed-1800" />
                      <Label htmlFor="closed-1800">30 minutes</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="updates" className="space-y-4">
            <div className="space-y-4">
              <Label>Live Update Settings</Label>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Update Method</CardTitle>
                  <CardDescription className="text-xs">
                    Choose how market data is updated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value="auto">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="auto" id="method-auto" />
                      <Label htmlFor="method-auto">Automatic (recommended)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="polling" id="method-polling" disabled />
                      <Label htmlFor="method-polling" className="text-muted-foreground">Polling Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ws" id="method-ws" disabled />
                      <Label htmlFor="method-ws" className="text-muted-foreground">WebSocket Only</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    Automatic method selects the best option based on market status and connection quality
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Data Priority</CardTitle>
                  <CardDescription className="text-xs">
                    Choose which data to prioritize for updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value="watchlist">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="watchlist" id="priority-watchlist" />
                      <Label htmlFor="priority-watchlist">Watchlist Stocks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visible" id="priority-visible" />
                      <Label htmlFor="priority-visible">Visible Components</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="priority-all" />
                      <Label htmlFor="priority-all">All Data</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
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
