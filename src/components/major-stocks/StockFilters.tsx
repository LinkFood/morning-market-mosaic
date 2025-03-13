
import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterTab = 'all' | 'gainers' | 'losers' | 'active';

interface StockFiltersProps {
  activeFilter: FilterTab;
  setActiveFilter: (value: FilterTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StockFilters: React.FC<StockFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Input
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-36 h-8 md:w-48"
          autoComplete="off"
        />
      </div>
      
      <Tabs defaultValue="all" value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="gainers" className="text-positive">Gainers</TabsTrigger>
          <TabsTrigger value="losers" className="text-negative">Losers</TabsTrigger>
          <TabsTrigger value="active">Most Active</TabsTrigger>
        </TabsList>
        <TabsContent value={activeFilter} className="mt-0">
          {/* Table container will be rendered here */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockFilters;
