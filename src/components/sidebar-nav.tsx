"use client";

import { useState, useEffect } from 'react';
import { ViewType } from '@/lib/types';
import { 
  LayoutDashboard, 
  Box,
  Cpu,
  Users,
  Package,
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
}

export function SidebarNav({ currentView, onViewChange }: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Overview' },
    { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Orders' },
    { id: 'gantt' as ViewType, icon: LayoutGrid, label: 'Timeline' },
    { id: 'operations' as ViewType, icon: Layers, label: 'Routing' },
    { id: 'quality' as ViewType, icon: ShieldCheck, label: 'Quality' },
    { id: 'inventory' as ViewType, icon: Boxes, label: 'Inventory' },
    { id: 'billing' as ViewType, icon: CreditCard, label: 'Finance' },
    { id: 'work-log' as ViewType, icon: ClipboardList, label: 'Work Logs' },
    { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Assets' },
    { id: 'manpower' as ViewType, icon: Users, label: 'Resources' },
    { id: 'sqcdp' as ViewType, icon: LineChart, label: 'SQCDP' },
    { id: 'customer-orders' as ViewType, icon: Package, label: 'CRM' },
    { id: 'vendor' as ViewType, icon: Truck, label: 'Supply' },
    { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Schedule' },
    { id: 'smart-quote' as ViewType, icon: BrainCircuit, label: 'Smart Quote' },
  ];

  if (!mounted) {
    return <div className="w-20 lg:w-24 bg-[#0f172a] h-screen" />;
  }

  return (
    <div className="w-full lg:w-24 bg-[#0f172a] flex flex-col items-center py-10 gap-10 z-50 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-white/5 shadow-2xl">
      <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 transition-transform hover:scale-110 active:scale-95 cursor-pointer">
        <Zap className="h-7 w-7 text-white fill-white" />
      </div>

      <div className="flex-1 flex flex-col gap-2 w-full px-4">
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
                      "w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 relative group outline-none",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/30" 
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform duration-500", !isActive && "group-hover:scale-110")} />
                    {isActive && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-l-full shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={15} className="bg-slate-900 text-white border-none text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-2xl">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-4 text-slate-600 pt-8 border-t border-white/5 w-12 items-center">
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
