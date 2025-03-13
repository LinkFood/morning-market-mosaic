import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  RefreshCw, 
  LineChart, 
  HelpCircle 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FredInterestRates from "@/components/FredInterestRates";
import FredInflation from "@/components/FredInflation";
import FredEconomicIndicators from "@/components/FredEconomicIndicators";
import FedDashboardOverview from "@/components/FedDashboardOverview";
import fedApiService from "@/services/fred";
import { toast } from "sonner";

const FedDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      fedApiService.clearFredCacheData();
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Having trouble with the data?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        If the economic data isn't loading properly, try these steps:
                      </p>
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Click the "Force Data Refresh" button to clear the cache and fetch fresh data</li>
                        <li>Check your internet connection</li>
                        <li>If issues persist, visit our <Link to="/fred-debug" className="text-primary hover:underline">debug page</Link> to test the API connection</li>
                      </ol>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </AlertDialogContent>
              </AlertDialog>
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
          <FedDashboardOverview />
          <FredEconomicIndicators />
          <FredInterestRates />
          <FredInflation />
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
