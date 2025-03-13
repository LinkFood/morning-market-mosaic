
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export interface IndicatorContextData {
  description: string;
  interpretation: string;
  benchmark?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  higherIsBetter: boolean;
  source?: string;
}

interface IndicatorInfoProps {
  indicatorId: string;
}

// Economic indicator data dictionary
const INDICATOR_INFO: Record<string, IndicatorContextData> = {
  // GDP related
  "GDPC1": {
    description: "Real Gross Domestic Product, measuring the inflation-adjusted value of goods and services produced in the U.S.",
    interpretation: "Represents the overall health of the economy. Negative growth for two consecutive quarters often signals a recession.",
    benchmark: "Pre-pandemic peak in Q4 2019: $19.2 trillion",
    frequency: "quarterly",
    higherIsBetter: true,
    source: "Bureau of Economic Analysis"
  },
  "A191RL1Q225SBEA": {
    description: "GDP Growth Rate (Quarterly), showing the annualized percent change in real GDP from the previous quarter.",
    interpretation: "Indicates economic expansion or contraction. Negative rates for two consecutive quarters often define a recession.",
    benchmark: "Long-term average (1947-2023): ~3.1%",
    frequency: "quarterly",
    higherIsBetter: true,
    source: "Bureau of Economic Analysis"
  },
  
  // Employment related
  "UNRATE": {
    description: "Unemployment Rate, showing the percentage of the labor force that is unemployed and actively seeking employment.",
    interpretation: "Lower is generally better for the economy. The natural rate of unemployment is considered to be around 4-5%.",
    benchmark: "Pre-pandemic low in Feb 2020: 3.5%",
    frequency: "monthly",
    higherIsBetter: false,
    source: "Bureau of Labor Statistics"
  },
  "PAYEMS": {
    description: "Total Nonfarm Payrolls, measuring the total number of paid U.S. workers excluding farm workers, private household employees, and nonprofit organization employees.",
    interpretation: "Consistent monthly increases indicate a strong labor market and economic growth.",
    benchmark: "Pre-pandemic peak in Feb 2020: 152.5 million",
    frequency: "monthly",
    higherIsBetter: true,
    source: "Bureau of Labor Statistics"
  },
  
  // Inflation related
  "CPIAUCSL": {
    description: "Consumer Price Index for All Urban Consumers (CPI-U), measuring the average change in prices paid by urban consumers for a market basket of goods and services.",
    interpretation: "Year-over-year changes indicate inflation rate. Fed's target is around 2%.",
    benchmark: "Pre-pandemic rate in Feb 2020: 2.3%",
    frequency: "monthly",
    higherIsBetter: false,
    source: "Bureau of Labor Statistics"
  },
  "PCEPI": {
    description: "Personal Consumption Expenditures Price Index, the Fed's preferred measure of inflation based on prices of goods and services purchased by consumers.",
    interpretation: "Year-over-year changes indicate inflation rate. Fed's target is 2%.",
    benchmark: "Pre-pandemic rate in Feb 2020: 1.8%",
    frequency: "monthly",
    higherIsBetter: false,
    source: "Bureau of Economic Analysis"
  },
  
  // Interest rates
  "FEDFUNDS": {
    description: "Federal Funds Effective Rate, the interest rate at which banks lend reserve balances to other banks overnight.",
    interpretation: "Controlled by the Federal Reserve to implement monetary policy. Higher rates tend to slow economic growth and reduce inflation.",
    benchmark: "Pre-pandemic rate in Feb 2020: 1.58%",
    frequency: "daily",
    higherIsBetter: null, // Depends on economic conditions
    source: "Federal Reserve"
  },
  "DGS10": {
    description: "10-Year Treasury Constant Maturity Rate, the yield on U.S. Treasury securities with a 10-year maturity.",
    interpretation: "Reflects market expectations about future economic growth and inflation. Often used as a benchmark for mortgage rates.",
    benchmark: "Pre-pandemic rate in Feb 2020: 1.50%",
    frequency: "daily",
    higherIsBetter: null, // Depends on economic conditions
    source: "Federal Reserve"
  },
  "DGS2": {
    description: "2-Year Treasury Constant Maturity Rate, the yield on U.S. Treasury securities with a 2-year maturity.",
    interpretation: "Reflects market expectations about short-term interest rates and monetary policy.",
    benchmark: "Pre-pandemic rate in Feb 2020: 1.36%",
    frequency: "daily",
    higherIsBetter: null, // Depends on economic conditions
    source: "Federal Reserve"
  },
  "T10Y2Y": {
    description: "10-Year Treasury Constant Maturity Minus 2-Year Treasury Constant Maturity (yield curve spread).",
    interpretation: "A negative value (inverted yield curve) often precedes recessions.",
    benchmark: "Pre-pandemic spread in Feb 2020: 0.14%",
    frequency: "daily",
    higherIsBetter: true, // Positive spread generally indicates healthy economy
    source: "Federal Reserve"
  }
};

const IndicatorInfo: React.FC<IndicatorInfoProps> = ({ indicatorId }) => {
  const indicatorInfo = INDICATOR_INFO[indicatorId];
  
  if (!indicatorInfo) {
    return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4" side="right">
          <div className="space-y-2">
            <h4 className="font-semibold">{indicatorId}</h4>
            <p className="text-sm">{indicatorInfo.description}</p>
            <p className="text-sm"><span className="font-medium">Interpretation:</span> {indicatorInfo.interpretation}</p>
            {indicatorInfo.benchmark && (
              <p className="text-sm"><span className="font-medium">Benchmark:</span> {indicatorInfo.benchmark}</p>
            )}
            <p className="text-sm"><span className="font-medium">Frequency:</span> {indicatorInfo.frequency}</p>
            {indicatorInfo.higherIsBetter !== null && (
              <p className="text-sm">
                <span className="font-medium">Direction:</span> {indicatorInfo.higherIsBetter ? 'Higher is better' : 'Lower is better'}
              </p>
            )}
            {indicatorInfo.source && (
              <p className="text-sm text-muted-foreground">Source: {indicatorInfo.source}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default IndicatorInfo;
