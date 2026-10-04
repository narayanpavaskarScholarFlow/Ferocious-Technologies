
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

  // Access Matrix Permission Evaluator
  const getPerm = (nodeId: string): PermissionLevel => {
    if (isMasterAdmin) return 'full';
    return permissions[nodeId] || 'none';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-body">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            Command Center Hub
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900 uppercase">
            Master <span className="text-blue-600">Dashboard</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Real-time institutional performance summary.</p>
        </div>
        
        {getPerm('dash-health') !== 'none' && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold text-[10px] h-10 px-6 uppercase tracking-widest rounded-xl shadow-sm">
              Status: Protocol Nominal
            </Badge>
          </div>
        )}
      </header>

      {/* PRIMARY KPI ROW: Controlled by Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getPerm('dash-po') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer PO Value</p>
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingCart className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-slate-900">₹ {(metrics.customerPOValue / 100000).toFixed(1)}L</span>
            <p className="text-[10px] text-blue-600 font-bold mt-4 uppercase">Authorized Nodes</p>
          </Card>
        )}

        {getPerm('dash-outstanding') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-red-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
               <div className="p-2 bg-red-50 rounded-lg text-red-600"><Landmark className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-red-600">₹ {(metrics.outstanding / 100000).toFixed(1)}L</span>
            <p className="text-[10px] text-red-400 font-bold mt-4 uppercase">Receivables Yield</p>
          </Card>
        )}

        {getPerm('dash-billing') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</p>
               <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Receipt className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-slate-900">{metrics.pendingInvoices}</span>
            <p className="text-[10px] text-amber-600 font-bold mt-4 uppercase">Awaiting Certification</p>
          </Card>
        )}

        {getPerm('dash-production') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Velocity</p>
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Factory className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-emerald-600">{metrics.prodAchievement}%</span>
            <p className="text-[10px] text-emerald-600 font-bold mt-4 uppercase">Target Achievement</p>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {getPerm('dash-machine') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Cpu className="h-6 w-6" /></div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase">Operational Asset Summary</h3>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {machineStatuses.map(m => (
                   <div key={m.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 group">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[10px] font-bold text-slate-400 uppercase font-code">{m.id}</span>
                         <div className={cn("h-2 w-2 rounded-full", m.status === 'active' || m.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-300')} />
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-sm font-bold text-slate-700 uppercase truncate">{m.name}</h4>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold uppercase">
                               <span className="text-slate-400">OEE Yield</span>
                               <span className={m.color}>{m.yield}%</span>
                            </div>
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                               <div className={cn("h-full transition-all duration-1000", m.status === 'active' || m.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-300')} style={{ width: `${m.yield}%` }} />
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          {getPerm('dash-ai') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
               <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">AI Intelligence</h3>
               </div>
               <div className="space-y-4">
                  {[
                    `Monthly billing at ₹${(metrics.monthlyBilling / 100000).toFixed(1)}L. Track against target.`,
                    "Asset OEE has improved by 4.2% across VMC nodes.",
                    "Receivables alert: 4 Tier-1 invoices approaching limit."
                  ].map((text, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                       <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                       <p className="text-xs font-medium text-slate-600 leading-relaxed">{text}</p>
                    </div>
                  ))}
               </div>
            </Card>
          )}

          {getPerm('dash-approvals') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">Certification Gateway</h3>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 uppercase">Invoice Release</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">WO #1002 — Verified</p>
                     </div>
                     {getPerm('auth-invoice') !== 'none' && (
                        <Button size="sm" className="bg-blue-600 text-white font-bold uppercase text-[9px] px-4 rounded-lg">Authorize</Button>
                     )}
                  </div>
               </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
