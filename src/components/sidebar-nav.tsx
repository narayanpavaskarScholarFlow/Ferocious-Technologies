"use client";

import { useState, useEffect, useMemo } from 'react';
import { ViewType, PermissionLevel } from '@/lib/types';
import { 
  LayoutDashboard, 
  Cpu,
  Users,
  Calendar,
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
  LayoutGrid,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  permissions?: Record<string, PermissionLevel>;
}

export function SidebarNav({ currentView, onViewChange, permissions = {} }: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = useMemo(() => {
    const items = [
      { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Command Matrix' },
      { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Production Ledger' },
      { id: 'gantt' as ViewType, icon: LayoutGrid, label: 'Master Timeline' },
      { id: 'operations' as ViewType, icon: Layers, label: 'Operational Spreadsheet' },
      { id: 'quality' as ViewType, icon: ShieldCheck, label: 'Quality Hub' },
      { id: 'inventory' as ViewType, icon: Boxes, label: 'Material Ledger' },
      { id: 'billing' as ViewType, icon: CreditCard, label: 'Financial Hub' },
      { id: 'work-log' as ViewType, icon: ClipboardList, label: 'Daily Logs' },
      { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Asset Fleet' },
      { id: 'manpower' as ViewType, icon: Users, label: 'Resource Pool' },
      { id: 'sqcdp' as ViewType, icon: LineChart, label: 'Performance' },
      { id: 'vendor' as ViewType, icon: Truck, label: 'Supply Chain' },
      { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Planning' },
      { id: 'smart-quote' as ViewType, icon: BrainCircuit, label: 'Smart Quote' },
    ];

    return items.filter(item => {
      const level = permissions[item.id];
      return level && level !== 'none';
    });
  }, [permissions]);

  if (!mounted) {
    return <div className="w-20 lg:w-24 bg-[#001F3D] h-screen" />;
  }

  return (
    <div className="w-full lg:w-24 bg-[#001F3D] flex flex-col items-center py-10 gap-10 z-50 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-white/5 shadow-2xl">
      <div 
        className="p-4 bg-primary rounded-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-110 active:scale-95 cursor-pointer group" 
        onClick={() => onViewChange('overview')}
      >
        <Zap className="h-7 w-7 text-white fill-white transition-transform group-hover:rotate-12" />
      </div>

      <div className="flex-1 flex flex-col gap-3 w-full px-4 mt-4">
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
                      "w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-500 relative group outline-none",
                      isActive 
                        ? "bg-white text-[#001F3D] shadow-2xl" 
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-all duration-500", !isActive && "group-hover:scale-110")} />
                    {isActive && (
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={20} className="bg-[#001F3D] text-white border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-4 text-white/20 pt-10 border-t border-white/5 w-12 items-center">
        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-xl transition-all outline-none",
            currentView === 'settings' ? "bg-white/10 text-white" : "hover:text-white"
          )}
        >
          <Settings className="h-5 w-5" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:text-white transition-all outline-none">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
