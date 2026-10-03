"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  TrendingUp, 
  Activity, 
  Box, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Factory,
  Layers,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { Order } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ShopFloorOverviewProps {
  orders: Order[];
  onNavigateToOrders?: () => void;
  onNavigateToMachine?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToBilling?: () => void;
}

export function ShopFloorOverview({ orders, onNavigateToOrders, onNavigateToMachine, onNavigateToInventory, onNavigateToBilling }: ShopFloorOverviewProps) {
  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => o.status === 'Active' || o.status === 'Production').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    delayed: orders.filter(o => o.status === 'Delayed').length
  }), [orders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', val: stats.total, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Active Threads', val: stats.active, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Certified Complete', val: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Critical Blocked', val: stats.delayed, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(item => (
          <Card key={item.label} className="p-5 enterprise-card border-l-4 border-l-primary flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{item.val}</h3>
            </div>
            <div className={cn("p-2 rounded", item.bg)}><item.icon className={cn("h-5 w-5", item.color)} /></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 enterprise-card">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary uppercase flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Recent Operational Threads</h3>
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase" onClick={onNavigateToOrders}>View All Matrix</Button>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50/30">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase">Node ID</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase">Identity</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase text-center">Velocity</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(order => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50 group">
                    <td className="px-4 py-3 font-code text-[11px] font-bold text-primary">#{order.id}</td>
                    <td className="px-4 py-3"><div className="flex flex-col"><span className="text-[11px] font-bold text-slate-700 uppercase">{order.customer}</span><span className="text-[8px] text-slate-400 uppercase">Ref: {order.poNumber || 'N/A'}</span></div></td>
                    <td className="px-4 py-3">
                       <div className="w-full max-w-[80px] mx-auto h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${order.progress || 0}%` }} />
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0.5">{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="enterprise-card p-6 bg-primary text-white border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><BarChart3 className="h-24 w-24" /></div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Efficiency Matrix</h4>
              <div className="space-y-6">
                {[
                  { label: 'Fleet availability', val: '94.2%' },
                  { label: 'Quality yield', val: '98.8%' },
                  { label: 'Throughput', val: '82.5%' }
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase"><span>{item.label}</span><span>{item.val}</span></div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white/60" style={{ width: item.val }} /></div>
                  </div>
                ))}
              </div>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Quality Hub', icon: ShieldCheck, onClick: () => {} },
                { label: 'Finance Hub', icon: CreditCard, onClick: onNavigateToBilling },
                { label: 'Assets', icon: Factory, onClick: onNavigateToMachine },
                { label: 'Inventory', icon: Box, onClick: onNavigateToInventory },
              ].map(tile => (
                <Card key={tile.label} className="p-4 enterprise-card hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center gap-2 group" onClick={tile.onClick}>
                   <tile.icon className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                   <span className="text-[10px] font-bold uppercase text-slate-600">{tile.label}</span>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
