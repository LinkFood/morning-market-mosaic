
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Minus, Percent } from "lucide-react";
import SparklineChart from "@/components/chart/SparklineChart";
import fedApiService, { ECONOMIC_CATEGORIES } from "@/services/fedApiService";
import { toast } from "sonner";

interface InflationData {
  id: string;
  name: string;
  value: string;
  previous: string;
  change: string;
  date: string;
  lastUpdated?: string;
  formattedDate?: string;
  trend: { date: string; value: number }[];
  unit: string;
}

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

  const getChangeColor = (change: number) => {
    if (change > 0) return "ticker-up";
    if (change < 0) return "ticker-down";
    return "ticker-neutral";
  };
  
  const getChangeSymbol = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

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
                    Previous: {indicator.previous}{indicator.unit}
                  </p>
                </div>
                
                <div className={getChangeColor(parseFloat(indicator.change))}>
                  {getChangeSymbol(parseFloat(indicator.change))}
                  <span className="ml-1">
                    {parseFloat(indicator.change) >= 0 ? "+" : ""}
                    {indicator.change}{indicator.unit}
                  </span>
                </div>
              </div>
              
              <div className="h-20 mt-4">
                {indicator.trend && (
                  <SparklineChart 
                    data={indicator.trend.map(t => t.value)} 
                    dates={indicator.trend.map(t => t.date)}
                    positive={parseFloat(indicator.change) < 0}
                    showAxis={true}
                    showLabels={true}
                    labelCount={6}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FredInflation;
