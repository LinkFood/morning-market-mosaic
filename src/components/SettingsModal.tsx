
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  updateSettings: (settings: any) => void;
}

const SettingsModal = ({ isOpen, onClose, settings, updateSettings }: SettingsModalProps) => {
  const [watchlistInput, setWatchlistInput] = useState(settings?.watchlist?.join(", ") || "");
  
  const handleSave = () => {
    // Parse watchlist input
    const watchlist = watchlistInput
      .split(",")
      .map((ticker) => ticker.trim().toUpperCase())
      .filter((ticker) => ticker.length > 0);
    
    // Update settings
    updateSettings({
      ...settings,
      watchlist,
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
        </div>
        
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
