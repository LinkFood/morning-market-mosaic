
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { isFeatureEnabled } from '@/services/featureFlags';
import { useDashboard } from '../dashboard/DashboardContext';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import AlgorithmTab from './AlgorithmTab';
import AIAnalysisTab from './AIAnalysisTab';
import StockPicksLoading from './StockPicksLoading';
import StockPicksEmpty from './StockPicksEmpty';

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
  
  // Show loading state
  if (isLoading && !stocks.length) {
    return <StockPicksLoading />;
  }
  
  // Handle no stock picks
  if (!isLoading && stocks.length === 0) {
    return <StockPicksEmpty />;
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

export default StockPicks;
