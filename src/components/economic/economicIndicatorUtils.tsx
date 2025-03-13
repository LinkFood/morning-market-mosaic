
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import React from "react";

export const getChangeColor = (change: number, indicatorId: string): string => {
  // For unemployment, a decrease is good (green), an increase is bad (red)
  if (indicatorId === "UNRATE") {
    if (change < 0) return "ticker-up text-emerald-600 dark:text-emerald-400";
    if (change > 0) return "ticker-down text-red-600 dark:text-red-400";
    return "ticker-neutral text-gray-500 dark:text-gray-400";
  }
  
  // For inflation indicators, an increase is bad (red), a decrease is good (green)
  if (indicatorId === "CPIAUCSL" || indicatorId === "PCEPI" || indicatorId === "MEDCPIM158SFRBCLE") {
    if (change < 0) return "ticker-up text-emerald-600 dark:text-emerald-400";
    if (change > 0) return "ticker-down text-red-600 dark:text-red-400";
    return "ticker-neutral text-gray-500 dark:text-gray-400";
  }
  
  // For most economic indicators, an increase is good (green), a decrease is bad (red)
  if (change > 0) return "ticker-up text-emerald-600 dark:text-emerald-400";
  if (change < 0) return "ticker-down text-red-600 dark:text-red-400";
  return "ticker-neutral text-gray-500 dark:text-gray-400";
};

export const getChangeSymbol = (change: number, indicatorId: string) => {
  if (["UNRATE", "CPIAUCSL", "PCEPI", "MEDCPIM158SFRBCLE"].includes(indicatorId)) {
    // For these indicators, down is good, up is bad
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
  } else {
    // For most indicators, up is good, down is bad
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
  }
  return <Minus className="h-4 w-4" />;
};

export const getIndicatorDescription = (id: string): string => {
  switch (id) {
    // GDP indicators
    case "GDPC1":
      return "Real Gross Domestic Product";
    case "A191RL1Q225SBEA":
      return "GDP Growth Rate (Quarterly)";
      
    // Employment indicators
    case "UNRATE":
      return "Unemployment Rate";
    case "PAYEMS":
      return "Total Nonfarm Payrolls";
    case "ICSA":
      return "Initial Jobless Claims";
    case "JTSJOL":
      return "Job Openings";
      
    // Inflation indicators
    case "CPIAUCSL":
      return "Consumer Price Index (CPI)";
    case "PCEPI":
      return "Personal Consumption Expenditures Price Index";
    case "MEDCPIM158SFRBCLE":
      return "Median CPI";
      
    // Interest rate indicators
    case "FEDFUNDS":
      return "Federal Funds Rate";
    case "DGS10":
      return "10-Year Treasury Yield";
    case "DGS2":
      return "2-Year Treasury Yield";
    case "T10Y2Y":
      return "10Y-2Y Treasury Spread";
    case "MORTGAGE30US":
      return "30-Year Fixed Mortgage Rate";
      
    default:
      return "";
  }
};

export const getIndicatorUnit = (id: string): string => {
  // Rate indicators use percent
  if (["UNRATE", "FEDFUNDS", "DGS10", "DGS2", "T10Y2Y", "MORTGAGE30US", "A191RL1Q225SBEA"].includes(id)) {
    return "%";
  }
  
  // Dollar-based indicators
  if (id === "GDPC1") {
    return "T";  // Trillions of dollars
  }
  
  // Employment indicators
  if (id === "PAYEMS") {
    return "M";  // Millions of jobs
  }
  
  if (id === "ICSA") {
    return "K";  // Thousands of claims
  }
  
  return "";
};
