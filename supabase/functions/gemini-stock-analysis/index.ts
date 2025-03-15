
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Get the Gemini API key from Supabase secrets
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = "gemini-1.5-pro"; // Using the latest model
const FUNCTION_VERSION = "1.2.0";  // Increment version for tracking

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
  checkModelVersion?: boolean; // Flag to check if this is a version test call
}

// Configurable retry settings
const MAX_RETRIES = 3;
const RETRY_DELAY = 2500; // 2.5 seconds
const API_TIMEOUT = 25000; // 25 seconds (increased timeout)

// Placeholder in-memory cache
type CacheEntry = {
  data: any;
  timestamp: number;
  requestHash: string;
};

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Simple function to hash request body for cache key
function hashRequest(stocks: any[]): string {
  // Use ticker + timestamp rounded to nearest 15 minutes for cache key
  const timeKey = Math.floor(Date.now() / (15 * 60 * 1000));
  return stocks.map(s => s.ticker).sort().join(',') + '_' + timeKey;
}

// Function to get from cache
function getCachedResponse(requestHash: string): any | null {
  const entry = cache[requestHash];
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    delete cache[requestHash];
    return null;
  }
  
  return entry.data;
}

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
          details: "The GEMINI_API_KEY environment variable is not set in Supabase Edge Function secrets",
          functionVersion: FUNCTION_VERSION
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Special case for health check endpoint (GET request)
    if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) {
      console.log("Health check endpoint requested");
      try {
        // Simple health check to verify API key and model access
        if (!GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({
              status: "error",
              error: "API key not configured",
              timestamp: new Date().toISOString(),
              functionVersion: FUNCTION_VERSION
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Do a minimal API call to check if Gemini is responding
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`;
        const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          return new Response(
            JSON.stringify({
              status: "error",
              error: `API error: ${response.status}`,
              details: errorText,
              timestamp: new Date().toISOString(),
              functionVersion: FUNCTION_VERSION
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // API is healthy
        return new Response(
          JSON.stringify({
            status: "healthy",
            model: GEMINI_MODEL,
            timestamp: new Date().toISOString(),
            functionVersion: FUNCTION_VERSION
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            status: "error",
            error: error.message,
            timestamp: new Date().toISOString(),
            functionVersion: FUNCTION_VERSION
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Parse request body for normal requests
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format", 
          details: "Could not parse JSON request body",
          functionVersion: FUNCTION_VERSION 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { stocks, checkModelVersion = false } = requestBody as RequestBody;
    
    // If this is just a model version check, return minimal response
    if (checkModelVersion) {
      console.log("Model version check requested");
      
      // Try to get the actual model info from the API
      try {
        // Create a minimal request to verify model access
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
        const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Model availability check failed: ${response.status} - ${errorData}`);
          
          return new Response(
            JSON.stringify({
              stockAnalyses: { TEST: "Model availability check only" },
              marketInsight: "This is a model check response.",
              generatedAt: new Date().toISOString(),
              fromFallback: true,
              model: "unavailable",
              modelEndpoint: endpoint,
              functionVersion: FUNCTION_VERSION,
              error: `Model check failed: ${response.status}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // If we get here, model is accessible
        return new Response(
          JSON.stringify({
            stockAnalyses: { TEST: "Model availability check only" },
            marketInsight: "This is a model check response.",
            generatedAt: new Date().toISOString(),
            model: GEMINI_MODEL,
            modelEndpoint: endpoint,
            functionVersion: FUNCTION_VERSION
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      } catch (modelCheckError) {
        console.error("Error during model check:", modelCheckError);
        
        return new Response(
          JSON.stringify({
            stockAnalyses: { TEST: "Model availability check only" },
            marketInsight: "This is a model check response.",
            generatedAt: new Date().toISOString(),
            fromFallback: true,
            model: "error",
            functionVersion: FUNCTION_VERSION,
            error: modelCheckError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      console.error("Invalid request: stocks array is missing or empty");
      return new Response(
        JSON.stringify({ 
          error: "Invalid request", 
          details: "The stocks array is required and cannot be empty",
          functionVersion: FUNCTION_VERSION,
          model: GEMINI_MODEL
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate request hash for caching
    const requestHash = hashRequest(stocks);
    
    // Check cache first
    const cachedResponse = getCachedResponse(requestHash);
    if (cachedResponse) {
      console.log("Returning cached response");
      // Add model info to cached response
      return new Response(
        JSON.stringify({
          ...cachedResponse,
          fromCache: true,
          functionVersion: FUNCTION_VERSION,
          model: GEMINI_MODEL
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${stocks.length} stocks`);
    
    // Limit number of stocks to analyze for performance
    const stocksToAnalyze = stocks.slice(0, Math.min(stocks.length, 8));
    
    // Format the stock data for the AI with more details
    const stocksContext = stocksToAnalyze.map(s => {
      const signals = s.signals?.join(', ') || 'No signals';
      const volumeInfo = s.volume && s.avgVolume 
        ? `Volume: ${s.volume.toLocaleString()} (${(s.volume / s.avgVolume).toFixed(1)}x avg)` 
        : '';
      
      return `${s.ticker}: Price $${s.close.toFixed(2)}, ${s.changePercent.toFixed(2)}% today, ` +
        `${volumeInfo}, ` +
        `Signals: ${signals}, ` +
        `Scores: Momentum ${s.scores?.momentum || 'N/A'}, Volume ${s.scores?.volume || 'N/A'}, ` +
        `Trend ${s.scores?.trend || 'N/A'}, Volatility ${s.scores?.volatility || 'N/A'}, ` +
        `Composite Score: ${s.scores?.composite || 'N/A'}/100`;
    }).join('\n');
    
    // Create an improved prompt with more structured output instructions
    const prompt = `
      Analyze these potential stock picks as a professional stock analyst:
      
      TOP STOCK CANDIDATES:
      ${stocksContext}
      
      For each stock, provide a structured analysis with the following sections:
      1. TICKER: Start with the ticker symbol followed by a brief summary
      2. TECHNICAL FACTORS: Key technical indicators and what they suggest
      3. CONTEXT: Relevant market conditions or sector trends
      
      After analyzing all stocks, provide a "MARKET INSIGHT" section with:
      1. Overall market trends suggested by these stocks
      2. Sector patterns or rotations if evident
      3. A brief outlook based on these indicators
      
      Keep analysis factual, concise, and focus on the technical indicators seen in the data.
      Maintain a balanced perspective, noting both bullish and bearish signals.
    `;

    console.log("Calling Gemini API...");
    console.log(`Using model: ${GEMINI_MODEL}`);
    
    // Implement the fetch API call with retries
    let response = null;
    let apiError = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`API call attempt ${attempt + 1} of ${MAX_RETRIES}`);
        
        // Using the configured Gemini model endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
        
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
              },
              // Add safety settings to reduce chances of rejection
              safetySettings: [
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_ONLY_HIGH"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_ONLY_HIGH"
                },
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_ONLY_HIGH"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_ONLY_HIGH"
                }
              ]
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
            const backOffMultiplier = attempt + 1; // Exponential backoff
            const retryDelayWithBackoff = RETRY_DELAY * backOffMultiplier;
            console.log(`Retrying in ${retryDelayWithBackoff/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, retryDelayWithBackoff));
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
        fromFallback: true,
        model: GEMINI_MODEL,
        functionVersion: FUNCTION_VERSION,
        error: apiError?.message || "Failed to call Gemini API"
      };
      
      // Cache fallback response (short TTL)
      cache[requestHash] = {
        data: fallbackResponse,
        timestamp: Date.now(),
        requestHash
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
      
      // Create the analysis object with model information
      const analysis = {
        stockAnalyses,
        marketInsight,
        generatedAt: new Date().toISOString(),
        model: GEMINI_MODEL,
        functionVersion: FUNCTION_VERSION,
        timestamp: new Date().toISOString()
      };
      
      // Cache successful response
      cache[requestHash] = {
        data: analysis,
        timestamp: Date.now(),
        requestHash
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
      
      const fallbackResponse = {
        stockAnalyses: fallbackAnalyses,
        marketInsight: "Analysis could not be processed. Using algorithmic results instead.",
        generatedAt: new Date().toISOString(),
        fromFallback: true,
        model: GEMINI_MODEL,
        functionVersion: FUNCTION_VERSION,
        error: parseError.message
      };
      
      return new Response(
        JSON.stringify(fallbackResponse),
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
        stack: error.stack,
        functionVersion: FUNCTION_VERSION,
        model: GEMINI_MODEL
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
 * Improved to handle more response formats
 */
function parseAnalysisResponse(response: string, expectedTickers: string[]): { [ticker: string]: string } {
  const stockAnalyses: { [ticker: string]: string } = {};
  
  console.log("Parsing analysis response for", expectedTickers.length, "expected tickers");
  
  // First, try to find sections that start with a ticker symbol
  // Improved regex pattern to match various formats like "AAPL:", "AAPL -", etc.
  const tickerPatternStr = expectedTickers.map(t => escapeRegExp(t)).join('|');
  const tickerPattern = new RegExp(`(${tickerPatternStr})(?::|\\s-|\\n)\\s*([\\s\\S]+?)(?=\\n\\s*(?:${tickerPatternStr})(?::|\\s-|\\n)|\\n\\s*(?:MARKET INSIGHT|Market Insight):|$)`, 'gi');
  
  let match;
  while ((match = tickerPattern.exec(response)) !== null) {
    const ticker = match[1].trim();
    const analysis = match[2].trim();
    stockAnalyses[ticker] = analysis;
    console.log(`Found analysis for ${ticker}, length: ${analysis.length} chars`);
  }
  
  // If we didn't find all expected tickers with the first pattern, try another approach
  if (Object.keys(stockAnalyses).length < expectedTickers.length) {
    console.log("Some tickers not found with first method, trying alternative parsing");
    
    // Split by sections using double newlines
    const sections = response.split(/\n\s*\n/);
    
    for (const section of sections) {
      // Check if this section starts with a ticker
      for (const ticker of expectedTickers) {
        // Skip tickers we've already found
        if (stockAnalyses[ticker]) continue;
        
        // Check if section starts with this ticker
        if (section.trim().startsWith(ticker)) {
          stockAnalyses[ticker] = section.trim();
          console.log(`Found analysis for ${ticker} using alternative method`);
          break;
        }
      }
    }
  }
  
  // For any missing tickers, provide a fallback
  for (const ticker of expectedTickers) {
    if (!stockAnalyses[ticker]) {
      console.log(`No analysis found for ${ticker}, adding fallback`);
      stockAnalyses[ticker] = `${ticker}: Analysis unavailable. This stock was selected by our algorithm based on technical indicators showing a composite score of ${stockAnalyses[ticker]?.scores?.composite || 'favorable'}.`;
    }
  }
  
  return stockAnalyses;
}

/**
 * Helper function to escape special regex characters
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract market insight from the AI response
 */
function extractMarketInsight(response: string): string {
  // Look for a section about market conditions or overall analysis
  const marketSectionRegex = /(?:MARKET INSIGHT|Market Insight|MARKET OVERVIEW|Overall Analysis|Market Summary)(?::|;|\n)?\s*([^]*?)(?:\n\s*\n\s*\w+:|$)/i;
  const marketSectionMatch = response.match(marketSectionRegex);
  
  if (marketSectionMatch && marketSectionMatch[1]) {
    return marketSectionMatch[1].trim();
  }
  
  // Fallback: take the last paragraph if no explicit section
  const paragraphs = response.split(/\n\s*\n/);
  const lastParagraph = paragraphs[paragraphs.length - 1].trim();
  
  // Check if the last paragraph actually looks like a conclusion
  if (lastParagraph.length > 100 && !lastParagraph.match(/^[A-Z]{2,5}:/)) {
    return lastParagraph;
  }
  
  // Second fallback: create a generic insight
  return "These stocks represent a mix of technical patterns in the current market environment. Consider them alongside broader market conditions and your investment goals.";
}

/**
 * Generate fallback analysis when the API is unavailable
 * Improved with more detailed commentary
 */
function generateFallbackAnalysis(stock: RequestBody['stocks'][0]): string {
  // Check if we have enough data to generate a meaningful fallback
  if (!stock) {
    return "Stock analysis is unavailable. Please try again later.";
  }
  
  let analysis = `${stock.ticker}: `;
  
  // Add price information
  analysis += `Currently trading at $${stock.close.toFixed(2)}`;
  
  // Add performance commentary
  if (stock.changePercent !== undefined) {
    if (stock.changePercent > 3) {
      analysis += `, showing strong upward momentum with a ${stock.changePercent.toFixed(2)}% gain today. `;
    } else if (stock.changePercent > 0) {
      analysis += `, up ${stock.changePercent.toFixed(2)}% today. `;
    } else if (stock.changePercent < -3) {
      analysis += `, experiencing significant selling pressure with a ${Math.abs(stock.changePercent).toFixed(2)}% decline today. `;
    } else if (stock.changePercent < 0) {
      analysis += `, down ${Math.abs(stock.changePercent).toFixed(2)}% today. `;
    } else {
      analysis += `, unchanged today. `;
    }
  }
  
  // Add sentiment based on score
  if (stock.scores?.composite > 80) {
    analysis += "Our algorithm indicates strong bullish technical signals with a high composite score of " + 
      stock.scores.composite + "/100. ";
  } else if (stock.scores?.composite > 60) {
    analysis += "Technical indicators are generally positive with a composite score of " + 
      stock.scores.composite + "/100. ";
  } else if (stock.scores?.composite > 40) {
    analysis += "Technical indicators show mixed signals with a moderate composite score of " + 
      stock.scores.composite + "/100. ";
  } else {
    analysis += "Technical indicators suggest caution may be warranted based on a composite score of " + 
      (stock.scores?.composite || "N/A") + "/100. ";
  }
  
  // Add information about signals if available
  if (stock.signals && stock.signals.length > 0) {
    analysis += `Key technical signals identified: ${stock.signals.join(', ')}. `;
  }
  
  // Add volume commentary if available
  if (stock.volume && stock.avgVolume) {
    const volumeRatio = stock.volume / stock.avgVolume;
    if (volumeRatio > 2) {
      analysis += `Trading volume is notably high at ${volumeRatio.toFixed(1)}x the average, `;
      
      if (stock.changePercent > 0) {
        analysis += "suggesting strong buying interest. ";
      } else if (stock.changePercent < 0) {
        analysis += "indicating potential distribution. ";
      } else {
        analysis += "which may signal increased investor attention. ";
      }
    } else if (volumeRatio < 0.5) {
      analysis += `Volume is light at ${volumeRatio.toFixed(1)}x the average, suggesting low conviction in the current price action. `;
    }
  }
  
  // Add final recommendation
  analysis += "This analysis is based on algorithmic scoring and should be considered alongside fundamental research and broader market conditions before making investment decisions.";
  
  return analysis;
}
