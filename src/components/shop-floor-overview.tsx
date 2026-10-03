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
  FileText,
  ChevronRight,
  Factory,
  Package,
  Layers,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Users,
  Settings
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

export function ShopFloorOverview({ 
  orders, 
  onNavigateToOrders, 
  onNavigateToMachine, 
  onNavigateToInventory, 
  onNavigateToBilling 
}: ShopFloorOverviewProps) {
  
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => o.status === 'Active').length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const delayed = orders.filter(o => o.status === 'Delayed').length;
    return { total, active, completed, delayed };
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Strategic KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] group hover:border-primary/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Orders</p>
              <h3 className="text-4xl font-display font-bold text-[#001F3D] tracking-tighter">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-[9px] text-blue-600 font-bold uppercase tracking-widest">
            <TrendingUp className="h-3 w-3 mr-2" />
            <span>Operational baseline nominal</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Threads</p>
              <h3 className="text-4xl font-display font-bold text-[#001F3D] tracking-tighter">{stats.active}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-[9px] text-emerald-600 font-bold uppercase tracking-widest">
            <CheckCircle2 className="h-3 w-3 mr-2" />
            <span>Yield sync active</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] group hover:border-purple-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Completed</p>
              <h3 className="text-4xl font-display font-bold text-[#001F3D] tracking-tighter">{stats.completed}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shadow-sm">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-[9px] text-purple-600 font-bold uppercase tracking-widest">
            <Clock className="h-3 w-3 mr-2" />
            <span>Quality certified</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] group hover:border-red-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Blocked</p>
              <h3 className="text-4xl font-display font-bold text-red-600 tracking-tighter">{stats.delayed}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-[9px] text-red-600 font-bold uppercase tracking-widest">
            <span>Critical attention required</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity Ledger */}
        <Card className="lg:col-span-7 p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold uppercase text-[#001F3D] tracking-tight">Production Ledger</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Operational Snapshot</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onNavigateToOrders} className="h-10 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary">
              Full Matrix <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-white rounded-xl border flex items-center justify-center font-code text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    #{order.id.slice(-3)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 uppercase">#{order.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Entry Date</p>
                    <p className="text-[11px] font-bold text-slate-600 mt-0.5">{order.startDate}</p>
                  </div>
                  <Badge className={cn(
                    "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                    order.status === 'Active' ? "bg-blue-50 text-blue-700 border-blue-100" :
                    order.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    "bg-slate-50 text-slate-500 border-slate-100"
                  )}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center">
                <Box className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-lg font-display font-bold uppercase tracking-widest text-[#001F3D]">No operational threads detected</p>
                <p className="text-xs text-slate-400 mt-2">Initialize a work order to begin tracking.</p>
              </div>
            )}
          </div>
        </Card>

        {/* System Intelligence Matrix */}
        <Card className="lg:col-span-5 p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <BarChart3 className="h-40 w-40" />
          </div>
          
          <h3 className="text-xl font-display font-bold uppercase text-[#001F3D] tracking-tight mb-12 flex items-center gap-4 relative z-10">
            <Activity className="h-6 w-6 text-primary" /> Performance Matrix
          </h3>
          
          <div className="space-y-12 flex-1 relative z-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fleet Availability</p>
                  <p className="text-3xl font-display font-bold text-[#001F3D]">84.2%</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold text-emerald-500 border-emerald-100 bg-emerald-50 mb-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> +2.4%
                </Badge>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px] shadow-inner">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: '84.2%' }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Completion Yield</p>
                  <p className="text-3xl font-display font-bold text-[#001F3D]">72.5%</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold text-emerald-500 border-emerald-100 bg-emerald-50 mb-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> +5.1%
                </Badge>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px] shadow-inner">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(5,150,105,0.4)]" style={{ width: '72.5%' }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Inventory Level</p>
                  <p className="text-3xl font-display font-bold text-[#001F3D]">65.8%</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold text-amber-500 border-amber-100 bg-amber-50 mb-1">STABLE</Badge>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px] shadow-inner">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]" style={{ width: '65.8%' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-16 pt-10 border-t border-slate-50 relative z-10">
             <Button variant="outline" className="h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest gap-3 border-slate-200 shadow-sm transition-all hover:bg-slate-50" onClick={onNavigateToMachine}>
               <Factory className="h-4 w-4 text-primary" /> Asset Fleet
             </Button>
             <Button variant="outline" className="h-14 rounded-2xl font-bold uppercase text-[10px] tracking-widest gap-3 border-slate-200 shadow-sm transition-all hover:bg-slate-50" onClick={onNavigateToInventory}>
               <Box className="h-4 w-4 text-primary" /> Stock Ledger
             </Button>
          </div>
        </Card>
      </div>

      {/* Functional Command Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 no-print pb-10">
         {[
           { label: 'Quality Hub', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
           { label: 'Finance Hub', icon: CreditCard, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
           { label: 'Workforce', icon: Users, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
           { label: 'Operations', icon: Layers, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
           { label: 'Settings', icon: Settings, color: 'bg-slate-50 text-slate-600', border: 'border-slate-100' },
         ].map((node, i) => (
           <Card key={i} className={cn("p-6 flex items-center justify-between bg-white border shadow-xl rounded-2xl group hover:border-primary transition-all cursor-pointer", node.border)}>
              <div className="flex items-center gap-5">
                <div className={cn("p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110", node.color)}>
                   <node.icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">{node.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
           </Card>
         ))}
      </div>
    </div>
  );
}
