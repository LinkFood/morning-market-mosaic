
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshTabProps } from "./types";

const RefreshTab = ({ refreshSettings, handleRefreshIntervalChange }: RefreshTabProps) => {
  return (
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
  );
};

export default RefreshTab;
