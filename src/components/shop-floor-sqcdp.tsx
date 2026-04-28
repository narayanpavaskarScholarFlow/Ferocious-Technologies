"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  History
} from 'lucide-react';
import { Order, QualityReport, WorkLogEntry, TrainingAssignment, SystemUser } from '@/lib/types';

interface ShopFloorSQCDPProps {
  orders: Order[];
  reports: QualityReport[];
  logs: WorkLogEntry[];
  users: SystemUser[];
  assignments: TrainingAssignment[];
}

export function ShopFloorSQCDP({ orders, reports, logs, users, assignments }: ShopFloorSQCDPProps) {
  const [syncTime, setSyncTime] = useState<string>('');

  useEffect(() => {
    setSyncTime(new Date().toLocaleTimeString());
  }, []);

  // Calculate Real-time Metrics
  const metrics = useMemo(() => {
    // Quality (Q)
    const totalReports = reports.length || 1;
    const passedReports = reports.filter(r => r.verdict === 'Pass').length;
    const qualityVal = Math.round((passedReports / totalReports) * 100);

    // Delivery (D)
    const totalOrders = orders.length || 1;
    const delayedOrders = orders.filter(o => o.status === 'Delayed').length;
    const deliveryVal = Math.max(0, 100 - Math.round((delayedOrders / totalOrders) * 100));

    // People (P)
    const totalAsg = assignments.length || 1;
    const completedAsg = assignments.filter(a => a.status === 'Completed').length;
    const peopleVal = Math.round((completedAsg / totalAsg) * 100);

    // Cost (C)
    // Derived from orders with 'Amount Spent'
    const ordersWithSpent = orders.filter(o => o.amountSpent && o.amountSpent !== '₹ 0.00').length;
    const costVal = ordersWithSpent > 0 ? 85 : 70; // Baseline if no data

    // Safety (S)
    // Deduction for high-severity alerts (simulated from logs)
    const safetyIncidents = 0; // Baseline
    const safetyVal = 100 - (safetyIncidents * 10);

    return {
      S: { value: safetyVal, label: 'Safety', color: '#22c55e' },
      Q: { value: qualityVal, label: 'Quality', color: '#22c55e' },
      C: { value: costVal, label: 'Cost', color: '#f59e0b' },
      D: { value: deliveryVal, label: 'Delivery', color: '#f59e0b' },
      P: { value: peopleVal, label: 'People', color: '#22c55e' }
    };
  }, [orders, reports, assignments]);

  const sqcdpList = [
    { category: 'S', ...metrics.S, history: [{v: 100}, {v: 100}, {v: 95}, {v: 100}] },
    { category: 'Q', ...metrics.Q, history: [{v: 85}, {v: 88}, {v: 92}, {v: metrics.Q.value}] },
    { category: 'C', ...metrics.C, history: [{v: 70}, {v: 72}, {v: 75}, {v: metrics.C.value}] },
    { category: 'D', ...metrics.D, history: [{v: 90}, {v: 85}, {v: 87}, {v: metrics.D.value}] },
    { category: 'P', ...metrics.P, history: [{v: 92}, {v: 94}, {v: 95}, {v: metrics.P.value}] },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="font-display font-bold text-3xl text-[#001F3D] uppercase tracking-tighter">SQCDP Performance Board</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Industrial Yield Telemetry v2.4</p>
        </div>
        <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[10px] h-9 px-6 uppercase tracking-widest rounded-xl shadow-sm">
          LAST_SYNC: {syncTime}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {sqcdpList.map((item) => (
          <Card key={item.category} className="p-8 flex flex-col items-center gap-10 border-slate-200/60 shadow-xl bg-white rounded-[2rem] relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">{item.label}</div>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    stroke={item.value > 90 ? "#22c55e" : item.value > 80 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="439.8" 
                    strokeDashoffset={439.8 - (439.8 * item.value / 100)} 
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-display font-bold text-[#001F3D]">{item.category}</span>
                  <span className="text-xs font-bold text-slate-400 mt-1">{item.value}%</span>
               </div>
            </div>

            <div className="w-full h-12">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={item.history}>
                    <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                      {item.history.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={item.value > 90 ? "#22c55e" : item.value > 80 ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Bar>
                    <XAxis dataKey="date" hide />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="absolute top-4 right-4">
               <div className={cn(
                 "h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm",
                 item.value > 90 ? "bg-emerald-500" : item.value > 80 ? "bg-amber-500" : "bg-red-500"
               )} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-[2.5rem]">
           <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#001F3D] flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Event Log (Safety/Quality)
              </h4>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold">NODE_STREAM_ACTIVE</Badge>
           </div>
           <div className="p-8 space-y-6">
              <div className="flex gap-6 items-start border-b border-slate-50 pb-6 group">
                 <div className="bg-red-50 text-red-600 font-display font-bold p-3 rounded-2xl text-lg w-14 h-14 flex items-center justify-center shrink-0 border border-red-100 shadow-sm">S</div>
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                       <p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">Near-miss accident reported at machine ML-02</p>
                       <span className="text-[9px] text-slate-300 font-code font-bold uppercase">03.03 / 08:15</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Status: In Review / Primary Node: Safety Officer / Action: Root cause analysis initiated.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-start group">
                 <div className="bg-amber-50 text-amber-600 font-display font-bold p-3 rounded-2xl text-lg w-14 h-14 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">Q</div>
                 <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                       <p className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">Deviation in batch #8845 - Test protocol failure</p>
                       <span className="text-[9px] text-slate-300 font-code font-bold uppercase">02.03 / 16:40</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Status: Completed / Action: Critical Rework / Final Verdict: Pending Authorization.</p>
                 </div>
              </div>
           </div>
        </Card>

        <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <TrendingUp className="h-40 w-40" />
           </div>
           
           <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <h4 className="text-4xl font-display font-bold text-[#001F3D] tracking-tighter">Plant OEE</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Monthly Performance Target Hub</p>
              </div>
              <div className="text-right">
                <span className="text-5xl font-display font-bold text-primary tracking-tighter">84%</span>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-2 flex items-center justify-end gap-1.5">
                   <TrendingUp className="h-3 w-3" /> +5% target sync
                </p>
              </div>
           </div>
           
           <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Availability</span>
                    <span className="text-[#001F3D]">92%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" style={{ width: '92%' }} />
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Performance Rate</span>
                    <span className="text-[#001F3D]">88%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" style={{ width: '88%' }} />
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Quality Rate</span>
                    <span className="text-[#001F3D]">96%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" style={{ width: '96%' }} />
                 </div>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
