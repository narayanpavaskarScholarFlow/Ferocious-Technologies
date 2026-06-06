
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
  Package,
  UserCircle,
  PackageCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  permissions?: Record<string, PermissionLevel>;
  isSlim?: boolean;
  customTitles?: Record<string, string>;
  userRole?: string;
  isReportingManager?: boolean;
}

export function SidebarNav({ currentView, onViewChange, permissions = {}, isSlim = true, customTitles = {}, userRole, isReportingManager }: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = useMemo(() => {
    const isMasterAdmin = userRole === 'Master Admin';
    const isHRAdmin = userRole === 'HR' || userRole === 'HR Manager' || isMasterAdmin;

    const items = [
      { id: 'overview' as ViewType, icon: LayoutDashboard, label: customTitles['overview'] || 'Command Matrix' },
      { id: 'my-portal' as ViewType, icon: UserCircle, label: customTitles['my-portal'] || 'My Personnel Portal' },
      { id: 'hr' as ViewType, icon: Briefcase, label: customTitles['hr'] || 'HR Command Hub' },
      { id: 'agile' as ViewType, icon: Kanban, label: customTitles['agile'] || 'Agile Kanban' },
      { id: 'orders' as ViewType, icon: ShoppingCart, label: customTitles['orders'] || 'Master Orders' },
      { id: 'production-planner' as ViewType, icon: Factory, label: customTitles['production-planner'] || 'Mass Production' },
      { id: 'gantt' as ViewType, icon: LayoutGrid, label: customTitles['gantt'] || 'Visual Gantt' },
      { id: 'operations' as ViewType, icon: Layers, label: customTitles['operations'] || 'Spreadsheet' },
      { id: 'quality' as ViewType, icon: ShieldCheck, label: customTitles['quality'] || 'Quality Hub' },
      { id: 'delivery' as ViewType, icon: PackageCheck, label: customTitles['delivery'] || 'Dispatch Ledger' },
      { id: 'customer-orders' as ViewType, icon: Contact, label: customTitles['customer-orders'] || 'Customer Identity' },
      { id: 'inventory' as ViewType, icon: Boxes, label: customTitles['inventory'] || 'Stock Ledger' },
      { id: 'billing' as ViewType, icon: CreditCard, label: customTitles['billing'] || 'Financial Hub' },
      { id: 'work-log' as ViewType, icon: ClipboardList, label: customTitles['work-log'] || 'Daily Logs' },
      { id: 'machine-utilization' as ViewType, icon: Cpu, label: customTitles['machine-utilization'] || 'Asset Fleet' },
      { id: 'sqcdp' as ViewType, icon: LineChart, label: customTitles['sqcdp'] || 'Performance' },
      { id: 'vendor' as ViewType, icon: Truck, label: customTitles['vendor'] || 'Supply Chain' },
      { id: 'weekly-plan' as ViewType, icon: Calendar, label: customTitles['weekly-plan'] || 'Master Plan' },
      { id: 'smart-quote' as ViewType, icon: BrainCircuit, label: customTitles['smart-quote'] || 'AI Quoting' },
    ];

    return items.filter(item => {
      // Master Admin bypass: Sees EVERYTHING
      if (isMasterAdmin) return true;

      // Portal is always visible for personal use
      if (item.id === 'my-portal') return true;

      // HR hub is strictly for HR admins
      if (item.id === 'hr') return isHRAdmin;

      // Check specific permissions for others
      const level = permissions[item.id];
      return level && level !== 'none';
    });
  }, [permissions, customTitles, userRole, isReportingManager]);

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
        {!isSlim && <span className="text-white font-headline font-bold text-sm tracking-tight uppercase">FEROCIOUS TECH</span>}
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
