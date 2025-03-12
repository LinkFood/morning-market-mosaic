
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EnhancedChart from "@/components/chart/EnhancedChart";

// Mock futures data (would be replaced with real API data)
const generateMockFuturesData = () => {
  const data = [];
  const now = new Date();
  const baseValue = 4500 + Math.random() * 200;
  const trend = Math.random() > 0.5 ? 1 : -1;
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(now.getHours() - i);
    
    const value = baseValue + (trend * i * (Math.random() * 5));
    data.push({
      date: time.toISOString(), // Using ISO string for date format
      value: parseFloat(value.toFixed(2)),
      displayTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
  
  return data;
};

const ES1FuturesChart = () => {
  const [futuresData, setFuturesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulating API call to get futures data
    setTimeout(() => {
      const data = generateMockFuturesData();
      setFuturesData(data);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Calculate current value, change and percentage change
  const currentValue = futuresData.length > 0 ? futuresData[futuresData.length - 1].value : 0;
  const previousValue = futuresData.length > 0 ? futuresData[0].value : 0;
  const change = currentValue - previousValue;
  const changePercent = ((change / previousValue) * 100).toFixed(2);
  
  const isPositive = change >= 0;
  const tickerClass = isPositive ? 'text-positive' : 'text-negative';
  
  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">ES1 Futures</CardTitle>
            <CardDescription>S&P 500 E-mini Futures</CardDescription>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold">
                {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${tickerClass}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent}%)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : (
          <div className="h-[300px] w-full">
            <EnhancedChart
              data={futuresData}
              height={300}
              dataKeys={["value"]}
              xAxisKey="date"
              title="S&P 500 E-mini Futures (Real-time)"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ES1FuturesChart;
