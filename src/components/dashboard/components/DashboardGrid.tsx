
import React from "react";
import { useDashboard } from "../DashboardContext";
import CollapsibleComponent from "../CollapsibleComponent";

// Components
import MarketOverview from "@/components/MarketOverview";
import EconomicData from "@/components/EconomicData";
import MajorStocks from "@/components/major-stocks/MajorStocks";
import MarketEvents from "@/components/MarketEvents";
import SectorPerformance from "@/components/SectorPerformance";
import MarketMovers from "@/components/market-movers/MarketMovers";
import TradingViewWidget from "@/components/TradingViewWidget";
import StockPicks from "@/components/stock-picks/StockPicks";
import AIStockPicker from "@/components/stock-picker/AIStockPicker";
import { SectorHeatMap } from "@/components/chart/heatmap";

const DashboardGrid: React.FC = () => {
  const { 
    stocks, 
    sectors, 
    events, 
    indicators, 
    indices,
    marketMovers,
    stockPicks,
    stockAnalysis,
    marketStatusData, 
    isLoading,
    isLoadingEcon,
    isLoadingMovers,
    isLoadingStockPicks,
    isLoadingAnalysis,
    moversError,
    loadMarketMovers,
    loadStockPicks,
    isComponentVisible
  } = useDashboard();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* TradingView Widget */}
      {isComponentVisible('es1-futures') && (
        <div className={`${isComponentVisible('es1-futures') ? 'lg:col-span-2' : ''}`}>
          <CollapsibleComponent
            componentId="es1-futures"
            title="S&P 500 Futures"
          >
            <TradingViewWidget 
              symbol="ES1!" 
              height={400} 
              interval="D"
              cardTitle="S&P 500 E-mini Futures"
              cardDescription="Real-time market data powered by TradingView"
            />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Heat Map */}
      {isComponentVisible('market-heat-map') && (
        <div className={`${isComponentVisible('market-heat-map') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-heat-map"
            title="Market Heat Map"
          >
            <SectorHeatMap 
              title="Market Performance Heat Map" 
              onStockClick={(ticker) => {
                console.log(`Selected stock: ${ticker}`);
                // In the future, we can integrate with stock detail view
              }}
            />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Overview */}
      {isComponentVisible('market-overview') && (
        <div className={`${isComponentVisible('market-overview') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-overview"
            title="Market Overview"
          >
            <MarketOverview indices={indices} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Economic Data */}
      {isComponentVisible('economic-data') && (
        <div className={`${isComponentVisible('economic-data') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="economic-data"
            title="Economic Indicators"
          >
            <EconomicData indicators={indicators} isLoading={isLoadingEcon} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Stock Picks */}
      {isComponentVisible('stock-picks') && (
        <div className={`${isComponentVisible('stock-picks') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="stock-picks"
            title="Algorithmic Stock Picks"
          >
            <StockPicks 
              stocks={stockPicks} 
              analysis={stockAnalysis}
              isLoading={isLoadingStockPicks}
              isLoadingAnalysis={isLoadingAnalysis}
              onRefresh={loadStockPicks}
            />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* AI Stock Picker */}
      {isComponentVisible('ai-stock-picker') && (
        <div className={`${isComponentVisible('ai-stock-picker') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="ai-stock-picker"
            title="AI Stock Recommendations"
          >
            <AIStockPicker />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Major Stocks */}
      {isComponentVisible('major-stocks') && (
        <div className={`${isComponentVisible('major-stocks') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="major-stocks"
            title="Watchlist"
          >
            <MajorStocks stocks={stocks} isLoading={isLoading} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Sector Performance */}
      {isComponentVisible('sector-performance') && (
        <div className={`${isComponentVisible('sector-performance') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="sector-performance"
            title="Sector Performance"
          >
            <SectorPerformance 
              sectors={sectors} 
              isLoading={isLoading} 
            />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Events */}
      {isComponentVisible('market-events') && (
        <div className={`${isComponentVisible('market-events') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-events"
            title="Market Events"
          >
            <MarketEvents events={events} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Movers */}
      {isComponentVisible('market-movers') && (
        <div className={`${isComponentVisible('market-movers') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-movers"
            title="Market Movers"
          >
            <MarketMovers 
              gainers={marketMovers.gainers} 
              losers={marketMovers.losers}
              isLoading={isLoadingMovers}
              error={moversError}
              marketStatus={marketStatusData || undefined}
              refreshData={loadMarketMovers}
            />
          </CollapsibleComponent>
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
