
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, Info, Cpu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import StockPickerCard from './StockPickerCard';
import StockPickerLoading from './StockPickerLoading';
import StockPickerEmpty from './StockPickerEmpty';
import MarketInsight from './MarketInsight';
import apiService from '@/services/apiService';
import { isFeatureEnabled } from '@/services/features';

const AIStockPicker = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topStocks, setTopStocks] = useState<ScoredStock[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Check for AI analysis feature flag
  const isAIEnabled = isFeatureEnabled('useAIStockAnalysis');
  
  const loadData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log("Starting AI Stock Picker data load");
      
      // Get a mix of active stocks to analyze (more comprehensive than just major stocks)
      const stockSymbols = [
        "AAPL", "MSFT", "AMZN", "GOOGL", "META", 
        "NVDA", "TSLA", "AMD", "NFLX", "DIS",
        "JPM", "BAC", "WMT", "PG", "JNJ", 
        "XOM", "CVX", "PFE", "KO", "PEP",
        "FB", "INTC", "VZ", "T", "MCD",
        "NKE", "IBM", "GS", "V", "PYPL"
      ];
      
      // Get stock data for the symbols
      console.log("Fetching stock data for analysis...");
      const stocksData = await apiService.getMajorStocks(stockSymbols);
      
      if (!stocksData || stocksData.length === 0) {
        throw new Error("Failed to retrieve stock data");
      }
      
      console.log(`Retrieved data for ${stocksData.length} stocks`);
      
      // Apply the algorithm to get top stock picks
      console.log("Applying stock picker algorithm...");
      const scoredStocks = await apiService.getTopPicks(stocksData);
      
      if (!scoredStocks || scoredStocks.length === 0) {
        throw new Error("No stocks met the algorithm criteria");
      }
      
      console.log(`Algorithm selected ${scoredStocks.length} top stocks`);
      setTopStocks(scoredStocks);
      
      // Get AI analysis if enabled
      if (isAIEnabled && scoredStocks.length > 0) {
        try {
          console.log("Requesting AI analysis for selected stocks...");
          const analysis = await apiService.getStockAnalysis(scoredStocks);
          console.log("AI analysis received:", analysis ? "success" : "empty");
          setAiAnalysis(analysis);
        } catch (analysisError) {
          console.error('Error getting AI analysis:', analysisError);
          toast.error('Could not load AI analysis. Algorithm results still available.');
        }
      } else {
        console.log("AI analysis is disabled or no stocks were selected");
        setAiAnalysis(null);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in AI Stock Picker:', error);
      setError('Failed to load stock data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  if (loading) {
    return <StockPickerLoading />;
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="mr-2 h-5 w-5" />
            AI-Enhanced Stock Picks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
              onClick={loadData}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Cpu className="mr-2 h-5 w-5" />
            <span>{isAIEnabled ? 'AI-Enhanced Stock Picks' : 'Algorithmic Stock Picks'}</span>
          </div>
          <div className="flex items-center text-sm font-normal">
            {lastUpdated && (
              <span className="text-muted-foreground mr-2">
                Updated {formatDistanceToNow(lastUpdated)} ago
              </span>
            )}
            <button 
              className="p-1 hover:bg-secondary rounded-full"
              onClick={loadData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center rounded-md bg-secondary/50 p-2 mb-4">
            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isAIEnabled 
                ? 'These picks are based on technical indicators and enhanced with AI analysis. For educational purposes only.'
                : 'These picks are based on technical indicators. AI analysis is currently unavailable.'}
            </p>
          </div>
          
          {topStocks.length === 0 ? (
            <StockPickerEmpty />
          ) : (
            <>
              {topStocks.map((stock) => (
                <StockPickerCard 
                  key={stock.ticker}
                  stock={stock}
                  analysis={aiAnalysis?.stockAnalyses[stock.ticker]}
                />
              ))}
              
              {aiAnalysis?.marketInsight && (
                <MarketInsight insight={aiAnalysis.marketInsight} />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStockPicker;
