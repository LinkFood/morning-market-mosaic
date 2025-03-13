
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
  
  // Function to get well-known liquid stocks
  const getWellKnownStocks = () => {
    // Focus on large cap, high-volume, well-known stocks
    return [
      // Big Tech
      "AAPL", "MSFT", "AMZN", "GOOGL", "META", 
      // Semiconductors
      "NVDA", "AMD", "INTC", "TSM", "MU",
      // Finance
      "JPM", "BAC", "GS", "V", "MA", 
      // Healthcare
      "JNJ", "PFE", "MRK", "UNH", "ABBV",
      // Consumer
      "WMT", "PG", "KO", "PEP", "MCD",
      // Energy
      "XOM", "CVX", "COP", "EOG", "SLB",
      // Other Tech
      "CRM", "ADBE", "ORCL", "IBM", "CSCO"
    ];
  };
  
  const loadData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log("Starting AI Stock Picker data load");
      
      // Get stock symbols with focus on liquid, well-known stocks
      const stockSymbols = getWellKnownStocks();
      
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
      
      console.log(`Algorithm selected ${scoredStocks.length} top stocks: ${scoredStocks.map(s => s.ticker).join(', ')}`);
      setTopStocks(scoredStocks);
      
      // Get AI analysis if enabled
      if (isFeatureEnabled('useAIStockAnalysis') && scoredStocks.length > 0) {
        try {
          console.log("Requesting AI analysis for selected stocks...");
          // Make async call
          apiService.getStockAnalysis(scoredStocks).then(analysis => {
            console.log("AI analysis received:", analysis ? "success" : "empty");
            if (analysis && analysis.stockAnalyses && Object.keys(analysis.stockAnalyses).length > 0) {
              console.log("AI analysis contains data for", Object.keys(analysis.stockAnalyses).length, "stocks");
              setAiAnalysis(analysis);
            } else {
              console.warn("AI analysis response was empty or malformed");
              toast.warning('AI analysis returned empty results');
            }
          }).catch(err => {
            console.error('Error processing AI analysis:', err);
            toast.error('Could not load AI analysis. Algorithm results still available.');
          });
        } catch (analysisError) {
          console.error('Error getting AI analysis:', analysisError);
          toast.error('Could not load AI analysis. Algorithm results still available.');
        }
      } else {
        console.log(`AI analysis is ${isFeatureEnabled('useAIStockAnalysis') ? 'enabled' : 'disabled'}, stocks selected: ${scoredStocks.length}`);
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
  
  // Manual trigger for AI analysis
  const triggerAIAnalysis = async () => {
    if (!topStocks || topStocks.length === 0) {
      toast.error("No stocks available for analysis");
      return;
    }
    
    toast.info("Requesting AI analysis...");
    
    try {
      const analysis = await apiService.getStockAnalysis(topStocks);
      if (analysis && analysis.stockAnalyses && Object.keys(analysis.stockAnalyses).length > 0) {
        setAiAnalysis(analysis);
        toast.success("AI analysis updated");
      } else {
        toast.error("Received empty analysis from AI");
      }
    } catch (error) {
      console.error("Error triggering AI analysis:", error);
      toast.error("Failed to get AI analysis");
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
              className="p-1 hover:bg-secondary rounded-full mr-2"
              onClick={loadData}
              disabled={refreshing}
              title="Refresh all data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {isAIEnabled && (
              <button
                className="p-1 px-2 text-xs border rounded hover:bg-secondary"
                onClick={triggerAIAnalysis}
                title="Refresh AI analysis only"
              >
                Analyze
              </button>
            )}
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
                  analysis={aiAnalysis?.stockAnalyses && aiAnalysis.stockAnalyses[stock.ticker] ? 
                    aiAnalysis.stockAnalyses[stock.ticker] : undefined}
                />
              ))}
              
              {aiAnalysis?.marketInsight && (
                <MarketInsight insight={aiAnalysis.marketInsight} />
              )}
              
              {/* Add debug information for troubleshooting */}
              {!aiAnalysis?.marketInsight && isAIEnabled && (
                <div className="text-xs text-muted-foreground mt-6 p-2 border border-dashed rounded-md">
                  <p>AI analysis feature is enabled but no market insight was returned.</p>
                  <p>Stocks analyzed: {topStocks.map(s => s.ticker).join(', ')}</p>
                  {aiAnalysis && (
                    <p>Analysis received for: {Object.keys(aiAnalysis.stockAnalyses || {}).join(', ') || 'none'}</p>
                  )}
                  <p>Try clicking the "Analyze" button to request analysis again.</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStockPicker;
