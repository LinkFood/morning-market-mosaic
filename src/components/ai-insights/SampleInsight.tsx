import React from 'react';
import { AIInsightPanel, AIInsight } from './index';

// Sample mock data for demonstration
const sampleInsight: AIInsight = {
  id: "insight-aapl-1",
  ticker: "AAPL",
  stockName: "Apple Inc.",
  summary: "Apple shows strong technical momentum but some fundamental concerns around product cycle and China market pressures.",
  technicalAnalysis: {
    conclusion: "AAPL is in a moderate uptrend with bullish momentum indicators and support at current price levels.",
    details: "Recent price action shows a bullish breakout from a consolidation pattern with increasing volume. The 50-day moving average has crossed above the 200-day moving average forming a golden cross pattern. RSI is at 62, showing strength without being overbought. MACD is positive with diverging signal lines.",
    confidence: "high",
    direction: "bullish",
    keyIndicators: [
      { name: "RSI (14)", value: "62", signal: "positive" },
      { name: "MACD", value: "Bullish crossover", signal: "positive" },
      { name: "Moving Avg (50/200)", value: "Golden Cross", signal: "positive" },
      { name: "Support", value: "$180.50", signal: "neutral" },
      { name: "Resistance", value: "$195.75", signal: "neutral" },
      { name: "Volume Trend", value: "Above average (+22%)", signal: "positive" }
    ]
  },
  fundamentalAnalysis: {
    conclusion: "Apple's fundamentals remain solid with strong cash flow and services growth, but there are concerns about iPhone demand and China market pressures.",
    details: "Apple continues to generate exceptional cash flow with services revenue growing at 15% YoY. However, iPhone sales growth has slowed with projections for the next cycle below analyst expectations. Margin compression due to component costs and China market share losses present medium-term challenges. Balance sheet remains extremely strong with over $150B in cash and investments.",
    confidence: "medium",
    direction: "neutral",
    keyMetrics: [
      { name: "P/E Ratio", value: "32.5", signal: "negative" },
      { name: "Revenue Growth (YoY)", value: "4.2%", signal: "neutral" },
      { name: "EPS Growth (YoY)", value: "7.8%", signal: "positive" },
      { name: "Cash Flow", value: "$24.5B", signal: "positive" },
      { name: "Debt/Equity", value: "1.45", signal: "neutral" },
      { name: "Dividend Yield", value: "0.6%", signal: "negative" }
    ]
  },
  sentimentAnalysis: {
    conclusion: "Market sentiment for Apple is cautiously optimistic with institutional investors maintaining positions while retail sentiment has cooled slightly.",
    newsHeadlines: [
      "Apple's AI Strategy Takes Center Stage at WWDC",
      "iPhone Sales in China Fall 19% as Huawei Gains Ground",
      "Services Revenue Hits All-Time High, Boosting Apple's Margins",
      "Warren Buffett Reduces Berkshire's Apple Stake by 13%",
      "Analysts Remain Bullish on Apple Despite China Concerns"
    ],
    socialMentions: 83750,
    confidence: "medium",
    direction: "bullish"
  },
  tradingStrategy: {
    recommendation: "Consider accumulating AAPL on dips below $180 with a target of $200-205 for the next 3-6 months. Implement a strategic entry plan with 30% position now and adding on price pullbacks.",
    stopLoss: 175.5,
    targetPrice: 202.5,
    timeHorizon: "medium-term",
    confidence: "medium"
  },
  riskAssessment: {
    overallRisk: "medium",
    factors: [
      "China market volatility and competitive pressure",
      "Potential disappointment in iPhone 16 upgrade cycle",
      "Regulatory risks related to App Store practices",
      "Valuation extended compared to historical averages",
      "Tech sector rotation in rising interest rate environment"
    ]
  },
  lastUpdated: new Date().toISOString(),
  model: "Gemini 1.5 Pro"
};

const SampleInsight = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">AI Stock Analysis Demo</h2>
      <AIInsightPanel 
        insight={sampleInsight} 
        onRefresh={() => console.log('Refreshing analysis...')}
      />
    </div>
  );
};

export default SampleInsight;