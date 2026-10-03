"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Factory,
  Users,
  ShieldCheck,
  LayoutGrid,
  Zap,
  TrendingUp,
  Cpu,
  BrainCircuit,
  Bell,
  UserCheck,
  CreditCard,
  Box,
  Monitor,
  ShoppingCart,
  Sparkles,
  Search,
  ArrowUpRight,
  Database,
  History,
  FileText,
  Package,
  Receipt,
  Landmark,
  Calculator,
  Settings
} from 'lucide-react';
import { Order, Machine, QualityReport, WorkLogEntry, InventoryItem, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShopFloorOverviewProps {
  orders: Order[];
  reports: QualityReport[];
  logs: WorkLogEntry[];
  machines: Machine[];
  inventory: InventoryItem[];
  billing: BillingRecord[];
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
}

const REVENUE_DATA = [
  { month: 'Jan', val: 1200000 },
  { month: 'Feb', val: 1500000 },
  { month: 'Mar', val: 1800000 },
  { month: 'Apr', val: 1400000 },
  { month: 'May', val: 2100000 },
];

export function ShopFloorOverview({ orders, reports, logs, machines, inventory, billing, onNavigateToOrders, onNavigateToMachine, onNavigateToInventory, onNavigateToBilling }: ShopFloorOverviewProps) {
  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => o.status === 'Active' || o.status === 'Production').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    delayed: orders.filter(o => o.status === 'Delayed').length,
    qualityPass: reports.length > 0 ? Math.round((reports.filter(r => r.verdict === 'Pass').length / reports.length) * 100) : 100,
    healthScore: 92
  }), [orders, reports]);

  const machineStatuses = useMemo(() => {
    return machines.slice(0, 6).map(m => ({
      ...m,
      displayStatus: m.status === 'active' ? (m.load > 10 ? 'Running' : 'Idle') : 
                     m.status === 'maintenance' ? 'Maintenance' : 'Breakdown',
      statusColor: m.status === 'active' ? (m.load > 10 ? 'text-primary' : 'text-blue-500') :
                   m.status === 'maintenance' ? 'text-amber-500' : 'text-red-500',
      bgGlow: m.status === 'active' ? (m.load > 10 ? 'bg-primary/5' : 'bg-blue-500/5') : 'bg-red-500/5'
    }));
  }, [machines]);

  const operationalNodes = [
    { label: 'Enquiry', count: 12, color: 'bg-blue-500' },
    { label: 'Quotation', count: orders.filter(o => o.status === 'Draft').length, color: 'bg-indigo-500' },
    { label: 'Sales Order', count: orders.filter(o => o.status === 'Planning').length, color: 'bg-purple-500' },
    { label: 'Production', count: orders.filter(o => o.status === 'Production' || o.status === 'Active').length, color: 'bg-amber-500' },
    { label: 'Inspection', count: reports.filter(r => r.status === 'Draft' || r.status === 'Review Pending').length, color: 'bg-cyan-500' },
    { label: 'Dispatch', count: orders.filter(o => o.status === 'Dispatch' || o.status === 'Ready for Delivery').length, color: 'bg-emerald-500' },
    { label: 'Invoice', count: billing.filter(b => b.type === 'invoice').length, color: 'bg-primary' },
    { label: 'Payment', count: billing.filter(b => b.status === 'Paid').length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 bg-background text-foreground">
      {/* 01. EXECUTIVE COMMAND AREA (TOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-3 p-8 bg-card border-border flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 z-10">Business Health Index</h4>
          <div className="relative w-40 h-40 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="72" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" cy="80" r="72" 
                stroke="hsl(var(--primary))" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray="452.4" 
                strokeDashoffset={452.4 - (452.4 * stats.healthScore / 100)} 
                className="transition-all duration-1000 shadow-primary"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-black text-white tracking-tighter">{stats.healthScore}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Nominal</span>
            </div>
          </div>
          <div className="mt-8 flex gap-4 z-10">
             <div className="text-center">
               <p className="text-[8px] font-bold text-white/20 uppercase mb-1">MTD Trend</p>
               <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black">+2.4%</Badge>
             </div>
             <div className="text-center">
               <p className="text-[8px] font-bold text-white/20 uppercase mb-1">Alerts</p>
               <Badge className="bg-red-500/20 text-red-500 border-none text-[9px] font-black">3 ACTIVE</Badge>
             </div>
          </div>
        </Card>

        <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Yield', val: stats.active, icon: Zap, color: 'text-primary', trend: '+4 Units' },
            { label: 'Commercial Val', val: '₹ 84.2L', icon: CreditCard, color: 'text-blue-500', trend: '+12% vs LY' },
            { label: 'Quality Pass', val: `${stats.qualityPass}%`, icon: ShieldCheck, color: 'text-emerald-500', trend: 'Fidelity Lock' },
            { label: 'Fleet Load', val: '72%', icon: Factory, color: 'text-amber-500', trend: 'Cap High' },
            { label: 'Inventory', val: inventory.length, icon: Box, color: 'text-cyan-500', trend: '12 Low Stock' },
            { label: 'Pending Auth', val: 5, icon: UserCheck, color: 'text-purple-500', trend: 'Manager Node' },
            { label: 'Avg Cycle', val: '4.2h', icon: Clock, color: 'text-indigo-500', trend: '-0.3h Gain' },
            { label: 'Staff Online', val: '24/28', icon: Users, color: 'text-white', trend: 'Active Shift' },
          ].map(item => (
            <Card key={item.label} className="p-6 bg-card border-border shadow-sm flex flex-col justify-between group hover:border-primary/40 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{item.label}</p>
                  <h3 className="text-2xl font-display font-bold mt-2 text-white">{item.val}</h3>
                </div>
                <div className={cn("p-2 rounded-lg bg-white/5", item.color)}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/20 mt-4">{item.trend}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 02. OPERATIONAL FLOW MATRIX (HORIZONTAL) */}
      <Card className="p-6 bg-card border-border shadow-xl overflow-hidden relative">
        <div className="flex justify-between items-center px-4 relative z-10">
          {operationalNodes.map((node, i) => (
            <div key={node.label} className="flex flex-col items-center gap-3 relative group">
              {i < operationalNodes.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-[2px] bg-white/5 -z-10" />
              )}
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-display font-black text-sm transition-all group-hover:scale-110",
                node.color, "text-white shadow-lg"
              )}>
                {node.count}
              </div>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{node.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 03. MACHINE FLEET MATRIX (LEFT MAIN) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase text-white/40 tracking-[0.3em] flex items-center gap-3">
              <Monitor className="h-4 w-4 text-primary" /> Industrial Asset Fleet Telemetry
            </h3>
            <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase text-white/30 hover:text-primary" onClick={onNavigateToMachine}>
              Fleet Audit <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {machineStatuses.map(m => (
              <Card key={m.id} className={cn("p-6 border-border group hover:border-primary/30 transition-all shadow-lg relative overflow-hidden", m.bgGlow)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Cpu className={cn("h-5 w-5", m.statusColor)} />
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white uppercase tracking-tight">{m.name}</h4>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{m.mcNumber}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[8px] font-black uppercase border-none h-6 px-3", m.statusColor.replace('text-', 'bg-') + "/10", m.statusColor)}>
                    {m.displayStatus}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-black text-white/20 uppercase">Core Yield</p>
                    <span className={cn("text-lg font-display font-black", m.statusColor)}>{m.load}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", m.statusColor.replace('text-', 'bg-'))} style={{ width: `${m.load}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 04. FINANCIAL INTELLIGENCE (CHART) */}
          <Card className="bg-card border-border shadow-2xl p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
               <div>
                 <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Institutional Yield Flow</h3>
                 <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">MTD Financial Performance Analysis</p>
               </div>
               <div className="flex gap-4">
                  <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black px-4 h-8 uppercase">Revenue_Matrix_Verified</Badge>
               </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.2)'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.2)'}} tickFormatter={(val) => `₹${val/100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#071427', border: '1px solid #0F2745', borderRadius: '12px' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 05. COMMAND SIDEBAR (RIGHT) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-2xl rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit className="h-32 w-32 text-primary" /></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <h4 className="text-xs font-black uppercase text-white tracking-[0.3em]">AI Cognitive Insights</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/40 transition-colors">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Throughput Optimus</p>
                  <p className="text-[11px] font-medium text-white/70 leading-relaxed italic">Suggest re-routing Order #2441 to VMC-02 due to optimal spindle load factor.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/40 transition-colors">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Commercial Insight</p>
                  <p className="text-[11px] font-medium text-white/70 leading-relaxed italic">Automate payment reminders for "Tier-1 Auto" to improve DSO by 12%.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border shadow-xl rounded-2xl">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
                  <Bell className="h-4 w-4 text-red-500" /> Alert Command Hub
                </h4>
                <Badge className="bg-red-500/20 text-red-500 border-none text-[9px] font-black px-3">3 CRITICAL</Badge>
             </div>
             <div className="space-y-4">
                {[
                  { label: 'Spindle Deviation', desc: 'VMC-01 calibration out of spec', icon: Cpu, color: 'text-red-500', bg: 'bg-red-500/5' },
                  { label: 'Dispatch Lag', desc: 'Order #8845 - Packaging Buffer Full', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                  { label: 'Supply Constraint', desc: 'M10 Tool Steel - Zero Inventory', icon: Box, color: 'text-red-500', bg: 'bg-red-500/5' },
                ].map((alert, i) => (
                  <div key={i} className={cn("flex gap-4 items-center p-4 rounded-2xl border border-white/5 transition-all group cursor-pointer hover:border-white/20", alert.bg)}>
                     <div className={cn("p-2 rounded-xl bg-white/5 group-hover:bg-white/10", alert.color)}><alert.icon className="h-4 w-4" /></div>
                     <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{alert.label}</p>
                        <p className="text-[10px] text-white/40 font-medium mt-0.5">{alert.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-6 bg-card border-border shadow-xl rounded-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-3">
              <UserCheck className="h-4 w-4 text-primary" /> Authorization Gateway
            </h4>
            <div className="space-y-4">
               {[
                 { user: 'A. Sharma', task: 'Work Log Certification', time: '2h ago' },
                 { user: 'R. Patil', task: 'Purchase Order Release', time: '4h ago' },
               ].map((item, i) => (
                 <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center font-black text-[10px] text-primary">{item.user[0]}</div>
                       <div>
                          <p className="text-[11px] font-black text-white uppercase">{item.user}</p>
                          <p className="text-[10px] text-white/30 font-medium">{item.task}</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
                 </div>
               ))}
               <Button variant="ghost" className="w-full h-10 text-[9px] font-black uppercase text-white/20 hover:text-primary tracking-widest">Execute Full Ledger Audit</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 06. SYSTEM ACTIVITY FEED & LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-12 bg-card border-border shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
              <History className="h-4 w-4 text-primary" /> Personnel Activity Thread
            </h4>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Live_Matrix_Active</span>
            </div>
          </div>
          <ScrollArea className="h-48">
            <div className="p-4 space-y-4">
              {logs.slice(0, 10).map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all border-l-2 border-primary/20">
                  <div className="flex items-center gap-6">
                    <span className="text-[9px] font-code font-bold text-white/20 w-16">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 border border-white/10">
                        <AvatarFallback className="bg-white/5 text-white/40 text-[8px] font-black">{log.operator[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{log.operator}</span>
                    </div>
                    <p className="text-[11px] font-medium text-white/60">Registered <b className="text-white">{log.duration}</b> yield on <b className="text-primary">WO #{log.workOrderId}</b></p>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black border-white/5 text-white/30 uppercase">{log.type}</Badge>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center py-10 text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Waiting for System Signal...</p>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* 07. QUICK ACCESS ICON TILES (FOOTER) */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
        {[
          { label: 'Sales', icon: ShoppingCart, color: 'text-blue-500', nav: onNavigateToOrders },
          { label: 'Purchase', icon: Package, color: 'text-indigo-500', nav: onNavigateToBilling },
          { label: 'Inventory', icon: Box, color: 'text-emerald-500', nav: onNavigateToInventory },
          { label: 'Production', icon: Factory, color: 'text-amber-500', nav: onNavigateToOrders },
          { label: 'Quality', icon: ShieldCheck, color: 'text-cyan-500', nav: onNavigateToOrders },
          { label: 'Finance', icon: CreditCard, color: 'text-primary', nav: onNavigateToBilling },
          { label: 'HR Hub', icon: Users, color: 'text-purple-500', nav: onNavigateToOrders },
          { label: 'Control', icon: Settings, color: 'text-white', nav: onNavigateToOrders },
          { label: 'Reports', icon: FileText, color: 'text-slate-400', nav: onNavigateToOrders },
          { label: 'Master', icon: Database, color: 'text-emerald-400', nav: onNavigateToOrders },
        ].map(tile => (
          <Card 
            key={tile.label} 
            className="p-4 bg-card border-border hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group shadow-lg"
            onClick={tile.nav}
          >
            <div className={cn("p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors", tile.color)}>
               <tile.icon className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black text-white/30 group-hover:text-white uppercase tracking-widest transition-colors">{tile.label}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
