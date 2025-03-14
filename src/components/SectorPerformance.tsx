
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectorPerformance as SectorType } from "@/types/marketTypes";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface SectorPerformanceProps {
  sectors: SectorType[];
  isLoading?: boolean;
  error?: Error | null;
}

const SectorPerformance = ({ sectors, isLoading = false, error = null }: SectorPerformanceProps) => {
  // Sort sectors by performance (descending)
  const sortedSectors = [...sectors].sort((a, b) => b.changePercent - a.changePercent);
  
  // Find max absolute value of change percent for scaling the bars
  const maxAbsChangePercent = Math.max(
    ...sortedSectors.map((sector) => Math.abs(sector.changePercent)),
    2 // Minimum range of 2% to avoid flat bars
  );
  
  // Calculate progress value (0-100) for each sector
  const getProgressValue = (changePercent: number) => {
    // Scale to 0-100 range, with 50 being neutral
    return 50 + (changePercent / maxAbsChangePercent) * 50;
  };
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <Skeleton className="h-4 w-full col-span-3 md:col-span-2" />
                <Skeleton className="h-2.5 w-full col-span-7 md:col-span-8" />
                <Skeleton className="h-4 w-full col-span-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle error state
  if (error || sectors.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Sector Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {error ? "Failed to load sector data" : "No sector data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Sector Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSectors.map((sector) => (
            <div key={sector.ticker} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3 md:col-span-2 text-sm">{sector.name}</div>
              <div className="col-span-7 md:col-span-8">
                <Progress 
                  value={getProgressValue(sector.changePercent)} 
                  className="h-2.5" 
                  indicatorClassName={sector.changePercent >= 0 ? "bg-positive" : "bg-negative"}
                />
              </div>
              <div className={`col-span-2 text-right text-sm font-medium ${
                sector.changePercent > 0 
                  ? "ticker-up" 
                  : sector.changePercent < 0 
                  ? "ticker-down" 
                  : "ticker-neutral"
              }`}>
                {sector.changePercent >= 0 ? "+" : ""}{sector.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorPerformance;
