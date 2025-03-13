
import { Layout, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { UserSettings } from "@/types/marketTypes";

interface LayoutMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userSettings: UserSettings;
  toggleComponentVisibility: (componentId: string) => void;
}

const dashboardComponents = [
  { id: 'market-overview', label: 'Market Overview' },
  { id: 'es1-futures', label: 'S&P 500 Futures' },
  { id: 'major-stocks', label: 'Watchlist' },
  { id: 'economic-data', label: 'Economic Indicators' },
  { id: 'sector-performance', label: 'Sector Performance' },
  { id: 'market-events', label: 'Market Events' },
  { id: 'market-movers', label: 'Market Movers' },
  { id: 'stock-picks', label: 'Stock Picks' },
  { id: 'ai-stock-picker', label: 'AI Stock Recommendations' }
];

const LayoutMenu = ({ 
  isOpen, 
  onOpenChange, 
  userSettings, 
  toggleComponentVisibility 
}: LayoutMenuProps) => {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Layout className="h-4 w-4 mr-2" />
          Layout
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Dashboard Components</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardComponents.map(component => (
          <DropdownMenuItem 
            key={component.id}
            onClick={() => toggleComponentVisibility(component.id)}
          >
            {(userSettings.visibleComponents || []).includes(component.id) ? (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <X className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            {component.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LayoutMenu;
