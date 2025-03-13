
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { isFeatureEnabled } from '@/services/featureFlags';
import { useDashboard } from '../dashboard/DashboardContext';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';

// Define prop interface for StockPicks
interface StockPicksProps {
  stocks: ScoredStock[];
  analysis?: StockAnalysis | null;
  isLoading: boolean;
  isLoadingAnalysis?: boolean;
}

const StockPicks: React.FC<StockPicksProps> = ({ 
  stocks, 
  analysis, 
  isLoading, 
  isLoadingAnalysis = false 
}) => {
  const { featureFlags } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>('algorithm');
  
  const isAIEnabled = isFeatureEnabled('useAIStockAnalysis');
  
  if (isLoading && !stocks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Stock Picks
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </CardTitle>
          <CardDescription>Algorithmic stock selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle no stock picks
  if (!isLoading && stocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Stock Picks
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </CardTitle>
          <CardDescription>Algorithmic stock selection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">
            No stock picks available for current market conditions
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Stock Picks
          <Badge variant="outline" className="ml-2">Beta</Badge>
        </CardTitle>
        <CardDescription>
          {isAIEnabled ? 'AI-enhanced stock analysis' : 'Algorithmic stock selection'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAIEnabled ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
              <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="algorithm" className="space-y-4">
              <AlgorithmTab stockPicks={stocks} />
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <AIAnalysisTab 
                stockAnalysis={analysis} 
                isLoading={isLoadingAnalysis} 
                stockPicks={stocks}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <AlgorithmTab stockPicks={stocks} />
        )}
      </CardContent>
    </Card>
  );
};

// Algorithm analysis tab
const AlgorithmTab: React.FC<{ stockPicks: ScoredStock[] }> = ({ stockPicks }) => {
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

// AI analysis tab
const AIAnalysisTab: React.FC<{ 
  stockAnalysis: StockAnalysis | null, 
  isLoading: boolean,
  stockPicks: ScoredStock[]
}> = ({ stockAnalysis, isLoading, stockPicks }) => {
  
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

export default StockPicks;
