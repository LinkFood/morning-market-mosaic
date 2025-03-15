import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ChevronDown, ChevronUp, Target, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiInsightBadge } from '@/styles/ai-design-system';

export interface AIInsight {
  id: string;
  ticker: string;
  stockName: string;
  summary: string;
  technicalAnalysis: {
    conclusion: string;
    details: string;
    confidence: 'high' | 'medium' | 'low';
    direction: 'bullish' | 'bearish' | 'neutral';
    keyIndicators: Array<{
      name: string;
      value: string;
      signal: 'positive' | 'negative' | 'neutral';
    }>;
  };
  fundamentalAnalysis: {
    conclusion: string;
    details: string;
    confidence: 'high' | 'medium' | 'low';
    direction: 'bullish' | 'bearish' | 'neutral';
    keyMetrics: Array<{
      name: string;
      value: string;
      signal: 'positive' | 'negative' | 'neutral';
    }>;
  };
  sentimentAnalysis: {
    conclusion: string;
    newsHeadlines: string[];
    socialMentions: number;
    confidence: 'high' | 'medium' | 'low';
    direction: 'bullish' | 'bearish' | 'neutral';
  };
  tradingStrategy: {
    recommendation: string;
    stopLoss?: number;
    targetPrice?: number;
    timeHorizon: 'short-term' | 'medium-term' | 'long-term';
    confidence: 'high' | 'medium' | 'low';
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'very-high';
    factors: string[];
  };
  lastUpdated: string;
  model?: string;
}

interface AIInsightPanelProps {
  insight: AIInsight;
  loading?: boolean;
  onRefresh?: () => void;
}

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  insight,
  loading = false,
  onRefresh
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to get direction icon
  const getDirectionIcon = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  // Helper function to get confidence text
  const getConfidenceText = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'High Confidence';
      case 'medium':
        return 'Medium Confidence';
      case 'low':
        return 'Low Confidence';
    }
  };

  // Helper function to get risk badge
  const getRiskBadge = (risk: 'low' | 'medium' | 'high' | 'very-high') => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">High Risk</Badge>;
      case 'very-high':
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Very High Risk</Badge>;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-accent-900/10" />
      <div className="absolute inset-0 bg-[url('/public/placeholder.svg')] opacity-[0.03]" />
      
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary-500" />
            <CardTitle className="text-xl">AI Analysis: {insight.ticker}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated {new Date(insight.lastUpdated).toLocaleString()}
            </span>
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onRefresh}
                disabled={loading}
                className="h-8 w-8"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="mb-6">
          <h3 className="text-lg font-medium">{insight.stockName}</h3>
          <p className="text-muted-foreground">{insight.summary}</p>
        </div>
        
        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="technical" className="text-xs">Technical</TabsTrigger>
            <TabsTrigger value="fundamental" className="text-xs">Fundamental</TabsTrigger>
            <TabsTrigger value="sentiment" className="text-xs">Sentiment</TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs">Strategy</TabsTrigger>
          </TabsList>
          
          {/* Technical Analysis Tab */}
          <TabsContent value="technical" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <h3 className="font-medium">Technical Analysis</h3>
              </div>
              <div className="flex items-center gap-2">
                {getDirectionIcon(insight.technicalAnalysis.direction)}
                <span className={cn(
                  aiInsightBadge({ confidence: insight.technicalAnalysis.confidence })
                )}>
                  {getConfidenceText(insight.technicalAnalysis.confidence)}
                </span>
              </div>
            </div>
            
            <p>{insight.technicalAnalysis.conclusion}</p>
            
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('technical')}
                className="flex items-center p-0 h-8"
              >
                {expandedSections.technical ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show More</span>
                  </>
                )}
              </Button>
              
              {expandedSections.technical && (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">{insight.technicalAnalysis.details}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {insight.technicalAnalysis.keyIndicators.map((indicator, i) => (
                      <div key={i} className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded">
                        <span className="text-sm">{indicator.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{indicator.value}</span>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            indicator.signal === 'positive' ? "bg-emerald-500" :
                            indicator.signal === 'negative' ? "bg-red-500" : "bg-yellow-500"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Fundamental Analysis Tab */}
          <TabsContent value="fundamental" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <h3 className="font-medium">Fundamental Analysis</h3>
              </div>
              <div className="flex items-center gap-2">
                {getDirectionIcon(insight.fundamentalAnalysis.direction)}
                <span className={cn(
                  aiInsightBadge({ confidence: insight.fundamentalAnalysis.confidence })
                )}>
                  {getConfidenceText(insight.fundamentalAnalysis.confidence)}
                </span>
              </div>
            </div>
            
            <p>{insight.fundamentalAnalysis.conclusion}</p>
            
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('fundamental')}
                className="flex items-center p-0 h-8"
              >
                {expandedSections.fundamental ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show More</span>
                  </>
                )}
              </Button>
              
              {expandedSections.fundamental && (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">{insight.fundamentalAnalysis.details}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {insight.fundamentalAnalysis.keyMetrics.map((metric, i) => (
                      <div key={i} className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded">
                        <span className="text-sm">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{metric.value}</span>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            metric.signal === 'positive' ? "bg-emerald-500" :
                            metric.signal === 'negative' ? "bg-red-500" : "bg-yellow-500"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Sentiment Analysis Tab */}
          <TabsContent value="sentiment" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <h3 className="font-medium">Market Sentiment</h3>
              </div>
              <div className="flex items-center gap-2">
                {getDirectionIcon(insight.sentimentAnalysis.direction)}
                <span className={cn(
                  aiInsightBadge({ confidence: insight.sentimentAnalysis.confidence })
                )}>
                  {getConfidenceText(insight.sentimentAnalysis.confidence)}
                </span>
              </div>
            </div>
            
            <p>{insight.sentimentAnalysis.conclusion}</p>
            
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('sentiment')}
                className="flex items-center p-0 h-8"
              >
                {expandedSections.sentiment ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show More</span>
                  </>
                )}
              </Button>
              
              {expandedSections.sentiment && (
                <div className="mt-2 space-y-3">
                  <h4 className="text-sm font-medium">Recent Headlines</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {insight.sentimentAnalysis.newsHeadlines.map((headline, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{headline}</li>
                    ))}
                  </ul>
                  
                  <div className="bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Media Mentions:</span>
                      <span className="text-sm font-mono">{insight.sentimentAnalysis.socialMentions}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Trading Strategy Tab */}
          <TabsContent value="strategy" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <h3 className="font-medium">Trading Strategy</h3>
              </div>
              <div className="flex gap-2">
                {getRiskBadge(insight.riskAssessment.overallRisk)}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Recommendation:</p>
              <p className="text-sm bg-primary-500/10 border border-primary-500/20 rounded p-2">
                {insight.tradingStrategy.recommendation}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {insight.tradingStrategy.targetPrice && (
                <div className="bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded text-center">
                  <p className="text-xs text-muted-foreground mb-1">Target Price</p>
                  <p className="font-medium">${insight.tradingStrategy.targetPrice}</p>
                </div>
              )}
              
              {insight.tradingStrategy.stopLoss && (
                <div className="bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded text-center">
                  <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                  <p className="font-medium">${insight.tradingStrategy.stopLoss}</p>
                </div>
              )}
              
              <div className="bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground mb-1">Time Horizon</p>
                <p className="font-medium capitalize">{insight.tradingStrategy.timeHorizon.replace('-', ' ')}</p>
              </div>
            </div>
            
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('strategy')}
                className="flex items-center p-0 h-8"
              >
                {expandedSections.strategy ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Show More</span>
                  </>
                )}
              </Button>
              
              {expandedSections.strategy && (
                <div className="mt-2 space-y-3">
                  <h4 className="text-sm font-medium">Risk Assessment Factors</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {insight.riskAssessment.factors.map((factor, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{factor}</li>
                    ))}
                  </ul>
                  
                  <div className={cn(
                    "mt-3 p-2 rounded border text-sm",
                    insight.tradingStrategy.confidence === 'high' ? "border-emerald-500/30 bg-emerald-500/10" :
                    insight.tradingStrategy.confidence === 'medium' ? "border-amber-500/30 bg-amber-500/10" :
                    "border-neutral-500/30 bg-neutral-500/10"
                  )}>
                    <p className="flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      Strategy confidence: <span className="font-medium ml-1">{insight.tradingStrategy.confidence}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="relative z-10 border-t pt-3 pb-1">
        <div className="flex items-center text-xs text-muted-foreground">
          <Brain className="h-3 w-3 mr-1" />
          {insight.model ? (
            <span>Analysis by {insight.model}</span>
          ) : (
            <span>AI-powered analysis</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIInsightPanel;