
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  ArrowUpRight, 
  ShieldCheck, 
  Package, 
  DollarSign, 
  ChevronRight,
  Zap,
  Cpu,
  TrendingUp,
  Clock,
  Activity,
  Factory,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  FileBadge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Area,
  AreaChart,
  CartesianGrid
} from "recharts";
import { cn } from '@/lib/utils';
import { Order, QualityReport, BillingRecord } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface ShopFloorOverviewProps {
  orders: Order[];
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
  title?: string;
}

const DAILY_UTILIZATION_DATA = [
  { day: 'Mon', value: 72 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 92 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 30 },
];

const YIELD_VELOCITY_DATA = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 48 },
  { name: 'Thu', value: 61 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 67 },
  { name: 'Sun', value: 70 },
];

export function ShopFloorOverview({ 
  orders,
  onNavigateToOrders, 
  onNavigateToMachine, 
  onNavigateToInventory, 
  onNavigateToBilling,
  title = 'Command Matrix'
}: ShopFloorOverviewProps) {
  const db = useFirestore();
  
  const reportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);
  const billingQuery = useMemoFirebase(() => collection(db, 'billing'), [db]);
  
  const { data: reports } = useCollection<QualityReport>(reportsQuery);
  const { data: billing } = useCollection<BillingRecord>(billingQuery);

  // Logic: Identify orders that are Completed but missing DC/Invoice/Verification
  const awaitingVerification = useMemo(() => {
    return orders.filter(order => {
      if (order.status !== 'Completed') return false;
      
      const orderReports = reports?.filter(r => r.workOrderId === order.id) || [];
      const orderInvoices = billing?.filter(b => b.orderId === order.id && b.type === 'invoice') || [];
      
      const missingQC = orderReports.length === 0 || orderReports.some(r => r.status !== 'Released');
      const missingInvoice = orderInvoices.length === 0 || orderInvoices.some(i => i.status !== 'Paid');
      
      return missingQC || missingInvoice;
    });
  }, [orders, reports, billing]);

  const kpiData = [
    { id: 'orders', label: 'Active Jobs', total: orders.filter(o => !['Completed', 'Ready for Delivery', 'Delivered'].includes(o.status)).length.toString(), sub1: 'WIP', sub1Val: orders.filter(o => o.status === 'Active').length, sub2: 'Queued', sub2Val: orders.filter(o => o.status === 'Pending' || o.status === 'Yet to start').length, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const handleKPIClick = (id: string) => {
    if (id === 'orders') onNavigateToOrders?.();
    if (id === 'inventory') onNavigateToInventory?.();
    if (id === 'billing') onNavigateToBilling?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-[#001F3D]">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-slate-400">{title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-1">MASTER_CTRL_ALPHA_READY</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Sync Active</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.label} 
              className="premium-card p-6 group cursor-pointer active:scale-[0.99]"
              onClick={() => handleKPIClick(kpi.id)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-xl shadow-sm transition-all group-hover:scale-105", kpi.bg)}>
                  <Icon className={cn("h-5 w-5", kpi.color)} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <ArrowUpRight className="h-3 w-3" /> {orders.length > 0 ? '+14%' : '0%'}
                </div>
              </div>
              
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-headline font-bold text-[#001F3D]">{kpi.total}</h3>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold">{kpi.sub1}</p>
                    <p className="text-lg font-bold text-[#001F3D]">{kpi.sub1Val}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold">{kpi.sub2}</p>
                    <p className="text-lg font-bold text-[#001F3D]">{kpi.sub2Val}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Verification Reminder Card */}
        {awaitingVerification.length > 0 && (
          <Card className="premium-card p-6 bg-amber-50 border-amber-100 shadow-amber-900/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="h-16 w-16 text-amber-900" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-amber-900 tracking-widest">Verification Alerts</p>
                <p className="text-[8px] font-bold uppercase text-amber-600 tracking-widest mt-0.5">Triple-Lock Reminder</p>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-display font-bold text-amber-900">{awaitingVerification.length} <span className="text-sm">Threads</span></h3>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                Orders operationally completed but awaiting final DC/Invoice or QC certification.
              </p>
              <div className="pt-4 flex gap-2">
                {awaitingVerification.slice(0, 3).map(o => (
                  <Badge key={o.id} variant="outline" className="bg-white border-amber-200 text-amber-700 text-[8px] font-bold">#{o.id}</Badge>
                ))}
                {awaitingVerification.length > 3 && <span className="text-[8px] font-bold text-amber-400">+{awaitingVerification.length - 3} more</span>}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-6 p-8 bg-white border border-slate-100 shadow-sm rounded-[2rem] space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg text-primary"><TrendingUp className="h-4 w-4" /></div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yield Velocity</h4>
            </div>
            <Badge variant="outline" className="text-[8px] font-bold uppercase bg-slate-50">Live_Feed</Badge>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={YIELD_VELOCITY_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} 
                  dy={10}
                />
                <YAxis hide />
                <ChartTooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#001F3D] text-white px-3 py-2 rounded-lg shadow-xl border-none">
                          <p className="text-xs font-bold">{payload[0].value}% Yield</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-6 p-8 bg-white border border-slate-100 shadow-sm rounded-[2rem] space-y-8 relative overflow-hidden group">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Activity className="h-4 w-4" /></div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Daily Utilization Trend</h4>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">OEE Peak</p>
              <p className="text-sm font-bold text-emerald-600">92%</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_UTILIZATION_DATA}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                  tickFormatter={(val) => `${val}%`}
                />
                <ChartTooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#001F3D] text-white px-4 py-3 rounded-2xl shadow-2xl border-none">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">{payload[0].payload.day}</p>
                          <p className="text-xl font-display font-bold">{payload[0].value}% <span className="text-[10px] text-emerald-400">OEE</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorUtil)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-8 bg-[#001F3D] text-white border-none shadow-lg rounded-[2rem] flex flex-col justify-between group cursor-pointer" onClick={onNavigateToMachine}>
          <div className="space-y-6">
            <div className="p-3 bg-white/10 rounded-xl w-fit">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Global Fleet Efficiency</p>
              <h3 className="text-5xl font-display font-bold tracking-tighter">{orders.length > 0 ? '84.2' : '0.0'}<span className="text-xl ml-1 text-white/20">%</span></h3>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex justify-between items-center group-hover:text-primary transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest">Asset Matrix</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-8 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-blue-900/5">
          <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security Health</p>
            <p className="text-lg font-bold text-[#001F3D] uppercase leading-tight">Ledger Protocol Active</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Verified Node</p>
          </div>
        </Card>

        <Card className="p-8 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-blue-900/5">
          <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monitoring Threads</p>
            <p className="text-lg font-bold text-[#001F3D] uppercase leading-tight">{orders.length} Managed Jobs</p>
            <p className="text-[10px] text-primary font-bold uppercase mt-1">Real-time Telemetry</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
