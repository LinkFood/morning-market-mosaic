
import React from "react";
import { OverviewSummary } from "./types";
import GDPCard from "./GDPCard";
import UnemploymentCard from "./UnemploymentCard";
import InflationCard from "./InflationCard";
import FedRateCard from "./FedRateCard";

interface OverviewIndicatorCardsProps {
  summary: OverviewSummary;
}

/**
 * Container for all overview indicator cards
 */
const OverviewIndicatorCards: React.FC<OverviewIndicatorCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* GDP Card */}
      {summary.gdpGrowth && (
        <GDPCard
          rate={summary.gdpGrowth.rate}
          trend={summary.gdpGrowth.trend}
        />
      )}
      
      {/* Unemployment Card */}
      {summary.unemployment && (
        <UnemploymentCard
          rate={summary.unemployment.rate}
          trend={summary.unemployment.trend}
        />
      )}
      
      {/* Inflation Card */}
      {summary.inflation && (
        <InflationCard
          rate={summary.inflation.rate}
          trend={summary.inflation.trend}
        />
      )}
      
      {/* Fed Rate Card */}
      {summary.fedRate && (
        <FedRateCard
          rate={summary.fedRate.rate}
          lastChange={summary.fedRate.lastChange}
        />
      )}
    </div>
  );
};

export default OverviewIndicatorCards;
