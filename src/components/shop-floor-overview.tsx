"use client";

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
  Activity,
  Zap,
  Cpu,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Cell,
  Area,
  AreaChart
} from "recharts";
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';

interface ShopFloorOverviewProps {
  orders: Order[];
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
}

export function ShopFloorOverview({ 
  orders,
  onNavigateToOrders, 
  onNavigateToMachine, 
  onNavigateToInventory, 
  onNavigateToBilling 
}: ShopFloorOverviewProps) {
  
  const kpiData = [
    { id: 'inventory', label: 'Material Ledger', total: '0', sub1: 'SKUs', sub1Val: 0, sub2: 'Short', sub2Val: 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'billing', label: 'Financial Hub', total: '$0.00', sub1: 'MTD', sub1Val: '$0', sub2: 'Due', sub2Val: '$0', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'orders', label: 'Active Jobs', total: orders.length.toString(), sub1: 'WIP', sub1Val: orders.filter(o => o.status === 'Active').length, sub2: 'Queued', sub2Val: orders.filter(o => o.status === 'Pending').length, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const chartData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 52 },
    { name: 'Wed', value: 48 },
    { name: 'Thu', value: 61 },
    { name: 'Fri', value: 55 },
    { name: 'Sat', value: 67 },
    { name: 'Sun', value: 70 },
  ];

  const handleKPIClick = (id: string) => {
    if (id === 'orders') onNavigateToOrders?.();
    if (id === 'inventory') onNavigateToInventory?.();
    if (id === 'billing') onNavigateToBilling?.();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
            <Zap className="h-4 w-4 fill-primary" />
            Live Plant Intelligence
          </div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-[#0f172a]">
            Command <span className="text-slate-400 font-medium">Matrix</span>
          </h2>
          <p className="text-slate-500 font-medium text-xs tracking-tight">System Telemetry v2.4.0 • Node: MASTER_CTRL</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Network Online</span>
          </div>
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 gap-2 font-bold text-[10px] uppercase tracking-widest shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary" /> Audit Secure
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.label} 
              className="p-8 group relative cursor-pointer active:scale-[0.98] transition-all border-none bg-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden"
              onClick={() => handleKPIClick(kpi.id)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", kpi.bg)}>
                  <Icon className={cn("h-6 w-6", kpi.color)} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                  <ArrowUpRight className="h-3.5 w-3.5" /> {orders.length > 0 ? '+12.5%' : '0%'}
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-2">{kpi.label}</p>
                <h3 className="text-4xl font-headline font-bold tracking-tighter text-[#0f172a]">{kpi.total}</h3>
                
                <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{kpi.sub1}</p>
                    <p className="text-lg font-bold text-[#0f172a]">{kpi.sub1Val}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{kpi.sub2}</p>
                    <p className="text-lg font-bold text-[#0f172a]">{kpi.sub2Val}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-10 bg-white border-none shadow-2xl shadow-slate-200/40 rounded-[3rem] space-y-10 group">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Throughput Velocity</h4>
              </div>
              <p className="text-2xl font-bold tracking-tight text-[#0f172a]">Operational Productivity</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold px-4 py-1.5 rounded-full">REAL_TIME</Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-400 text-[9px] font-bold px-4 py-1.5 rounded-full">7D_WINDOW</Badge>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                  dy={15}
                />
                <YAxis hide />
                <ChartTooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{payload[0].payload.name}</p>
                          <p className="text-xl font-headline font-bold">{payload[0].value}% <span className="text-[10px] text-emerald-400">UP</span></p>
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
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-10 bg-primary text-white border-none shadow-2xl shadow-primary/30 rounded-[3rem] flex flex-col justify-between relative overflow-hidden group cursor-pointer" onClick={onNavigateToMachine}>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <header className="flex justify-between items-center mb-12">
              <div className="p-3 bg-white/20 backdrop-blur-lg rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge className="bg-white text-primary border-none text-[9px] font-bold tracking-widest px-4 py-1">OEE_INDEX</Badge>
            </header>
            
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">Fleet Efficiency</p>
              <h3 className="text-6xl font-headline font-bold tracking-tighter">{orders.length > 0 ? '84.2' : '0.0'}<span className="text-xl ml-1 text-white/40">%</span></h3>
              <p className="text-xs font-medium text-white/70 leading-relaxed max-w-[200px]">
                Global operational performance across all active production nodes.
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-10 border-t border-white/10 relative z-10">
            <div className="flex justify-between items-center group/btn" onClick={(e) => { e.stopPropagation(); onNavigateToMachine?.(); }}>
              <span className="text-[10px] font-bold uppercase tracking-widest">Asset Telemetry</span>
              <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-primary transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] flex items-center gap-6 group hover:translate-y-[-4px] transition-transform">
          <div className="h-16 w-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/5 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Health</p>
            <p className="text-lg font-bold text-[#0f172a]">Ledger Protocol Active</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-slate-500 font-medium">All financial nodes synchronized</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] flex items-center gap-6 group hover:translate-y-[-4px] transition-transform">
          <div className="h-16 w-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-500 shrink-0 shadow-lg shadow-amber-500/5 group-hover:scale-110 transition-transform">
            <Clock className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime Telemetry</p>
            <p className="text-lg font-bold text-[#0f172a]">99.9% Production Stability</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-medium">Monitoring {orders.length} production threads</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}