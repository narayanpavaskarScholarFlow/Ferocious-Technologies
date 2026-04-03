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
    { id: 'overview' as ViewType, icon: LayoutDashboard, label: 'Command Overview' },
    { id: 'orders' as ViewType, icon: ShoppingCart, label: 'Production Orders' },
    { id: 'gantt' as ViewType, icon: LayoutGrid, label: 'Visual Timeline' },
    { id: 'operations' as ViewType, icon: Layers, label: 'Routing Spreadsheet' },
    { id: 'quality' as ViewType, icon: ShieldCheck, label: 'Quality Assurance' },
    { id: 'inventory' as ViewType, icon: Boxes, label: 'Material Ledger' },
    { id: 'billing' as ViewType, icon: CreditCard, label: 'Financial Hub' },
    { id: 'work-log' as ViewType, icon: ClipboardList, label: 'Operator Log' },
    { id: 'machine-utilization' as ViewType, icon: Cpu, label: 'Asset Telemetry' },
    { id: 'manpower' as ViewType, icon: Users, label: 'Resource Mgmt' },
    { id: 'sqcdp' as ViewType, icon: LineChart, label: 'SQCDP Board' },
    { id: 'customer-orders' as ViewType, icon: Package, label: 'CRM / Pipeline' },
    { id: 'vendor' as ViewType, icon: Truck, label: 'Supply Chain' },
    { id: 'weekly-plan' as ViewType, icon: Calendar, label: 'Master Schedule' },
    { id: 'users' as ViewType, icon: UserPlus, label: 'Access Security' },
  ];

  if (!mounted) {
    return <div className="w-16 lg:w-20 bg-[#001F3D] h-screen" />;
  }

  return (
    <div className="w-16 lg:w-20 bg-[#001F3D] flex flex-col items-center py-8 gap-8 z-50 sticky top-0 h-screen overflow-y-auto hide-scrollbar">
      <div className="p-3 bg-accent rounded-xl shadow-lg shadow-accent/20">
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
                    className={cn(
                      "p-3 rounded-xl transition-all duration-200 relative group outline-none",
                      isActive 
                        ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
                    {isActive && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-slate-900 text-white border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-4 text-slate-500 pt-6 border-t border-white/5 w-8 items-center">
        <button className="hover:text-white transition-all outline-none">
          <Settings className="h-4 w-4" />
        </button>
        <button className="hover:text-white transition-all outline-none">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}