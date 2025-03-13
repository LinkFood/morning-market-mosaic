
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  compactMode?: boolean;
}

const StockFilters: React.FC<StockFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  compactMode = false
}) => {
  const FILTERS = [
    { id: "all", label: "All" },
    { id: "watchlist", label: "Watchlist" },
    { id: "gainers", label: "Gainers" },
    { id: "losers", label: "Losers" },
    { id: "tech", label: "Tech" },
  ];

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={`space-y-3 mb-4 ${compactMode ? 'mb-2' : ''}`}>
      <div className={`flex flex-wrap gap-2 ${compactMode ? 'gap-1' : ''}`}>
        {FILTERS.map((filter) => (
          <Badge
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              compactMode ? "px-2 py-1 text-xs" : ""
            )}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Input
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={compactMode ? "h-8 text-sm pl-3 pr-8" : "pr-8"}
        />
        {searchQuery && (
          <button
            onClick={handleSearchClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className={compactMode ? "h-4 w-4" : "h-5 w-5"} />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StockFilters;
