
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Cpu, 
  BarChart3, 
  PieChart, 
  Activity, 
  ShieldCheck, 
  ShoppingCart, 
  Factory, 
  Receipt, 
  Landmark, 
  Clock, 
  FileText,
  DollarSign,
  Target,
  ArrowUpRight,
  TrendingDown,
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
  Bar,
  BarChart,
  Cell
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyBilling = billing
      .filter(r => r.type === 'invoice' && new Date(r.date).getMonth() === currentMonth && new Date(r.date).getFullYear() === currentYear)
      .reduce((acc, r) => acc + (r.amount || 0), 0);

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

    const healthScore = 94; // Baseline business health

    return { 
      monthlyBilling, 
      outstanding, 
      poValue, 
      openQuotes, 
      activeWOs, 
      pendingDispatch, 
      prodAchievement, 
      machineUtil, 
      healthScore 
    };
  }, [orders, billing, machines]);

  const trends = {
    billing: [
      { name: 'Jan', val: 45 }, { name: 'Feb', val: 52 }, { name: 'Mar', val: metrics.monthlyBilling / 10000 }
    ],
    production: [
      { name: 'W1', val: 70 }, { name: 'W2', val: 85 }, { name: 'W3', val: 78 }, { name: 'W4', val: metrics.prodAchievement }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body pb-20">
      
      {/* 9-NODE EXECUTIVE KPI MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-[#001F3D] text-white border-none shadow-xl flex flex-col justify-between rounded-2xl lg:col-span-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Business Health</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-display font-black text-primary">{metrics.healthScore}%</span>
            <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold">NOMINAL</Badge>
          </div>
        </Card>

        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FINANCIAL ANALYTICS */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="h-5 w-5" /></div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Financial Intelligence</h3>
            </div>
            <Select defaultValue="MTD">
              <SelectTrigger className="w-24 h-8 text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                <SelectItem value="MTD" className="text-[10px] font-bold uppercase">MTD</SelectItem>
                <SelectItem value="YTD" className="text-[10px] font-bold uppercase">YTD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-[250px] w-full">
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
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Collection Rate</p><p className="text-lg font-display font-bold text-emerald-600">92.4%</p></div>
             <div className="text-right space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Avg. Collection Cycle</p><p className="text-lg font-display font-bold text-slate-700">38 Days</p></div>
          </div>
        </Card>

        {/* PRODUCTION ANALYTICS */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Factory className="h-5 w-5" /></div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Production Velocity</h3>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-none text-[8px] font-bold uppercase">Target: 85%</Badge>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.production}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis hide />
                <ChartTooltip />
                <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                  {trends.production.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Current Load</p><p className="text-lg font-display font-bold text-blue-600">78.2%</p></div>
             <div className="text-right space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Projected 30D</p><p className="text-lg font-display font-bold text-slate-700">+12% Growth</p></div>
          </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MACHINE ANALYTICS */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-6">
           <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-5 w-5 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase text-slate-900 tracking-widest">Asset Fleet OEE</h4>
           </div>
           <div className="space-y-6">
              {machines.slice(0, 4).map(m => (
                <div key={m.id} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-slate-500">{m.name}</span>
                      <span className="text-slate-900">{m.load}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${m.load}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </Card>

        {/* QUALITY ANALYTICS */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-6">
           <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase text-slate-900 tracking-widest">Compliance Fidelity</h4>
           </div>
           <div className="h-[180px] w-full flex items-center justify-center relative">
              <div className="text-center">
                 <p className="text-4xl font-display font-black text-emerald-600">96.8%</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pass Rate</p>
              </div>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                 <span className="text-[10px] font-bold text-slate-600 uppercase">First Time Right</span>
                 <span className="text-xs font-bold text-emerald-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                 <span className="text-[10px] font-bold text-slate-600 uppercase">Rework Index</span>
                 <span className="text-xs font-bold text-rose-600">2.1%</span>
              </div>
           </div>
        </Card>

        {/* MANAGEMENT ANALYTICS */}
        <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] space-y-8 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '30px 30px' }} />
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                 <BarChart3 className="h-5 w-5 text-primary" />
                 <h4 className="text-xs font-bold uppercase text-white/60 tracking-widest">Growth Matrix</h4>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/40 uppercase">Customer Retention</p>
                    <p className="text-2xl font-display font-bold">98.2%</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/40 uppercase">Net Margin Trend</p>
                    <div className="flex items-center gap-3">
                       <p className="text-2xl font-display font-bold">24.5%</p>
                       <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] font-bold">+1.2%</Badge>
                    </div>
                 </div>
              </div>
              <Button className="w-full h-12 bg-white text-[#001F3D] hover:bg-primary hover:text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">Download Executive Summary</Button>
           </div>
        </Card>

      </div>
    </div>
  );
}
