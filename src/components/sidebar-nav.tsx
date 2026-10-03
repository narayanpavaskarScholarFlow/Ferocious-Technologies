"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
  CreditCard,
  ClipboardList,
  Box,
  LineChart,
  ShieldCheck,
  LayoutGrid,
  BrainCircuit,
  Factory,
  Kanban,
  GraduationCap,
  ChevronDown,
  Briefcase,
  Contact,
  PackageCheck,
  Printer,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  permissions?: Record<string, PermissionLevel>;
  isSlim?: boolean;
  customTitles?: Record<string, string>;
  userRole?: string;
  isReportingManager?: boolean;
  brandLogo?: string;
  logoSize?: number;
}

export function SidebarNav({ 
  currentView, 
  onViewChange, 
  permissions = {}, 
  isSlim = false, 
  customTitles = {}, 
  userRole, 
  brandLogo = '',
  logoSize = 32
}: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuSections = useMemo(() => {
    const isMasterAdmin = userRole === 'Master Admin';
    const isHRAdmin = userRole === 'HR' || userRole === 'HR Manager' || isMasterAdmin;

    const allItems = [
      { id: 'overview', icon: LayoutDashboard, label: 'Dashboard', cat: 'Mission Control' },
      { id: 'my-portal', icon: Contact, label: 'My Portal', cat: 'Personnel' },
      { id: 'hr', icon: Briefcase, label: 'HR Hub', cat: 'Resources' },
      { id: 'agile', icon: Kanban, label: 'Kanban', cat: 'Strategic' },
      { id: 'orders', icon: ShoppingCart, label: 'Orders', cat: 'Production' },
      { id: 'production-planner', icon: Factory, label: 'Mass Prod', cat: 'Production' },
      { id: 'gantt', icon: LayoutGrid, label: 'Timeline', cat: 'Production' },
      { id: 'operations', icon: Layers, label: 'Sheet', cat: 'Production' },
      { id: 'quality', icon: ShieldCheck, label: 'Quality', cat: 'Quality' },
      { id: 'delivery', icon: PackageCheck, label: 'Dispatch', cat: 'Commercial' },
      { id: 'customer-orders', icon: Users, label: 'Registry', cat: 'Commercial' },
      { id: 'inventory', icon: Box, label: 'Inventory', cat: 'Commercial' },
      { id: 'billing', icon: CreditCard, label: 'Finance', cat: 'Commercial' },
      { id: 'work-log', icon: ClipboardList, label: 'Logs', cat: 'Production' },
      { id: 'machine-utilization', icon: Cpu, label: 'Assets', cat: 'Resources' },
      { id: 'sqcdp', icon: LineChart, label: 'Analytics', cat: 'Strategic' },
      { id: 'weekly-plan', icon: Calendar, label: 'Schedule', cat: 'Production' },
      { id: 'smart-quote', icon: BrainCircuit, label: 'AI Quoting', cat: 'Strategic' },
      { id: 'print-templates', icon: Printer, label: 'Templates', cat: 'Governance' },
    ];

    const filtered = allItems.filter(item => {
      if (isMasterAdmin) return true;
      if (item.id === 'my-portal') return true;
      if (item.id === 'hr') return isHRAdmin;
      const level = permissions[item.id];
      return level && level !== 'none';
    });

    // Group by category
    const sections: Record<string, typeof filtered> = {};
    filtered.forEach(item => {
      if (!sections[item.cat]) sections[item.cat] = [];
      sections[item.cat].push(item);
    });

    return Object.entries(sections).map(([name, items]) => ({ name, items }));
  }, [permissions, userRole]);

  if (!mounted) return <div className="bg-primary h-full w-full" />;

  return (
    <div className={cn(
      "bg-primary h-full flex flex-col border-r border-white/5 transition-all duration-300",
      isSlim ? "w-20" : "w-64"
    )}>
      {/* Branding Hub */}
      <div className={cn(
        "bg-white/5 border-b border-white/5 p-4 flex items-center gap-3",
        isSlim && "justify-center"
      )}>
        <div 
          className="relative rounded bg-white p-1" 
          style={{ width: logoSize + 8, height: logoSize + 8 }}
        >
          <Image src={brandLogo} alt="Logo" fill className="object-contain" />
        </div>
        {!isSlim && (
          <div className="flex flex-col">
            <span className="text-white font-bold text-[10px] tracking-widest uppercase">Ferocious Tech</span>
            <span className="text-white/40 text-[8px] font-medium tracking-tighter uppercase">Industrial Control</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {menuSections.map((section) => (
            <div key={section.name} className="space-y-1">
              {!isSlim && (
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{section.name}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-white/10" />
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <TooltipProvider key={item.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onViewChange(item.id as ViewType)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 h-10 rounded transition-all group",
                              isActive 
                                ? "bg-white/10 text-white font-bold shadow-inner" 
                                : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-white/20 group-hover:text-white/60")} />
                            {!isSlim && <span className="text-[11px] uppercase tracking-wider truncate">{customTitles[item.id] || item.label}</span>}
                            {isActive && !isSlim && <ChevronRight className="h-3 w-3 ml-auto text-white/20" />}
                          </button>
                        </TooltipTrigger>
                        {isSlim && <TooltipContent side="right" className="bg-slate-900 text-white border-none text-[10px] font-bold uppercase">{item.label}</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 mt-auto border-t border-white/5">
        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-10 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors",
            isSlim && "justify-center"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isSlim && <span className="text-[10px] font-bold uppercase tracking-widest">Configuration</span>}
        </button>
      </div>
    </div>
  );
}
