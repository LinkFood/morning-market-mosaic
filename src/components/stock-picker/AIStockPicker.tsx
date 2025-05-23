import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, Info, Cpu, Activity } from 'lucide-react';
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

interface ApiHealthStatus {
  isHealthy: boolean;
  lastChecked: Date | null;
  error?: string;
}

const AIStockPicker = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topStocks, setTopStocks] = useState<ScoredStock[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealthStatus>({
    isHealthy: false,
    lastChecked: null
  });
  
  const isAIEnabled = isFeatureEnabled('useAIStockAnalysis');
  
  const checkApiHealth = async () => {
    try {
      const status = await apiService.checkGeminiAPIHealth();
      setApiHealth({
        isHealthy: status.healthy,
        lastChecked: new Date(),
        error: status.error
      });
      
      localStorage.setItem('geminiApiHealth', JSON.stringify({
        isHealthy: status.healthy,
        lastChecked: new Date().toISOString(),
        error: status.error
      }));
      
      return status.healthy;
    } catch (error) {
      console.error("Error checking API health:", error);
      setApiHealth({
        isHealthy: false,
        lastChecked: new Date(),
        error: error.message
      });
      return false;
    }
  };
  
  const getWellKnownStocks = () => {
    return [
      "AAPL", "MSFT", "AMZN", "GOOGL", "META", 
      "NVDA", "AMD", "INTC", "TSM", "MU",
      "JPM", "BAC", "GS", "V", "MA", 
      "JNJ", "PFE", "MRK", "UNH", "ABBV",
      "WMT", "PG", "KO", "PEP", "MCD",
      "XOM", "CVX", "COP", "EOG", "SLB",
      "CRM", "ADBE", "ORCL", "IBM", "CSCO"
    ];
  };
  
  const loadData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log("Starting AI Stock Picker data load");
      
      const stockSymbols = getWellKnownStocks();
      
      console.log("Fetching stock data for analysis...");
      const stocksData = await apiService.getMajorStocks(stockSymbols);
      
      if (!stocksData || stocksData.length === 0) {
        throw new Error("Failed to retrieve stock data");
      }
      
      console.log(`Retrieved data for ${stocksData.length} stocks`);
      
      const scoredStocks = await apiService.getTopPicks(stocksData);
      
      if (!scoredStocks || scoredStocks.length === 0) {
        throw new Error("No stocks met the algorithm criteria");
      }
      
      console.log(`Algorithm selected ${scoredStocks.length} top stocks: ${scoredStocks.map(s => s.ticker).join(', ')}`);
      setTopStocks(scoredStocks);
      
      if (isFeatureEnabled('useAIStockAnalysis') && scoredStocks.length > 0) {
        try {
          toast.loading('Loading AI analysis...', {
            id: 'ai-analysis-loading',
            duration: 40000
          });
          
          const analysisPromise = apiService.getStockAnalysis(scoredStocks);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Analysis request timed out')), 45000);
          });
          
          Promise.race([analysisPromise, timeoutPromise])
            .then((analysis: StockAnalysis) => {
              toast.dismiss('ai-analysis-loading');
              
              console.log("AI analysis received:", analysis ? "success" : "empty");
              if (analysis && analysis.stockAnalyses && Object.keys(analysis.stockAnalyses).length > 0) {
                console.log("AI analysis contains data for", Object.keys(analysis.stockAnalyses).length, "stocks");
                setAiAnalysis(analysis);
                
                if (!analysis.fromFallback) {
                  toast.success('AI analysis updated successfully');
                } else {
                  toast.warning('Using automated analysis. AI service limited.', {
                    duration: 4000
                  });
                }
              } else {
                console.warn("AI analysis response was empty or malformed");
                toast.warning('AI analysis returned empty results. Try again later.');
              }
            })
            .catch(err => {
              toast.dismiss('ai-analysis-loading');
              
              console.error('Error processing AI analysis:', err);
              
              if (err.message.includes('timed out')) {
                toast.error('AI analysis request timed out. Try again later.');
              } else if (err.message.includes('network') || err.message.includes('connection')) {
                toast.error('Network issue. Check your connection and try again.');
              } else {
                toast.error('Could not load AI analysis. Algorithm results still available.');
              }
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
  
  const triggerAIAnalysis = async () => {
    if (!topStocks || topStocks.length === 0) {
      toast.error("No stocks available for analysis");
      return;
    }
    
    toast.loading("Requesting AI analysis...", { 
      id: 'manual-ai-analysis',
      duration: 40000
    });
    
    const now = Date.now();
    const lastRefresh = window.localStorage.getItem('lastAIRefresh');
    const refreshThreshold = 30000;
    
    if (lastRefresh && now - parseInt(lastRefresh) < refreshThreshold) {
      toast.dismiss('manual-ai-analysis');
      toast.warning("Please wait a moment before requesting another analysis");
      return;
    }
    
    window.localStorage.setItem('lastAIRefresh', now.toString());
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Analysis request timed out")), 45000);
      });
      
      const analysisPromise = apiService.getStockAnalysis(topStocks);
      
      const result = await Promise.race([analysisPromise, timeoutPromise]);
      const analysis = result as StockAnalysis;
      
      toast.dismiss('manual-ai-analysis');
      
      if (analysis && analysis.stockAnalyses && Object.keys(analysis.stockAnalyses).length > 0) {
        setAiAnalysis(analysis);
        
        if (analysis.fromFallback) {
          toast.warning("AI service limited. Using algorithmic analysis instead.", {
            duration: 5000
          });
        } else if (analysis.fromCache) {
          toast.success("AI analysis loaded from cache", {
            description: "Fresh analysis requires less frequent requests"
          });
        } else {
          toast.success("AI analysis updated successfully");
          setLastUpdated(new Date());
        }
      } else {
        toast.error("Received empty analysis from AI");
      }
    } catch (error) {
      toast.dismiss('manual-ai-analysis');
      
      console.error("Error triggering AI analysis:", error);
      
      if (error.message.includes('timed out')) {
        toast.error("AI analysis request timed out. Server may be busy.");
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        toast.error("Network issue. Check your connection and try again.");
      } else if (error.message.includes('rate') || error.message.includes('limit')) {
        toast.error("Rate limit reached. Please try again in a few minutes.");
      } else {
        toast.error("Failed to get AI analysis. Service may be unavailable.");
      }
    }
  };
  
  useEffect(() => {
    loadData();
    
    const savedHealth = localStorage.getItem('geminiApiHealth');
    if (savedHealth) {
      try {
        const parsed = JSON.parse(savedHealth);
        setApiHealth({
          isHealthy: parsed.isHealthy,
          lastChecked: parsed.lastChecked ? new Date(parsed.lastChecked) : null,
          error: parsed.error
        });
      } catch (e) {
        console.error("Error parsing saved API health:", e);
      }
    }
    
    checkApiHealth();
    
    const healthCheckInterval = setInterval(() => {
      checkApiHealth();
    }, 15 * 60 * 1000);
    
    return () => {
      clearInterval(healthCheckInterval);
    };
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
            
            {isAIEnabled && (
              <div 
                className={`ml-2 px-2 py-0.5 text-xs rounded-full flex items-center ${
                  apiHealth.isHealthy ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
                title={apiHealth.isHealthy ? 
                  "AI API is online and healthy" : 
                  `AI API may be experiencing issues: ${apiHealth.error || "Unknown error"}`
                }
              >
                <Activity className="h-3 w-3 mr-1" />
                {apiHealth.isHealthy ? "API Online" : "Limited AI"}
              </div>
            )}
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
              <div className="flex">
                <button
                  className="p-1 px-2 text-xs border rounded-l hover:bg-secondary"
                  onClick={triggerAIAnalysis}
                  title="Refresh AI analysis only"
                  disabled={!apiHealth.isHealthy}
                >
                  Analyze
                </button>
                <button
                  className="p-1 px-1 text-xs border border-l-0 hover:bg-secondary"
                  onClick={() => {
                    apiService.clearAIAnalysisCache();
                    toast.success("Cache cleared - click Analyze to fetch fresh data");
                  }}
                  title="Clear AI analysis cache"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
                <button
                  className="p-1 px-1 text-xs border border-l-0 rounded-r hover:bg-secondary"
                  onClick={async () => {
                    toast.loading("Checking AI API status...", { 
                      id: "api-health-check",
                      duration: 20000
                    });
                    const isHealthy = await checkApiHealth();
                    toast.dismiss("api-health-check");
                    if (isHealthy) {
                      toast.success("AI API is online and healthy");
                    } else {
                      toast.error(`AI API issue: ${apiHealth.error || "Connection failed"}`);
                    }
                  }}
                  title="Check AI API health"
                >
                  <Activity className="h-3 w-3" />
                </button>
              </div>
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
            
            {isAIEnabled && apiHealth.lastChecked && (
              <span className="ml-auto text-xs text-muted-foreground">
                API checked {formatDistanceToNow(apiHealth.lastChecked)} ago
              </span>
            )}
          </div>
          
          {isAIEnabled && !aiAnalysis && topStocks.length > 0 && (
            <div className="p-4 border border-dashed rounded-md flex items-center justify-center">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-5 w-5 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Loading AI analysis...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
              </div>
            </div>
          )}
          
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
