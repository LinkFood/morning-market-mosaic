import { useState, useMemo, useEffect } from "react";
import { Line, Bar, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

interface EnhancedChartProps {
  data: any[];
  height?: number;
  width?: number;
  dataKeys: string[];
  xAxisKey: string;
  stacked?: boolean;
  comparisonPeriod?: string; // 'yoy', 'mom', 'qoq'
  title?: string;
  tooltipFormatter?: (value: number) => string;
}

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  height = 300,
  dataKeys,
  xAxisKey,
  stacked = false,
  comparisonPeriod,
  title,
  tooltipFormatter
}) => {
  const { theme } = useTheme();
  const [timeFrame, setTimeFrame] = useState("1Y"); // 1M, 3M, 6M, 1Y, 5Y, MAX
  
  // Filter data based on the selected time frame with improved date validation
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeFrame) {
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "5Y":
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      case "MAX":
      default:
        return data;
    }
    
    return data.filter(item => {
      // Ensure proper date parsing with validation
      const itemDate = new Date(item[xAxisKey]);
      if (isNaN(itemDate.getTime())) {
        console.warn(`Invalid date in chart data: ${item[xAxisKey]}`);
        return false;
      }
      return itemDate >= cutoffDate;
    });
  }, [data, timeFrame, xAxisKey]);
  
  // Add debug logging to trace data flow issues
  useEffect(() => {
    if (data && data.length > 0) {
      console.log(`EnhancedChart data for ${title || 'chart'}:`, {
        dataPoints: data.length,
        timeFrame,
        dateRange: data.length > 0 ? `${data[0][xAxisKey]} to ${data[data.length-1][xAxisKey]}` : 'none',
        filteredCount: filteredData.length
      });
    }
  }, [data, filteredData, title, xAxisKey, timeFrame]);
  
  // CSS variables for chart colors
  const chartColors = [
    '#1f77b4', // blue
    '#ff7f0e', // orange
    '#2ca02c', // green
    '#d62728', // red
    '#9467bd', // purple
    '#8c564b', // brown
    '#e377c2', // pink
    '#7f7f7f', // gray
    '#bcbd22', // olive
    '#17becf'  // teal
  ];
  
  // Apply theme-specific styles
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
    borderColor: theme === 'dark' ? '#555555' : '#e2e8f0',
    color: theme === 'dark' ? '#ffffff' : '#000000',
  };
  
  const axisColor = theme === 'dark' ? '#888888' : '#666666';
  
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
          <div className="h-[300px] flex items-center justify-center bg-secondary/20 rounded-md">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <div className="flex justify-end mb-2 space-x-1">
        {["1M", "3M", "6M", "1Y", "5Y", "MAX"].map(period => (
          <button 
            key={period}
            className={`px-2 py-1 text-xs rounded ${timeFrame === period ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            onClick={() => setTimeFrame(period)}
          >
            {period}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey={xAxisKey} 
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            tick={{ fontSize: 11 }}
            stroke={axisColor}
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            stroke={axisColor}
          />
          <Tooltip 
            formatter={tooltipFormatter || ((value: number) => value.toFixed(2))}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={tooltipStyle}
          />
          <Legend 
            wrapperStyle={{ fontSize: 12 }}
          />
          {dataKeys.map((key, i) => (
            key.includes('area') ? (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key.replace('_area', '')} 
                fill={chartColors[i % chartColors.length]}
                stroke={chartColors[i % chartColors.length]}
                fillOpacity={0.3}
                stackId={stacked ? "stack" : undefined}
                name={key.replace('_area', '')}
              />
            ) : key.includes('bar') ? (
              <Bar
                key={key}
                dataKey={key.replace('_bar', '')}
                fill={chartColors[i % chartColors.length]}
                stackId={stacked ? "stack" : undefined}
                name={key.replace('_bar', '')}
              />
            ) : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[i % chartColors.length]}
                dot={false}
                activeDot={{ r: 5 }}
                name={key}
              />
            )
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedChart;
