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
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Contact,
  Building2,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  permissions?: Record<string, PermissionLevel>;
  isSlim?: boolean;
}

export function SidebarNav({ currentView, onViewChange, permissions = {}, isSlim = true }: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = useMemo(() => {
    const items = [
      { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Command Matrix' },
      { id: 'hr' as ViewType, icon: Users, label: 'HR Command' },
      { id: 'agile' as ViewType, icon: Kanban, label: 'Agile Kanban' },
      { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Master Orders' },
      { id: 'production-planner' as ViewType, icon: Factory, label: 'Mass Production' },
      { id: 'gantt' as ViewType, icon: LayoutGrid, label: 'Visual Gantt' },
      { id: 'operations' as ViewType, icon: Layers, label: 'Spreadsheet' },
      { id: 'quality' as ViewType, icon: ShieldCheck, label: 'Quality Hub' },
      { id: 'customer-orders' as ViewType, icon: Contact, label: 'Customer Identity' },
      { id: 'inventory' as ViewType, icon: Boxes, label: 'Stock Ledger' },
      { id: 'billing' as ViewType, icon: CreditCard, label: 'Financial Hub' },
      { id: 'work-log' as ViewType, icon: ClipboardList, label: 'Daily Logs' },
      { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Asset Fleet' },
      { id: 'sqcdp' as ViewType, icon: LineChart, label: 'Performance' },
      { id: 'vendor' as ViewType, icon: Truck, label: 'Supply Chain' },
      { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Master Plan' },
      { id: 'smart-quote' as ViewType, icon: BrainCircuit, label: 'AI Quoting' },
    ];

    return items.filter(item => {
      // For HR, check both manpower and training permissions
      if (item.id === 'hr') {
        const manpowerLevel = permissions['manpower'];
        const trainingLevel = permissions['training'];
        return (manpowerLevel && manpowerLevel !== 'none') || (trainingLevel && trainingLevel !== 'none');
      }
      const level = permissions[item.id];
      return level && level !== 'none';
    });
  }, [permissions]);

  if (!mounted) {
    return <div className={cn("bg-[#001F3D] h-screen", isSlim ? "w-20" : "w-64")} />;
  }

  return (
    <div className={cn(
      "bg-[#001F3D] flex flex-col py-6 gap-8 z-50 sticky top-0 h-screen overflow-y-auto hide-scrollbar border-r border-white/5 transition-all duration-500",
      isSlim ? "w-20 items-center" : "w-64 px-4"
    )}>
      <div 
        className={cn(
          "p-3 bg-primary rounded-xl shadow-lg cursor-pointer group transition-all",
          isSlim ? "w-12 h-12 flex items-center justify-center" : "w-full flex items-center gap-3"
        )} 
        onClick={() => onViewChange('overview')}
      >
        <Zap className="h-6 w-6 text-white fill-white transition-transform group-hover:rotate-12 shrink-0" />
        {!isSlim && <span className="text-white font-headline font-bold text-sm tracking-tight">BHARAT AXIS</span>}
      </div>

      <div className="flex-1 flex flex-col gap-1 w-full mt-4">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            if (isSlim) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        "w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300 relative group outline-none",
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
            }

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full h-11 flex items-center gap-3 px-4 rounded-xl transition-all duration-300 relative group outline-none",
                  isActive 
                    ? "bg-white text-[#001F3D] shadow-md font-bold" 
                    : "text-white/40 hover:text-white hover:bg-white/5 font-medium"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#001F3D]" : "text-white/20")} />
                <span className="text-[11px] uppercase tracking-wider truncate">{item.label}</span>
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
                )}
              </button>
            );
          })}
        </TooltipProvider>
      </div>

      <div className={cn(
        "flex flex-col gap-3 text-white/20 pt-6 border-t border-white/5 items-center",
        isSlim ? "w-10" : "w-full"
      )}>
        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "flex items-center justify-center rounded-xl transition-colors",
            isSlim ? "w-10 h-10" : "w-full h-11 px-4 gap-3",
            currentView === 'settings' ? "bg-white/10 text-white" : "hover:text-white"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isSlim && <span className="text-[10px] font-bold uppercase tracking-widest flex-1 text-left">Configuration</span>}
        </button>
      </div>
    </div>
  );
}