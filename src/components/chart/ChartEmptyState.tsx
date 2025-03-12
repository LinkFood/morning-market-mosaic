
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ChartEmptyStateProps {
  title?: string;
  hasData: boolean;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ title, hasData }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <div className="h-[300px] flex items-center justify-center bg-secondary/20 rounded-md">
          <p className="text-muted-foreground text-center">
            {hasData ? 
              "No data available for selected time period" : 
              "No data available"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartEmptyState;
