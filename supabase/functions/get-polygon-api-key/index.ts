
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
    
    // Log successful retrieval (useful for debugging)
    console.log("Successfully retrieved Polygon API key");
    
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
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
