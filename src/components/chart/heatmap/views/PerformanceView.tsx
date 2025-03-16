
import React from 'react';
import { HeatMapItem } from '../types';
import HeatMapTile from '../HeatMapTile';

interface PerformanceViewProps {
  data: HeatMapItem[];
  onItemClick?: (item: HeatMapItem) => void;
}

const PerformanceView: React.FC<PerformanceViewProps> = ({ data, onItemClick }) => {
  // Sort data by change (performance)
  const sortedData = [...data].sort((a, b) => b.change - a.change);
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {sortedData.map(item => (
        <HeatMapTile 
          key={item.id} 
          item={item} 
          onClick={onItemClick} 
        />
      ))}
    </div>
  );
};

export default PerformanceView;
