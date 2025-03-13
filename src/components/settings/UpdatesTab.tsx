
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsTabProps } from "./types";

const UpdatesTab = ({ settings }: SettingsTabProps) => {
  return (
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
  );
};

export default UpdatesTab;
