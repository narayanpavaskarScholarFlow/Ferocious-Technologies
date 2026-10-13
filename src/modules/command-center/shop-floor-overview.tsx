"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Cpu, 
  BrainCircuit, 
  Bell, 
  UserCheck, 
  ShoppingCart,
  Factory,
  Receipt,
  Landmark,
  Zap,
} from 'lucide-react';
import { Order, Machine, QualityReport, WorkLogEntry, InventoryItem, BillingRecord, PermissionLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ShopFloorOverviewProps {
  orders: Order[];
  reports: QualityReport[];
  logs: WorkLogEntry[];
  machines: Machine[];
  inventory: InventoryItem[];
  billing: BillingRecord[];
  permissions: Record<string, PermissionLevel>;
  isMasterAdmin?: boolean;
}

export function ShopFloorOverview({ orders, machines, billing, permissions, isMasterAdmin }: ShopFloorOverviewProps) {
  
  const metrics = useMemo(() => {
    const invoices = billing.filter(r => r.type === 'invoice');
    const monthlyBilling = invoices.reduce((acc, r) => acc + (r.amount || 0), 0);

    const poValue = billing.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);

    const totalInvoiced = billing.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayments = billing.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalPayments;

    const pendingInvoices = billing.filter(r => r.type === 'invoice' && r.status === 'Pending').length;

    const prodAchievement = orders.length > 0 
      ? Math.round(orders.reduce((acc, o) => acc + (o.progress || 0), 0) / orders.length)
      : 0;

    const machineUtil = machines.length > 0
      ? Math.round(machines.reduce((acc, m) => acc + (m.load || 0), 0) / machines.length)
      : 0;

    return { 
      monthlyBilling, 
      customerPOValue: poValue, 
      outstanding, 
      prodAchievement,
      machineUtil,
      pendingInvoices,
    };
  }, [orders, billing, machines]);

  const machineStatuses = useMemo(() => {
    return machines.slice(0, 6).map(m => ({
      id: m.mcNumber || m.id,
      name: m.name,
      status: m.status,
      yield: m.load,
      color: m.status === 'Running' || m.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
    }));
  }, [machines]);

  const getPerm = (nodeId: string): PermissionLevel => {
    if (isMasterAdmin) return 'full';
    return permissions[nodeId] || 'none';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-body">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            Command Center Hub
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900 uppercase">
            Master <span className="text-blue-600">Dashboard</span>
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getPerm('dash-po') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer PO Value</p>
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShoppingCart className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-slate-900">₹ {(metrics.customerPOValue / 100000).toFixed(1)}L</span>
          </Card>
        )}

        {getPerm('dash-outstanding') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-red-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
               <div className="p-2 bg-red-50 rounded-lg text-red-600"><Landmark className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-red-600">₹ {(metrics.outstanding / 100000).toFixed(1)}L</span>
          </Card>
        )}

        {getPerm('dash-billing') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</p>
               <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Receipt className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-slate-900">{metrics.pendingInvoices}</span>
          </Card>
        )}

        {getPerm('dash-production') !== 'none' && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Velocity</p>
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Factory className="h-4 w-4" /></div>
            </div>
            <span className="text-3xl font-display font-bold text-emerald-600">{metrics.prodAchievement}%</span>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {getPerm('dash-machine') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Cpu className="h-6 w-6" /></div>
                <h3 className="text-lg font-bold text-slate-900 uppercase">Operational Asset Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {machineStatuses.length > 0 ? machineStatuses.map(m => (
                   <div key={m.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 group">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[10px] font-bold text-slate-400 uppercase font-code">{m.id}</span>
                         <div className={cn("h-2 w-2 rounded-full", m.status === 'active' || m.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-300')} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase truncate">{m.name}</h4>
                   </div>
                 )) : (
                   <p className="col-span-3 text-center text-[10px] font-bold uppercase text-slate-300 py-10">No assets registered</p>
                 )}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          {getPerm('dash-ai') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm space-y-8">
               <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">AI Intelligence</h3>
               </div>
               <div className="py-10 text-center opacity-20">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting data matrix synchronization</p>
               </div>
            </Card>
          )}

          {getPerm('dash-approvals') !== 'none' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">Certification Gateway</h3>
               </div>
               <div className="py-10 text-center opacity-20">
                  <p className="text-[10px] font-bold uppercase tracking-widest">No pending certifications</p>
               </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}