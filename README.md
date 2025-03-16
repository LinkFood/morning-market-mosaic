# Morning Market Mosaic

## Project info

Morning Market Mosaic is an AI-enhanced stock market dashboard that provides comprehensive market data visualization and AI-powered insights in a single platform.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c6f9948a-c301-44b1-8caa-46dc5a6bdb3f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c6f9948a-c301-44b1-8caa-46dc5a6bdb3f) and click on Share -> Publish.

## Database Setup

This application uses Supabase for its backend database. To set up the required database tables:

1. Log into your Supabase project dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the SQL below (**NOT** the file path)
5. Run the query

```sql
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
```

This will create:
- The `app_settings` table that stores application configuration
- Feature flags with default values
- Dashboard layout settings
