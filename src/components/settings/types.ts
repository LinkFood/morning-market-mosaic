
import { UserSettings } from "@/types/marketTypes";

export interface RefreshIntervalSettings {
  marketHours: number;
  afterHours: number;
  closed: number;
}

export interface SettingsTabProps {
  settings: UserSettings;
  onChange: (settingsUpdate: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
}

export interface WatchlistTabProps extends SettingsTabProps {
  watchlistInput: string;
  setWatchlistInput: (value: string) => void;
}

export interface RefreshTabProps extends SettingsTabProps {
  refreshSettings: RefreshIntervalSettings;
  handleRefreshIntervalChange: (field: keyof RefreshIntervalSettings, value: number) => void;
}

export interface MobileTabProps extends SettingsTabProps {
  isCompactMode: boolean;
  setIsCompactMode: (value: boolean) => void;
  batteryOptimization: boolean;
  setBatteryOptimization: (value: boolean) => void;
}
