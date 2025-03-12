
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Percent } from "lucide-react";
import fedApiService from "@/services/fred";
import { ECONOMIC_CATEGORIES } from "@/services/fred/constants";
import { toast } from "sonner";
import InflationCard from "./inflation/InflationCard";
import { InflationData } from "./inflation/types";

const FredInflation = () => {
  const [inflationData, setInflationData] = useState<InflationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fedApiService.getEconomicCategory(ECONOMIC_CATEGORIES.INFLATION);
        setInflationData(data);
        
        const timestamp = fedApiService.getFredCacheTimestamp(`fred_${ECONOMIC_CATEGORIES.INFLATION.toLowerCase()}`);
        setLastUpdated(timestamp);
      } catch (error) {
        console.error("Failed to load inflation data:", error);
        toast.error("Failed to load inflation data");
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
          <CardTitle>Inflation Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
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
            <Percent className="h-5 w-5 mr-2 text-primary" />
            <span>Inflation Indicators</span>
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
          {inflationData.map((indicator) => (
            <InflationCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FredInflation;
