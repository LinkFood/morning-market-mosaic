
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileTabProps } from "./types";

const MobileTab = ({ 
  isCompactMode, 
  setIsCompactMode, 
  batteryOptimization, 
  setBatteryOptimization 
}: MobileTabProps) => {
  return (
    <div className="space-y-4">
      <Label>Mobile Experience</Label>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Display Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="compact-mode" className="cursor-pointer">
              <div>
                <span>Compact Mode</span>
                <p className="text-xs text-muted-foreground">
                  Show more data with a compact interface
                </p>
              </div>
            </Label>
            <Switch 
              id="compact-mode"
              checked={isCompactMode}
              onCheckedChange={setIsCompactMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="battery-optimization" className="cursor-pointer">
              <div>
                <span>Battery Optimization</span>
                <p className="text-xs text-muted-foreground">
                  Reduce updates when on battery power
                </p>
              </div>
            </Label>
            <Switch 
              id="battery-optimization"
              checked={batteryOptimization}
              onCheckedChange={setBatteryOptimization}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileTab;
