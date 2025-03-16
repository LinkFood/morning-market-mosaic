
import React from 'react';
import { getColor } from './utils/colorUtils';
import { HeatMapLegendProps } from './types';
import { Badge } from '@/components/ui/badge';

const HeatMapLegend: React.FC<HeatMapLegendProps> = ({ itemCount }) => {
  return (
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
        {itemCount} items
      </Badge>
    </div>
  );
};

export default HeatMapLegend;
