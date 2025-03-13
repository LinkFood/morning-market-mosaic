
import React from "react";
import { OverviewSummary } from "./types";

interface OverviewSummaryTextProps {
  summary: OverviewSummary;
}

/**
 * Generates a human-readable summary of the economic indicators
 */
const OverviewSummaryText: React.FC<OverviewSummaryTextProps> = ({ summary }) => {
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

  return <p className="text-lg mb-4">{generateSummary()}</p>;
};

export default OverviewSummaryText;
