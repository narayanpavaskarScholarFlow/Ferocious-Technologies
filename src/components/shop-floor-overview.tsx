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
  Zap,
  Package,
  TrendingUp,
  DollarSign,
  ShieldCheck
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
  LineChart,
  Area,
  AreaChart
} from "recharts";
import { cn } from '@/lib/utils';

const kpiData = [
  { id: 'inventory', label: 'Inventory Ledger', total: '1,244', sub1: 'SKUs Active', sub1Val: 89, sub2: 'Shortage', sub2Val: 12, icon: Package, color: 'text-blue-500' },
  { id: 'billing', label: 'Revenue Pipeline', total: '$42,350', sub1: 'Paid MTD', sub1Val: '$11K', sub2: 'Pending', sub2Val: '$5.6K', icon: DollarSign, color: 'text-green-500' },
  { id: 'orders', label: 'Production Load', total: '50', sub1: 'WIP Units', sub1Val: 29, sub2: 'In Queue', sub2Val: 21, icon: ShoppingCart, color: 'text-primary' },
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

interface ShopFloorOverviewProps {
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
}

export function ShopFloorOverview({ onNavigateToOrders, onNavigateToMachine }: ShopFloorOverviewProps) {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.25em]">
            <TrendingUp className="h-4 w-4" />
            Live Plant Intelligence
          </div>
          <h2 className="text-5xl font-display font-bold tracking-tighter text-[#1D1D1F]">
            Command <span className="text-muted-foreground font-normal">Center</span>
          </h2>
          <p className="text-muted-foreground font-medium text-lg">Integrated Industrial 2.0 ERP Telemetry.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-green-500/5 rounded-full border border-green-500/10 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Network Operational</span>
          </div>
          <div className="px-6 py-3 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Audit Verified</span>
          </div>
        </div>
      </header>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.label} 
              className="glass-card p-10 group relative overflow-hidden cursor-pointer"
              onClick={kpi.id === 'orders' ? onNavigateToOrders : undefined}
            >
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="p-4 bg-black/[0.03] rounded-2xl group-hover:bg-primary/5 transition-colors">
                  <Icon className={cn("h-7 w-7", kpi.color)} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                  <ArrowUpRight className="h-4 w-4" />
                  +12.5%
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">{kpi.label}</p>
                <h3 className="text-5xl font-display font-bold tracking-tight mb-8">{kpi.total}</h3>
                
                <div className="flex gap-12 border-t border-black/5 pt-8">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{kpi.sub1}</p>
                    <p className="text-2xl font-bold">{kpi.sub1Val}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{kpi.sub2}</p>
                    <p className="text-2xl font-bold">{kpi.sub2Val}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                <Icon className="h-64 w-64" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OEE Gauge Section */}
        <div 
          className="lg:col-span-4 glass-card p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
          onClick={onNavigateToMachine}
        >
          <header className="w-full flex justify-between items-center mb-10">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Fleet OEE Index</h4>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold px-3">Real-time</Badge>
          </header>
          
          <div className="relative w-full aspect-square max-w-[260px] flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-black/[0.03]" />
                <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="300" strokeDashoffset="75" className="text-primary rounded-full drop-shadow-[0_0_15px_rgba(0,113,227,0.3)]" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-display font-bold tracking-tighter">84.2</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] mt-2">PERCENT</span>
             </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 w-full border-t border-black/5 pt-10">
            <div className="text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Availability</p>
              <p className="text-xl font-bold">92%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Performance</p>
              <p className="text-xl font-bold">88%</p>
            </div>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="lg:col-span-8 glass-card p-10">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1">Functional Stability</h4>
              <p className="text-2xl font-bold tracking-tight">Load Balancing Matrix</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Stable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Review</span>
              </div>
            </div>
          </header>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#A1A1A6'}} />
                <YAxis hide />
                <ChartTooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10">
                          <p className="uppercase tracking-widest text-white/50 mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg">{payload[0].value} UNITS</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="ok" stackId="a" fill="#0071E3" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="warn" stackId="a" fill="#F59E0B" barSize={32} />
                <Bar dataKey="error" stackId="a" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Section */}
        <div className="lg:col-span-7 glass-card p-10">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1">Production Velocity</h4>
              <p className="text-2xl font-bold tracking-tight">Output vs Goal</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-green-500 uppercase">+4.2% Above Target</p>
            </div>
          </header>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071E3" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#A1A1A6'}} />
                <YAxis hide />
                <ChartTooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-black/5 p-4 rounded-2xl shadow-2xl flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{payload[0].payload.date}</p>
                          <p className="text-lg font-bold text-primary">{payload[0].value} UNITS</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#0071E3" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorActual)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#0071E3' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="plan" 
                  stroke="#E5E7EB" 
                  strokeWidth={2} 
                  strokeDasharray="8 8"
                  dot={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Allocation Summary */}
        <div className="lg:col-span-5 glass-card p-10 flex flex-col justify-between">
          <header className="mb-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1">Network Capacity</h4>
            <p className="text-2xl font-bold tracking-tight">Active Nodes</p>
          </header>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Milling Centers</span>
                <span className="text-sm font-bold">5 / 6 Active</span>
              </div>
              <div className="h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[83%] rounded-full" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">QC Specialists</span>
                <span className="text-sm font-bold">12 / 12 Active</span>
              </div>
              <div className="h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Logistics Fleet</span>
                <span className="text-sm font-bold">8 / 10 Active</span>
              </div>
              <div className="h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[80%] rounded-full" />
              </div>
            </div>
          </div>

          <button className="mt-10 w-full py-4 bg-black text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Analyze Resource Distribution
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="glass-card p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1">Status Notifications</h4>
            <p className="text-xl font-bold tracking-tight">Industrial Event Log</p>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline tracking-widest">Acknowledge All</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-8 bg-red-500/5 hover:bg-red-500/10 rounded-3xl transition-all group border border-red-500/10">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 flex items-center justify-center bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Machine Failure</p>
                <p className="text-lg font-bold text-red-900">VMC milling-04 (Drive Error)</p>
                <p className="text-xs text-red-700/60 mt-1">Impact: Production Order #105542</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-red-400 font-code uppercase">12:44 PM</span>
          </div>
          
          <div className="flex items-center justify-between p-8 bg-primary/5 hover:bg-primary/10 rounded-3xl transition-all group border border-primary/10">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 flex items-center justify-center bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Network Audit</p>
                <p className="text-lg font-bold text-primary-900">ERP Ledger Integrity Verified</p>
                <p className="text-xs text-primary/60 mt-1">Source: Security Governance Node</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary/30 font-code uppercase">11:15 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
