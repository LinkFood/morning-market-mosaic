
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import FredInterestRates from "@/components/FredInterestRates";
import FredInflation from "@/components/FredInflation";
import fedApiService from "@/services/fedApiService";
import { toast } from "sonner";

const FedDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh all Fed data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      fedApiService.clearFredCacheData();
      // Force page reload to refresh all components
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
      setIsRefreshing(false);
    }
  };

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
              <h1 className="text-3xl font-bold">Federal Reserve Data Dashboard</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
          <p className="text-muted-foreground">
            Real-time economic indicators and Federal Reserve data
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
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
