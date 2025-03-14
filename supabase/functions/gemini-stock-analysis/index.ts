
// Gemini Stock Analysis Edge Function
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured",
          details: "The GEMINI_API_KEY environment variable is not set in Supabase Edge Function secrets"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Parse request body
    const requestData = await req.json();
    const stocks = requestData.stocks || [];
    
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: "Request must include a 'stocks' array with at least one stock"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log(`Analyzing ${stocks.length} stocks with Gemini API`);
    
    // Format the prompt for Gemini
    const prompt = formatAnalysisPrompt(stocks);
    
    // Call the Gemini API
    try {
      // Updated to use the current model name: gemini-1.5-pro
      // Note: This is the updated model name as of 2025
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4096,
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error (${response.status}):`, errorText);
        
        return new Response(
          JSON.stringify({
            error: `Gemini API Error: ${response.statusText}`,
            status: response.status,
            details: errorText
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      const data = await response.json();
      
      // Parse the Gemini response
      const result = parseGeminiResponse(data, stocks);
      
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (apiError) {
      console.error("Error calling Gemini API:", apiError);
      
      return new Response(
        JSON.stringify({
          error: "Failed to call Gemini API",
          details: apiError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in gemini-stock-analysis function:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

/**
 * Format the analysis prompt for Gemini
 */
function formatAnalysisPrompt(stocks) {
  const stockList = stocks.map(stock => {
    const signals = stock.signals?.join(", ") || "None";
    return `
    - ${stock.ticker}: Price $${stock.close.toFixed(2)}, Change: ${stock.changePercent?.toFixed(2) || 0}%
      Signals: ${signals}
      Overall Score: ${stock.scores?.composite || 'N/A'}/100
    `;
  }).join("\n");
  
  return `
  Analyze the following stocks for a retail investor:
  
  ${stockList}
  
  For each stock, provide:
  1. A brief analysis of its current performance and technical signals
  2. Potential opportunities and risks
  3. Keep each analysis concise (50-75 words)
  
  Also provide a short market insight paragraph (100 words max) based on these stocks' overall performance and signals.
  
  Format your response as JSON with this exact structure:
  {
    "stockAnalyses": {
      "TICKER1": "Analysis for ticker 1...",
      "TICKER2": "Analysis for ticker 2...",
      ...
    },
    "marketInsight": "Overall market insight paragraph..."
  }
  
  STRICTLY follow the JSON format above. Your entire response must be valid JSON.
  `;
}

/**
 * Parse the Gemini API response
 */
function parseGeminiResponse(geminiResponse, stocks) {
  try {
    // Extract the text from Gemini's response
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      console.error("Empty or invalid response from Gemini API:", geminiResponse);
      throw new Error("Invalid response format from Gemini API");
    }
    
    // Extract the JSON object from the response text
    // The response might contain markdown or other formatting, so we need to extract just the JSON part
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find JSON in Gemini response:", responseText);
      
      // Fallback: create a basic analysis for each stock
      return createFallbackAnalysis(stocks);
    }
    
    // Parse the JSON
    const jsonText = jsonMatch[0];
    let parsedData;
    
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.log("Attempted to parse:", jsonText);
      
      // Fallback: create a basic analysis for each stock
      return createFallbackAnalysis(stocks);
    }
    
    // Validate the parsed data
    if (!parsedData.stockAnalyses || !parsedData.marketInsight) {
      console.error("Missing required fields in Gemini response:", parsedData);
      
      // Fallback: create a basic analysis for each stock
      return createFallbackAnalysis(stocks);
    }
    
    // Add a timestamp to the response
    return {
      ...parsedData,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return createFallbackAnalysis(stocks);
  }
}

/**
 * Create a fallback analysis when the API response cannot be properly parsed
 */
function createFallbackAnalysis(stocks) {
  return {
    stockAnalyses: stocks.reduce((acc, stock) => {
      acc[stock.ticker] = `${stock.ticker} is currently priced at $${stock.close.toFixed(2)} with a ${stock.changePercent >= 0 ? 'positive' : 'negative'} change of ${Math.abs(stock.changePercent || 0).toFixed(2)}%. Consider reviewing recent news and financial statements for more information.`;
      return acc;
    }, {}),
    marketInsight: "Analysis unavailable at this time. Please try again later or consult other financial resources for current market insights.",
    generatedAt: new Date().toISOString()
  };
}
