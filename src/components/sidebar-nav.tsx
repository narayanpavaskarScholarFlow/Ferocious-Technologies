"use client";

import { ViewType } from '@/lib/types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Activity, 
  Settings, 
  HelpCircle, 
  Box,
  Cpu,
  Users,
  Package,
  Calendar,
  UserPlus,
  Layers,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function SidebarNav({ currentView, onViewChange }: SidebarNavProps) {
  const menuItems = [
    { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Overview' },
    { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Work Orders' },
    { id: 'customer-orders' as ViewType, icon: Package, label: 'Pipeline' },
    { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Machines' },
    { id: 'manpower' as ViewType, icon: Users, label: 'Manpower' },
    { id: 'operations' as ViewType, icon: Layers, label: 'Routing' },
    { id: 'vendor' as ViewType, icon: Truck, label: 'Vendors' },
    { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Schedule' },
    { id: 'sqcdp' as ViewType, icon: Activity, label: 'Board' },
    { id: 'users' as ViewType, icon: UserPlus, label: 'Access' },
  ];

  return (
    <div className="w-20 lg:w-24 bg-white dark:bg-black flex flex-col items-center py-10 gap-10 border-r border-black/5 dark:border-white/5 z-50 sticky top-0 h-screen">
      <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20 animate-float">
        <Box className="h-7 w-7 text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "p-3.5 rounded-2xl transition-all duration-300 relative group",
                      isActive 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" 
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform duration-500", !isActive && "group-hover:scale-110")} />
                    {isActive && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-full blur-[2px]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={15} className="bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 border-none">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-6 text-muted-foreground pt-6 border-t border-black/5 dark:border-white/5 w-10 items-center">
        <button className="hover:text-primary transition-all hover:scale-110">
          <Settings className="h-5 w-5" />
        </button>
        <button className="hover:text-primary transition-all hover:scale-110">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}