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
  Zap,
  Factory,
  Kanban,
  GraduationCap
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
      { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Overview' },
      { id: 'agile' as ViewType, icon: Kanban, label: 'Agile Flow' },
      { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Orders' },
      { id: 'production-planner' as ViewType, icon: Factory, label: 'Mass Production' },
      { id: 'gantt' as ViewType, icon: LayoutGrid, label: 'Gantt' },
      { id: 'operations' as ViewType, icon: Layers, label: 'Spreadsheet' },
      { id: 'quality' as ViewType, icon: ShieldCheck, label: 'Quality' },
      { id: 'training' as ViewType, icon: GraduationCap, label: 'Training Matrix' },
      { id: 'inventory' as ViewType, icon: Boxes, label: 'Inventory' },
      { id: 'billing' as ViewType, icon: CreditCard, label: 'Billing' },
      { id: 'work-log' as ViewType, icon: ClipboardList, label: 'Work Logs' },
      { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Assets' },
      { id: 'manpower' as ViewType, icon: Users, label: 'Resources' },
      { id: 'sqcdp' as ViewType, icon: LineChart, label: 'Stats' },
      { id: 'vendor' as ViewType, icon: Truck, label: 'Supply' },
      { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Planning' },
      { id: 'smart-quote' as ViewType, icon: BrainCircuit, label: 'AI Quote' },
    ];

    return items.filter(item => {
      const level = permissions[item.id];
      return level && level !== 'none';
    });
  }, [permissions]);

  if (!mounted) {
    return <div className="w-20 bg-[#001F3D] h-screen" />;
  }

  return (
    <div className="w-20 bg-[#001F3D] flex flex-col items-center py-6 gap-8 z-50 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-white/5">
      <div 
        className="p-3 bg-primary rounded-xl shadow-lg cursor-pointer group" 
        onClick={() => onViewChange('overview')}
      >
        <Zap className="h-6 w-6 text-white fill-white transition-transform group-hover:rotate-12" />
      </div>

      <div className="flex-1 flex flex-col gap-2 w-full px-3 mt-4">
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
                      "w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300 relative group outline-none",
                      isActive 
                        ? "bg-white text-[#001F3D] shadow-md" 
                        : "text-white/30 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={15} className="bg-[#001F3D] text-white border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-3 text-white/20 pt-6 border-t border-white/5 w-10 items-center">
        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
            currentView === 'settings' ? "bg-white/10 text-white" : "hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
