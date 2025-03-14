
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

// Configurable retry settings
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 seconds
const API_TIMEOUT = 15000; // 15 seconds

serve(async (req) => {
  // Add detailed logging for debugging
  console.log("gemini-stock-analysis function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "API key is not configured",
          details: "The GEMINI_API_KEY environment variable is not set in Supabase Edge Function secrets"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format", 
          details: "Could not parse JSON request body" 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { stocks } = requestBody as RequestBody;
    
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      console.error("Invalid request: stocks array is missing or empty");
      return new Response(
        JSON.stringify({ 
          error: "Invalid request", 
          details: "The stocks array is required and cannot be empty" 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${stocks.length} stocks`);
    
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
    
    // Implement the fetch API call with retries
    let response = null;
    let apiError = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`API call attempt ${attempt + 1} of ${MAX_RETRIES}`);
        
        // Google Gemini API endpoint  
        const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent";
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        try {
          response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
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
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
          }
          
          break; // Success, exit retry loop
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          // Check if this was a timeout error
          if (fetchError.name === 'AbortError') {
            console.error(`Request timed out after ${API_TIMEOUT/1000}s`);
            apiError = new Error("Request timed out");
          } else {
            console.error(`Fetch error on attempt ${attempt + 1}:`, fetchError);
            apiError = fetchError;
          }
          
          // If this is not the last attempt, wait before retrying
          if (attempt < MAX_RETRIES - 1) {
            console.log(`Retrying in ${RETRY_DELAY/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          }
        }
      } catch (retryError) {
        console.error(`Error during retry logic:`, retryError);
        apiError = retryError;
      }
    }
    
    // If all attempts failed, provide a fallback response
    if (!response || !response.ok) {
      console.error("All API attempts failed, using fallback");
      
      // Generate fallback analysis based on algorithmic scores
      const fallbackAnalyses = stocks.reduce((acc, stock) => {
        acc[stock.ticker] = generateFallbackAnalysis(stock);
        return acc;
      }, {} as { [ticker: string]: string });
      
      const fallbackResponse = {
        stockAnalyses: fallbackAnalyses,
        marketInsight: "Market analysis is currently unavailable. The selected stocks were chosen based on technical indicators and algorithmic screening. Please check back later for detailed market insights.",
        generatedAt: new Date().toISOString(),
        fromFallback: true
      };
      
      return new Response(
        JSON.stringify(fallbackResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Process successful response
    try {
      console.log("Received successful response from Gemini API");
      
      const data = await response.json();
      
      // Validate response structure
      if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Invalid response format from Gemini API:", data);
        throw new Error("Invalid API response format");
      }
      
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Validate AI response isn't empty
      if (!aiResponse) {
        console.error("Empty response from Gemini API");
        throw new Error("Empty API response");
      }

      console.log("Successfully received response from Gemini API");
      console.log("AI Response excerpt:", aiResponse.substring(0, 100) + "...");

      // Parse the AI response
      const stockAnalyses = parseAnalysisResponse(aiResponse, stocks.map(s => s.ticker));
      const marketInsight = extractMarketInsight(aiResponse);
      
      console.log("Extracted analyses for tickers:", Object.keys(stockAnalyses));
      console.log("Market insight excerpt:", marketInsight.substring(0, 100) + "...");
      
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
    } catch (parseError) {
      console.error("Error parsing Gemini API response:", parseError);
      
      // Generate fallback for parse errors
      const fallbackAnalyses = stocks.reduce((acc, stock) => {
        acc[stock.ticker] = generateFallbackAnalysis(stock);
        return acc;
      }, {} as { [ticker: string]: string });
      
      return new Response(
        JSON.stringify({
          stockAnalyses: fallbackAnalyses,
          marketInsight: "Analysis could not be processed. Using algorithmic results instead.",
          generatedAt: new Date().toISOString(),
          fromFallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Log the full error
    console.error("Error in gemini-stock-analysis function:", error);
    
    // Return a detailed error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate analysis", 
        details: error.message,
        stack: error.stack
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
 * Improved to make sure we catch all tickers
 */
function parseAnalysisResponse(response: string, expectedTickers: string[]): { [ticker: string]: string } {
  const stockAnalyses: { [ticker: string]: string } = {};
  
  console.log("Parsing analysis response for", expectedTickers.length, "expected tickers");
  
  // First, try to find sections that start with a ticker symbol pattern (1-5 capital letters)
  const tickerPattern = new RegExp(`(${expectedTickers.join('|')}):\\s*([\\s\\S]+?)(?=\\n\\s*(?:${expectedTickers.join('|')}):|\\n\\s*Market Insight:|$)`, 'g');
  
  let match;
  while ((match = tickerPattern.exec(response)) !== null) {
    const ticker = match[1].trim();
    const analysis = match[2].trim();
    stockAnalyses[ticker] = analysis;
    console.log(`Found analysis for ${ticker}, length: ${analysis.length} chars`);
  }
  
  // If we didn't find all expected tickers, try another approach
  if (Object.keys(stockAnalyses).length < expectedTickers.length) {
    console.log("Some tickers not found with first method, trying alternative parsing");
    
    // Split by lines and look for lines starting with ticker
    const lines = response.split('\n');
    let currentTicker = null;
    let currentAnalysis = '';
    
    for (const line of lines) {
      // Check if line starts with any of our expected tickers
      const tickerMatch = line.match(new RegExp(`^\\s*(${expectedTickers.join('|')}):\\s*(.*)$`));
      
      if (tickerMatch) {
        // If we were building an analysis for another ticker, save it
        if (currentTicker && currentAnalysis) {
          stockAnalyses[currentTicker] = currentAnalysis.trim();
        }
        
        // Start new ticker analysis
        currentTicker = tickerMatch[1];
        currentAnalysis = tickerMatch[2];
      } else if (currentTicker && !line.match(/^Market Insight:/i)) {
        // Continue adding to current analysis if not a new section
        currentAnalysis += '\n' + line;
      }
    }
    
    // Save the last ticker's analysis
    if (currentTicker && currentAnalysis && !stockAnalyses[currentTicker]) {
      stockAnalyses[currentTicker] = currentAnalysis.trim();
    }
  }
  
  // For any missing tickers, provide a fallback
  for (const ticker of expectedTickers) {
    if (!stockAnalyses[ticker]) {
      console.log(`No analysis found for ${ticker}, adding fallback`);
      stockAnalyses[ticker] = generateFallbackAnalysis({ ticker } as any);
    }
  }
  
  return stockAnalyses;
}

/**
 * Extract market insight from the AI response
 */
function extractMarketInsight(response: string): string {
  // Look for a section about market conditions or overall analysis
  const marketSectionMatch = response.match(/(?:Market Insight|Overall Analysis|Market Context|Market Conditions|In Summary):\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i);
  
  if (marketSectionMatch && marketSectionMatch[1]) {
    return marketSectionMatch[1].trim();
  }
  
  // Fallback: take the last paragraph if no explicit section
  const paragraphs = response.split('\n\n');
  return paragraphs[paragraphs.length - 1].trim();
}

/**
 * Generate fallback analysis when the API is unavailable
 */
function generateFallbackAnalysis(stock: RequestBody['stocks'][0]): string {
  // Check if we have enough data to generate a meaningful fallback
  if (!stock.signals || !stock.scores) {
    return `${stock.ticker} was selected by our algorithm as having potential based on technical indicators.`;
  }
  
  let analysis = `${stock.ticker} shows `;
  
  // Add sentiment based on score
  if (stock.scores.composite > 80) {
    analysis += "strong potential based on our algorithm. ";
  } else if (stock.scores.composite > 60) {
    analysis += "good potential based on our algorithm. ";
  } else {
    analysis += "some potential based on our algorithm. ";
  }
  
  // Add information about signals if available
  if (stock.signals.length > 0) {
    analysis += `Technical indicators that triggered include: ${stock.signals.join(', ')}. `;
  }
  
  // Add price action comment if available
  if (stock.changePercent !== undefined) {
    if (stock.changePercent > 0) {
      analysis += `The stock is up ${stock.changePercent.toFixed(2)}% today, showing positive momentum. `;
    } else if (stock.changePercent < 0) {
      analysis += `Despite being down ${Math.abs(stock.changePercent).toFixed(2)}% today, our algorithm sees potential. `;
    } else {
      analysis += `The stock is flat today. `;
    }
  }
  
  // Add final recommendation
  analysis += "Consider doing additional research before making any investment decisions.";
  
  return analysis;
}
