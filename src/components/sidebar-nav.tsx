"use client";

import { useState, useEffect } from 'react';
import { ViewType } from '@/lib/types';
import { 
  LayoutDashboard, 
  Activity, 
  Box,
  Cpu,
  Users,
  Package,
  Calendar,
  UserPlus,
  Layers,
  Truck,
  ShoppingCart,
  Settings,
  HelpCircle,
  CreditCard,
  ClipboardList,
  Boxes,
  LineChart,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function SidebarNav({ currentView, onViewChange }: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Command Center' },
    { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Production Orders' },
    { id: 'gantt' as ViewType, icon: LayoutGrid, label: 'Production Gantt' },
    { id: 'operations' as ViewType, icon: Layers, label: 'Operational Routing' },
    { id: 'quality' as ViewType, icon: ShieldCheck, label: 'Quality Assurance' },
    { id: 'inventory' as ViewType, icon: Boxes, label: 'Resource Inventory' },
    { id: 'billing' as ViewType, icon: CreditCard, label: 'Financial Ledger' },
    { id: 'work-log' as ViewType, icon: ClipboardList, label: 'Work Log Entry' },
    { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Asset Telemetry' },
    { id: 'manpower' as ViewType, icon: Users, label: 'Resource Management' },
    { id: 'sqcdp' as ViewType, icon: LineChart, label: 'SQCDP Board' },
    { id: 'customer-orders' as ViewType, icon: Package, label: 'Customer Pipeline' },
    { id: 'vendor' as ViewType, icon: Truck, label: 'Vendor Management' },
    { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Master Schedule' },
    { id: 'users' as ViewType, icon: UserPlus, label: 'Access Control' },
  ];

  if (!mounted) {
    return <div className="w-20 lg:w-24 bg-white border-r border-black/5 h-screen" />;
  }

  return (
    <div className="w-20 lg:w-24 bg-white flex flex-col items-center py-10 gap-10 border-r border-black/5 z-50 sticky top-0 h-screen overflow-y-auto hide-scrollbar">
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
                    suppressHydrationWarning
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "p-3.5 rounded-2xl transition-all duration-300 relative group outline-none",
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
                <TooltipContent side="right" sideOffset={15} className="bg-black text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 border-none">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-6 text-muted-foreground pt-6 border-t border-black/5 w-10 items-center">
        <button suppressHydrationWarning className="hover:text-primary transition-all hover:scale-110 outline-none">
          <Settings className="h-5 w-5" />
        </button>
        <button suppressHydrationWarning className="hover:text-primary transition-all hover:scale-110 outline-none">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
