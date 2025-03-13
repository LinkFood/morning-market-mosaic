
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Settings, 
  ChevronRight,
  UserCircle2,
  Bell,
  HelpCircle,
  Info,
  Share2,
  Smartphone
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/theme-provider';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userSettings: any;
  updateUserSettings: (settings: any) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  open, 
  onOpenChange,
  userSettings,
  updateUserSettings
}) => {
  const { theme, setTheme } = useTheme();

  const toggleCompactMode = () => {
    updateUserSettings({
      ...userSettings,
      compactMode: !userSettings.compactMode
    });
  };

  const toggleAutoRefresh = () => {
    const realtimeUpdates = userSettings.realtimeUpdates || { enabled: true };
    updateUserSettings({
      ...userSettings,
      realtimeUpdates: {
        ...realtimeUpdates,
        enabled: !realtimeUpdates.enabled
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-sm">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-xl">Morning Market Mosaic</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Link to="/fed-dashboard" className="flex items-center justify-between py-2 px-1 hover:text-primary transition-colors">
              <div className="flex items-center">
                <BarChart3 className="mr-3 h-5 w-5" />
                <span>Fed Dashboard</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Separator />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Settings</h3>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Smartphone className="mr-3 h-5 w-5" />
                <Label htmlFor="compact-mode">Compact Mode</Label>
              </div>
              <Switch 
                id="compact-mode"
                checked={userSettings.compactMode || false}
                onCheckedChange={toggleCompactMode}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Bell className="mr-3 h-5 w-5" />
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
              </div>
              <Switch 
                id="auto-refresh"
                checked={userSettings.realtimeUpdates?.enabled !== false}
                onCheckedChange={toggleAutoRefresh}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="mr-3 h-5 w-5 flex items-center justify-center">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </div>
                <Label>Dark Mode</Label>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <Separator />
          </div>

          <div className="space-y-3">
            <Link to="#" className="flex items-center py-2 px-1 hover:text-primary transition-colors">
              <Share2 className="mr-3 h-5 w-5" />
              <span>Share Dashboard</span>
            </Link>
            
            <Link to="#" className="flex items-center py-2 px-1 hover:text-primary transition-colors">
              <HelpCircle className="mr-3 h-5 w-5" />
              <span>Help & Support</span>
            </Link>
            
            <Link to="#" className="flex items-center py-2 px-1 hover:text-primary transition-colors">
              <Info className="mr-3 h-5 w-5" />
              <span>About</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
