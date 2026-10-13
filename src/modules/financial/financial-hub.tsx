"use client";

import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
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
  FileCheck,
  Zap,
  Hammer,
  ClipboardList,
  X,
  Download,
  ChevronRight,
  BarChart3,
  TrendingDown,
  Target
} from 'lucide-react';
import { BillingRecord, Customer, ProductMaster } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BillingManagement } from '@/modules/financial/billing-management';
import { format } from 'date-fns';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip,
} from 'recharts';

interface FinancialHubProps {
  currentUser: string | null;
  customers: Customer[];
  records: BillingRecord[];
  products: ProductMaster[];
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
  currentUser, customers, records, products, onSaveRecord, onDeleteRecord 
}: FinancialHubProps) {
  const [activeMode, setActiveMode] = useState<'Analytics' | 'Quick Links'>('Analytics');
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const bi = useMemo(() => {
    const invoices = records.filter(r => r.type === 'invoice');
    const monthlySales = invoices.reduce((acc, r) => acc + (r.amount || 0), 0);

    const purchases = records.filter(r => r.type === 'purchase_invoice');
    const monthlyPurchases = purchases.reduce((acc, r) => acc + (r.amount || 0), 0);

    const income = records.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const expense = records.filter(r => r.type === 'outward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);

    const receivables = records.filter(r => r.type === 'invoice' && r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);
    const payables = records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);

    return { monthlySales, monthlyPurchases, income, expense, receivables, payables };
  }, [records]);

  // Cleared sample trend data
  const chartData: any[] = [];

  const AnalyticsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 px-2">
      <div className="flex justify-end items-center gap-4 mb-2">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Active: {format(new Date(), 'dd MMM yyyy')}</span>
         <Button className="h-10 bg-[#001F3D] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2">
            Refresh Hub <RefreshCw className="h-3.5 w-3.5" />
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sales Performance</p>
            <p className="text-4xl font-display font-black text-[#001F3D]">₹ {bi.monthlySales.toLocaleString()}</p>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{ width: bi.monthlySales > 0 ? '100%' : '0%' }} />
            </div>
         </Card>

         <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2rem] flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Purchase Load</p>
            <p className="text-4xl font-display font-black text-[#001F3D]">₹ {bi.monthlyPurchases.toLocaleString()}</p>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500" style={{ width: bi.monthlyPurchases > 0 ? '100%' : '0%' }} />
            </div>
         </Card>

         <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4">
               <div className="flex justify-between items-center"><p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Total Expense</p><p className="text-xl font-display font-black text-rose-400">₹ {bi.expense.toLocaleString()}</p></div>
               <div className="flex justify-between items-center"><p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Total Income</p><p className="text-xl font-display font-black text-emerald-400">₹ {bi.income.toLocaleString()}</p></div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[3rem] h-64 flex flex-col items-center justify-center opacity-20">
            <Target className="h-12 w-12 mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Receivables Matrix Idle</p>
         </Card>
         <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[3rem] h-64 flex flex-col items-center justify-center opacity-20">
            <Target className="h-12 w-12 mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Payables Matrix Idle</p>
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
                 <button onClick={() => setSelectedDocType(null)} className="rounded-full h-12 w-12 hover:bg-slate-100 flex items-center justify-center transition-all group">
                    <X className="h-6 w-6 text-slate-400 group-hover:text-red-500" />
                 </button>
                 <div className="flex flex-col">
                    <h3 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tight leading-none">{QUICK_LINKS.find(l => l.type === selectedDocType)?.label}</h3>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setSelectedDocType(null)} className="rounded-xl h-10 px-8 bg-[#001F3D] text-white font-bold uppercase text-[9px] tracking-widest shadow-xl">Exit Workspace</button>
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
                className="p-10 bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-center group hover:border-primary hover:shadow-2xl transition-all"
              >
                <div className="p-6 bg-slate-50 rounded-[1.5rem] text-slate-400 group-hover:bg-[#001F3D] group-hover:text-white transition-all duration-700">
                  <Icon className="h-10 w-10" />
                </div>
                <span className="text-sm font-black uppercase text-[#001F3D] tracking-tight">{link.label}</span>
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
              className={cn("px-12 h-11 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all", activeMode === 'Analytics' ? "bg-[#001F3D] text-white" : "text-slate-400 hover:bg-slate-50")}
            >
              Institutional Intelligence
            </button>
            <button 
              onClick={() => setActiveMode('Quick Links')}
              className={cn("px-12 h-11 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all", activeMode === 'Quick Links' ? "bg-[#001F3D] text-white" : "text-slate-400 hover:bg-slate-50")}
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
