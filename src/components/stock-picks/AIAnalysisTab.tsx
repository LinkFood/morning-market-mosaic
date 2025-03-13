
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import { ScoredStock } from '@/services/stockPicker/algorithm';

interface AIAnalysisTabProps {
  stockAnalysis: StockAnalysis | null;
  isLoading: boolean;
  stockPicks: ScoredStock[];
}

const AIAnalysisTab: React.FC<AIAnalysisTabProps> = ({ 
  stockAnalysis, 
  isLoading, 
  stockPicks 
}) => {
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!stockAnalysis) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        AI analysis not available
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Market insight section */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Market Insight</h4>
        <p className="text-sm">{stockAnalysis.marketInsight}</p>
      </div>
      
      {/* Individual stock analyses */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Stock Analysis</h4>
        
        {stockPicks.map((stock) => {
          const analysis = stockAnalysis.stockAnalyses[stock.ticker];
          
          if (!analysis) return null;
          
          return (
            <div key={stock.ticker} className="border-b pb-3 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{stock.ticker}</div>
                <div className="text-sm text-muted-foreground">
                  ${stock.close.toFixed(2)} · {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
              <p className="text-sm">{analysis}</p>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground text-right mt-2">
        Analysis generated: {new Date(stockAnalysis.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default AIAnalysisTab;
