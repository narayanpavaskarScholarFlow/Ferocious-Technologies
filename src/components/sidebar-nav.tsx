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
  ChevronRight,
  FileText,
  Lock,
  Target,
  UserCheck,
  TrendingUp,
  History,
  FileBarChart,
  Building2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  ShieldAlert
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

    const sections = [
      {
        name: 'COMMAND CENTER',
        items: [
          { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'analytics', icon: TrendingUp, label: 'Analytics Dashboard' },
          { id: 'activity', icon: History, label: 'Activity Feed' },
          { id: 'approvals', icon: UserCheck, label: 'Approvals' },
          { id: 'sqcdp', icon: LineChart, label: 'SQCDP Dashboard' },
        ]
      },
      {
        name: 'FINANCIAL HUB',
        items: [
          { id: 'customer-master', icon: Building2, label: 'Customer Master' },
          { id: 'vendor-master', icon: Truck, label: 'Vendor Master' },
          { id: 'product-master', icon: Box, label: 'Product Master' },
          { id: 'quotation', icon: FileText, label: 'Quotation' },
          { id: 'customer-po', icon: FileCheck, label: 'Customer PO' },
          { id: 'sale-order', icon: ShoppingCart, label: 'Sales Orders' },
          { id: 'sale-invoice', icon: Receipt, label: 'Sales Invoices' },
          { id: 'purchase-order', icon: PackageCheck, label: 'Purchase Orders' },
          { id: 'purchase-invoice', icon: Receipt, label: 'Purchase Invoices' },
          { id: 'delivery-challan', icon: Truck, label: 'Delivery Challans' },
          { id: 'payments', icon: Landmark, label: 'Payments' },
          { id: 'credit-note', icon: ArrowDownLeft, label: 'Credit Notes' },
          { id: 'debit-note', icon: ArrowUpRight, label: 'Debit Notes' },
        ]
      },
      {
        name: 'PRODUCTION HUB',
        items: [
          { id: 'orders', icon: ShoppingCart, label: 'Work Orders' },
          { id: 'order-details', icon: Target, label: 'Order Details' },
          { id: 'operations', icon: Layers, label: 'Operations Status' },
          { id: 'production-planner', icon: Factory, label: 'Production Planner' },
          { id: 'gantt', icon: LayoutGrid, label: 'Production Gantt' },
          { id: 'quality', icon: ShieldCheck, label: 'Quality Management' },
          { id: 'delivery', icon: PackageCheck, label: 'Dispatch Ledger' },
          { id: 'inventory', icon: Box, label: 'Inventory Management' },
        ]
      },
      {
        name: 'RESOURCE HUB',
        items: [
          { id: 'machine-utilization', icon: Cpu, label: 'Machine Utilization' },
          { id: 'machine-load-plan', icon: Calendar, label: 'Machine Load Planning' },
          { id: 'tool-catalog', icon: Box, label: 'Tool Catalog' },
          { id: 'my-portal', icon: Contact, label: 'Employee Portal' },
          { id: 'hr', icon: Briefcase, label: 'HR Management' },
          { id: 'salary', icon: CreditCard, label: 'Salary Structure' },
        ]
      },
      {
        name: 'ADMINISTRATION',
        items: [
          { id: 'users', icon: Users, label: 'User Management' },
          { id: 'print-templates', icon: Printer, label: 'Template Manager' },
          { id: 'reports', icon: FileBarChart, label: 'Report Center' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ]
      },
      {
        name: 'STRATEGIC HUB',
        items: [
          { id: 'smart-quote', icon: BrainCircuit, label: 'AI Smart Quoting' },
          { id: 'strategy-hub', icon: Target, label: 'Loan Project Hub' },
        ]
      }
    ];

    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (isMasterAdmin) return true;
        if (item.id === 'my-portal' || item.id === 'overview') return true;
        if (item.id === 'hr') return isHRAdmin;
        const level = permissions[item.id];
        return level && level !== 'none';
      })
    })).filter(section => section.items.length > 0);
  }, [permissions, userRole]);

  if (!mounted) return <div className="bg-[#001F3D] h-full w-full" />;

  return (
    <div className={cn(
      "bg-[#001F3D] dark:bg-card h-full flex flex-col border-r border-white/5 dark:border-border transition-all duration-300",
      isSlim ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "bg-white/5 dark:bg-card border-b border-white/5 dark:border-border p-4 flex items-center gap-3",
        isSlim && "justify-center"
      )}>
        <div className="relative rounded bg-white p-1" style={{ width: logoSize + 8, height: logoSize + 8 }}>
          <Image src={brandLogo} alt="Logo" fill className="object-contain" />
        </div>
        {!isSlim && (
          <div className="flex flex-col">
            <span className="text-white dark:text-primary font-black text-[10px] tracking-widest uppercase leading-none">Ferocious Tech</span>
            <span className="text-white/40 dark:text-slate-400 text-[7px] font-bold tracking-tighter uppercase mt-1">Control Node v2.4</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {menuSections.map((section) => (
            <div key={section.name} className="space-y-1">
              {!isSlim && (
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-[8px] font-black text-white/20 dark:text-slate-500 uppercase tracking-[0.3em]">{section.name}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-white/10" />
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
                                ? "bg-primary text-[#001F3D] font-black shadow-lg" 
                                : "text-white/40 dark:text-slate-400 hover:bg-white/5 dark:hover:bg-slate-900 hover:text-white"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#001F3D]" : "text-white/20 group-hover:text-white transition-colors")} />
                            {!isSlim && <span className="text-[10px] font-bold uppercase tracking-wider truncate">{customTitles[item.id] || item.label}</span>}
                            {isActive && !isSlim && <ChevronRight className="h-3 w-3 ml-auto text-[#001F3D]/40" />}
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

      <div className="p-3 mt-auto border-t border-white/5 dark:border-border">
        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-10 rounded-lg text-white/40 dark:text-slate-400 hover:text-white hover:bg-white/5 dark:hover:bg-slate-900 transition-colors",
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

function FileCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  )
}
