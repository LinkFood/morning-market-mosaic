
import React from 'react';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import StockHeader from './StockHeader';
import StockItem from './StockItem';
import StockSkeleton from './StockSkeleton';

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
      
      <div className="text-xs text-muted-foreground text-right mt-2">
        Analysis generated: {new Date(stockAnalysis.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default AIAnalysisTab;
