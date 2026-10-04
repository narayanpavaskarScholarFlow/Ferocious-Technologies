
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
  ChevronRight, 
  History, 
  ShoppingCart,
  Factory,
  ShieldCheck,
  PackageCheck,
  Receipt,
  Landmark,
  Users,
  Settings,
  FileText,
  DollarSign
} from 'lucide-react';
import { Order, Machine, QualityReport, WorkLogEntry, InventoryItem, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts';
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

export function ShopFloorOverview({ orders, reports, logs, machines, inventory, billing }: ShopFloorOverviewProps) {
  
  // REAL-TIME DATA BINDING V3
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyBilling = billing
      .filter(r => r.type === 'invoice' && new Date(r.date).getMonth() === currentMonth && new Date(r.date).getFullYear() === currentYear)
      .reduce((acc, r) => acc + (r.amount || 0), 0);

    const customerPOValue = billing
      .filter(r => r.type === 'purchase_order')
      .reduce((acc, r) => acc + (r.amount || 0), 0);

    const openQuotations = billing.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    const activeWorkOrders = orders.filter(o => o.status === 'Production' || o.status === 'Active').length;
    const pendingDispatch = orders.filter(o => o.status === 'Inspection' || o.status === 'Ready for Delivery').length;

    const totalInvoiced = billing.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayments = billing.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalPayments;

    const pendingInvoices = billing.filter(r => r.type === 'invoice' && r.status === 'Pending').length;
    const pendingPayments = billing.filter(r => r.type === 'purchase_invoice' && r.status === 'Pending').length;

    const prodAchievement = orders.length > 0 
      ? Math.round(orders.reduce((acc, o) => acc + (o.progress || 0), 0) / orders.length)
      : 0;

    const machineUtil = machines.length > 0
      ? Math.round(machines.reduce((acc, m) => acc + (m.load || 0), 0) / machines.length)
      : 0;

    return { 
      monthlyBilling, 
      customerPOValue, 
      openQuotations, 
      activeWorkOrders, 
      pendingDispatch, 
      outstanding, 
      prodAchievement,
      machineUtil,
      pendingInvoices,
      pendingPayments
    };
  }, [orders, billing, machines]);

  const machineStatuses = useMemo(() => {
    return machines.slice(0, 6).map(m => ({
      id: m.mcNumber || m.id,
      name: m.name,
      status: m.status,
      yield: m.load,
      color: m.status === 'Running' || m.status === 'active' ? 'text-emerald-400' : 'text-amber-500'
    }));
  }, [machines]);

  const operationalFlow = [
    { label: 'ENQUIRY', count: billing.filter(r => r.type === 'enquiry').length || 0 },
    { label: 'QUOTATION', count: billing.filter(r => r.type === 'quotation').length || 0 },
    { label: 'SALES ORDER', count: billing.filter(r => r.type === 'sale_order').length || 0 },
    { label: 'PRODUCTION', count: orders.filter(o => o.status === 'Production' || o.status === 'Active').length || 0 },
    { label: 'INSPECTION', count: reports.filter(r => r.status === 'Review Pending').length || 0 },
    { label: 'DISPATCH', count: orders.filter(o => o.status === 'Ready for Delivery').length || 0 },
    { label: 'INVOICE', count: billing.filter(r => r.type === 'invoice').length || 0 },
    { label: 'PAYMENT', count: billing.filter(r => r.type === 'inward_payment').length || 0 },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 bg-[#020617] text-white min-h-screen p-2 font-body">
      
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
                  { label: 'OEE', val: metrics.machineUtil, color: 'bg-primary' },
                  { label: 'PROD', val: metrics.prodAchievement, color: 'bg-primary' },
                  { label: 'INV', val: 78, color: 'bg-primary' },
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1">
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Monthly Billing</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-display font-black text-white leading-none">₹ {(metrics.monthlyBilling / 100000).toFixed(1)}L</span>
            <span className="text-[8px] font-bold text-primary mb-1 uppercase tracking-tighter">MTD Sync</span>
          </div>
        </Card>
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Customer PO Value</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-display font-black text-white leading-none">₹ {(metrics.customerPOValue / 100000).toFixed(1)}L</span>
            <span className="text-[10px] font-bold text-primary mb-1 uppercase tracking-tighter">Authorized</span>
          </div>
        </Card>
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Outstanding Collection</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-display font-black text-rose-500 leading-none">₹ {(metrics.outstanding / 100000).toFixed(1)}L</span>
            <span className="text-[10px] font-bold text-rose-400/40 mb-1 uppercase tracking-tighter">Receivables</span>
          </div>
        </Card>
        <Card className="p-6 bg-[#071427] border-[#0F2745] shadow-xl hover:border-primary/20 transition-all">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Production Achievement</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-black text-white leading-none">{metrics.prodAchievement}%</span>
            <span className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-tighter">Velocity</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 px-1">
        {[
          { label: 'Pending Invoices', val: metrics.pendingInvoices, icon: Receipt, color: 'text-orange-500' },
          { label: 'Pending Payments', val: metrics.pendingPayments, icon: Landmark, color: 'text-blue-500' },
          { label: 'Open Quotations', val: metrics.openQuotations, icon: FileText, color: 'text-primary' },
          { label: 'Active Work Orders', val: metrics.activeWorkOrders, icon: ShoppingCart, color: 'text-emerald-500' },
          { label: 'Pending Dispatch', val: metrics.pendingDispatch, icon: PackageCheck, color: 'text-amber-500' },
          { label: 'Machine OEE', val: `${metrics.machineUtil}%`, icon: Cpu, color: 'text-primary' },
        ].map(item => (
          <Card key={item.label} className="p-4 bg-[#071427] border-[#0F2745] flex items-center justify-between group hover:border-white/10">
            <div className="space-y-1">
              <p className="text-[7px] font-black text-white/30 uppercase tracking-widest">{item.label}</p>
              <p className={cn("text-xl font-display font-black", item.color)}>{item.val}</p>
            </div>
            <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-white transition-colors">
              <item.icon className="h-4 w-4" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        <div className="lg:col-span-9 space-y-4 overflow-y-auto hide-scrollbar">
          
          <Card className="p-6 bg-[#071427] border-[#0F2745] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap className="h-4 w-4" /></div>
               <h3 className="text-xs font-black uppercase text-white tracking-[0.3em]">Machine Status Wall</h3>
               <div className="ml-auto flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /><span className="text-[8px] font-bold text-white/30 uppercase">Running</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-[8px] font-bold text-white/30 uppercase">Idle</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-red-500" /><span className="text-[8px] font-bold text-white/30 uppercase">Breakdown</span></div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {machineStatuses.map(m => (
                 <Card key={m.id} className="p-4 bg-white/5 border-white/5 hover:border-primary/40 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-10px font-bold text-white/40 uppercase tracking-widest">{m.id}</span>
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

          <Card className="p-8 bg-[#071427] border-[#0F2745] relative overflow-hidden h-[400px] flex flex-col">
             <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Financial Intelligence</h3>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">Institutional Liquidity Matrix</p>
                </div>
                <div className="flex gap-8">
                   <div className="text-right">
                      <p className="text-[7px] font-bold text-white/20 uppercase mb-1">Customer POs</p>
                      <span className="text-xs font-bold text-primary">₹ {(metrics.customerPOValue / 100000).toFixed(1)}L</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[7px] font-bold text-white/20 uppercase mb-1">Outstanding</p>
                      <span className="text-xs font-bold text-rose-500">₹ {(metrics.outstanding / 100000).toFixed(1)}L</span>
                   </div>
                </div>
             </div>
             <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[]}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#00E5A8" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                   <XAxis hide />
                   <YAxis hide />
                   <Area type="monotone" dataKey="val" stroke="#00E5A8" strokeWidth={3} fill="url(#colorRev)" />
                 </AreaChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <TrendingUp className="h-32 w-32" />
               </div>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4 overflow-y-auto hide-scrollbar">
          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6">
             <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">AI Business Insights</h3>
             </div>
             <div className="space-y-3">
                {[
                  `Monthly billing target: ₹${(metrics.monthlyBilling / 100000).toFixed(1)}L archived.`,
                  "Inventory nodes projected to reach critical levels in 4 days.",
                  `${metrics.activeWorkOrders} active threads requiring baseline yield sync.`,
                  "Asset under-utilization detected on GRINDING-01 node."
                ].map((text, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/20 transition-all group flex items-start gap-3">
                     <div className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                     <p className="text-[10px] font-medium text-white/70 leading-relaxed group-hover:text-white">{text}</p>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Bell className="h-4 w-4 text-red-500" />
                   <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Alert Command</h3>
                </div>
                <Badge className="bg-red-500 text-white border-none text-[7px] font-black">ACTIVE</Badge>
             </div>
             <div className="space-y-3">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                   <p className="text-[9px] font-black text-red-500 uppercase">Production Halt</p>
                   <p className="text-[10px] text-white/60 font-medium">Machine Matrix Offline: CNC-01 (Power Node).</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                   <p className="text-[9px] font-black text-amber-500 uppercase">Critical Outstanding</p>
                   <p className="text-[10px] text-white/60 font-medium">3 Tier-1 accounts overdue &gt; 30 days.</p>
                </div>
             </div>
          </Card>

          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6">
             <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Approval Gateway</h3>
             </div>
             <div className="space-y-3">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group">
                   <div>
                      <p className="text-[10px] font-black text-white uppercase">Invoice Release</p>
                      <p className="text-[9px] text-white/40 font-bold uppercase mt-0.5">WO #9012 (Verified)</p>
                   </div>
                   <Button className="h-7 bg-primary text-[#001F3D] font-black uppercase text-[8px] px-3 rounded-lg hover:bg-white transition-all shadow-lg shadow-primary/20">Authorize</Button>
                </div>
             </div>
          </Card>

          <Card className="p-6 bg-[#071427] border-[#0F2745] space-y-6 flex-grow">
             <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Personnel Feed</h3>
             </div>
             <ScrollArea className="h-64">
                <div className="space-y-6 pr-2">
                   {logs.slice(0, 8).map((log, i) => (
                     <div key={i} className="flex gap-4 items-start relative group">
                        <Avatar className="h-8 w-8 border border-white/10">
                           <AvatarFallback className="bg-white/5 text-white/40 text-[9px] font-black">{log.operator[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                           <p className="text-[10px] font-medium text-white/80 leading-snug"><b className="text-white">{log.operator}</b> {log.activity}</p>
                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{log.date}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </ScrollArea>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 px-1 pb-4">
        {[
          { label: 'SALES', icon: ShoppingCart },
          { label: 'PURCHASE', icon: Box },
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
