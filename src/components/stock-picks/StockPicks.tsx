
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScoredStock } from "@/services/stockPicker/algorithm";
import { StockAnalysis } from "@/services/stockPicker/aiAnalysis";
import { Star, TrendingUp, Volume2, Shuffle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  const [activeTab, setActiveTab] = useState<string>("algorithmic");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Stock Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">Loading stock picks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Stock Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center p-6">
            No stock picks available at this time. Try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Top Stock Picks
        </CardTitle>
        {analysis && (
          <CardDescription>
            Analysis generated at: {new Date(analysis.generatedAt).toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="algorithmic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="algorithmic">Algorithmic</TabsTrigger>
            <TabsTrigger value="ai" disabled={!analysis}>AI Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="algorithmic" className="space-y-4">
            {stocks.map((stock) => (
              <StockPickCard key={stock.ticker} stock={stock} />
            ))}
          </TabsContent>
          
          <TabsContent value="ai">
            {isLoadingAnalysis ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-pulse text-muted-foreground">Loading AI analysis...</div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <MarketInsightCard insight={analysis.marketInsight} />
                
                {stocks.map((stock) => (
                  <AIAnalysisCard 
                    key={stock.ticker} 
                    stock={stock} 
                    analysis={analysis.stockAnalyses[stock.ticker] || "No analysis available for this stock."}
                  />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center p-6">
                AI analysis is not available at this time.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface StockPickCardProps {
  stock: ScoredStock;
}

const StockPickCard: React.FC<StockPickCardProps> = ({ stock }) => {
  const { ticker, name, changePercent, scores, signals } = stock;
  
  // Format the score to be out of 100
  const formatScore = (score: number) => `${score}/100`;
  
  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{ticker}</h3>
          <p className="text-sm text-muted-foreground">{name || ticker}</p>
        </div>
        <div className="flex items-center">
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            changePercent > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 
            'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Momentum: {formatScore(scores.momentum)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-purple-500" />
          <span className="text-sm">Volume: {formatScore(scores.volume)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-sm">Trend: {formatScore(scores.trend)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shuffle className="h-4 w-4 text-amber-500" />
          <span className="text-sm">Volatility: {formatScore(scores.volatility)}</span>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-xs font-medium uppercase text-muted-foreground mb-1">Signals</div>
        <div className="flex flex-wrap gap-1">
          {signals.map((signal, index) => (
            <span 
              key={`${ticker}-${index}`}
              className={`px-2 py-0.5 rounded-full text-xs ${
                signal.includes('Bullish') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                signal.includes('Bearish') ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
              }`}
            >
              {signal}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-4 bg-muted/50 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" 
          style={{ width: `${scores.composite}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>Composite Score</span>
        <span className="font-medium">{scores.composite}/100</span>
      </div>
    </div>
  );
};

interface AIAnalysisCardProps {
  stock: ScoredStock;
  analysis: string;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ stock, analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const { ticker, name, changePercent } = stock;
  
  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-semibold text-lg">{ticker}</h3>
            <p className="text-sm text-muted-foreground">{name || ticker}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            changePercent > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 
            'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className={expanded ? "" : "line-clamp-3"}>
        <p className="text-sm">{analysis}</p>
      </div>
      
      <button
        className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            Read more <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
};

interface MarketInsightCardProps {
  insight: string;
}

const MarketInsightCard: React.FC<MarketInsightCardProps> = ({ insight }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-4 rounded-lg border bg-accent/30">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="bg-primary/10 text-primary">Market Insight</Badge>
      </div>
      
      <div className={expanded ? "" : "line-clamp-3"}>
        <p className="text-sm">{insight}</p>
      </div>
      
      <button
        className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            Read more <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
};

export default StockPicks;
