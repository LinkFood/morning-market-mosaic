
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Get the Gemini API key from Supabase secrets
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Define interface for the request body
interface RequestBody {
  stocks: Array<{
    ticker: string;
    close: number;
    changePercent: number;
    volume?: number; 
    avgVolume?: number;
    signals: string[];
    scores: {
      composite: number;
      [key: string]: number;
    };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is not configured");
      return new Response(
        JSON.stringify({ error: "API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { stocks } = await req.json() as RequestBody;
    
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: stocks array is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log("Calling Gemini API with prompt...");
    
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
      const errorData = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Parse the AI response
    const stockAnalyses = parseAnalysisResponse(aiResponse);
    const marketInsight = extractMarketInsight(aiResponse);
    
    // Create the analysis object
    const analysis = {
      stockAnalyses,
      marketInsight,
      generatedAt: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in gemini-stock-analysis function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate analysis", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

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
