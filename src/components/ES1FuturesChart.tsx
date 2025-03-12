
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/theme-provider";

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
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: value.toFixed(2),
      fullTime: time
    });
  }
  
  return data;
};

const ES1FuturesChart = () => {
  const [futuresData, setFuturesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  
  useEffect(() => {
    // Simulating API call to get futures data
    setTimeout(() => {
      const data = generateMockFuturesData();
      setFuturesData(data);
      setIsLoading(false);
    }, 800);
  }, []);
  
  const currentValue = futuresData.length > 0 ? parseFloat(futuresData[futuresData.length - 1].value) : 0;
  const previousValue = futuresData.length > 0 ? parseFloat(futuresData[0].value) : 0;
  const change = currentValue - previousValue;
  const changePercent = ((change / previousValue) * 100).toFixed(2);
  
  const isPositive = change >= 0;
  const tickerClass = isPositive ? 'ticker-up' : 'ticker-down';
  const chartColor = isPositive ? '#16a34a' : '#dc2626';
  
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
                {parseFloat(futuresData[futuresData.length - 1]?.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={futuresData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickCount={6} 
                  stroke={theme === 'dark' ? '#888888' : '#666666'}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tick={{ fontSize: 12 }} 
                  tickCount={8} 
                  width={60} 
                  stroke={theme === 'dark' ? '#888888' : '#666666'}
                />
                <Tooltip 
                  formatter={(value: any) => [`${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
                  labelFormatter={(time) => `Time: ${time}`}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                    borderColor: theme === 'dark' ? '#555555' : '#e2e8f0',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartColor} 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2, fill: theme === 'dark' ? '#333333' : '#ffffff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ES1FuturesChart;
