
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Cpu, 
  BrainCircuit, 
  Bell, 
  UserCheck, 
  Box, 
  ShoppingCart,
  Factory,
  ShieldCheck,
  PackageCheck,
  Receipt,
  Landmark,
  Users,
  Settings,
  FileText,
  History,
  Zap,
  Activity
} from 'lucide-react';
import { Order, Machine, QualityReport, WorkLogEntry, InventoryItem, BillingRecord, PermissionLevel } from '@/lib/types';
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
  permissions: Record<string, PermissionLevel>;
  isMasterAdmin?: boolean;
}

export function ShopFloorOverview({ orders, reports, logs, machines, inventory, billing, permissions, isMasterAdmin }: ShopFloorOverviewProps) {
  
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
      color: m.status === 'Running' || m.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
    }));
  }, [machines]);

  const hasAccess = (nodeId: string) => {
    if (isMasterAdmin) return 'full';
    return permissions[nodeId] || 'none';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-body">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            ERP Control Center
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900 uppercase">
            Executive <span className="text-blue-600">Dashboard</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Authoritative performance summary and business overview.</p>
        </div>
        
        {hasAccess('dash-health') !== 'none' && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold text-[10px] h-10 px-6 uppercase tracking-widest rounded-xl shadow-sm">
              Status: System Nominal
            </Badge>
          </div>
        )}
      </header>

      {/* PRIMARY KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasAccess('dash-po') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer PO Value</p>
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingCart className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-slate-900">₹ {(metrics.customerPOValue / 100000).toFixed(1)}L</span>
            </div>
            <p className="text-[10px] text-blue-600 font-bold mt-4 uppercase flex items-center gap-1.5">
               <TrendingUp className="h-3 w-3" /> Validated Nodes
            </p>
          </Card>
        )}

        {hasAccess('dash-outstanding') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-red-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Collection</p>
               <div className="p-2 bg-red-50 rounded-lg text-red-600"><Landmark className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-red-600">₹ {(metrics.outstanding / 100000).toFixed(1)}L</span>
            </div>
            <p className="text-[10px] text-red-400 font-bold mt-4 uppercase">Receivables Pipeline</p>
          </Card>
        )}

        {hasAccess('dash-billing') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</p>
               <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Receipt className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-slate-900">{metrics.pendingInvoices}</span>
              <span className="text-xs font-bold text-slate-400 mb-1">Nodes</span>
            </div>
            <p className="text-[10px] text-amber-600 font-bold mt-4 uppercase">Requires Authorization</p>
          </Card>
        )}

        {hasAccess('dash-production') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Achievement</p>
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Factory className="h-4 w-4" /></div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-emerald-600">{metrics.prodAchievement}%</span>
              <span className="text-xs font-bold text-slate-400 mb-1">Yield</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-4 uppercase flex items-center gap-1.5">
               <TrendingUp className="h-3 w-3" /> Target Performance
            </p>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {hasAccess('dash-machine') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Cpu className="h-6 w-6" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 uppercase">Operational Asset Summary</h3>
                      <p className="text-xs text-slate-400">Live telemetry from plant floor nodes.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-slate-500 uppercase">Running</span></div>
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-slate-300" /><span className="text-[9px] font-bold text-slate-500 uppercase">Idle</span></div>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {machineStatuses.map(m => (
                   <div key={m.id} className="p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all bg-slate-50/50 group">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.id}</span>
                         <div className={cn("h-2 w-2 rounded-full", m.status === 'active' || m.status === 'Running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-300')} />
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-sm font-bold text-slate-700 uppercase truncate">{m.name}</h4>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold uppercase">
                               <span className="text-slate-400">OEE Yield</span>
                               <span className={m.color}>{m.yield}%</span>
                            </div>
                            <div className="h-1.5 bg-white border border-slate-100 rounded-full overflow-hidden">
                               <div className={cn("h-full transition-all duration-1000", m.status === 'active' || m.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-300')} style={{ width: `${m.yield}%` }} />
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </Card>
          )}

          {hasAccess('dash-flow') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm h-[400px] flex flex-col">
               <div className="flex justify-between items-start mb-10">
                  <div>
                     <h3 className="text-xl font-display font-bold text-slate-900 uppercase">Revenue & Collection Trends</h3>
                     <p className="text-xs text-slate-400 mt-1">MTD Financial Performance Analysis</p>
                  </div>
                  <Button variant="outline" className="rounded-xl font-bold uppercase text-[9px] tracking-widest gap-2">
                     <History className="h-3.5 w-3.5" /> Full Analysis
                  </Button>
               </div>
               <div className="flex-1 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis hide />
                     <YAxis hide />
                     <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.05} />
                   </AreaChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 text-slate-300">
                    <TrendingUp className="h-20 w-20 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Historical Data Sync Active</p>
                 </div>
               </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          
          {hasAccess('dash-ai') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
               <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">AI Business Insights</h3>
               </div>
               <div className="space-y-4">
                  {[
                    `Monthly billing at ₹${(metrics.monthlyBilling / 100000).toFixed(1)}L. Track against target.`,
                    "Machine OEE has improved by 4.2% across VMC nodes.",
                    "Receivables alert: 4 Tier-1 invoices approaching limit.",
                    "Suggested: Review inventory levels for Alloy Steel."
                  ].map((text, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group flex items-start gap-4">
                       <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                       <p className="text-xs font-medium text-slate-600 leading-relaxed group-hover:text-slate-900">{text}</p>
                    </div>
                  ))}
               </div>
            </Card>
          )}

          {hasAccess('dash-alerts') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Bell className="h-5 w-5 text-red-600" />
                     <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">System Alerts</h3>
                  </div>
                  <Badge className="bg-red-50 text-red-600 border-red-100 text-[8px] font-bold">CRITICAL</Badge>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-1">
                     <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">Machine Halt Detected</p>
                     <p className="text-xs text-red-700/70 font-medium">Node TR-MC-001 (VMC Haas) reporting spindle vibration.</p>
                  </div>
               </div>
            </Card>
          )}

          {hasAccess('dash-approvals') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">Approval Gateway</h3>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-blue-200 transition-all">
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 uppercase">Invoice Release</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">WO #1002 — Verified</p>
                     </div>
                     {hasAccess('approve-invoice') !== 'none' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[9px] px-4 rounded-lg shadow-sm">Authorize</Button>
                     )}
                  </div>
               </div>
            </Card>
          )}

          {hasAccess('dash-personnel') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-6 flex-grow">
               <div className="flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-blue-600" />
                  <h3 className="text-[10px] font-bold uppercase text-slate-900 tracking-widest">Personnel Feed</h3>
               </div>
               <ScrollArea className="h-64">
                  <div className="space-y-6 pr-2">
                     {logs.slice(0, 8).map((log, i) => (
                       <div key={i} className="flex gap-4 items-start relative group">
                          <Avatar className="h-8 w-8 border border-slate-100">
                             <AvatarFallback className="bg-slate-50 text-slate-400 text-[9px] font-black">{log.operator[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                             <p className="text-[10px] font-medium text-slate-600 leading-snug"><b className="text-slate-900">{log.operator}</b> {log.activity}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{log.date}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
