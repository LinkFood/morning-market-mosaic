
import React from 'react';
import { HeatMapItem } from '../types';
import HeatMapTile from '../HeatMapTile';

interface SectorViewProps {
  groupedData: Record<string, HeatMapItem[]>;
  onItemClick?: (item: HeatMapItem) => void;
}

const SectorView: React.FC<SectorViewProps> = ({ groupedData, onItemClick }) => {
  return (
    <div className="space-y-4">
      {Object.entries(groupedData).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-medium text-sm mb-2">{category}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {items.map(item => (
              <HeatMapTile 
                key={item.id} 
                item={item} 
                onClick={onItemClick} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SectorView;
