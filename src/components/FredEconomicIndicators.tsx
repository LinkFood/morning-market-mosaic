
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "lucide-react";
import fedApiService from "@/services/fred";
import { ECONOMIC_CATEGORIES } from "@/services/fred/constants";
import { toast } from "sonner";
import EconomicIndicatorCard, { EconomicIndicator } from "./economic/EconomicIndicatorCard";

const FredEconomicIndicators = () => {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const economiCategories = [
    ECONOMIC_CATEGORIES.ECONOMIC_GROWTH,
    ECONOMIC_CATEGORIES.EMPLOYMENT
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const growthData = await fedApiService.getEconomicCategory(ECONOMIC_CATEGORIES.ECONOMIC_GROWTH);
        const employmentData = await fedApiService.getEconomicCategory(ECONOMIC_CATEGORIES.EMPLOYMENT);
        
        const allIndicators = [...growthData, ...employmentData];
        
        const primaryIndicators = allIndicators.filter(indicator => 
          ["GDPC1", "A191RL1Q225SBEA", "UNRATE", "PAYEMS"].includes(indicator.id)
        );
        
        setIndicators(primaryIndicators);
        
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
            <EconomicIndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FredEconomicIndicators;
