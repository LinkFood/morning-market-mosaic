
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  LineChart, 
  PieChart,
  Activity,
  CalendarDays
} from 'lucide-react';

interface MobileNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'watchlist', label: 'Watchlist', icon: LineChart },
    { id: 'sectors', label: 'Sectors', icon: PieChart },
    { id: 'movers', label: 'Movers', icon: Activity },
    { id: 'events', label: 'Events', icon: CalendarDays },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex flex-col items-center justify-center py-2 px-4 transition-colors ${
              activeSection === item.id
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobileNavigation;
