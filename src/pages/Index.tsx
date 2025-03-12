
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import MarketOverview from "@/components/MarketOverview";
import EconomicData from "@/components/EconomicData";
import MajorStocks from "@/components/MajorStocks";
import MarketEvents from "@/components/MarketEvents";
import SectorPerformance from "@/components/SectorPerformance";
import ES1FuturesChart from "@/components/ES1FuturesChart";
import apiService, { getCacheTimestamp } from "@/services/apiService";
import fedApiService from "@/services/fedApiService";
import { MarketIndex, SectorPerformance as SectorType, StockData, EconomicIndicator, MarketEvent, UserSettings } from "@/types/marketTypes";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

const defaultSettings: UserSettings = {
  watchlist: ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]
};

const Dashboard = () => {
  // Theme state
  const { theme } = useTheme();
  
  // State for market data
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<SectorType[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  
  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEcon, setIsLoadingEcon] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  
  // Effect to load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("market_dashboard_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);
  
  // Function to update settings
  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem("market_dashboard_settings", JSON.stringify(newSettings));
    toast.success("Settings updated");
    loadData(); // Reload data with new settings
  };
  
  // Function to load economic indicators from FRED
  const loadEconomicIndicators = async () => {
    setIsLoadingEcon(true);
    try {
      // Get key economic indicators from FRED 
      // GDP, GDP Growth, Unemployment, Inflation (CPI)
      const keySeriesIds = ["GDPC1", "A191RL1Q225SBEA", "UNRATE", "CPIAUCSL"];
      const promises = keySeriesIds.map(seriesId => fedApiService.getEconomicSeries(seriesId));
      
      const results = await Promise.all(promises);
      
      // Convert to EconomicIndicator type
      const fedIndicators: EconomicIndicator[] = results.map(item => ({
        id: item.id,
        name: item.name,
        value: parseFloat(item.value),
        previous: parseFloat(item.previous),
        change: parseFloat(item.change),
        unit: item.unit,
        date: item.date
      }));
      
      setIndicators(fedIndicators);
    } catch (error) {
      console.error("Error loading economic indicators:", error);
      toast.error("Failed to load economic indicators");
    } finally {
      setIsLoadingEcon(false);
    }
  };
  
  // Function to load all market data
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Load market indices
      const indicesData = await apiService.getMarketIndices();
      setIndices(indicesData);
      
      // Use the timestamp from the indices cache as the last updated time
      const timestamp = getCacheTimestamp("market_indices");
      if (timestamp) {
        setLastUpdated(timestamp);
      }
      
      // Load sectors
      const sectorsData = await apiService.getSectorPerformance();
      setSectors(sectorsData);
      
      // Load stocks based on user's watchlist
      const stocksData = await apiService.getMajorStocks(settings.watchlist);
      setStocks(stocksData);
      
      // Load market events
      const eventsData = await apiService.getMarketEvents();
      setEvents(eventsData);
      
      // Load economic indicators separately
      loadEconomicIndicators();
      
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error("Failed to load some market data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [settings.watchlist.join(",")]); // Reload when watchlist changes
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 px-4">
        <DashboardHeader 
          lastUpdated={lastUpdated}
          refreshData={loadData}
          isRefreshing={isLoading}
          userSettings={settings}
          updateUserSettings={updateSettings}
        />
        
        {/* ES1 Futures Chart - Featured prominently at the top */}
        <div className="w-full mb-6 animate-fade-in">
          <ES1FuturesChart />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MarketOverview indices={indices} />
          <EconomicData indicators={indicators} isLoading={isLoadingEcon} />
          
          <div className="md:col-span-2">
            <MajorStocks stocks={stocks} />
          </div>
          
          <SectorPerformance sectors={sectors} />
          <MarketEvents events={events} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
