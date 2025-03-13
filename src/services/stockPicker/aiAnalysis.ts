
/**
 * AI Stock Analysis Service
 * Uses Google's Gemini API to enhance stock picks with AI analysis
 */
import { ScoredStock } from "./algorithm";
import { toast } from "sonner";

// Define the response structure
export interface StockAnalysis {
  stockAnalyses: { [ticker: string]: string };
  marketInsight: string;
  generatedAt: string;
}

// Mock cache to avoid repeated API calls
let cachedAnalysis: StockAnalysis | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour

// Gemini API Key (this should be moved to a secure environment variable)
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with actual key or env variable

/**
 * Call the Google Gemini API to analyze stock picks
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    // Google Gemini API endpoint
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent";
    
    const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

/**
 * Parse the AI response to extract individual stock analyses
 */
function parseAnalysisResponse(response: string): { [ticker: string]: string } {
  const stockAnalyses: { [ticker: string]: string } = {};
  
  // Find sections that start with a ticker symbol pattern (1-5 capital letters)
  const sections = response.split(/\n\s*([A-Z]{1,5}):\s*/).filter(Boolean);
  
  for (let i = 0; i < sections.length; i += 2) {
    if (i + 1 < sections.length) {
      const ticker = sections[i].trim();
      const analysis = sections[i + 1].trim();
      stockAnalyses[ticker] = analysis;
    }
  }
  
  return stockAnalyses;
}

/**
 * Extract market insight from the AI response
 */
function extractMarketInsight(response: string): string {
  // Look for a section about market conditions or overall analysis
  const marketSectionMatch = response.match(/(?:Overall Analysis|Market Context|Market Conditions|In Summary|Market Insight):\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i);
  
  if (marketSectionMatch && marketSectionMatch[1]) {
    return marketSectionMatch[1].trim();
  }
  
  // Fallback: take the last paragraph if no explicit section
  const paragraphs = response.split('\n\n');
  return paragraphs[paragraphs.length - 1].trim();
}

/**
 * Main function to get AI analysis for stock picks
 */
export async function getAIAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  // Check cache first
  if (cachedAnalysis && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    console.log("Using cached AI analysis");
    return cachedAnalysis;
  }
  
  try {
    // Format the stock data for the AI
    const stocksContext = stocks.map(s => {
      const signals = s.signals.join(', ');
      const volumeInfo = s.volume && s.avgVolume 
        ? `Volume: ${s.volume.toLocaleString()} (${(s.volume / s.avgVolume).toFixed(1)}x avg)` 
        : '';
      
      return `${s.ticker}: Price $${s.close.toFixed(2)}, ${s.changePercent.toFixed(2)}% today, ` +
        `${volumeInfo}, ` +
        `Signals: ${signals}, ` +
        `Composite Score: ${s.scores.composite}/100`;
    }).join('\n');
    
    // Create the prompt
    const prompt = `
      Analyze these potential stock picks as if you are a professional stock analyst:
      
      TOP STOCK CANDIDATES:
      ${stocksContext}
      
      For each stock (starting with the ticker symbol):
      1. Provide a brief analysis of why this stock might be showing strength or weakness
      2. Note any significant technical factors that might be influencing it
      3. Give context about recent market conditions that might affect this stock
      
      After analyzing all stocks, add a section called "Market Insight" with a brief overview of what these stocks collectively indicate about current market conditions.
      
      Keep your analysis concise and data-driven.
    `;
    
    // Call the AI API
    const aiResponse = await callGeminiAPI(prompt);
    
    // Parse the response
    const stockAnalyses = parseAnalysisResponse(aiResponse);
    const marketInsight = extractMarketInsight(aiResponse);
    
    // Create the analysis object
    const analysis: StockAnalysis = {
      stockAnalyses,
      marketInsight,
      generatedAt: new Date().toISOString()
    };
    
    // Cache the result
    cachedAnalysis = analysis;
    cacheTimestamp = Date.now();
    
    return analysis;
  } catch (error) {
    console.error("Failed to get AI analysis:", error);
    toast.error("AI analysis unavailable. Showing algorithmic picks only.");
    
    // Return empty analysis with a note
    return {
      stockAnalyses: stocks.reduce((acc, stock) => {
        acc[stock.ticker] = "AI analysis currently unavailable.";
        return acc;
      }, {} as { [ticker: string]: string }),
      marketInsight: "Market insight unavailable. Please try again later.",
      generatedAt: new Date().toISOString()
    };
  }
}

export default {
  getAIAnalysis
};
