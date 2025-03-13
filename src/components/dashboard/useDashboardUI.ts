
import { useState } from "react";
import { toast } from "sonner";
import { UserSettings } from "@/types/marketTypes";
import { isFeatureEnabled } from "@/services/featureFlags";
import { defaultSettings } from "./types";

export const useDashboardUI = (onSettingsChange: () => void) => {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [collapsedComponents, setCollapsedComponents] = useState<{[key: string]: boolean}>({});
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Function to update settings
  const updateSettings = (newSettings: UserSettings) => {
    const updatedSettings = {
      ...defaultSettings,
      ...newSettings,
      refreshInterval: {
        ...defaultSettings.refreshInterval,
        ...(newSettings.refreshInterval || {})
      }
    };
    
    setSettings(updatedSettings);
    localStorage.setItem("market_dashboard_settings", JSON.stringify(updatedSettings));
    toast.success("Settings updated");
    onSettingsChange(); // Trigger data reload
  };
  
  // Function to toggle component collapse state
  const toggleComponentCollapse = (componentId: string) => {
    setCollapsedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };
  
  // Function to expand component to full screen
  const expandComponent = (componentId: string) => {
    setExpandedComponent(componentId);
  };
  
  // Determine which components to render based on settings and feature flags
  const isComponentVisible = (componentId: string) => {
    if (!settings || !settings.visibleComponents) {
      return false;
    }
    
    // Check component-specific feature flags
    if (componentId === "market-movers" && !isFeatureEnabled('showMarketMovers')) {
      return false;
    }
    
    if (componentId === "economic-data" && !isFeatureEnabled('useFredEconomicData')) {
      return false;
    }
    
    return settings.visibleComponents.includes(componentId);
  };

  return {
    settings,
    expandedComponent,
    collapsedComponents,
    updateSettings,
    toggleComponentCollapse,
    expandComponent,
    setExpandedComponent,
    isComponentVisible
  };
};
