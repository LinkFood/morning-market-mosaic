import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define types for heat map data
export interface HeatMapItem {
  id: string;
  name: string;
  value: number;
  change: number;
  marketCap?: number;
  category?: string;
  subCategory?: string;
}

interface HeatMapProps {
  title?: string;
  data: HeatMapItem[];
  loading?: boolean;
  onItemClick?: (item: HeatMapItem) => void;
  maxItems?: number;
}

const HeatMap: React.FC<HeatMapProps> = ({
  title = "Market Heat Map",
  data = [],
  loading = false,
  onItemClick,
  maxItems = 100
}) => {
  const [viewType, setViewType] = useState<'sector' | 'performance'>('sector');
  const [filteredData, setFilteredData] = useState<HeatMapItem[]>([]);
  
  useEffect(() => {
    // Sort and limit data based on view type
    let sorted = [...data];
    
    // Apply the max items limit
    sorted = sorted.slice(0, maxItems);
    
    setFilteredData(sorted);
  }, [data, viewType, maxItems]);
  
  // Group data by category
  const groupedData = filteredData.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, HeatMapItem[]>);
  
  // Function to determine color based on value/change
  const getColor = (value: number): string => {
    // For percentages between -10% and +10%
    const normalizedValue = Math.max(-10, Math.min(10, value)) / 10;
    
    if (value > 0) {
      // Green gradient for positive values
      const intensity = Math.round(200 * normalizedValue);
      return `rgba(0, ${100 + intensity}, 0, ${0.5 + normalizedValue * 0.5})`;
    } else {
      // Red gradient for negative values
      const intensity = Math.round(200 * -normalizedValue);
      return `rgba(${100 + intensity}, 0, 0, ${0.5 + -normalizedValue * 0.5})`;
    }
  };

  // Function to determine tile size based on market cap
  const getTileSize = (item: HeatMapItem): string => {
    if (!item.marketCap) return 'text-sm';
    
    if (item.marketCap > 500000000000) return 'text-xl'; // > $500B
    if (item.marketCap > 100000000000) return 'text-lg'; // > $100B
    if (item.marketCap > 10000000000) return 'text-base'; // > $10B
    return 'text-sm'; // < $10B
  };
  
  // Render loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{title}</span>
            <Skeleton className="h-8 w-[100px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
            {Array(24).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Tabs 
            value={viewType} 
            onValueChange={(v) => setViewType(v as 'sector' | 'performance')}
            className="h-8"
          >
            <TabsList className="h-8">
              <TabsTrigger value="sector" className="h-7 px-3 text-xs">By Sector</TabsTrigger>
              <TabsTrigger value="performance" className="h-7 px-3 text-xs">By Performance</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {viewType === 'sector' ? (
          // Render by sector
          <div className="space-y-4">
            {Object.entries(groupedData).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-medium text-sm mb-2">{category}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "p-2 rounded border cursor-pointer transition-all hover:shadow-md flex flex-col justify-between",
                        getTileSize(item)
                      )}
                      style={{ backgroundColor: getColor(item.change) }}
                      onClick={() => onItemClick && onItemClick(item)}
                    >
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span>${item.value.toFixed(2)}</span>
                        <span 
                          className={cn(
                            "font-bold",
                            item.change > 0 ? "text-green-800" : item.change < 0 ? "text-red-800" : ""
                          )}
                        >
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Render by performance (flat grid, color coded)
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredData
              .sort((a, b) => b.change - a.change) // Sort by change
              .map(item => (
                <div 
                  key={item.id} 
                  className={cn(
                    "p-2 rounded border cursor-pointer transition-all hover:shadow-md flex flex-col justify-between",
                    getTileSize(item)
                  )}
                  style={{ backgroundColor: getColor(item.change) }}
                  onClick={() => onItemClick && onItemClick(item)}
                >
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span>${item.value.toFixed(2)}</span>
                    <span 
                      className={cn(
                        "font-bold",
                        item.change > 0 ? "text-green-800" : item.change < 0 ? "text-red-800" : ""
                      )}
                    >
                      {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {filteredData.length === 0 && !loading && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <InfoCircle className="mr-2 h-4 w-4" />
            <span>No data available</span>
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Color intensity based on % change</span>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(-10) }}></span>
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(-5) }}></span>
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(-1) }}></span>
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(0) }}></span>
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(1) }}></span>
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(5) }}></span>
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(10) }}></span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredData.length} items
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatMap;