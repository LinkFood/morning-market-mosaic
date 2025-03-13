
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScoredStock } from '@/services/stockPicker/algorithm';

interface AlgorithmTabProps {
  stockPicks: ScoredStock[];
}

const AlgorithmTab: React.FC<AlgorithmTabProps> = ({ stockPicks }) => {
  return (
    <div className="space-y-4">
      {stockPicks.map((stock) => (
        <div key={stock.ticker} className="border-b pb-3 last:border-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-lg">{stock.ticker}</span>
              <div className="flex">
                <span className="text-sm text-muted-foreground">
                  ${stock.close.toFixed(2)} · {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlgorithmTab;
