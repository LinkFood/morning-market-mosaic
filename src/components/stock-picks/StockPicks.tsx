
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { isFeatureEnabled } from '@/services/featureFlags';
import { useDashboard } from '../dashboard/DashboardContext';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import AlgorithmTab from './AlgorithmTab';
import AIAnalysisTab from './AIAnalysisTab';
import StockPicksLoading from './StockPicksLoading';
import StockPicksEmpty from './StockPicksEmpty';
import { Button } from '@/components/ui/button';

// Define prop interface for StockPicks
interface StockPicksProps {
  stocks: ScoredStock[];
  analysis?: StockAnalysis | null;
  isLoading: boolean;
  isLoadingAnalysis?: boolean;
  onRefresh?: () => Promise<void>;
}

const StockPicks: React.FC<StockPicksProps> = ({ 
  stocks, 
  analysis, 
  isLoading, 
  isLoadingAnalysis = false,
  onRefresh
}) => {
  const { featureFlags } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>('algorithm');
  const [refreshing, setRefreshing] = useState(false);
  
  const isAIEnabled = isFeatureEnabled('useAIStockAnalysis');
  
  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
  
  // Show loading state
  if (isLoading && !stocks.length) {
    return <StockPicksLoading />;
  }
  
  // Handle no stock picks
  if (!isLoading && stocks.length === 0) {
    return <StockPicksEmpty onRetry={onRefresh ? handleRefresh : undefined} />;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              Stock Picks
              <Badge variant="outline" className="ml-2">Beta</Badge>
            </CardTitle>
            <CardDescription>
              {isAIEnabled ? 'AI-enhanced stock analysis' : 'Algorithmic stock selection'}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              {refreshing ? 'Updating...' : 'Refresh'}
            </Button>
          )}
        </div>
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
              {analysis?.fromFallback && (
                <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    AI analysis is currently limited. Showing algorithmic results instead.
                  </p>
                </div>
              )}
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

export default StockPicks;
