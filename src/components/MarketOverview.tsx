
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MarketIndex } from "@/types/marketTypes";
import SparklineChart from "./SparklineChart";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";

interface MarketOverviewProps {
  indices: MarketIndex[];
}

const MarketOverview = ({ indices }: MarketOverviewProps) => {
  const [sparklines, setSparklines] = useState<{[key: string]: number[]}>({});
  
  useEffect(() => {
    const fetchSparklines = async () => {
      const sparklineData: {[key: string]: number[]} = {};
      
      for (const index of indices) {
        try {
          const data = await apiService.getStockSparkline(index.ticker);
          sparklineData[index.ticker] = data;
        } catch (error) {
          console.error(`Failed to fetch sparkline for ${index.ticker}:`, error);
          // Provide fallback data if the API fails
          sparklineData[index.ticker] = [100, 101, 102, 101, 102, 103, 104];
        }
      }
      
      setSparklines(sparklineData);
    };
    
    if (indices.length > 0) {
      fetchSparklines();
    }
  }, [indices]);
  
  const formatChange = (change: number, includeSign = true) => {
    const formatted = Math.abs(change).toFixed(2);
    return includeSign ? `${change >= 0 ? "+" : "-"}${formatted}` : formatted;
  };
  
  const formatPercentChange = (change: number) => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indices.map((index) => (
            <div 
              key={index.ticker} 
              className="p-4 rounded-lg bg-secondary/50 flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{index.name}</h3>
                  <p className="text-2xl font-semibold">{index.close.toFixed(2)}</p>
                </div>
                <div className={`flex items-center ${index.change >= 0 ? 'ticker-up' : 'ticker-down'}`}>
                  {index.change >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <div>
                    <div className="text-sm">{formatChange(index.change)}</div>
                    <div className="text-sm">{formatPercentChange(index.changePercent)}</div>
                  </div>
                </div>
              </div>
              
              <div className="h-12 mt-2">
                {sparklines[index.ticker] && (
                  <SparklineChart 
                    data={sparklines[index.ticker]} 
                    positive={index.change >= 0}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
