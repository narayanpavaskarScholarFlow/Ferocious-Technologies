"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Building2, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  RefreshCw, 
  Calendar,
  CreditCard,
  ClipboardList,
  FileCheck,
  Target,
  LayoutGrid,
  ChevronRight,
  PackageCheck,
  Hammer,
  ShieldAlert,
  Zap,
  Info,
  ArrowLeft,
  X,
  Download,
  Share2
} from 'lucide-react';
import { BillingRecord, Customer, Order, ProductMaster, WorkLogEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BillingManagement } from '@/modules/financial/billing-management';
import { format } from 'date-fns';

interface FinancialHubProps {
  currentUser: string | null;
  customers: Customer[];
  records: BillingRecord[];
  products: ProductMaster[];
  orders: Order[];
  logs: WorkLogEntry[];
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
}

const QUICK_LINKS = [
  { id: 'sale-invoice', label: 'Sale Invoice', icon: Receipt, type: 'invoice' },
  { id: 'purchase-invoice', label: 'Purchase Invoice', icon: ShoppingCart, type: 'purchase_invoice' },
  { id: 'quotation', label: 'Quotation', icon: FileText, type: 'quotation' },
  { id: 'delivery-challan', label: 'Delivery Challan', icon: Truck, type: 'delivery_challan' },
  { id: 'proforma', label: 'Proforma', icon: FileCheck, type: 'proforma' },
  { id: 'purchase-order', label: 'Purchase Order', icon: ShoppingCart, type: 'purchase_order' },
  { id: 'sale-order', label: 'Sale Order', icon: ClipboardList, type: 'sale_order' },
  { id: 'job-work', label: 'Job Work', icon: Hammer, type: 'job_work' },
  { id: 'credit-note', label: 'Credit Note', icon: ArrowDownLeft, type: 'credit_note' },
  { id: 'debit-note', label: 'Debit Note', icon: ArrowUpRight, type: 'debit_note' },
  { id: 'service-request', label: 'Service Request', icon: Zap, type: 'service_request' },
  { id: 'inward-payment', label: 'Inward Payment', icon: Landmark, type: 'inward_payment' },
  { id: 'outward-payment', label: 'Outward Payment', icon: Wallet, type: 'outward_payment' },
];

export function FinancialHub({ 
  currentUser, customers, records, products, orders, logs, onSaveRecord, onDeleteRecord 
}: FinancialHubProps) {
  const [activeMode, setActiveMode] = useState<'Analytics' | 'Quick Links'>('Analytics');
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  // Dynamic Intelligence Matrix
  const bi = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sales = records.filter(r => r.type === 'invoice');
    const monthlySales = sales.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, r) => acc + (r.amount || 0), 0);

    const purchases = records.filter(r => r.type === 'purchase_invoice');
    const monthlyPurchases = purchases.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, r) => acc + (r.amount || 0), 0);

    const income = records.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const expense = records.filter(r => r.type === 'outward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);

    const receivables = records.filter(r => r.type === 'invoice' && r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);
    const payables = records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);

    return { monthlySales, monthlyPurchases, income, expense, receivables, payables };
  }, [records]);

  const AnalyticsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 px-2">
      <div className="flex justify-end items-center gap-4 mb-2">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated: {format(new Date(), 'dd MMM HH:mm')}</span>
         <div className="flex items-center gap-2 bg-white border rounded-xl px-4 h-10 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 font-code">{format(new Date(), 'dd-MM-yyyy')}</span>
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
         </div>
         <Button className="h-10 bg-[#00b894] hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 shadow-sm">
            Refresh Hub <RefreshCw className="h-3.5 w-3.5" />
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-6 h-56 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><TrendingUp className="h-24 w-24" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sales Performance</p>
            <div className="space-y-1 relative z-10">
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
               <p className="text-4xl font-display font-black text-[#001F3D]">₹ {bi.monthlySales.toLocaleString()}</p>
            </div>
            <div className="flex gap-1.5 h-6 items-end relative z-10">
               {[20, 35, 45, 25, 60, 40, 75].map((h, i) => <div key={i} className="flex-1 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500/40 transition-colors" style={{ height: `${h}%` }} />)}
            </div>
         </Card>

         <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] space-y-6 h-56 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><ShoppingCart className="h-24 w-24" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Purchase Load</p>
            <div className="space-y-1 relative z-10">
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
               <p className="text-4xl font-display font-black text-[#001F3D]">₹ {bi.monthlyPurchases.toLocaleString()}</p>
            </div>
            <div className="flex gap-1.5 h-6 items-end relative z-10">
               {[40, 20, 35, 55, 30, 50, 45].map((h, i) => <div key={i} className="flex-1 bg-blue-500/20 rounded-full group-hover:bg-blue-500/40 transition-colors" style={{ height: `${h}%` }} />)}
            </div>
         </Card>

         <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2rem] h-56 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '25px 25px' }} />
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-8">
                  <div className="space-y-1"><p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Total Expense</p><p className="text-2xl font-display font-black text-rose-400">₹ {bi.expense.toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Total Income</p><p className="text-2xl font-display font-black text-emerald-400">₹ {bi.income.toLocaleString()}</p></div>
               </div>
               <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5"><BarChart3 className="h-8 w-8 text-primary" /></div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[3rem] space-y-10">
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-lg shadow-emerald-500/10"><Target className="h-6 w-6" /></div>
                  <h4 className="text-lg font-display font-black uppercase tracking-tight text-[#001F3D]">Sales Outstanding Matrix</h4>
               </div>
               <Badge className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-4 h-8 uppercase border-emerald-100">Live Sync</Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end px-2"><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Receivables</span><span className="text-3xl font-display font-black text-[#001F3D]">₹ {bi.receivables.toLocaleString()}</span></div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] w-[70%]" /></div>
            </div>
            
            <div className="grid grid-cols-4 gap-6 pt-6 border-t border-slate-50">
               <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Current</p>
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div>
               </div>
               <div className="col-span-3 space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Overdue Tiers</p>
                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-1"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-[11px] font-black text-slate-800 tracking-tight">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-4 uppercase">1-15 DAYS</span></div>
                     <div className="space-y-1"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-orange-500" /><span className="text-[11px] font-black text-slate-800 tracking-tight">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-4 uppercase">16-30 DAYS</span></div>
                     <div className="space-y-1"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-600" /><span className="text-[11px] font-black text-slate-800 tracking-tight">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-4 uppercase">30+ DAYS</span></div>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[3rem] space-y-10">
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-lg shadow-blue-500/10"><Target className="h-6 w-6" /></div>
                  <h4 className="text-lg font-display font-black uppercase tracking-tight text-[#001F3D]">Purchase Liability Matrix</h4>
               </div>
               <Badge className="bg-blue-50 text-blue-700 font-bold text-[10px] px-4 h-8 uppercase border-blue-100">Live Sync</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end px-2"><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Payables</span><span className="text-3xl font-display font-black text-[#001F3D]">₹ {bi.payables.toLocaleString()}</span></div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] w-[40%]" /></div>
            </div>
            
            <div className="grid grid-cols-4 gap-6 pt-6 border-t border-slate-50">
               <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Current</p>
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div>
               </div>
               <div className="col-span-3 space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Overdue Tiers</p>
                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-1"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-[11px] font-black text-slate-800 tracking-tight">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-4 uppercase">1-15 DAYS</span></div>
                     <div className="space-y-1"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-orange-500" /><span className="text-[11px] font-black text-slate-800 tracking-tight">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-4 uppercase">16-30 DAYS</span></div>
                     <div className="space-y-1"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-600" /><span className="text-[11px] font-black text-slate-800 tracking-tight">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-4 uppercase">30+ DAYS</span></div>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );

  const QuickLinksView = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 px-4">
      {selectedDocType ? (
        <div className="space-y-8">
           <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-6">
                 <Button variant="ghost" size="icon" onClick={() => setSelectedDocType(null)} className="rounded-full h-12 w-12 hover:bg-slate-100 group transition-all">
                    <X className="h-6 w-6 text-slate-400 group-hover:text-red-500" />
                 </Button>
                 <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                       <Badge className="bg-[#001F3D] text-white border-none text-[8px] font-black uppercase px-2 tracking-widest">Workspace_Active</Badge>
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Protocol Node</span>
                    </div>
                    <h3 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tight leading-none">{QUICK_LINKS.find(l => l.type === selectedDocType)?.label} Workspace</h3>
                 </div>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest gap-2 bg-slate-50 border-none text-slate-500 hover:bg-slate-100"><Download className="h-3.5 w-3.5" /> Export Matrix</Button>
                 <Button className="rounded-xl h-10 px-8 bg-[#001F3D] hover:bg-black text-white font-bold uppercase text-[9px] tracking-widest shadow-xl flex gap-2" onClick={() => setSelectedDocType(null)}><X className="h-3.5 w-3.5" /> Exit Node</Button>
              </div>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[700px]">
             <BillingManagement 
               currentUser={currentUser} 
               customers={customers} 
               records={records} 
               products={products} 
               onSaveRecord={onSaveRecord} 
               onDeleteRecord={onDeleteRecord} 
               initialTab={selectedDocType} 
             />
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <button 
                key={link.id}
                onClick={() => setSelectedDocType(link.type)}
                className="p-10 bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-center group hover:border-emerald-500 hover:shadow-2xl hover:translate-y-[-4px] transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/50 transition-all duration-700 pointer-events-none" />
                <div className="p-6 bg-slate-50 rounded-[1.5rem] text-slate-400 group-hover:bg-[#001F3D] group-hover:text-white group-hover:rotate-[360deg] transition-all duration-1000 shadow-sm relative z-10">
                  <Icon className="h-10 w-10" />
                </div>
                <div className="space-y-1 relative z-10">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1">Matrix Node</p>
                   <span className="text-sm font-black uppercase text-[#001F3D] tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">{link.label}</span>
                </div>
                <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                   <ChevronRight className="h-4 w-4 text-emerald-500" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 font-body pb-20 max-w-[1800px] mx-auto">
      <div className="flex justify-center">
         <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] inline-flex border border-slate-200 shadow-xl gap-1">
            <button 
              onClick={() => { setActiveMode('Analytics'); setSelectedDocType(null); }}
              className={cn("px-12 h-11 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all duration-500", activeMode === 'Analytics' ? "bg-[#001F3D] text-white shadow-2xl scale-[1.02]" : "text-slate-400 hover:bg-slate-50")}
            >
              Institutional Intelligence
            </button>
            <button 
              onClick={() => setActiveMode('Quick Links')}
              className={cn("px-12 h-11 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all duration-500", activeMode === 'Quick Links' ? "bg-[#001F3D] text-white shadow-2xl scale-[1.02]" : "text-slate-400 hover:bg-slate-50")}
            >
              Operational Quick Links
            </button>
         </div>
      </div>

      <div className="px-1">
        {activeMode === 'Analytics' ? <AnalyticsView /> : <QuickLinksView />}
      </div>
    </div>
  );
}
