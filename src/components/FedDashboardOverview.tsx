
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, TrendingUp, TrendingDown, AlertTriangle, Check } from "lucide-react";
import fedApiService from "@/services/fred";
import { ECONOMIC_CATEGORIES } from "@/services/fred/constants";
import { TimeSpan } from "@/services/fred/types";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";

interface OverviewSummary {
  gdpGrowth: {
    rate: number;
    trend: 'accelerating' | 'decelerating' | 'stable';
  } | null;
  unemployment: {
    rate: number;
    trend: 'improving' | 'worsening' | 'stable';
  } | null;
  inflation: {
    rate: number;
    trend: 'rising' | 'falling' | 'stable';
  } | null;
  fedRate: {
    rate: number;
    lastChange: number;
  } | null;
  lastUpdated: Date | null;
}

const FedDashboardOverview: React.FC = () => {
  const [summary, setSummary] = useState<OverviewSummary>({
    gdpGrowth: null,
    unemployment: null,
    inflation: null,
    fedRate: null,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        // Fetch key economic indicators
        const growthData = await fedApiService.getEconomicCategory(
          ECONOMIC_CATEGORIES.ECONOMIC_GROWTH,
          TimeSpan.FIVE_YEARS
        );
        
        const employmentData = await fedApiService.getEconomicCategory(
          ECONOMIC_CATEGORIES.EMPLOYMENT,
          TimeSpan.FIVE_YEARS
        );
        
        const inflationData = await fedApiService.getEconomicCategory(
          ECONOMIC_CATEGORIES.INFLATION,
          TimeSpan.FIVE_YEARS
        );
        
        const ratesData = await fedApiService.getEconomicCategory(
          ECONOMIC_CATEGORIES.INTEREST_RATES,
          TimeSpan.FIVE_YEARS
        );
        
        // Find specific indicators
        const gdpGrowth = growthData.find(item => item.id === "A191RL1Q225SBEA");
        const unemployment = employmentData.find(item => item.id === "UNRATE");
        const cpi = inflationData.find(item => item.id === "CPIAUCSL");
        const fedRate = ratesData.find(item => item.id === "FEDFUNDS");
        
        // Build the summary object
        const newSummary: OverviewSummary = {
          gdpGrowth: gdpGrowth ? {
            rate: parseFloat(gdpGrowth.value),
            trend: determineGdpTrend(gdpGrowth.trend)
          } : null,
          
          unemployment: unemployment ? {
            rate: parseFloat(unemployment.value),
            trend: determineUnemploymentTrend(unemployment.trend)
          } : null,
          
          inflation: cpi ? {
            rate: parseFloat(cpi.value),
            trend: determineInflationTrend(cpi.trend)
          } : null,
          
          fedRate: fedRate ? {
            rate: parseFloat(fedRate.value),
            lastChange: parseFloat(fedRate.change)
          } : null,
          
          lastUpdated: new Date()
        };
        
        setSummary(newSummary);
      } catch (error) {
        console.error("Failed to load overview data:", error);
        toast.error("Failed to load economic overview data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummaryData();
  }, []);
  
  // Helper functions to determine trends
  const determineGdpTrend = (trend: { date: string; value: number }[] = []): 'accelerating' | 'decelerating' | 'stable' => {
    if (trend.length < 3) return 'stable';
    
    const latest = trend[trend.length - 1].value;
    const previous = trend[trend.length - 2].value;
    const twoBefore = trend[trend.length - 3].value;
    
    const currentChange = latest - previous;
    const previousChange = previous - twoBefore;
    
    if (Math.abs(currentChange) < 0.1) return 'stable';
    if (currentChange > 0 && currentChange > previousChange) return 'accelerating';
    if (currentChange < 0 && currentChange < previousChange) return 'decelerating';
    return 'stable';
  };
  
  const determineUnemploymentTrend = (trend: { date: string; value: number }[] = []): 'improving' | 'worsening' | 'stable' => {
    if (trend.length < 3) return 'stable';
    
    const latest = trend[trend.length - 1].value;
    const previous = trend[trend.length - 2].value;
    const threeBefore = trend[trend.length - 4]?.value || previous;
    
    // For unemployment, decreasing is "improving"
    if (latest < previous && previous < threeBefore) return 'improving';
    if (latest > previous && previous > threeBefore) return 'worsening';
    return 'stable';
  };
  
  const determineInflationTrend = (trend: { date: string; value: number }[] = []): 'rising' | 'falling' | 'stable' => {
    if (trend.length < 6) return 'stable';
    
    // Look at the last 6 months to determine trend
    const recent = trend.slice(-6);
    const increasing = recent.filter((pt, i) => i > 0 && pt.value > recent[i-1].value).length;
    const decreasing = recent.filter((pt, i) => i > 0 && pt.value < recent[i-1].value).length;
    
    if (increasing >= 4) return 'rising';
    if (decreasing >= 4) return 'falling';
    return 'stable';
  };
  
  // Generate summary text
  const generateSummary = (): string => {
    const { gdpGrowth, unemployment, inflation, fedRate } = summary;
    
    const parts = [];
    
    // GDP summary
    if (gdpGrowth) {
      const gdpRate = gdpGrowth.rate.toFixed(1);
      if (gdpGrowth.rate < 0) {
        parts.push(`The economy is contracting at a rate of ${Math.abs(gdpGrowth.rate).toFixed(1)}% annually`);
      } else if (gdpGrowth.rate < 1) {
        parts.push(`The economy is growing slowly at ${gdpRate}% annually`);
      } else if (gdpGrowth.rate < 3) {
        parts.push(`The economy is growing moderately at ${gdpRate}% annually`);
      } else {
        parts.push(`The economy is growing strongly at ${gdpRate}% annually`);
      }
      
      if (gdpGrowth.trend === 'accelerating') {
        parts[0] += " and accelerating";
      } else if (gdpGrowth.trend === 'decelerating') {
        parts[0] += " but decelerating";
      }
    }
    
    // Unemployment summary
    if (unemployment) {
      const unemploymentRate = unemployment.rate.toFixed(1);
      if (unemployment.rate < 4) {
        parts.push(`unemployment is very low at ${unemploymentRate}%`);
      } else if (unemployment.rate < 5) {
        parts.push(`unemployment is low at ${unemploymentRate}%`);
      } else if (unemployment.rate < 6) {
        parts.push(`unemployment is moderate at ${unemploymentRate}%`);
      } else {
        parts.push(`unemployment is elevated at ${unemploymentRate}%`);
      }
      
      if (unemployment.trend === 'improving') {
        parts[parts.length - 1] += " and decreasing";
      } else if (unemployment.trend === 'worsening') {
        parts[parts.length - 1] += " and increasing";
      }
    }
    
    // Inflation summary
    if (inflation) {
      const inflationRate = inflation.rate.toFixed(1);
      if (inflation.rate < 2) {
        parts.push(`inflation is below the Fed's target at ${inflationRate}%`);
      } else if (inflation.rate < 3) {
        parts.push(`inflation is near the Fed's target at ${inflationRate}%`);
      } else if (inflation.rate < 5) {
        parts.push(`inflation is above target at ${inflationRate}%`);
      } else {
        parts.push(`inflation is significantly elevated at ${inflationRate}%`);
      }
      
      if (inflation.trend === 'falling') {
        parts[parts.length - 1] += " but declining";
      } else if (inflation.trend === 'rising') {
        parts[parts.length - 1] += " and rising";
      }
    }
    
    // Fed rate summary
    if (fedRate) {
      const fedRateValue = fedRate.rate.toFixed(2);
      parts.push(`the Federal Funds Rate is at ${fedRateValue}%`);
      
      if (fedRate.lastChange > 0) {
        parts[parts.length - 1] += " after a recent increase";
      } else if (fedRate.lastChange < 0) {
        parts[parts.length - 1] += " after a recent decrease";
      }
    }
    
    // Combine the parts
    if (parts.length === 0) {
      return "Economic data is currently unavailable. Please check back later.";
    }
    
    // Capitalize first letter and add periods
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join(", ") + ".";
  };
  
  // Get the appropriate icon for economic health
  const getEconomicHealthIcon = () => {
    const { gdpGrowth, unemployment, inflation } = summary;
    
    if (!gdpGrowth || !unemployment || !inflation) {
      return <LineChart className="h-5 w-5 text-muted-foreground" />;
    }
    
    // Simple economic health assessment
    const isGrowthHealthy = gdpGrowth.rate >= 2;
    const isUnemploymentHealthy = unemployment.rate < 5;
    const isInflationHealthy = inflation.rate >= 1.5 && inflation.rate <= 3.5;
    
    const healthScore = (isGrowthHealthy ? 1 : 0) + 
                        (isUnemploymentHealthy ? 1 : 0) + 
                        (isInflationHealthy ? 1 : 0);
    
    if (healthScore === 3) {
      return <Check className="h-5 w-5 text-emerald-500" />;
    } else if (healthScore === 0) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else if (gdpGrowth.rate < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    } else {
      return <TrendingUp className="h-5 w-5 text-blue-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Economic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getEconomicHealthIcon()}
            <span>Economic Overview</span>
          </div>
          {summary.lastUpdated && (
            <div className="text-sm font-normal text-muted-foreground">
              {formatDate(summary.lastUpdated.toISOString(), 'short')}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">{generateSummary()}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* GDP Card */}
          {summary.gdpGrowth && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="text-sm font-medium mb-1">GDP Growth</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">
                  {summary.gdpGrowth.rate.toFixed(1)}%
                </p>
                <div className={summary.gdpGrowth.rate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                  {summary.gdpGrowth.rate >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.gdpGrowth.trend === 'accelerating' ? 'Accelerating' : 
                  summary.gdpGrowth.trend === 'decelerating' ? 'Decelerating' : 'Stable'}
              </p>
            </div>
          )}
          
          {/* Unemployment Card */}
          {summary.unemployment && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="text-sm font-medium mb-1">Unemployment</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">
                  {summary.unemployment.rate.toFixed(1)}%
                </p>
                <div className={summary.unemployment.trend === 'improving' ? "text-emerald-600 dark:text-emerald-400" : 
                  summary.unemployment.trend === 'worsening' ? "text-red-600 dark:text-red-400" : 
                  "text-gray-500"}>
                  {summary.unemployment.trend === 'improving' ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : summary.unemployment.trend === 'worsening' ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <LineChart className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.unemployment.trend === 'improving' ? 'Decreasing' : 
                  summary.unemployment.trend === 'worsening' ? 'Increasing' : 'Stable'}
              </p>
            </div>
          )}
          
          {/* Inflation Card */}
          {summary.inflation && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="text-sm font-medium mb-1">Inflation (CPI)</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">
                  {summary.inflation.rate.toFixed(1)}%
                </p>
                <div className={
                  summary.inflation.rate <= 3 ? 
                    "text-emerald-600 dark:text-emerald-400" : 
                    summary.inflation.rate > 5 ? 
                      "text-red-600 dark:text-red-400" : 
                      "text-amber-600 dark:text-amber-400"
                }>
                  {summary.inflation.trend === 'falling' ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : summary.inflation.trend === 'rising' ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <LineChart className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.inflation.trend === 'falling' ? 'Decreasing' : 
                  summary.inflation.trend === 'rising' ? 'Increasing' : 'Stable'}
              </p>
            </div>
          )}
          
          {/* Fed Rate Card */}
          {summary.fedRate && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="text-sm font-medium mb-1">Fed Funds Rate</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">
                  {summary.fedRate.rate.toFixed(2)}%
                </p>
                <div className="text-blue-600 dark:text-blue-400">
                  {summary.fedRate.lastChange > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : summary.fedRate.lastChange < 0 ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : (
                    <LineChart className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {summary.fedRate.lastChange > 0 ? 'Recently increased' : 
                  summary.fedRate.lastChange < 0 ? 'Recently decreased' : 'Unchanged'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FedDashboardOverview;
