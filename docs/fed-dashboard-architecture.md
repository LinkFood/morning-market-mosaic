
# Federal Reserve Data Dashboard Architecture

## Overview

The Federal Reserve Data Dashboard is a React-based application that fetches, processes, and visualizes economic data from the Federal Reserve Economic Data (FRED) API. The architecture is designed to be modular, maintainable, and efficient, with a focus on performance through caching and optimized rendering.

## Architecture Components

### 1. Data Layer

#### API Client (`src/services/fred/apiClient.ts`)
- Handles direct communication with the FRED API via Supabase Edge Functions
- Manages authentication and request formatting

#### Data Service (`src/services/fred/dataService.ts`)
- Provides high-level data fetching functions
- Implements caching strategy
- Handles data refresh policies

#### Caching (`src/services/fred/cacheUtils.ts`)
- Implements local storage-based caching
- Provides TTL (time-to-live) functionality for different data types
- Manages cache invalidation strategies

### 2. Data Processing (Supabase Edge Functions)

#### Edge Function (`supabase/functions/get-fred-data/index.ts`)
- Fetches data from FRED API using API key (securely stored)
- Processes raw data into application-specific format
- Returns formatted data to client

#### Processors (`supabase/functions/get-fred-data/processors/`)
- Specialized modules for different categories of economic data:
  - `inflationProcessor.ts`: Handles CPI and other inflation metrics
  - `interestRateProcessor.ts`: Processes Fed Funds Rate and treasury yields
  - `growthProcessor.ts`: Manages GDP and other growth indicators
  - `employmentProcessor.ts`: Handles unemployment and labor statistics
  - `marketProcessor.ts`: Processes market-related indicators

#### Base Processing (`supabase/functions/get-fred-data/processors/baseProcessor.ts`)
- Provides common processing functions reused across different processors
- Standardizes output format for consistency

### 3. Visualization Layer

#### Dashboard Components
- `FedDashboard.tsx`: Main container for the dashboard
- `FedDashboardOverview.tsx`: Summary view of key economic indicators
- `FredInflation.tsx`, `FredInterestRates.tsx`, etc.: Category-specific visualizations

#### Chart Components
- `EnhancedChart.tsx`: Flexible chart component with adaptive features
- `ChartComponent.tsx`: Lower-level component that handles Recharts integration
- Utility modules for data processing, formatting, and styling

#### Indicator Components
- `EconomicIndicatorCard.tsx`: Reusable card for displaying economic metrics
- `InflationCard.tsx`, `InterestRateCard.tsx`: Specialized indicator cards

## Data Flow

1. User visits dashboard or requests data refresh
2. React components request data via `fedApiService`
3. `fedApiService` checks cache for valid data
   - If valid cache exists, returns cached data
   - If no cache or cache invalid, makes request to Edge Function
4. Edge Function:
   - Makes authenticated request to FRED API
   - Processes raw data using appropriate processors
   - Returns formatted data to client
5. `fedApiService` caches the data and returns it to components
6. React components render visualizations using the data

## Optimization Strategies

1. **Caching**: Different TTLs based on data update frequency
2. **Lazy Loading**: Components fetch data only when needed
3. **Data Normalization**: Consistent format for easier component reuse
4. **Adaptive Rendering**: Charts and visualizations adjust to data frequency
5. **Shared State**: Common data is fetched once and shared across components

## Extension Points

1. **Additional Categories**: New processors can be added for other economic data
2. **Custom Visualizations**: The chart components can be extended for new visualization types
3. **Advanced Analytics**: The processing layer can be extended with statistical analysis
4. **Alternative Data Sources**: The architecture can be adapted to include other data providers

## Style Guidelines

The dashboard follows these design principles:
- Clear visual hierarchy with the most important indicators prominent
- Consistent color coding (red for negative trends, green for positive)
- Responsive design that works across device sizes
- Context-aware tooltips and annotations for better data understanding
