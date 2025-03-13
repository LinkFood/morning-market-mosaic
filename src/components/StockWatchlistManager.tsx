
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Heart, Plus, X, CirclePlus, Trash2, Save } from "lucide-react";
import { Input } from "./ui/input";
import { StockData } from "@/types/marketTypes";
import { toast } from "sonner";

interface StockWatchlistManagerProps {
  currentWatchlist: string[];
  onWatchlistUpdate: (newWatchlist: string[]) => void;
  availableStocks: StockData[];
}

const StockWatchlistManager = ({
  currentWatchlist,
  onWatchlistUpdate,
  availableStocks,
}: StockWatchlistManagerProps) => {
  const [editableWatchlist, setEditableWatchlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Preset watchlists
  const presetWatchlists = {
    technology: ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
    blueChips: ["JPM", "WMT", "JNJ", "PG", "KO"],
    energy: ["XOM", "CVX", "COP", "SLB", "EOG"],
  };

  // Initialize editable watchlist when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setEditableWatchlist([...currentWatchlist]);
    }
  }, [isDialogOpen, currentWatchlist]);

  // Filter available stocks based on search
  const filteredStocks = availableStocks.filter(
    (stock) =>
      !editableWatchlist.includes(stock.ticker) &&
      (stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (stock.name &&
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Add a stock to the watchlist
  const addToWatchlist = (ticker: string) => {
    if (!editableWatchlist.includes(ticker)) {
      setEditableWatchlist([...editableWatchlist, ticker]);
    }
  };

  // Remove a stock from the watchlist
  const removeFromWatchlist = (ticker: string) => {
    setEditableWatchlist(editableWatchlist.filter((t) => t !== ticker));
  };

  // Save changes to watchlist
  const saveChanges = () => {
    onWatchlistUpdate(editableWatchlist);
    setIsDialogOpen(false);
    toast.success("Watchlist updated");
  };

  // Load a preset watchlist
  const loadPreset = (preset: keyof typeof presetWatchlists) => {
    setEditableWatchlist([...presetWatchlists[preset]]);
    toast.info(`Loaded ${preset} preset`);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Heart className="h-4 w-4" /> Manage Watchlist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Your Watchlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Preset watchlists */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPreset("technology")}
            >
              Technology
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPreset("blueChips")}
            >
              Blue Chips
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPreset("energy")}
            >
              Energy
            </Button>
          </div>

          {/* Current watchlist */}
          <div>
            <h3 className="text-sm font-medium mb-2">Your Watchlist</h3>
            {editableWatchlist.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editableWatchlist.map((ticker) => (
                  <div
                    key={ticker}
                    className="bg-muted rounded-full px-3 py-1 text-sm flex items-center gap-1"
                  >
                    {ticker}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1"
                      onClick={() => removeFromWatchlist(ticker)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Your watchlist is empty. Add some stocks below.
              </div>
            )}
          </div>

          {/* Search and add stocks */}
          <div>
            <h3 className="text-sm font-medium mb-2">Add Stocks</h3>
            <Input
              placeholder="Search by ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />

            <div className="max-h-40 overflow-y-auto">
              {filteredStocks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredStocks.map((stock) => (
                    <Button
                      key={stock.ticker}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-1"
                      onClick={() => addToWatchlist(stock.ticker)}
                    >
                      <CirclePlus className="h-3 w-3" />
                      {stock.ticker}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm text-center py-2">
                  {searchQuery
                    ? `No stocks found matching "${searchQuery}"`
                    : "No additional stocks available"}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditableWatchlist([])}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
            <Button onClick={saveChanges} className="gap-1">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockWatchlistManager;
