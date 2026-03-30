"use client";

import { Card } from '@/components/ui/card';
import { 
  Monitor, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Cell,
  Line,
  LineChart
} from "recharts";
import { cn } from '@/lib/utils';

const kpiData = [
  { label: 'Inventory Assets', total: 71, sub1: 'Active', sub1Val: 25, sub2: 'Standby', sub2Val: 30, icon: Monitor, color: 'text-blue-500' },
  { label: 'Active Orders', total: 50, sub1: 'WIP', sub1Val: 29, sub2: 'Queue', sub2Val: 21, icon: ShoppingCart, color: 'text-purple-500' },
  { label: 'Field Staff', total: 37, sub1: 'On-Shift', sub1Val: 34, sub2: 'Off', sub2Val: 3, icon: Users, color: 'text-orange-500' },
];

const chartData = [
  { name: 'Assembly', ok: 400, warn: 240, error: 100 },
  { name: 'Machining', ok: 300, warn: 139, error: 200 },
  { name: 'Quality', ok: 200, warn: 180, error: 300 },
  { name: 'Logistics', ok: 278, warn: 390, error: 150 },
  { name: 'Design', ok: 189, warn: 480, error: 180 },
];

const trendData = [
  { date: 'Mon', actual: 400, plan: 450 },
  { date: 'Tue', actual: 420, plan: 450 },
  { date: 'Wed', actual: 380, plan: 450 },
  { date: 'Thu', actual: 480, plan: 460 },
  { date: 'Fri', actual: 520, plan: 460 },
  { date: 'Sat', actual: 550, plan: 470 },
  { date: 'Sun', actual: 590, plan: 480 },
];

export function ShopFloorOverview() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-display font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
          Operations <span className="text-muted-foreground font-normal">Summary</span>
        </h2>
        <p className="text-muted-foreground font-medium">Real-time telemetry and resource performance analysis.</p>
      </header>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="glass-card p-8 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-3 bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl">
                  <Icon className={cn("h-6 w-6", kpi.color)} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                  <ArrowUpRight className="h-4 w-4" />
                  +12.5%
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
                <h3 className="text-4xl font-display font-bold tracking-tight mb-6">{kpi.total}</h3>
                
                <div className="flex gap-10 border-t border-black/5 dark:border-white/5 pt-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{kpi.sub1}</p>
                    <p className="text-xl font-bold">{kpi.sub1Val}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{kpi.sub2}</p>
                    <p className="text-xl font-bold">{kpi.sub2Val}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                <Icon className="h-48 w-48" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OEE Gauge Section */}
        <div className="lg:col-span-3 glass-card p-8 flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-primary/10 rounded-full mb-6">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Aggregate OEE</h4>
          <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/[0.03] dark:text-white/[0.05]" />
                <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="300" strokeDashoffset="75" className="text-primary rounded-full" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-bold tracking-tighter">67.4</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1">PERCENT</span>
             </div>
          </div>
          <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
            <Zap className="h-3 w-3" />
            Optimal Performance
          </div>
        </div>

        {/* Performance Bars */}
        <div className="lg:col-span-5 glass-card p-8">
          <header className="flex justify-between items-center mb-10">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Department Load</h4>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">OK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Warn</span>
              </div>
            </div>
          </header>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'currentColor'}} />
                <YAxis hide />
                <ChartTooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-2xl">
                          {payload[0].payload.name}: {payload[0].value} UNITS
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="ok" stackId="a" fill="currentColor" className="text-primary" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="warn" stackId="a" fill="currentColor" className="text-orange-400" barSize={24} />
                <Bar dataKey="error" stackId="a" fill="currentColor" className="text-red-500" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Section */}
        <div className="lg:col-span-4 glass-card p-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-10">Output Velocity</h4>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <ChartTooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{payload[0].payload.date}</p>
                          <p className="text-sm font-bold text-primary">{payload[0].value} UNITS</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="currentColor" 
                  className="text-primary"
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0071E3' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="plan" 
                  stroke="currentColor" 
                  className="text-muted-foreground/20"
                  strokeWidth={2} 
                  strokeDasharray="10 10"
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Critical Status Messages</h4>
          <span className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline">Acknowledge All</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-6 bg-red-500/5 hover:bg-red-500/10 rounded-3xl transition-all group border border-red-500/10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-red-500/20 rounded-2xl text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-tighter">Machine Failure</p>
                <p className="text-sm font-medium opacity-80 mt-0.5">VMC milling-04 (Drive Error)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold opacity-30">12:44 PM</span>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-primary/5 hover:bg-primary/10 rounded-3xl transition-all group border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-primary/20 rounded-2xl text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-tighter">Event Update</p>
                <p className="text-sm font-medium opacity-80 mt-0.5">Maintenance TR-12 Complete</p>
              </div>
            </div>
            <span className="text-[10px] font-bold opacity-30">11:15 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
}