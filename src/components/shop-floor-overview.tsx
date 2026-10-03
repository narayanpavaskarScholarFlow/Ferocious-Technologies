"use client";

import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  ArrowUpRight, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  Cpu,
  TrendingUp,
  Clock,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Factory,
  LineChart as LineChartIcon,
  Archive,
  ArrowRight,
  ClipboardCheck,
  Building2,
  Users,
  Target,
  FileText,
  BrainCircuit,
  MessageSquare,
  Lock,
  History,
  Box,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Globe,
  Database,
  RefreshCw,
  FileBox,
  Truck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  Area,
  AreaChart,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
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

const MACHINE_FLEET = [
  { id: 'VMC-01', status: 'Running', health: 98, load: 85 },
  { id: 'VMC-02', status: 'Running', health: 95, load: 92 },
  { id: 'CNC-01', status: 'Maintenance', health: 70, load: 0 },
  { id: 'CNC-02', status: 'Running', health: 99, load: 78 },
  { id: 'Grinding-01', status: 'Idle', health: 85, load: 10 },
  { id: 'Inspection-01', status: 'Running', health: 100, load: 100 },
];

const WORKFLOW_STEPS = [
  { id: 'enquiry', label: 'Enquiry', count: 12 },
  { id: 'quotation', label: 'Quotation', count: 8 },
  { id: 'sales_order', label: 'Sales Order', count: 15 },
  { id: 'production', label: 'Production', count: 24 },
  { id: 'inspection', label: 'Inspection', count: 6 },
  { id: 'dispatch', label: 'Dispatch', count: 3 },
  { id: 'invoice', label: 'Invoice', count: 18 },
  { id: 'payment', label: 'Payment', count: 10 },
];

export function ShopFloorOverview({ 
  orders,
  onNavigateToOrders, 
  onNavigateToMachine, 
  onNavigateToInventory, 
  onNavigateToBilling,
  title = 'Command Matrix'
}: ShopFloorOverviewProps) {
  const [syncTime, setSyncTime] = useState('');

  useEffect(() => {
    setSyncTime(new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-1000 bg-slate-950 p-6 -m-6 min-h-screen font-body text-slate-200">
      {/* Global Business Status Bar */}
      <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/50 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Business Health</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-display font-black text-emerald-500">94.2%</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-bold">OPTIMAL</Badge>
            </div>
          </div>
          <div className="h-10 w-px bg-white/5" />
          <div className="hidden sm:flex gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Sales</span>
              <div className="h-1 w-12 bg-emerald-500/20 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-4/5" /></div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Production</span>
              <div className="h-1 w-12 bg-emerald-500/20 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full" /></div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Inventory</span>
              <div className="h-1 w-12 bg-amber-500/20 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-3/5" /></div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Quality</span>
              <div className="h-1 w-12 bg-emerald-500/20 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-5/6" /></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Command Matrix Sync</p>
            <p className="text-[10px] font-code text-primary">{syncTime}</p>
          </div>
          <Button size="icon" variant="outline" className="bg-white/5 border-white/10 text-slate-400 hover:text-white rounded-xl h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Primary Operations Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Quotations', val: '24', sub: '₹ 42.5L', icon: FileBox, color: 'text-blue-400' },
          { label: 'Active Orders', val: '18', sub: '12% On-time', icon: ShoppingCart, color: 'text-indigo-400' },
          { label: 'Production Flow', val: '9 Nodes', sub: '6 Running', icon: Factory, color: 'text-emerald-400' },
          { label: 'Pending Dispatch', val: '5', sub: '3 Verified', icon: Truck, color: 'text-amber-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/40 border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:bg-slate-900/60 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="h-16 w-16" />
            </div>
            <div className="space-y-4 relative z-10">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-display font-black text-slate-100">{stat.val}</span>
                <span className={cn("text-[10px] font-bold mb-1.5", stat.color)}>{stat.sub}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Production Monitor & Machine Wall */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Activity className="h-6 w-6" /></div>
                   <div>
                      <h3 className="text-lg font-display font-bold uppercase tracking-tight">Machine Status Wall</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Live IIOT Telemetry v2.4</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-bold uppercase text-slate-500">4 Running</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="text-[8px] font-bold uppercase text-slate-500">1 Idle</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MACHINE_FLEET.map((m) => (
                  <div key={m.id} className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl space-y-4 hover:border-primary/30 transition-all">
                     <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold uppercase text-slate-400">{m.id}</span>
                        <Badge className={cn(
                          "text-[7px] font-bold px-2 py-0.5 rounded-full",
                          m.status === 'Running' ? "bg-emerald-500/10 text-emerald-500" :
                          m.status === 'Maintenance' ? "bg-red-500/10 text-red-500" : "bg-slate-500/10 text-slate-500"
                        )}>{m.status}</Badge>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-bold uppercase">
                           <span className="text-slate-600">OEE Yield</span>
                           <span className="text-slate-300">{m.load}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={cn("h-full", m.load > 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${m.load}%` }} />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          {/* Workflow Tracker */}
          <Card className="bg-slate-900/40 border-white/5 p-8 rounded-[2.5rem]">
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-8 border-l-4 border-primary pl-4">Live Operational Flow</h3>
             <div className="flex flex-wrap items-center justify-between gap-4">
                {WORKFLOW_STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-4 group">
                     <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center relative shadow-xl group-hover:border-primary/40 transition-all">
                           <span className="text-sm font-display font-black text-slate-200">{step.count}</span>
                           {idx < WORKFLOW_STEPS.length - 1 && (
                             <ChevronRight className="absolute -right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-800" />
                           )}
                        </div>
                        <span className="text-[8px] font-bold uppercase text-slate-500 group-hover:text-primary transition-colors">{step.label}</span>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* AI Insights & Alerts */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-[#001F3D] border-none p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/80">AI Business Insights</h4>
                 </div>
                 <div className="space-y-4">
                    {[
                      { text: "Quotation conversion dropped by 12% vs last week.", severity: 'warning' },
                      { text: "Aluminum stock will reach critical limit in 5 days.", severity: 'critical' },
                      { text: "3 major accounts have payments overdue > 15 days.", severity: 'critical' },
                      { text: "Production OEE at VMC-02 hit record 92%.", severity: 'success' },
                    ].map((insight, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-4 items-start group hover:bg-white/10 transition-all">
                         <div className={cn(
                           "h-1.5 w-1.5 rounded-full mt-2 shrink-0",
                           insight.severity === 'critical' ? "bg-red-500" : insight.severity === 'warning' ? "bg-amber-500" : "bg-emerald-500"
                         )} />
                         <p className="text-[11px] text-white/60 leading-relaxed group-hover:text-white transition-colors">{insight.text}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </Card>

           <Card className="bg-slate-900/40 border-white/5 p-6 rounded-[2rem] space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500" /> Alert Command Center
                 </h4>
                 <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-bold">2 CRITICAL</Badge>
              </div>
              <div className="space-y-3">
                 <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-red-400 uppercase">Machine Breakdown</span>
                       <span className="text-[8px] text-slate-600 font-code">10:42 AM</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-300">CNC-01 Offline: Hydraulic pressure failure protocol initiated.</p>
                 </div>
                 <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-amber-400 uppercase">Delayed Dispatch</span>
                       <span className="text-[8px] text-slate-600 font-code">09:15 AM</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-300">WO #8842: Awaiting final QC certification for release.</p>
                 </div>
              </div>
           </Card>

           <Card className="bg-slate-900/40 border-white/5 p-6 rounded-[2rem] space-y-6">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4 text-primary" /> Approval Gateway
              </h4>
              <div className="space-y-2">
                 {[
                   { label: 'Purchase Requisition', ref: '#PR-452', user: 'Jayant P.' },
                   { label: 'Discount Override', ref: '#QT-099', user: 'Amit S.' },
                 ].map((app, i) => (
                   <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-200">{app.label}</p>
                        <p className="text-[8px] text-slate-500 uppercase">{app.ref} • {app.user}</p>
                      </div>
                      <Button size="sm" className="h-7 bg-primary hover:bg-primary/80 text-white rounded-lg font-bold text-[8px] uppercase">Authorize</Button>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* Live Financial War Room & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        <Card className="lg:col-span-8 bg-slate-900/40 border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between overflow-hidden">
           <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-display font-bold uppercase tracking-tight">Financial Intelligence</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Liquidity Index</p>
              </div>
              <div className="grid grid-cols-3 gap-10">
                 <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Receivables</p>
                    <p className="text-lg font-bold text-emerald-400">₹ 84.5L</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Payables</p>
                    <p className="text-lg font-bold text-rose-400">₹ 22.1L</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Gst Liability</p>
                    <p className="text-lg font-bold text-amber-400">₹ 14.8L</p>
                 </div>
              </div>
           </div>
           <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[
                   {n: '1', v: 400}, {n: '2', v: 300}, {n: '3', v: 600}, {n: '4', v: 800}, {n: '5', v: 750}, {n: '6', v: 900}, {n: '7', v: 1200}
                 ]}>
                    <defs>
                       <linearGradient id="colorWar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWar)" />
                    <XAxis hide />
                    <YAxis hide />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card className="lg:col-span-4 bg-slate-900/40 border-white/5 p-8 rounded-[2.5rem] flex flex-col">
           <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
             <History className="h-4 w-4" /> Personnel Activity Feed
           </h3>
           <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-6">
                 {[
                   { user: 'Amit S.', act: 'Created Quotation #QT-8845', time: '12m ago' },
                   { user: 'Jayant P.', act: 'Approved Payment REC-221', time: '45m ago' },
                   { user: 'Sanjay M.', act: 'Modified WO #8821 Routing', time: '1h ago' },
                   { user: 'Admin', act: 'Updated Inventory Matrix (SKU-102)', time: '3h ago' },
                   { user: 'System', act: 'Auto-backup Synchronized', time: '5h ago' },
                 ].map((log, i) => (
                   <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-4 relative group">
                      <div className="absolute -left-[3.5px] top-1 h-1.5 w-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                      <div className="space-y-1">
                         <p className="text-[11px] font-bold text-slate-200">{log.act}</p>
                         <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{log.user} • {log.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </ScrollArea>
        </Card>
      </div>

      {/* Global Quick Access Matrix */}
      <footer className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 no-print">
         {[
           { id: 'sales', icon: ShoppingCart, label: 'Sales' },
           { id: 'purchase', icon: Truck, label: 'Purchase' },
           { id: 'inventory', icon: Boxes, label: 'Inventory' },
           { id: 'production', icon: Factory, label: 'Production' },
           { id: 'quality', icon: ShieldCheck, label: 'Quality' },
           { id: 'finance', icon: Banknote, label: 'Finance' },
           { id: 'hr', icon: Users, label: 'HR' },
           { id: 'admin', icon: Settings, label: 'Admin' },
           { id: 'reports', icon: FileBarChart, label: 'Reports' },
           { id: 'users', icon: UserCircle, label: 'Users' },
         ].map(tile => (
           <button key={tile.id} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col items-center gap-3 group hover:bg-primary transition-all hover:translate-y-[-2px] shadow-lg hover:shadow-primary/20">
              <tile.icon className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white">{tile.label}</span>
           </button>
         ))}
      </footer>
    </div>
  );
}
