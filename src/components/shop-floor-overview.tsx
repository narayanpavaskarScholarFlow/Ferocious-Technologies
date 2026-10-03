
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Zap, 
  TrendingUp, 
  Cpu, 
  BrainCircuit, 
  Bell, 
  UserCheck, 
  Box, 
  Monitor, 
  ShoppingCart, 
  Sparkles, 
  ChevronRight, 
  History, 
  FileText, 
  Package, 
  Receipt, 
  Landmark, 
  Settings,
  ShieldCheck,
  Factory,
  Users,
  Clock,
  LayoutGrid,
  CreditCard,
  PackageCheck
} from 'lucide-react';
import { Order, Machine, QualityReport, WorkLogEntry, InventoryItem, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShopFloorOverviewProps {
  orders: Order[];
  reports: QualityReport[];
  logs: WorkLogEntry[];
  machines: Machine[];
  inventory: InventoryItem[];
  billing: BillingRecord[];
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
}

const REVENUE_DATA = [
  { month: 'Jan', val: 1200000 },
  { month: 'Feb', val: 1500000 },
  { month: 'Mar', val: 1800000 },
  { month: 'Apr', val: 1400000 },
  { month: 'May', val: 2100000 },
  { month: 'Jun', val: 1900000 },
  { month: 'Jul', val: 2400000 },
];

export function ShopFloorOverview({ orders, reports, logs, machines, inventory, billing, onNavigateToOrders, onNavigateToMachine, onNavigateToInventory, onNavigateToBilling }: ShopFloorOverviewProps) {
  
  const operationalFlow = [
    { label: 'ENQUIRY', count: 12 },
    { label: 'QUOTATION', count: 8 },
    { label: 'SALES ORDER', count: 15 },
    { label: 'PRODUCTION', count: 24 },
    { label: 'INSPECTION', count: 6 },
    { label: 'DISPATCH', count: 3 },
    { label: 'INVOICE', count: 16 },
    { label: 'PAYMENT', count: 10 },
  ];

  const machineStatuses = useMemo(() => {
    return [
      { id: 'VMC-01', status: 'Running', yield: 92, color: 'text-primary' },
      { id: 'VMC-02', status: 'Running', yield: 84, color: 'text-primary' },
      { id: 'CNC-01', status: 'Maintenance', yield: 0, color: 'text-red-500' },
      { id: 'CNC-02', status: 'Idle', yield: 78, color: 'text-blue-500' },
      { id: 'GRINDING-01', status: 'Idle', yield: 45, color: 'text-blue-500' },
      { id: 'INSPECTION-01', status: 'Running', yield: 100, color: 'text-primary' },
    ];
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 bg-[#020617] text-white min-h-screen p-2 font-body">
      
      {/* 01. TOP COMMAND HEADER */}
      <div className="flex justify-between items-start px-2">
        <div className="flex items-center gap-10">
          <div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Strategic Control Node</span>
            <h1 className="text-2xl font-display font-black tracking-tight text-white uppercase leading-tight">Command Matrix</h1>
          </div>
          <div className="flex items-center gap-8 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
             <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Business Health</span>
                <div className="flex items-center gap-3">
                   <span className="text-2xl font-display font-black text-primary tracking-tighter">94.2%</span>
                   <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold px-2">NOMINAL</Badge>
                </div>
             </div>
             <div className="flex gap-4">
                {[
                  { label: 'FUEL', val: 72, color: 'bg-primary' },
                  { label: 'PROD', val: 88, color: 'bg-primary' },
                  { label: 'INV', val: 45, color: 'bg-amber-500' },
                  { label: 'QUAL', val: 96, color: 'bg-primary' },
                ].map(m => (
                  <div key={m.label} className="flex flex-col gap-1 w-12">
                    <span className="text-[6px] font-bold text-white/40 uppercase">{m.label}</span>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className={cn("h-full", m.color)} style={{ width: `${m.val}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
        <div className="text-right">
           <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Luminous Matrix v2.4</span>
           <p className="text-[9px] font-bold text-white/30 uppercase mt-1">Status: Operational</p>
        </div>
      </div>

      {/* 02. SUMMARY ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Open Quotations</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-black text-white leading-none">24</span>
            <span className="text-xs font-bold text-primary mb-1">₹ 42.1L</span>
          </div>
        </Card>
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Active Orders</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-black text-white leading-none">18</span>
            <span className="text-[10px] font-bold text-primary mb-1 uppercase tracking-tighter">72% complete</span>
          </div>
        </Card>
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Production Flow</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-black text-white leading-none">9 Nodes</span>
            <span className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-tighter">Running</span>
          </div>
        </Card>
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Pending Dispatch</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-black text-white leading-none">5</span>
            <span className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-tighter">Verified</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* LEFT COLUMN (MAIN TELEMTRY) */}
        <div className="lg:col-span-9 space-y-4 overflow-y-auto hide-scrollbar">
          
          {/* MACHINE STATUS WALL */}
          <Card className="p-6 bg-[#071427] border-[#0F2745] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap className="h-4 w-4" /></div>
               <h3 className="text-xs font-black uppercase text-white tracking-[0.3em]">Machine Status Wall</h3>
               <div className="ml-auto flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-[8px] font-bold text-white/30 uppercase">Running</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-[8px] font-bold text-white/30 uppercase">Idle</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-red-500" /><span className="text-[8px] font-bold text-white/30 uppercase">Alert</span></div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {machineStatuses.map(m => (
                 <Card key={m.id} className="p-4 bg-white/5 border-white/5 hover:border-primary/40 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{m.id}</span>
                       <Badge className={cn("text-[7px] font-bold uppercase border-none px-2", m.color.replace('text-', 'bg-') + '/20', m.color)}>{m.status}</Badge>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[8px] font-bold text-white/20 uppercase">Core Yield</span>
                       <span className={cn("text-lg font-display font-black tracking-tight", m.color)}>{m.yield}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className={cn("h-full transition-all duration-1000", m.color.replace('text-', 'bg-'))} style={{ width: `${m.yield}%` }} />
                    </div>
                 </Card>
               ))}
            </div>
          </Card>

          {/* LIVE OPERATIONAL FLOW */}
          <Card className="p-6 bg-[#071427] border-[#0F2745] overflow-hidden">
            <h3 className="text-[9px] font-black uppercase text-white/30 tracking-[0.4em] mb-8">Live Operational Flow</h3>
            <div className="flex justify-between items-center px-2">
               {operationalFlow.map((node, i) => (
                 <div key={node.label} className="flex flex-col items-center gap-3 relative group">
                    <span className="text-xl font-display font-black text-white group-hover:text-primary transition-colors">{node.count}</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{node.label}</span>
                    {i < operationalFlow.length - 1 && (
                      <div className="absolute top-3 left-[calc(100%+10px)] w-8 h-[1px] bg-white/5" />
                    )}
                 </div>
               ))}
            </div>
          </Card>

          {/* FINANCIAL INTELLIGENCE */}
          <Card className="p-8 bg-[#071427] border-[#0F2745] relative overflow-hidden h-[400px] flex flex-col">
             <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Financial Intelligence</h3>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Institutional Liquidity Flow</p>
                </div>
                <div className="flex gap-8">
                   <div className="text-right">
                      <p className="text-[7px] font-bold text-white/20 uppercase mb-1">Receivables</p>
                      <span className="text-xs font-bold text-primary">₹ 84.5L</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[7px] font-bold text-white/20 uppercase mb-1">Accrued</p>
                      <span className="text-xs font-bold text-blue-400">₹ 22.1L</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[7px] font-bold text-white/20 uppercase mb-1">Deficit</p>
                      <span className="text-xs font-bold text-amber-500">₹ 14.8L</span>
                   </div>
                </div>
             </div>
             <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={REVENUE_DATA}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                   <XAxis dataKey="month" hide />
                   <YAxis hide />
                   <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={3} fill="url(#colorRev)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </Card>

        </div>

        {/* RIGHT COLUMN (COMMAND PANELS) */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto hide-scrollbar">
          
          {/* AI INSIGHTS */}
          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6">
             <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">AI Business Insights</h3>
             </div>
             <div className="space-y-3">
                {[
                  "Operational completion dropped by 12% vs last week.",
                  "Aluminum stock will reach critical limit in 3 days.",
                  "3 major accounts have payments overdue > 15 days.",
                  "Production OEE at VMC-02 is exceed 85%."
                ].map((text, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/20 transition-all group flex items-start gap-3">
                     <div className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                     <p className="text-[10px] font-medium text-white/70 leading-relaxed group-hover:text-white">{text}</p>
                  </div>
                ))}
             </div>
          </Card>

          {/* ALERTS */}
          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Bell className="h-4 w-4 text-red-500" />
                   <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Alert Command Center</h3>
                </div>
                <Badge className="bg-red-500 text-white border-none text-[7px] font-black">4 ACTIVE</Badge>
             </div>
             <div className="space-y-3">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                   <p className="text-[9px] font-black text-red-500 uppercase">Machine Breakdown</p>
                   <p className="text-[10px] text-white/60 font-medium">VMC-01 Report: Hydraulic pressure failure. Protocol initiated.</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                   <p className="text-[9px] font-black text-amber-500 uppercase">Delay Analysis</p>
                   <p className="text-[10px] text-white/60 font-medium">WO #8845: Awaiting final QC certification for release.</p>
                </div>
             </div>
          </Card>

          {/* APPROVALS */}
          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6">
             <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Approval Gateway</h3>
             </div>
             <div className="space-y-3">
                {[
                  { label: 'Purchase Requisition', desc: 'MT-011 Steel' },
                  { label: 'Discount Override', desc: 'WO #9012 (Tier-1)' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all">
                     <div>
                        <p className="text-[10px] font-black text-white uppercase">{item.label}</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase mt-0.5">{item.desc}</p>
                     </div>
                     <Button className="h-7 bg-primary text-[#001F3D] font-black uppercase text-[8px] px-3 rounded-lg hover:bg-white transition-all shadow-lg shadow-primary/20">Authorize</Button>
                  </div>
                ))}
             </div>
          </Card>

          {/* ACTIVITY FEED */}
          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6 flex-grow">
             <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Personnel Activity Feed</h3>
             </div>
             <ScrollArea className="h-64">
                <div className="space-y-6 pr-2">
                   {[
                     { user: 'A. Sharma', action: 'Created Quotation #QT-8845', time: '2 mins ago' },
                     { user: 'R. Patil', action: 'Approved Payment REC-121', time: '14 mins ago' },
                     { user: 'Admin', action: 'Modified VMC-01 CAD Drawing', time: '1h ago' },
                     { user: 'System', action: 'Inventory Alerts: Steel (MT-011)', time: '4h ago' },
                     { user: 'System', action: 'Auto-Backup Synchronized', time: '8h ago' },
                   ].map((log, i) => (
                     <div key={i} className="flex gap-4 items-start relative group">
                        <Avatar className="h-8 w-8 border border-white/10">
                           <AvatarFallback className="bg-white/5 text-white/40 text-[9px] font-black">{log.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                           <p className="text-[10px] font-medium text-white/80 leading-snug"><b className="text-white">{log.user}</b> {log.action}</p>
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{log.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </ScrollArea>
          </Card>
        </div>
      </div>

      {/* 03. FOOTER QUICK ACCESS */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 px-1">
        {[
          { label: 'SALES', icon: ShoppingCart },
          { label: 'PURCHASE', icon: Package },
          { label: 'INVENTORY', icon: Box },
          { label: 'PRODUCTION', icon: Factory },
          { label: 'QUALITY', icon: ShieldCheck },
          { label: 'FINANCE', icon: Landmark },
          { label: 'HR', icon: Users },
          { label: 'ADMIN', icon: Settings },
          { label: 'REPORTS', icon: FileText },
          { label: 'USERS', icon: UserCheck },
        ].map(tile => (
          <Card 
            key={tile.label} 
            className="p-3 bg-[#071427] border-[#0F2745] hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group shadow-lg"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors text-white/30 group-hover:text-primary">
               <tile.icon className="h-4 w-4" />
            </div>
            <span className="text-[8px] font-black text-white/20 group-hover:text-white uppercase tracking-[0.2em] transition-colors">{tile.label}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
