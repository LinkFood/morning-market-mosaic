-- Create app_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by key
CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings (key);

-- Add RLS policies to allow authorized access
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for anon access (this is a public app for now)
CREATE POLICY "Allow_anonymous_access_to_app_settings" ON public.app_settings
  FOR ALL USING (true);

-- Default initial settings for feature flags
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'feature_flags',
  '{
    "useRealTimeData": true,
    "showMarketMovers": true,
    "enableDetailedCharts": true,
    "enableNewsSection": true,
    "useFredEconomicData": true,
    "enableDataRefresh": true,
    "useStockPickerAlgorithm": true,
    "useAIStockAnalysis": true
  }',
  'Application feature flags configuration'
) ON CONFLICT (key) DO NOTHING;

-- Default initial settings for dashboard layout
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'dashboard_layout',
  '{
    "visibleComponents": [
      "market-overview",
      "es1-futures",
      "market-heat-map",
      "major-stocks",
      "economic-data",
      "sector-performance",
      "market-events",
      "market-movers",
      "stock-picks",
      "ai-stock-picker"
    ],
    "componentOrder": [
      "market-overview",
      "es1-futures",
      "market-heat-map",
      "major-stocks",
      "economic-data",
      "sector-performance",
      "market-events",
      "market-movers",
      "stock-picks",
      "ai-stock-picker"
    ]
  }',
  'Dashboard layout configuration'
) ON CONFLICT (key) DO NOTHING;