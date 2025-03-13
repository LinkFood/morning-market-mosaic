
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatTimeWithDate } from '@/utils/dateUtils';

interface CandlestickTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CandlestickTooltip: React.FC<CandlestickTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Card className="border shadow-md">
        <CardContent className="p-3">
          <p className="text-xs font-medium mb-1">{formatTimeWithDate(data.timestamp)}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>Open: <span className="font-medium">${data.open.toFixed(2)}</span></div>
            <div>Close: <span className="font-medium">${data.close.toFixed(2)}</span></div>
            <div>High: <span className="font-medium">${data.high.toFixed(2)}</span></div>
            <div>Low: <span className="font-medium">${data.low.toFixed(2)}</span></div>
            <div className="col-span-2 mt-1">
              Volume: <span className="font-medium">{data.volume.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default CandlestickTooltip;
