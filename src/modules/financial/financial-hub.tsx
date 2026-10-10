
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowLeft
} from 'lucide-react';
import { BillingRecord, Customer, Order, ProductMaster, WorkLogEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BillingManagement } from './billing-management';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-end items-center gap-4 mb-2">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated 7 days ago</span>
         <div className="flex items-center gap-2 bg-white border rounded-xl px-4 h-10 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 font-code">03-04-2025 To 03-10-2025</span>
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
         </div>
         <Button className="h-10 bg-[#00b894] hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2">
            Refresh <RefreshCw className="h-3.5 w-3.5" />
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl space-y-6 h-48">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sale</p>
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(), 'MMM yyyy')}</p>
               <p className="text-3xl font-display font-black text-slate-900">₹ {bi.monthlySales.toLocaleString()}</p>
            </div>
            <div className="flex gap-1 h-2 items-end">
               {[20, 30, 45, 25, 60, 40].map((h, i) => <div key={i} className="flex-1 bg-emerald-100 rounded-full" style={{ height: `${h}%` }} />)}
            </div>
         </Card>

         <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl space-y-6 h-48">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Purchase</p>
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(), 'MMM yyyy')}</p>
               <p className="text-3xl font-display font-black text-slate-900">₹ {bi.monthlyPurchases.toLocaleString()}</p>
            </div>
            <div className="flex gap-1 h-2 items-end">
               {[40, 20, 35, 55, 30, 50].map((h, i) => <div key={i} className="flex-1 bg-blue-100 rounded-full" style={{ height: `${h}%` }} />)}
            </div>
         </Card>

         <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl h-48">
            <div className="flex justify-between items-center mb-6">
               <div className="flex gap-8">
                  <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Expense</p><p className="text-xl font-display font-black text-slate-900">₹ {bi.expense.toLocaleString()}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Income</p><p className="text-xl font-display font-black text-slate-900">₹ {bi.income.toLocaleString()}</p></div>
               </div>
               <BarChart3 className="h-5 w-5 text-slate-200" />
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">Sales Outstanding</h4>
               <Target className="h-4 w-4 text-slate-200" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase">Total Receivables: <span className="text-[#001F3D] ml-2">₹ {bi.receivables.toLocaleString()}</span></p>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden mb-10"><div className="h-full bg-emerald-500 w-[70%]" /></div>
            
            <div className="grid grid-cols-4 gap-4">
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Current</p>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-emerald-500" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div>
               </div>
               <div className="col-span-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Overdue</p>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-amber-400" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-5">1-15 DAYS</span></div>
                     <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-orange-500" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-5">16-30 DAYS</span></div>
                     <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-red-600" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-5">30+ DAYS</span></div>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">Purchase Outstanding</h4>
               <Target className="h-4 w-4 text-slate-200" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase">Total Payables: <span className="text-[#001F3D] ml-2">₹ {bi.payables.toLocaleString()}</span></p>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden mb-10"><div className="h-full bg-blue-500 w-[40%]" /></div>
            
            <div className="grid grid-cols-4 gap-4">
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Current</p>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-emerald-500" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div>
               </div>
               <div className="col-span-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Overdue</p>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-amber-400" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-5">1-15 DAYS</span></div>
                     <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-orange-500" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-5">16-30 DAYS</span></div>
                     <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-red-600" /><span className="text-xs font-black text-slate-800">₹ 0.00</span></div><span className="text-[8px] text-slate-300 font-bold ml-5">30+ DAYS</span></div>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );

  const QuickLinksView = () => (
    <div className="animate-in fade-in duration-500">
      {selectedDocType ? (
        <div className="space-y-6">
           <Button variant="ghost" onClick={() => setSelectedDocType(null)} className="rounded-full gap-2 text-slate-400 hover:text-[#001F3D]">
              <ArrowLeft className="h-4 w-4" /> Back to Matrix
           </Button>
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <button 
                key={link.id}
                onClick={() => setSelectedDocType(link.type)}
                className="p-8 bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center group hover:border-[#00b894] hover:shadow-2xl transition-all"
              >
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-[#00b894]/10 group-hover:text-[#00b894] transition-all">
                  <Icon className="h-8 w-8" />
                </div>
                <span className="text-[11px] font-black uppercase text-[#001F3D] tracking-tight">{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 font-body pb-20">
      <div className="flex justify-center">
         <div className="bg-slate-100 p-1.5 rounded-full inline-flex border border-slate-200 shadow-sm gap-1">
            <button 
              onClick={() => { setActiveMode('Analytics'); setSelectedDocType(null); }}
              className={cn("px-10 h-10 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all", activeMode === 'Analytics' ? "bg-[#00b894] text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveMode('Quick Links')}
              className={cn("px-10 h-10 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all", activeMode === 'Quick Links' ? "bg-[#00b894] text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
            >
              Quick Links
            </button>
         </div>
      </div>

      {activeMode === 'Analytics' ? <AnalyticsView /> : <QuickLinksView />}
    </div>
  );
}
