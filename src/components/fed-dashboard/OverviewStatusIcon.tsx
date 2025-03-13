
import React from "react";
import { Check, AlertTriangle, TrendingDown, TrendingUp, LineChart } from "lucide-react";
import { OverviewSummary } from "./types";

interface OverviewStatusIconProps {
  summary: OverviewSummary;
}

/**
 * Displays an appropriate icon based on the current economic health
 */
const OverviewStatusIcon: React.FC<OverviewStatusIconProps> = ({ summary }) => {
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

  return getEconomicHealthIcon();
};

export default OverviewStatusIcon;
