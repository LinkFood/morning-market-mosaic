
/**
 * Shared CORS headers for all Supabase Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires, x-request-id, x-client-timestamp',
};
