
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import React from "react";

export const getChangeColor = (change: number, indicatorId: string): string => {
  if (change < 0 && indicatorId === "UNRATE") {
    return "ticker-up";
  }
  if (change > 0 && indicatorId !== "UNRATE") return "ticker-up";
  if (change < 0 && indicatorId !== "UNRATE") return "ticker-down";
  if (change > 0 && indicatorId === "UNRATE") return "ticker-down";
  return "ticker-neutral";
};

export const getChangeSymbol = (change: number, indicatorId: string) => {
  if (indicatorId === "UNRATE") {
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
  } else {
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
  }
  return <Minus className="h-4 w-4" />;
};

export const getIndicatorDescription = (id: string): string => {
  switch (id) {
    case "GDPC1":
      return "Real Gross Domestic Product";
    case "A191RL1Q225SBEA":
      return "GDP Growth Rate (Quarterly)";
    case "UNRATE":
      return "Unemployment Rate";
    case "PAYEMS":
      return "Total Nonfarm Payrolls";
    default:
      return "";
  }
};
