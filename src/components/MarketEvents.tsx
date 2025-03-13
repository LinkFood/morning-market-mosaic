
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketEvent } from "@/types/marketTypes";
import { CalendarClock, DollarSign, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDailyDate } from "@/utils/dateUtils";

interface MarketEventsProps {
  events: MarketEvent[];
}

const MarketEvents = ({ events }: MarketEventsProps) => {
  // Sort events by date (nearest first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  const getEventIcon = (type: string) => {
    if (type === "earnings") return <DollarSign className="h-4 w-4" />;
    if (type === "economic") return <BarChart3 className="h-4 w-4" />;
    return null;
  };
  
  const getImportanceBadge = (importance: string) => {
    const variants: {[key: string]: any} = {
      high: { className: "bg-red-100 text-red-800 hover:bg-red-100" },
      medium: { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      low: { className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
      // Default fallback for any other importance value
      default: { className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
    };
    
    const variantClassName = variants[importance]?.className || variants.default.className;
    
    return (
      <Badge variant="outline" className={variantClassName}>
        {importance}
      </Badge>
    );
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Upcoming Market Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{event.title}</p>
                  {getImportanceBadge(event.importance)}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="mr-1 h-3 w-3" />
                  <span>{formatDailyDate(event.date)} • {event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketEvents;
