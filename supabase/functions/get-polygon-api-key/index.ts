
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
    // Get the API key from environment variables
    const apiKey = Deno.env.get("POLYGON_API_KEY");
    
    if (!apiKey) {
      console.error("POLYGON_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured",
          details: "The POLYGON_API_KEY environment variable is not set in Supabase Edge Function secrets"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Validate API key format
    if (apiKey.trim() === "") {
      console.error("POLYGON_API_KEY is empty");
      return new Response(
        JSON.stringify({
          error: "API key is empty",
          details: "The POLYGON_API_KEY environment variable is set but contains an empty string"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Log successful retrieval (useful for debugging)
    console.log("Successfully retrieved Polygon API key");
    
    // Test API key validity
    try {
      // Simple test request to Polygon's API
      const testResponse = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey=${apiKey}`,
        { method: "GET" }
      );
      
      if (!testResponse.ok) {
        const errorStatus = testResponse.status;
        const errorText = await testResponse.text();
        console.error(`Polygon API test failed with status ${errorStatus}:`, errorText);
        
        if (errorStatus === 401 || errorStatus === 403) {
          return new Response(
            JSON.stringify({
              apiKey,
              warning: "API key may be invalid",
              testStatus: errorStatus
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
      } else {
        console.log("Polygon API key test successful");
      }
    } catch (testError) {
      console.error("Error testing Polygon API key:", testError);
      // Continue with returning the key, but include a warning
      return new Response(
        JSON.stringify({
          apiKey,
          warning: "Could not validate API key",
          error: testError instanceof Error ? testError.message : "Unknown error"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Return the API key
    return new Response(
      JSON.stringify({ apiKey }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Log the full error
    console.error("Error retrieving API key:", error);
    
    // Return a detailed error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to retrieve API key",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace available"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
