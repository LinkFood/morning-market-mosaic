
import React, { useState } from 'react';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu } from 'lucide-react';

interface StockPickerCardProps {
  stock: ScoredStock;
  analysis?: string;
}

const StockPickerCard: React.FC<StockPickerCardProps> = ({ stock, analysis }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Determine the badge color based on composite score
  const getBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{stock.ticker}</h3>
            <Badge variant={getBadgeVariant(stock.scores.composite)}>
              {stock.scores.composite}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{stock.name}</p>
          
          <div className="mt-1">
            <span className={`font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stock.close.toFixed(2)} · {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {stock.signals.slice(0, 3).map((signal, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {signal}
              </Badge>
            ))}
            {stock.signals.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{stock.signals.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex flex-col items-end">
            <div className="text-sm mb-2">
              <div>Vol: {stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : 'N/A'}</div>
              <div>Momentum: {stock.scores.momentum}</div>
            </div>
          </div>
        </div>
      </div>
      
      {analysis && (
        <div className="mt-3">
          {!showAnalysis ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-xs flex items-center justify-center"
              onClick={() => setShowAnalysis(true)}
            >
              <Cpu className="h-3 w-3 mr-1" />
              Show AI Analysis
            </Button>
          ) : (
            <div className="bg-secondary/30 p-3 rounded-md mt-2">
              <div className="flex items-center mb-1">
                <Cpu className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">AI Analysis</span>
              </div>
              <p className="text-xs">{analysis}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={() => setShowAnalysis(false)}
              >
                Hide Analysis
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockPickerCard;
