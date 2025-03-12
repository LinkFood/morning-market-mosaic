
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Database, LineChart } from "lucide-react";
import FredInterestRates from "@/components/FredInterestRates";
import FredInflation from "@/components/FredInflation";
import FredEconomicIndicators from "@/components/FredEconomicIndicators";
import fedApiService from "@/services/fedApiService";
import { toast } from "sonner";

const FedDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to refresh all Fed data with force flag
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Clear cache and force refresh
      fedApiService.clearFredCacheData();
      // Force page reload to refresh all components
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
      setIsRefreshing(false);
    }
  };

  // Check for last update time
  useEffect(() => {
    // Use the most recent cache timestamp across all economic categories
    const categories = [
      "interest_rates",
      "inflation",
      "economic_growth",
      "employment"
    ];
    
    let mostRecentUpdate: Date | null = null;
    
    categories.forEach(category => {
      const timestamp = fedApiService.getFredCacheTimestamp(`fred_${category}`);
      if (timestamp) {
        if (!mostRecentUpdate || timestamp > mostRecentUpdate) {
          mostRecentUpdate = timestamp;
        }
      }
    });
    
    setLastUpdated(mostRecentUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 px-4">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold flex items-center">
                <LineChart className="h-7 w-7 mr-2 text-primary" />
                Federal Reserve Data Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground mr-2">
                  Last updated: {lastUpdated.toLocaleString()}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Force Data Refresh
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Real-time economic indicators and Federal Reserve data
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {/* Economic Indicators Section */}
          <FredEconomicIndicators />
          
          {/* Interest Rates Section */}
          <FredInterestRates />
          
          {/* Inflation Section */}
          <FredInflation />
          
          {/* More sections will be added here */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              More economic indicators will be added soon (Employment, GDP, Markets)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FedDashboard;
