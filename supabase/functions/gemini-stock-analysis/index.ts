
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
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "API key is not configured",
          details: "The GEMINI_API_KEY environment variable is not set in Supabase Edge Function secrets"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test if the API key is a valid format
    if (GEMINI_API_KEY.trim() === "" || !GEMINI_API_KEY.trim().startsWith("AI")) {
      console.error("GEMINI_API_KEY appears to be invalid (should start with 'AI')");
      return new Response(
        JSON.stringify({ 
          error: "API key appears to be invalid",
          details: "The GEMINI_API_KEY environment variable is set but doesn't appear to be in the correct format (should start with 'AI')"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    const { stocks } = requestBody as RequestBody;
    
    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request", 
          details: "The stocks array is required and cannot be empty" 
        }),
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
    
    try {
      console.log("Making API request to Google Gemini endpoint");
      
      // Add more detailed logging for request troubleshooting
      const requestData = {
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
      };
      
      const requestURL = `${endpoint}?key=${GEMINI_API_KEY}`;
      console.log(`Request URL (without key): ${endpoint}?key=AI...`);
      
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      // Check response status
      console.log(`Gemini API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        console.error(`Gemini API Error (${status}):`, errorText);
        
        // Enhanced error handling based on status code
        let errorDetails = errorText;
        
        if (status === 401) {
          errorDetails = "Authentication failed. The Gemini API key appears to be invalid.";
        } else if (status === 403) {
          errorDetails = "Permission denied. The API key may not have access to the Gemini API.";
        } else if (status === 429) {
          errorDetails = "Rate limit exceeded. The API quota may have been reached.";
        } else if (status >= 500) {
          errorDetails = "Gemini API server error. The service may be experiencing issues.";
        }
        
        // Return a more detailed error response
        return new Response(
          JSON.stringify({ 
            error: `Gemini API Error: ${response.statusText}`,
            status: response.status,
            details: errorDetails
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Process successful response
      const data = await response.json();
      console.log("Successfully received response from Gemini API");
      
      // Enhanced logging for debugging
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        console.log("Response contains expected structure");
      } else {
        console.error("Unexpected response structure:", JSON.stringify(data).substring(0, 500) + "...");
      }
      
      // Validate response structure
      if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Invalid response format from Gemini API:", JSON.stringify(data).substring(0, 500) + "...");
        return new Response(
          JSON.stringify({ 
            error: "Invalid API response format", 
            details: "The Gemini API returned an unexpected response format"
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Validate AI response isn't empty
      if (!aiResponse) {
        console.error("Empty response from Gemini API");
        return new Response(
          JSON.stringify({ 
            error: "Empty API response", 
            details: "The Gemini API returned an empty response"
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Parse the AI response
      const stockAnalyses = parseAnalysisResponse(aiResponse);
      const marketInsight = extractMarketInsight(aiResponse);
      
      // Create the analysis object
      const analysis = {
        stockAnalyses,
        marketInsight,
        generatedAt: new Date().toISOString()
      };
      
      console.log("Successfully processed Gemini response");
      
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      console.error("Error during Gemini API fetch:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "API communication error", 
          details: fetchError instanceof Error ? fetchError.message : "Unknown fetch error"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Log the full error
    console.error("Error in gemini-stock-analysis function:", error);
    
    // Return a detailed error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate analysis", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
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
  const marketSectionMatch = response.match(/(?:Market Insight|Overall Analysis|Market Context|Market Conditions|In Summary):\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i);
  
  if (marketSectionMatch && marketSectionMatch[1]) {
    return marketSectionMatch[1].trim();
  }
  
  // Fallback: take the last paragraph if no explicit section
  const paragraphs = response.split('\n\n');
  return paragraphs[paragraphs.length - 1].trim();
}
