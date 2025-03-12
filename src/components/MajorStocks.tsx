
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockData } from "@/types/marketTypes";
import SparklineChart from "./SparklineChart";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";

interface MajorStocksProps {
  stocks: StockData[];
}

const MajorStocks = ({ stocks }: MajorStocksProps) => {
  const [sparklines, setSparklines] = useState<{[key: string]: number[]}>({});
  
  useEffect(() => {
    const fetchSparklines = async () => {
      const sparklineData: {[key: string]: number[]} = {};
      
      for (const stock of stocks) {
        try {
          const data = await apiService.getStockSparkline(stock.ticker);
          sparklineData[stock.ticker] = data;
        } catch (error) {
          console.error(`Failed to fetch sparkline for ${stock.ticker}:`, error);
          // Provide fallback data if the API fails
          sparklineData[stock.ticker] = [100, 101, 102, 101, 102, 103, 104];
        }
      }
      
      setSparklines(sparklineData);
    };
    
    if (stocks.length > 0) {
      fetchSparklines();
    }
  }, [stocks]);
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Major Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground text-sm">
                <th className="pb-2">Ticker</th>
                <th className="pb-2">Close</th>
                <th className="pb-2">Change</th>
                <th className="pb-2 hidden sm:table-cell">Low</th>
                <th className="pb-2 hidden sm:table-cell">High</th>
                <th className="pb-2">7-Day Trend</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.ticker} className="border-t border-border">
                  <td className="py-3 font-medium">{stock.ticker}</td>
                  <td className="py-3">${stock.close.toFixed(2)}</td>
                  <td className={`py-3 ${
                    stock.change > 0 
                      ? "ticker-up" 
                      : stock.change < 0 
                      ? "ticker-down" 
                      : "ticker-neutral"
                  }`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                  </td>
                  <td className="py-3 hidden sm:table-cell">${stock.low.toFixed(2)}</td>
                  <td className="py-3 hidden sm:table-cell">${stock.high.toFixed(2)}</td>
                  <td className="py-3">
                    <div className="h-8 w-24">
                      {sparklines[stock.ticker] && (
                        <SparklineChart 
                          data={sparklines[stock.ticker]} 
                          positive={stock.change >= 0}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MajorStocks;
