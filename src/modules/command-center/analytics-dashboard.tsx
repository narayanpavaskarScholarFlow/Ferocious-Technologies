"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Cpu, 
  Factory, 
  Landmark, 
  ShoppingCart, 
  Target, 
  FileText,
  PackageCheck
} from 'lucide-react';
import { 
  Order, 
  Machine, 
  QualityReport, 
  WorkLogEntry, 
  BillingRecord, 
  SystemUser 
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip,
} from 'recharts';

interface AnalyticsDashboardProps {
  orders: Order[];
  billing: BillingRecord[];
  reports: QualityReport[];
  logs: WorkLogEntry[];
  machines: Machine[];
  users: SystemUser[];
}

export function AnalyticsDashboard({ orders, billing, reports, logs, machines, users }: AnalyticsDashboardProps) {
  
  const metrics = useMemo(() => {
    const invoices = billing.filter(r => r.type === 'invoice');
    const monthlyBilling = invoices.reduce((acc, r) => acc + (r.amount || 0), 0);

    const totalInvoiced = billing.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayments = billing.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalPayments;

    const poValue = billing.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const openQuotes = billing.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    
    const activeWOs = orders.filter(o => ['Production', 'Active', 'Planning'].includes(o.status)).length;
    const pendingDispatch = orders.filter(o => o.status === 'Ready for Delivery' || o.status === 'Inspection').length;

    const prodAchievement = orders.length > 0 
      ? Math.round(orders.reduce((acc, o) => acc + (o.progress || 0), 0) / orders.length)
      : 0;

    const machineUtil = machines.length > 0
      ? Math.round(machines.reduce((acc, m) => acc + (m.load || 0), 0) / machines.length)
      : 0;

    return { 
      monthlyBilling, 
      outstanding, 
      poValue, 
      openQuotes, 
      activeWOs, 
      pendingDispatch, 
      prodAchievement, 
      machineUtil, 
    };
  }, [orders, billing, machines]);

  // Cleared trend data for fresh installation
  const trends = {
    billing: [],
    production: []
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        {[
          { label: 'Monthly Billing', val: `₹ ${(metrics.monthlyBilling / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Outstanding', val: `₹ ${(metrics.outstanding / 100000).toFixed(1)}L`, icon: Landmark, color: 'text-rose-600' },
          { label: 'Customer PO Value', val: `₹ ${(metrics.poValue / 100000).toFixed(1)}L`, icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Open Quotations', val: metrics.openQuotes, icon: FileText, color: 'text-amber-600' },
          { label: 'Active Work Orders', val: metrics.activeWOs, icon: Factory, color: 'text-indigo-600' },
          { label: 'Pending Dispatch', val: metrics.pendingDispatch, icon: PackageCheck, color: 'text-emerald-500' },
          { label: 'Production Yield', val: `${metrics.prodAchievement}%`, icon: Target, color: 'text-primary' },
          { label: 'Machine OEE', val: `${metrics.machineUtil}%`, icon: Cpu, color: 'text-blue-500' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
              <kpi.icon className={cn("h-3 w-3", kpi.color)} />
            </div>
            <p className={cn("text-lg font-display font-black", kpi.color)}>{kpi.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Financial Performance</h3>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            {trends.billing.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.billing}>
                  <defs>
                    <linearGradient id="colorBill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis hide />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fill="url(#colorBill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No historical metrics</p>
            )}
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Factory className="h-5 w-5" /></div>
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Production Velocity</h3>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center text-center opacity-20">
             <div className="space-y-4">
                <Factory className="h-10 w-10 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Yield Data</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}