"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Order, QualityReport, WorkLogEntry, TrainingAssignment, SystemUser } from '@/lib/types';

interface ShopFloorSQCDPProps {
  orders: Order[];
  reports: QualityReport[];
  logs: WorkLogEntry[];
  users: SystemUser[];
  assignments: TrainingAssignment[];
}

export function ShopFloorSQCDP({ orders, reports, assignments }: ShopFloorSQCDPProps) {
  const [syncTime, setSyncTime] = useState<string>('');

  useEffect(() => {
    setSyncTime(new Date().toLocaleTimeString());
  }, []);

  const metrics = useMemo(() => {
    const totalReports = reports.length || 1;
    const passedReports = reports.filter(r => r.verdict === 'Pass').length;
    const qualityVal = reports.length > 0 ? Math.round((passedReports / totalReports) * 100) : 0;

    const totalOrders = orders.length || 1;
    const delayedOrders = orders.filter(o => o.status === 'Delayed').length;
    const deliveryVal = orders.length > 0 ? Math.max(0, 100 - Math.round((delayedOrders / totalOrders) * 100)) : 0;

    const totalAsg = assignments.length || 1;
    const completedAsg = assignments.filter(a => a.status === 'Completed').length;
    const peopleVal = assignments.length > 0 ? Math.round((completedAsg / totalAsg) * 100) : 0;

    const safetyVal = 100;

    return {
      S: { value: safetyVal, label: 'Safety', color: '#10b981', icon: ShieldCheck },
      Q: { value: qualityVal, label: 'Quality', color: '#10b981', icon: CheckCircle2 },
      C: { value: 0, label: 'Cost', color: '#f59e0b', icon: TrendingUp },
      D: { value: deliveryVal, label: 'Delivery', color: '#f59e0b', icon: Clock },
      P: { value: peopleVal, label: 'People', color: '#3b82f6', icon: Activity }
    };
  }, [orders, reports, assignments]);

  const sqcdpList = [
    { category: 'S', ...metrics.S },
    { category: 'Q', ...metrics.Q },
    { category: 'C', ...metrics.C },
    { category: 'D', ...metrics.D },
    { category: 'P', ...metrics.P },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-body">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-3xl text-slate-900 uppercase tracking-tight">Performance Summary</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Enterprise Performance Metrics (SQCDP)</p>
        </div>
        <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[10px] h-10 px-6 uppercase tracking-widest rounded-xl shadow-sm">
          Last Sync: {syncTime}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {sqcdpList.map((item) => (
          <Card key={item.category} className="p-10 flex flex-col items-center border-slate-200 shadow-sm bg-white rounded-3xl group hover:shadow-xl transition-all">
            <div className="p-4 bg-slate-50 rounded-2xl mb-8">
              <item.icon className="h-8 w-8 text-slate-400" />
            </div>
            
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-5xl font-display font-bold text-slate-900 leading-none">{item.category}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase">
                <span className="text-slate-400">Yield</span>
                <span style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full rounded-full transition-all duration-1000" 
                   style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                 />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}