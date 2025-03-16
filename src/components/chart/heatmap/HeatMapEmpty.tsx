
import React from 'react';
import { Info } from 'lucide-react';

const HeatMapEmpty: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-32 text-muted-foreground">
      <Info className="mr-2 h-4 w-4" />
      <span>No data available</span>
    </div>
  );
};

export default HeatMapEmpty;
