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
  Zap,
  Cpu,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-[#001F3D]">
            Command <span className="text-slate-400">Matrix</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8 p-8 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yield Velocity</h4>
            <Badge variant="outline" className="text-[8px] font-bold uppercase">Live_Feed</Badge>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                          <p className="text-xs font-bold">{payload[0].value}% Uptime</p>
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

        <Card className="lg:col-span-4 p-8 bg-[#001F3D] text-white border-none shadow-lg rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={onNavigateToMachine}>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center gap-6">
          <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security Health</p>
            <p className="text-sm font-bold text-[#001F3D] uppercase">Ledger Protocol Active</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center gap-6">
          <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monitoring Threads</p>
            <p className="text-sm font-bold text-[#001F3D] uppercase">{orders.length} Active Jobs</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
