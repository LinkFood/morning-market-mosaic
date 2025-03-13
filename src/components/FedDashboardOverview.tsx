
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import fedApiService from "@/services/fred";
import { ECONOMIC_CATEGORIES } from "@/services/fred/constants";
import { TimeSpan } from "@/services/fred/types";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";

// Import the refactored components
import { OverviewSummary } from "./fed-dashboard/types";
import OverviewStatusIcon from "./fed-dashboard/OverviewStatusIcon";
import OverviewSummaryText from "./fed-dashboard/OverviewSummaryText";
import OverviewIndicatorCards from "./fed-dashboard/OverviewIndicatorCards";
import { 
  determineGdpTrend,
  determineUnemploymentTrend,
  determineInflationTrend
} from "./fed-dashboard/TrendHelpers";

/**
 * Main component for the Federal Reserve Dashboard Overview
 * Displays a summary of key economic indicators and their trends
 */
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
            <OverviewStatusIcon summary={summary} />
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
        <OverviewSummaryText summary={summary} />
        <OverviewIndicatorCards summary={summary} />
      </CardContent>
    </Card>
  );
};

export default FedDashboardOverview;
