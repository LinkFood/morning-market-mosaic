
import React from 'react';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import StockHeader from './StockHeader';
import StockItem from './StockItem';
import StockSkeleton from './StockSkeleton';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    return <StockSkeleton />;
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
            <StockItem key={stock.ticker}>
              <StockHeader stock={stock} className="mb-2" />
              <p className="text-sm">{analysis}</p>
            </StockItem>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
        <div>
          {stockAnalysis.model && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1 hover:text-muted-foreground/80">
                  <InfoIcon className="h-3.5 w-3.5" />
                  <span>Model: {stockAnalysis.model}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Function version: {stockAnalysis.functionVersion || 'unknown'}</p>
                  {stockAnalysis.timestamp && <p>Last updated: {new Date(stockAnalysis.timestamp).toLocaleString()}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div>
          Analysis generated: {new Date(stockAnalysis.generatedAt).toLocaleString()}
        </div>
      </div>
      
      {stockAnalysis.error && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-md text-sm">
          <p className="font-medium">Error details:</p>
          <p>{stockAnalysis.error}</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisTab;
