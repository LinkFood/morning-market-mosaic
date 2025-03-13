
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScoredStock } from '@/services/stockPicker/algorithm';

interface StockScoreProps {
  stock: ScoredStock;
}

const StockScore: React.FC<StockScoreProps> = ({ stock }) => {
  return (
    <div>
      <div className="flex items-center">
        <span className="font-bold">Score: </span>
        <Badge variant={stock.scores.composite > 70 ? "default" : 
                        stock.scores.composite > 50 ? "secondary" : 
                        "destructive"}
            className="ml-2">
          {stock.scores.composite}/100
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {stock.signals.slice(0, 3).join(' · ')}
        {stock.signals.length > 3 && ' · ...'}
      </div>
    </div>
  );
};

export default StockScore;
