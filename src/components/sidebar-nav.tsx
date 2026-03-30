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
  Layers
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
    { id: 'customer-orders' as ViewType, icon: Package, label: 'Customer Orders' },
    { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Machine Utilization' },
    { id: 'manpower' as ViewType, icon: Users, label: 'Manpower' },
    { id: 'operations' as ViewType, icon: Layers, label: 'Operations' },
    { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Weekly Plan' },
    { id: 'sqcdp' as ViewType, icon: Activity, label: 'SQCDP Board' },
    { id: 'users' as ViewType, icon: UserPlus, label: 'User Management' },
  ];

  return (
    <div className="w-16 bg-[#003d6b] flex flex-col items-center py-6 gap-6 border-r border-white/10 z-50">
      <div className="p-2 bg-white/10 rounded-lg mb-2">
        <Box className="h-6 w-6 text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(item.id)}
                    suppressHydrationWarning
                    className={cn(
                      "p-3 rounded-lg transition-all duration-200 relative",
                      isActive 
                        ? "bg-white text-[#003d6b] shadow-lg" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#003d6b] rounded-r-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs font-bold">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-4 text-white/40">
        <button className="hover:text-white transition-colors" suppressHydrationWarning>
          <Settings className="h-5 w-5" />
        </button>
        <button className="hover:text-white transition-colors" suppressHydrationWarning>
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
