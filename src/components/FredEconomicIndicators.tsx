
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Minus, Database } from "lucide-react";
import SparklineChart from "@/components/chart/SparklineChart";
import fedApiService from "@/services/fred";
import { ECONOMIC_CATEGORIES } from "@/services/fred/constants";
import { toast } from "sonner";

interface EconomicData {
  id: string;
  name: string;
  value: string;
  previous: string;
  change: string;
  date: string;
  lastUpdated?: string;
  formattedDate?: string;
  trend?: { date: string; value: number }[];
  unit: string;
}

const FredEconomicIndicators = () => {
  const [indicators, setIndicators] = useState<EconomicData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Types of economic indicators to fetch
  const economiCategories = [
    ECONOMIC_CATEGORIES.ECONOMIC_GROWTH,
    ECONOMIC_CATEGORIES.EMPLOYMENT
  ];

  // Load economic data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch different categories of economic data
        const growthData = await fedApiService.getEconomicCategory(ECONOMIC_CATEGORIES.ECONOMIC_GROWTH);
        const employmentData = await fedApiService.getEconomicCategory(ECONOMIC_CATEGORIES.EMPLOYMENT);
        
        // Combine and filter primary indicators
        const allIndicators = [...growthData, ...employmentData];
        
        // Pick important indicators for the dashboard
        const primaryIndicators = allIndicators.filter(indicator => 
          ["GDPC1", "A191RL1Q225SBEA", "UNRATE", "PAYEMS"].includes(indicator.id)
        );
        
        setIndicators(primaryIndicators);
        
        // Get the most recent timestamp from cache
        const categories = economiCategories.map(cat => cat.toLowerCase());
        let mostRecentTimestamp: Date | null = null;
        
        categories.forEach(category => {
          const timestamp = fedApiService.getFredCacheTimestamp(`fred_${category}`);
          if (timestamp && (!mostRecentTimestamp || timestamp > mostRecentTimestamp)) {
            mostRecentTimestamp = timestamp;
          }
        });
        
        setLastUpdated(mostRecentTimestamp);
      } catch (error) {
        console.error("Failed to load economic indicators:", error);
        toast.error("Failed to load economic indicators data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getChangeColor = (change: number, indicatorId: string) => {
    // For unemployment, decreasing is positive
    if (change < 0 && indicatorId === "UNRATE") {
      return "ticker-up";
    }
    // For other indicators
    if (change > 0 && indicatorId !== "UNRATE") return "ticker-up";
    if (change < 0 && indicatorId !== "UNRATE") return "ticker-down";
    if (change > 0 && indicatorId === "UNRATE") return "ticker-down";
    return "ticker-neutral";
  };
  
  const getChangeSymbol = (change: number, indicatorId: string) => {
    // For unemployment, down arrow is positive
    if (indicatorId === "UNRATE") {
      if (change < 0) return <ArrowDown className="h-4 w-4" />;
      if (change > 0) return <ArrowUp className="h-4 w-4" />;
    } else {
      if (change > 0) return <ArrowUp className="h-4 w-4" />;
      if (change < 0) return <ArrowDown className="h-4 w-4" />;
    }
    return <Minus className="h-4 w-4" />;
  };

  // Helper function to get descriptions for economic indicators
  const getIndicatorDescription = (id: string): string => {
    switch (id) {
      case "GDPC1":
        return "Real Gross Domestic Product";
      case "A191RL1Q225SBEA":
        return "GDP Growth Rate (Quarterly)";
      case "UNRATE":
        return "Unemployment Rate";
      case "PAYEMS":
        return "Total Nonfarm Payrolls";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-secondary/50">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/3 mb-1" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            <span>Economic Indicators</span>
          </div>
          {lastUpdated && (
            <span className="text-sm font-normal text-muted-foreground">
              Updated: {lastUpdated.toLocaleString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indicators.map((indicator) => (
            <div key={indicator.id} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{indicator.name}</h3>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground block">
                    {indicator.formattedDate || new Date(indicator.date).toLocaleDateString()}
                  </span>
                  {indicator.lastUpdated && indicator.lastUpdated !== indicator.date && (
                    <span className="text-xs text-muted-foreground block">
                      Updated: {new Date(indicator.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold">
                    {indicator.value}{indicator.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getIndicatorDescription(indicator.id)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Previous: {indicator.previous}{indicator.unit}
                  </p>
                </div>
                
                <div className={getChangeColor(parseFloat(indicator.change), indicator.id)}>
                  {getChangeSymbol(parseFloat(indicator.change), indicator.id)}
                  <span className="ml-1">
                    {parseFloat(indicator.change) >= 0 ? "+" : ""}
                    {indicator.change}{indicator.unit}
                  </span>
                </div>
              </div>
              
              {indicator.trend && (
                <div className="h-20 mt-4">
                  <SparklineChart 
                    data={indicator.trend.map(t => t.value)} 
                    dates={indicator.trend.map(t => t.date)}
                    positive={indicator.id === "UNRATE" ? parseFloat(indicator.change) < 0 : parseFloat(indicator.change) >= 0}
                    showAxis={true}
                    showLabels={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FredEconomicIndicators;
