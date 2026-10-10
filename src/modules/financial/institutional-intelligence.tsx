
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Landmark, 
  ShoppingCart, 
  Receipt, 
  Target, 
  Activity, 
  Calendar,
  RefreshCw,
  ArrowUpRight,
  PieChart as PieIcon,
  Users,
  Truck,
  Box,
  ChevronRight,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { BillingRecord, Customer, Order, WorkLogEntry } from '@/lib/types';
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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, startOfQuarter, startOfYear, isWithinInterval } from 'date-fns';

interface InstitutionalIntelligenceProps {
  records: BillingRecord[];
  customers: Customer[];
  orders: Order[];
  logs: WorkLogEntry[];
}

export function InstitutionalIntelligence({ records, customers, orders, logs }: InstitutionalIntelligenceProps) {
  
  const bi = useMemo(() => {
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: now };

    const invoices = records.filter(r => r.type === 'invoice');
    const monthlyRevenue = invoices.filter(r => isWithinInterval(new Date(r.date), currentMonthInterval))
      .reduce((acc, r) => acc + (r.amount || 0), 0);

    const expenseRecords = records.filter(r => r.type === 'outward_payment' || r.type === 'purchase_invoice');
    const monthlyExpense = expenseRecords.filter(r => isWithinInterval(new Date(r.date), currentMonthInterval))
      .reduce((acc, r) => acc + (r.amount || 0), 0);

    const totalReceivables = invoices.filter(r => r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayables = records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);

    const receipts = records.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const collectionEfficiency = monthlyRevenue > 0 ? (receipts / monthlyRevenue) * 100 : 100;

    return { monthlyRevenue, monthlyExpense, totalReceivables, totalPayables, collectionEfficiency };
  }, [records]);

  const chartData = [
    { name: 'Week 1', revenue: 45000, expense: 32000 },
    { name: 'Week 2', revenue: 52000, expense: 38000 },
    { name: 'Week 3', revenue: 48000, expense: 41000 },
    { name: 'Week 4', revenue: bi.monthlyRevenue, expense: bi.monthlyExpense },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
         <div>
            <h2 className="text-3xl font-display font-black text-[#001F3D] uppercase tracking-tight">Institutional Intelligence</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Executive Management & Leadership Matrix</p>
         </div>
         <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest gap-2 bg-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh Hub</Button>
            <Button className="rounded-xl h-10 px-8 bg-[#001F3D] text-white font-bold uppercase text-[9px] tracking-widest shadow-xl">Export Summary</Button>
         </div>
      </div>

      {/* TOP KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Monthly Revenue', val: `₹ ${bi.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Operational Expense', val: `₹ ${bi.monthlyExpense.toLocaleString()}`, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
           { label: 'Net Profit Node', val: `₹ ${(bi.monthlyRevenue - bi.monthlyExpense).toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Collection Eff.', val: `${bi.collectionEfficiency.toFixed(1)}%`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
         ].map(kpi => (
           <Card key={kpi.label} className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-between group hover:border-primary transition-all">
              <div className="flex justify-between items-start mb-6">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
                 <div className={cn("p-3 rounded-2xl", kpi.bg, kpi.color)}><kpi.icon className="h-5 w-5" /></div>
              </div>
              <p className={cn("text-3xl font-display font-black", kpi.color)}>{kpi.val}</p>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 p-10 bg-white border-slate-200 shadow-xl rounded-[3rem] space-y-10">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-display font-black text-[#001F3D] uppercase tracking-tight">Institutional Cash Flow Trend</h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-bold text-slate-400 uppercase">Revenue</span></div>
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500" /><span className="text-[8px] font-bold text-slate-400 uppercase">Expense</span></div>
               </div>
            </div>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                     <ChartTooltip />
                     <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fill="url(#colorRev)" />
                     <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={4} fill="url(#colorExp)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="lg:col-span-4 p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '30px 30px' }} />
            <div className="relative z-10 space-y-10">
               <div>
                  <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.5em] mb-4">Liquidity Matrix</p>
                  <h3 className="text-3xl font-display font-black uppercase tracking-tight">Institutional Aging</h3>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-3">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-bold uppercase text-white/40">Total Receivables</span><span className="text-2xl font-display font-bold text-emerald-400">₹ {bi.totalReceivables.toLocaleString()}</span></div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: '70%' }} /></div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-bold uppercase text-white/40">Total Payables</span><span className="text-2xl font-display font-bold text-rose-400">₹ {bi.totalPayables.toLocaleString()}</span></div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" style={{ width: '40%' }} /></div>
                  </div>
               </div>

               <div className="pt-10 border-t border-white/5 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1"><p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">In-house Load</p><p className="text-xl font-display font-bold">84%</p></div>
                     <div className="space-y-1"><p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Outsource Load</p><p className="text-xl font-display font-bold">16%</p></div>
                  </div>
               </div>
            </div>
            <Button className="w-full h-12 bg-primary text-[#001F3D] hover:bg-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl relative z-10">Authorize Audit Protocol</Button>
         </Card>
      </div>
    </div>
  );
}
