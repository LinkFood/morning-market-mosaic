
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HeatMapLegendProps } from './types';
import { ColorLegend } from './utils/colorUtils';

const HeatMapLegend: React.FC<HeatMapLegendProps> = ({ itemCount }) => {
  return (
    <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>Color intensity based on % change</span>
        <ColorLegend />
      </div>
      <Badge variant="outline" className="text-xs">
        {itemCount} items
      </Badge>
    </div>
  );
};

export default HeatMapLegend;
