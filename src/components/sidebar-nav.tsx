
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
  Boxes,
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
  ChevronRight,
  FileText,
  UserCheck,
  History,
  FileBarChart,
  Building2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Bell,
  FileCheck,
  Shield,
  Lock,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  permissions?: Record<string, PermissionLevel>;
  isSlim?: boolean;
  customTitles?: Record<string, string>;
  userRole?: string;
  brandLogo?: string;
  logoSize?: number;
  isMobile?: boolean;
}

export function SidebarNav({ 
  currentView, 
  onViewChange, 
  permissions = {}, 
  isSlim = false, 
  customTitles = {}, 
  userRole, 
  brandLogo = '',
  logoSize = 32,
  isMobile = false
}: SidebarNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuSections = useMemo(() => {
    const isMasterAdmin = userRole === 'Master Admin' || userRole?.toLowerCase() === 'master admin';

    const sections = [
      {
        name: 'COMMAND CENTER',
        mobileVisible: true,
        items: [
          { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'analytics', icon: LineChart, label: 'Analytics', mobileHidden: true },
          { id: 'activity', icon: Activity, label: 'Performance Hub' },
          { id: 'sqcdp', icon: Target, label: 'Quality Metrics' },
        ]
      },
      {
        name: 'FINANCIAL HUB',
        mobileVisible: false,
        items: [
          { id: 'customer-master', icon: Building2, label: 'Customers' },
          { id: 'vendor-master', icon: Truck, label: 'Vendors' },
          { id: 'product-master', icon: Box, label: 'Products' },
          { id: 'quotation', icon: FileText, label: 'Quotations' },
          { id: 'sale-invoice', icon: Receipt, label: 'Invoices' },
          { id: 'purchase-order', icon: PackageCheck, label: 'Purchase Orders' },
          { id: 'payments', icon: Landmark, label: 'Payments' },
        ]
      },
      {
        name: 'PRODUCTION HUB',
        mobileVisible: true,
        items: [
          { id: 'orders', icon: ShoppingCart, label: 'Work Orders' },
          { id: 'production-planner', icon: Factory, label: 'Planner', mobileHidden: true },
          { id: 'gantt', icon: Calendar, label: 'Timeline', mobileHidden: true },
          { id: 'quality', icon: ShieldCheck, label: 'Quality' },
          { id: 'inventory', icon: Boxes, label: 'Inventory' },
          { id: 'work-log', icon: ClipboardList, label: 'Work Logs' },
        ]
      },
      {
        name: 'RESOURCE HUB',
        mobileVisible: true,
        items: [
          { id: 'machine-utilization', icon: Cpu, label: 'Assets', mobileHidden: true },
          { id: 'my-portal', icon: Contact, label: 'Self Service' },
          { id: 'hr', icon: Briefcase, label: 'HR Admin', mobileHidden: true },
        ]
      },
      {
        name: 'ADMINISTRATION',
        mobileVisible: false,
        items: [
          { id: 'users', icon: Users, label: 'User Ledger' },
          { id: 'print-templates', icon: Printer, label: 'Designer' },
          { id: 'settings', icon: Settings, label: 'Configuration' },
        ]
      },
      {
        name: 'STRATEGIC HUB',
        mobileVisible: false,
        items: [
          { id: 'smart-quote', icon: BrainCircuit, label: 'AI Quoting' },
          { id: 'strategy-hub', icon: Target, label: 'Strategy Hub' },
        ]
      }
    ];

    return sections
      .filter(section => !isMobile || section.mobileVisible)
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          if (isMobile && item.mobileHidden) return false;
          if (isMasterAdmin) return true;
          const level = permissions[item.id];
          if (level === 'none') return false;
          if (item.id === 'my-portal' || item.id === 'overview') return true;
          return level && level !== 'none';
        })
      }))
      .filter(section => section.items.length > 0);
  }, [permissions, userRole, isMobile]);

  if (!mounted) return <div className="bg-[#1E293B] h-full w-full" />;

  return (
    <div className={cn(
      "bg-[#1E293B] h-full flex flex-col border-r border-white/5 transition-all duration-300",
      isSlim ? "w-20" : "w-full lg:w-64"
    )}>
      <div className={cn(
        "p-6 flex items-center gap-3 shrink-0 border-b border-white/5",
        isSlim && "justify-center"
      )}>
        <div className="relative rounded-lg bg-white p-1" style={{ width: logoSize + 4, height: logoSize + 4 }}>
          {brandLogo ? (
            <Image src={brandLogo} alt="Logo" fill className="object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <Box className="h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>
        {(!isSlim || isMobile) && (
          <div className="flex flex-col">
            <span className="text-white font-bold text-xs tracking-tight uppercase">Ferocious Tech</span>
            <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-0.5">Enterprise Matrix</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="p-4 space-y-8 pb-20">
          {menuSections.map((section) => (
            <div key={section.name} className="space-y-2">
              {(!isSlim || isMobile) && (
                <div className="px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{section.name}</span>
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon || Box;
                  const isActive = currentView === item.id;
                  
                  return (
                    <TooltipProvider key={item.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onViewChange(item.id as ViewType)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 h-10 rounded-lg transition-all group",
                              isActive 
                                ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/20" 
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                            {(!isSlim || isMobile) && <span className="text-[11px] font-medium tracking-wide truncate">{customTitles[item.id] || item.label}</span>}
                          </button>
                        </TooltipTrigger>
                        {isSlim && !isMobile && <TooltipContent side="right" className="bg-slate-900 text-white border-none text-[10px] font-bold uppercase">{item.label}</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/5 bg-[#1E293B]">
        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
            isSlim && !isMobile && "justify-center"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {(!isSlim || isMobile) && <span className="text-[11px] font-medium uppercase tracking-wider">Configuration</span>}
        </button>
      </div>
    </div>
  );
}
