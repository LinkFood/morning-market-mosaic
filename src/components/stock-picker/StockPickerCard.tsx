
import React, { useState } from 'react';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, ArrowRight, MessageSquare, BarChart } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StockPickerCardProps {
  stock: ScoredStock;
  analysis?: string;
}

const StockPickerCard: React.FC<StockPickerCardProps> = ({ stock, analysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format price change with color and sign
  const formatChange = () => {
    const isPositive = stock.change >= 0;
    const sign = isPositive ? '+' : '';
    return (
      <span className={isPositive ? 'text-emerald-500' : 'text-rose-500'}>
        {sign}{stock.change.toFixed(2)} ({sign}{stock.changePercent.toFixed(2)}%)
      </span>
    );
  };
  
  // Determine color for composite score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-emerald-400';
    if (score >= 60) return 'bg-amber-400';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-lg overflow-hidden mb-3"
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-card">
        {/* Stock info */}
        <div className="flex items-start sm:items-center mb-2 sm:mb-0">
          <div className="mr-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {stock.ticker.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-lg">{stock.ticker}</h3>
              <span className="text-sm text-muted-foreground ml-2">
                {stock.name || ''}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">${stock.close.toFixed(2)}</span>
              <span className="ml-2 text-sm">{formatChange()}</span>
            </div>
          </div>
        </div>
        
        {/* Scores and action */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Score:</span>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-4 border-background" 
                style={{ backgroundColor: getScoreColor(stock.scores.composite) }}>
                <span className="text-white font-bold">{stock.scores.composite}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mr-2">
            {stock.signals.slice(0, 2).map((signal, index) => (
              <Badge key={index} variant={signal.includes('Bullish') ? 'default' : signal.includes('Bearish') ? 'destructive' : 'secondary'}>
                {signal}
              </Badge>
            ))}
            {stock.signals.length > 2 && (
              <Badge variant="outline">+{stock.signals.length - 2}</Badge>
            )}
          </div>
          
          <CollapsibleTrigger className="rounded-full p-2 hover:bg-muted">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
        </div>
      </div>
      
      <CollapsibleContent>
        <CardContent className="p-4 pt-0 border-t bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <BarChart className="h-4 w-4 mr-1" />
                Score Breakdown
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Momentum</span>
                    <span>{stock.scores.momentum}/100</span>
                  </div>
                  <Progress value={stock.scores.momentum} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Volume</span>
                    <span>{stock.scores.volume}/100</span>
                  </div>
                  <Progress value={stock.scores.volume} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Trend</span>
                    <span>{stock.scores.trend}/100</span>
                  </div>
                  <Progress value={stock.scores.trend} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Volatility</span>
                    <span>{stock.scores.volatility}/100</span>
                  </div>
                  <Progress value={stock.scores.volatility} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                AI Analysis
              </h4>
              {analysis ? (
                <p className="text-sm">{analysis}</p>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  AI analysis not available for this stock.
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <a 
              href={`https://finance.yahoo.com/quote/${stock.ticker}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary flex items-center hover:underline"
            >
              View details
              <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default StockPickerCard;
