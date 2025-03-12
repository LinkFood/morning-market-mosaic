
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { 
  FRED_BASE_URL, 
  corsHeaders, 
  SERIES_GROUPS 
} from "./config.ts";
import { 
  fetchSeriesObservations, 
  getSeriesReleaseInfo 
} from "./api.ts";
import {
  processInflationData,
  processInterestRateData,
  processGrowthData,
  processEmploymentData,
  processMarketData
} from "./dataProcessors.ts";

// Main handler function for the endpoint
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { seriesId, category, forceRefresh, timeSpan = 12 } = await req.json();
    
    console.log(`Request received for ${category || 'category'} ${seriesId || 'all series'} with timeSpan=${timeSpan} months, forceRefresh=${forceRefresh || false}`);
    
    // If a specific series is requested
    if (seriesId) {
      let result;
      
      // Determine the processing function based on series ID or category
      if (SERIES_GROUPS.INFLATION.some(s => s.id === seriesId)) {
        result = await processInflationData(seriesId, timeSpan);
      } else if (SERIES_GROUPS.INTEREST_RATES.some(s => s.id === seriesId)) {
        result = await processInterestRateData(seriesId, timeSpan);
      } else if (SERIES_GROUPS.ECONOMIC_GROWTH.some(s => s.id === seriesId)) {
        result = await processGrowthData(seriesId, timeSpan);
      } else if (SERIES_GROUPS.EMPLOYMENT.some(s => s.id === seriesId)) {
        result = await processEmploymentData(seriesId, timeSpan);
      } else if (SERIES_GROUPS.MARKETS.some(s => s.id === seriesId)) {
        result = await processMarketData(seriesId, timeSpan);
      } else {
        throw new Error(`Unknown series ID: ${seriesId}`);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If a category is requested, fetch all series in that category
    if (category) {
      let seriesGroup;
      let processingFunction;
      
      switch (category.toUpperCase()) {
        case 'INFLATION':
          seriesGroup = SERIES_GROUPS.INFLATION;
          processingFunction = processInflationData;
          break;
        case 'INTEREST_RATES':
          seriesGroup = SERIES_GROUPS.INTEREST_RATES;
          processingFunction = processInterestRateData;
          break;
        case 'ECONOMIC_GROWTH':
          seriesGroup = SERIES_GROUPS.ECONOMIC_GROWTH;
          processingFunction = processGrowthData;
          break;
        case 'EMPLOYMENT':
          seriesGroup = SERIES_GROUPS.EMPLOYMENT;
          processingFunction = processEmploymentData;
          break;
        case 'MARKETS':
          seriesGroup = SERIES_GROUPS.MARKETS;
          processingFunction = processMarketData;
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }
      
      const results = await Promise.all(
        seriesGroup.map(async (series) => {
          try {
            const data = await processingFunction(series.id, timeSpan);
            return {
              ...data,
              name: series.name,
              unit: series.unit
            };
          } catch (error) {
            console.error(`Error processing ${series.id}:`, error);
            return {
              id: series.id,
              name: series.name,
              error: error.message
            };
          }
        })
      );
      
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If neither series nor category specified, return available options
    return new Response(JSON.stringify({
      categories: Object.keys(SERIES_GROUPS),
      series: Object.entries(SERIES_GROUPS).reduce((acc, [category, series]) => {
        acc[category] = series.map(s => ({ id: s.id, name: s.name }));
        return acc;
      }, {})
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in FRED data function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
