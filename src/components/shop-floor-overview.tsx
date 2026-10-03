"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Factory,
  BarChart3,
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
  Monitor
} from 'lucide-react';
import { Order, Machine, QualityReport, WorkLogEntry, InventoryItem, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

export function ShopFloorOverview({ orders, reports, logs, machines, inventory, billing, onNavigateToOrders }: ShopFloorOverviewProps) {
  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => o.status === 'Active' || o.status === 'Production').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    delayed: orders.filter(o => o.status === 'Delayed').length,
    qualityPass: reports.length > 0 ? Math.round((reports.filter(r => r.verdict === 'Pass').length / reports.length) * 100) : 100,
    healthScore: 92
  }), [orders, reports]);

  const machineStatuses = useMemo(() => {
    // Map existing active/maintenance/fault to Running/Idle/Maintenance/Breakdown
    return machines.slice(0, 5).map(m => ({
      ...m,
      displayStatus: m.status === 'active' ? (m.load > 10 ? 'Running' : 'Idle') : 
                     m.status === 'maintenance' ? 'Maintenance' : 'Breakdown',
      statusColor: m.status === 'active' ? (m.load > 10 ? 'text-emerald-500' : 'text-blue-500') :
                   m.status === 'maintenance' ? 'text-amber-500' : 'text-red-500'
    }));
  }, [machines]);

  const pendingApprovals = [
    { id: '1', user: 'A. Sharma', task: 'Work Log Certification', time: '2h ago' },
    { id: '2', user: 'R. Patil', task: 'Leave Protocol Approval', time: '4h ago' },
    { id: '3', user: 'S. Mehta', task: 'Purchase Requisition', time: '5h ago' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Industry 4.0 Dashboard Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card className="lg:col-span-1 p-4 flex flex-col items-center justify-center bg-white dark:bg-card border-slate-200 dark:border-border group hover:border-primary transition-all">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Health Index</p>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * stats.healthScore / 100)} className="text-primary transition-all duration-1000" />
            </svg>
            <span className="absolute text-sm font-bold dark:text-white">{stats.healthScore}%</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 bg-white dark:bg-card border-slate-200 dark:border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">MTD Revenue Performance</p>
              <h3 className="text-2xl font-bold dark:text-white">₹ 18.42L</h3>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-bold">+12%</Badge>
          </div>
          <div className="h-10 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5A8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#00E5A8" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {[
          { label: 'Orders', val: stats.total, icon: ShoppingCart, color: 'text-blue-500' },
          { label: 'Yield', val: `${stats.qualityPass}%`, icon: Zap, color: 'text-primary' },
          { label: 'Fleet', val: `${Math.round(stats.healthScore * 0.9)}%`, icon: Factory, color: 'text-amber-500' },
          { label: 'Stock', val: inventory.length, icon: Box, color: 'text-purple-500' },
        ].map(item => (
          <Card key={item.label} className="p-5 flex flex-col justify-between bg-white dark:bg-card border-slate-200 dark:border-border">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-bold dark:text-white">{item.val}</h3>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Machine Status Panel */}
        <Card className="lg:col-span-8 p-0 bg-white dark:bg-card border-slate-200 dark:border-border overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg text-white shadow-lg shadow-primary/20"><Monitor className="h-4 w-4" /></div>
              <h3 className="text-sm font-bold dark:text-white uppercase tracking-widest">Global Fleet Monitor</h3>
            </div>
            <div className="flex gap-4">
              {['Running', 'Idle', 'Maintenance', 'Breakdown'].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full", s === 'Running' ? 'bg-emerald-500' : s === 'Idle' ? 'bg-blue-500' : s === 'Maintenance' ? 'bg-amber-500' : 'bg-red-500')} />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machineStatuses.map(m => (
                <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white dark:bg-card border border-slate-100 dark:border-border flex items-center justify-center text-slate-400"><Cpu className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-bold dark:text-white uppercase">{m.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{m.mcNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-[10px] font-black uppercase tracking-tighter", m.statusColor)}>{m.displayStatus}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">{m.load}% Load</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-[9px] font-bold uppercase tracking-widest gap-2 text-slate-400 hover:text-primary">
              Access Full Fleet Matrix <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>

        {/* AI Business Insights */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-[#001F3D] dark:bg-[#071427] text-white border-none relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-widest">AI Intelligence Node</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-bold text-primary uppercase mb-2">Throughput Prediction</p>
                   <p className="text-xs font-medium text-white/70 leading-relaxed">VMC-02 is running at 94% capacity. Suggest shifting Order #8845 to VMC-04 to prevent bottleneck.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-bold text-amber-500 uppercase mb-2">Commercial Insight</p>
                   <p className="text-xs font-medium text-white/70 leading-relaxed">Quotation yield is down by 8%. Standardize response time to under 4h to increase win rate.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Alert Center */}
          <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5" /> Institutional Alert Center
                </h4>
                <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-bold px-2">4 NEW</Badge>
             </div>
             <div className="space-y-4">
                {[
                  { label: 'Overdue Payment', desc: 'Auto-Component Inc. (₹14.2L)', icon: CreditCard, color: 'text-red-500' },
                  { label: 'Production Delay', desc: 'Order #4521 - Setup Lag', icon: Clock, color: 'text-amber-500' },
                  { label: 'Inventory Critical', desc: 'M10 Hex Bolts - Out of Stock', icon: Box, color: 'text-red-500' },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-all group">
                     <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-card", alert.color)}><alert.icon className="h-3.5 w-3.5" /></div>
                     <div>
                        <p className="text-[10px] font-bold dark:text-white uppercase">{alert.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{alert.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Operational Threads */}
        <Card className="lg:col-span-2 bg-white dark:bg-card border-slate-200 dark:border-border">
          <div className="p-4 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary dark:text-primary-foreground uppercase flex items-center gap-2"><LayoutGrid className="h-3.5 w-3.5" /> Operational Velocity</h3>
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase" onClick={onNavigateToOrders}>Audit Registry</Button>
          </div>
          <ScrollArea className="h-64">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white dark:bg-card z-10">
                <tr className="border-b dark:border-border">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">Node ID</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">Identity</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase text-center">Efficiency</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b dark:border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-code text-[11px] font-bold text-primary">#{order.id}</td>
                    <td className="px-6 py-4"><div className="flex flex-col"><span className="text-[11px] font-bold dark:text-white uppercase">{order.customer}</span><span className="text-[8px] text-slate-400 uppercase">PO: {order.poNumber || 'N/A'}</span></div></td>
                    <td className="px-6 py-4">
                       <div className="w-full max-w-[80px] mx-auto space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-slate-400"><span>{order.progress}%</span></div>
                          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${order.progress || 0}%` }} />
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0.5 border-slate-200 dark:border-border dark:text-white">{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>

        {/* Approval Center */}
        <Card className="bg-white dark:bg-card border-slate-200 dark:border-border">
          <div className="p-4 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary dark:text-primary-foreground uppercase flex items-center gap-2"><UserCheck className="h-3.5 w-3.5" /> Certification Matrix</h3>
          </div>
          <div className="p-6 space-y-6">
            {pendingApprovals.map(approval => (
              <div key={approval.id} className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-primary transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-card border border-slate-100 dark:border-border flex items-center justify-center font-bold text-[10px] text-slate-400">{approval.user.charAt(0)}</div>
                    <div>
                      <p className="text-[10px] font-bold dark:text-white uppercase">{approval.user}</p>
                      <p className="text-[9px] text-slate-400">{approval.task}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-300 uppercase">{approval.time}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 h-8 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500">Reject</Button>
                  <Button className="flex-[2] h-8 rounded-lg bg-[#001F3D] dark:bg-primary dark:text-card font-black uppercase text-[8px] tracking-widest">Authorize</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full h-10 border-slate-200 dark:border-border text-[9px] font-black uppercase tracking-widest text-slate-400 group hover:text-primary">
              View All Approvals <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
