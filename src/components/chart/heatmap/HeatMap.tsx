import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { HeatMapProps, HeatMapItem } from './types';
import HeatMapLegend from './ColorLegend';
import HeatMapEmpty from './HeatMapEmpty';
import SectorView from './views/SectorView';
import PerformanceView from './views/PerformanceView';

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
  
  // Handle item click
  const handleItemClick = (item: HeatMapItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
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
          <SectorView groupedData={groupedData} onItemClick={handleItemClick} />
        ) : (
          <PerformanceView data={filteredData} onItemClick={handleItemClick} />
        )}
        
        {filteredData.length === 0 && !loading && <HeatMapEmpty />}
        
        <HeatMapLegend itemCount={filteredData.length} />
      </CardContent>
    </Card>
  );
};

export default HeatMap;
