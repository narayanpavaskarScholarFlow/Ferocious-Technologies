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
  Monitor,
  ShoppingCart,
  Sparkles
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
    return machines.slice(0, 5).map(m => ({
      ...m,
      displayStatus: m.status === 'active' ? (m.load > 10 ? 'Running' : 'Idle') : 
                     m.status === 'maintenance' ? 'Maintenance' : 'Breakdown',
      statusColor: m.status === 'active' ? (m.load > 10 ? 'text-emerald-500' : 'text-blue-500') :
                   m.status === 'maintenance' ? 'text-amber-500' : 'text-red-500'
    }));
  }, [machines]);

  const alerts = [
    { label: 'Overdue Payment', desc: 'Auto-Component Inc. (₹14.2L)', icon: CreditCard, color: 'text-red-500' },
    { label: 'Production Delay', desc: 'Order #4521 - Setup Lag', icon: Clock, color: 'text-amber-500' },
    { label: 'Inventory Critical', desc: 'M10 Hex Bolts - Out of Stock', icon: Box, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 4-Card Executive Header - Restored Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', val: stats.total, icon: ShoppingCart, color: 'text-blue-500', trend: '+4% vs LW' },
          { label: 'Active Threads', val: stats.active, icon: Zap, color: 'text-primary', trend: 'Nominal' },
          { label: 'Fleet Availability', val: `${Math.round(stats.healthScore * 0.9)}%`, icon: Factory, color: 'text-amber-500', trend: 'Critical' },
          { label: 'Completion Yield', val: `${stats.qualityPass}%`, icon: ShieldCheck, color: 'text-emerald-500', trend: '+1.2% Gain' },
        ].map(item => (
          <Card key={item.label} className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                <h3 className="text-3xl font-bold mt-1 dark:text-white">{item.val}</h3>
              </div>
              <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-900", item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 dark:border-border dark:text-slate-400">{item.trend}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area - Operational Velocity */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="text-xs font-bold text-primary dark:text-white uppercase flex items-center gap-2"><LayoutGrid className="h-3.5 w-3.5" /> Operational Velocity</h3>
              <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase text-slate-400 hover:text-primary" onClick={onNavigateToOrders}>Audit Master Registry</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-border bg-slate-50/20 dark:bg-card">
                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">Node ID</th>
                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">Customer Identity</th>
                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase text-center">Efficiency</th>
                    <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase text-right">State</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map(order => (
                    <tr key={order.id} className="border-b dark:border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-code text-[11px] font-bold text-primary dark:text-primary-foreground">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold dark:text-white uppercase">{order.customer}</span>
                          <span className="text-[8px] text-slate-400 uppercase">PO: {order.poNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[100px] mx-auto space-y-1">
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
                  {orders.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-[10px] text-slate-400 uppercase font-bold">No Active Operational Threads Detected</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Machine Fleet Grid - Restored Hierarchical Placement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm">
              <div className="p-4 border-b dark:border-border flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-bold uppercase dark:text-white">Fleet Matrix</h4>
              </div>
              <div className="p-4 space-y-3">
                {machineStatuses.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-card border dark:border-border flex items-center justify-center"><Cpu className="h-4 w-4 text-slate-400" /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold dark:text-white uppercase">{m.name}</span>
                        <span className="text-[8px] text-slate-400 uppercase">{m.mcNumber}</span>
                      </div>
                    </div>
                    <Badge className={cn("text-[8px] font-black uppercase border-none", m.statusColor.replace('text-', 'bg-') + "/10", m.statusColor)}>
                      {m.displayStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm flex flex-col">
              <div className="p-4 border-b dark:border-border flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-bold uppercase dark:text-white">Performance Target</h4>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center gap-4">
                 <div className="flex justify-between items-end">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly Goal Achievement</p>
                   <span className="text-2xl font-display font-black text-primary">84%</span>
                 </div>
                 <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full bg-primary" style={{ width: '84%' }} />
                 </div>
                 <p className="text-[9px] text-slate-400 italic font-medium leading-relaxed">
                   * Production yield currently tracking +2.4% above historical institutional baseline.
                 </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Strategy & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-[#001F3D] dark:bg-[#071427] text-white border-none relative overflow-hidden group shadow-2xl rounded-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit className="h-32 w-32" /></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-widest">AI Intelligence</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                   <p className="text-[9px] font-bold text-primary uppercase mb-2">Throughput Prediction</p>
                   <p className="text-xs font-medium text-white/70 leading-relaxed">Suggest shifting Order #8845 to VMC-04 to mitigate capacity bottleneck.</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                   <p className="text-[9px] font-bold text-amber-500 uppercase mb-2">Commercial Insight</p>
                   <p className="text-xs font-medium text-white/70 leading-relaxed">Standardize response time to under 4h to increase quotation win rate by 8%.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-2xl">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5" /> Alert Center
                </h4>
                <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-bold px-2">3 NEW</Badge>
             </div>
             <div className="space-y-4">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex gap-4 items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                     <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-card", alert.color)}><alert.icon className="h-3.5 w-3.5" /></div>
                     <div>
                        <p className="text-[10px] font-bold dark:text-white uppercase">{alert.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{alert.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" /> Certification Matrix
            </h4>
            <div className="space-y-4">
               {[
                 { user: 'A. Sharma', task: 'Work Log Certification', time: '2h ago' },
                 { user: 'R. Patil', task: 'Leave Protocol Approval', time: '4h ago' },
               ].map((item, i) => (
                 <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="h-7 w-7 rounded-lg bg-white dark:bg-card border dark:border-border flex items-center justify-center font-bold text-[9px] text-slate-400">{item.user[0]}</div>
                       <div>
                          <p className="text-[10px] font-bold dark:text-white uppercase">{item.user}</p>
                          <p className="text-[8px] text-slate-400">{item.task}</p>
                       </div>
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase">{item.time}</span>
                 </div>
               ))}
               <Button variant="ghost" className="w-full h-8 text-[9px] font-black uppercase text-slate-400 hover:text-primary">View Global Queue</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
