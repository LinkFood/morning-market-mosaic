import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";
import EnhancedChart from "@/components/chart/EnhancedChart";
import fedApiService from "@/services/fred";
import { ECONOMIC_CATEGORIES } from "@/services/fred/constants";
import { toast } from "sonner";

interface InterestRateData {
  id: string;
  name: string;
  value: string;
  previous: string;
  change: string;
  weeklyChange: string;
  date: string;
  lastUpdated?: string;
  formattedDate?: string;
  trend: { date: string; value: number }[];
  unit: string;
}

const FredInterestRates = () => {
  const [ratesData, setRatesData] = useState<InterestRateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fedApiService.getEconomicCategory(ECONOMIC_CATEGORIES.INTEREST_RATES);
        setRatesData(data);
        
        const timestamp = fedApiService.getFredCacheTimestamp(`fred_${ECONOMIC_CATEGORIES.INTEREST_RATES.toLowerCase()}`);
        setLastUpdated(timestamp);
      } catch (error) {
        console.error("Failed to load interest rates data:", error);
        toast.error("Failed to load interest rates data");
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
          <CardTitle>Interest Rates</CardTitle>
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
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            <span>Interest Rates</span>
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
          {ratesData.map((rate) => (
            <div key={rate.id} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{rate.name}</h3>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground block">
                    {rate.formattedDate || new Date(rate.date).toLocaleDateString()}
                  </span>
                  {rate.lastUpdated && rate.lastUpdated !== rate.date && (
                    <span className="text-xs text-muted-foreground block">
                      Updated: {new Date(rate.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold">
                    {rate.value}{rate.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Previous: {rate.previous}{rate.unit}
                  </p>
                </div>
                
                <div className={getChangeColor(parseFloat(rate.change))}>
                  {getChangeSymbol(parseFloat(rate.change))}
                  <span className="ml-1">
                    {parseFloat(rate.change) >= 0 ? "+" : ""}
                    {rate.change}{rate.unit}
                  </span>
                </div>
              </div>
              
              <div className="h-48 mt-4">
                {rate.trend && (
                  <EnhancedChart
                    data={rate.trend.map(t => ({ date: t.date, value: t.value }))}
                    dataKeys={["value"]}
                    xAxisKey="date"
                    height={180}
                    title={`${rate.name} Trend`}
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

export default FredInterestRates;
