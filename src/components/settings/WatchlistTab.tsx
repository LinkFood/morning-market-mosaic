
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { WatchlistTabProps } from "./types";

const WatchlistTab = ({ watchlistInput, setWatchlistInput }: WatchlistTabProps) => {
  return (
    <div className="space-y-4">
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
  );
};

export default WatchlistTab;
