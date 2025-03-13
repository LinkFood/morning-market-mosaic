
import React from "react";
import { Expand, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDashboard } from "./DashboardContext";

interface CollapsibleComponentProps {
  componentId: string;
  title: string;
  children: React.ReactNode;
}

const CollapsibleComponent = ({ componentId, title, children }: CollapsibleComponentProps) => {
  const { 
    collapsedComponents, 
    toggleComponentCollapse, 
    expandComponent, 
    isComponentVisible 
  } = useDashboard();
  
  const isCollapsed = collapsedComponents[componentId];
  
  if (!isComponentVisible(componentId)) return null;
  
  return (
    <Collapsible
      open={!isCollapsed}
      className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => expandComponent(componentId)}
            className="p-1 rounded-full hover:bg-secondary"
            aria-label="Expand"
          >
            <Expand className="h-4 w-4" />
          </button>
          <CollapsibleTrigger
            onClick={() => toggleComponentCollapse(componentId)}
            className="p-1 rounded-full hover:bg-secondary"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className="p-4 pt-0">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleComponent;
