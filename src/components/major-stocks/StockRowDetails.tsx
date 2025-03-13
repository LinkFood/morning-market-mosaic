
import React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockData } from "@/types/marketTypes";

interface StockRowDetailsProps {
  stock: StockData;
  stockDetails: any | null;
  isLoading: boolean;
  onViewDetailsClick: () => void;
}

const StockRowDetails: React.FC<StockRowDetailsProps> = ({
  stock,
  stockDetails,
  isLoading,
  onViewDetailsClick,
}) => {
  return (
    <div className="animate-fade-in space-y-2">
      {isLoading ? (
        <div className="h-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading details...</div>
        </div>
      ) : stockDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm">{stockDetails.name}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
              {stockDetails.description || "No description available"}
            </p>
            
            {stockDetails.sector && (
              <div className="mt-2">
                <Badge variant="outline" className="mr-2">
                  {stockDetails.sector}
                </Badge>
                {stockDetails.exchange && (
                  <Badge variant="secondary">
                    {stockDetails.exchange}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Market Cap</div>
              <div>
                {stockDetails.marketCap ? 
                  `$${(stockDetails.marketCap / 1_000_000_000).toFixed(2)}B` : 
                  "N/A"
                }
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Employees</div>
              <div>
                {stockDetails.employees ? 
                  stockDetails.employees.toLocaleString() : 
                  "N/A"
                }
              </div>
            </div>
            {stockDetails.listDate && (
              <div>
                <div className="text-muted-foreground text-xs">Listed</div>
                <div>{stockDetails.listDate}</div>
              </div>
            )}
            {stockDetails.homepageUrl && (
              <div>
                <div className="text-muted-foreground text-xs">Website</div>
                <a 
                  href={stockDetails.homepageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">
          No details available for {stock.ticker}
        </div>
      )}
      
      <div className="flex justify-end mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetailsClick();
          }}
        >
          View Details <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default StockRowDetails;
