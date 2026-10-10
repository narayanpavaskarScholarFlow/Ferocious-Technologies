
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Receipt, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Building2, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  ClipboardList, 
  FileCheck, 
  Zap,
  Hammer,
  ChevronRight,
  X,
  Download,
  Share2,
  Search,
  Filter,
  PackageCheck
} from 'lucide-react';
import { BillingRecord, Customer, ProductMaster, WorkLogEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BillingManagement } from '@/modules/financial/billing-management';

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

interface OperationalQuickLinksProps {
  currentUser: string | null;
  customers: Customer[];
  records: BillingRecord[];
  products: ProductMaster[];
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export function OperationalQuickLinks({ 
  currentUser, 
  customers, 
  records, 
  products, 
  onSaveRecord, 
  onDeleteRecord 
}: OperationalQuickLinksProps) {
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  if (selectedDocType) {
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
           <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => setSelectedDocType(null)} className="rounded-full h-12 w-12 hover:bg-slate-100 group transition-all">
                 <X className="h-6 w-6 text-slate-400 group-hover:text-red-500" />
              </Button>
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-0.5">
                    <Badge className="bg-[#001F3D] text-white border-none text-[8px] font-black uppercase px-2 tracking-widest">Operational_Node_Active</Badge>
                 </div>
                 <h3 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tight leading-none">
                    {QUICK_LINKS.find(l => l.type === selectedDocType)?.label} Workspace
                 </h3>
              </div>
           </div>
           <div className="flex gap-4">
              <Button variant="outline" className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest gap-2"><Download className="h-3.5 w-3.5" /> Export Matrix</Button>
              <Button className="rounded-xl h-10 px-8 bg-[#001F3D] text-white font-bold uppercase text-[9px] tracking-widest shadow-xl flex gap-2" onClick={() => setSelectedDocType(null)}><X className="h-3.5 w-3.5" /> Exit Workspace</Button>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[800px]">
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
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 px-2">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-display font-black text-[#001F3D] uppercase tracking-tight">Daily Operational Matrix</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Institutional Execution Hub v2.4</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {QUICK_LINKS.map(link => {
          const Icon = link.icon;
          return (
            <button 
              key={link.id}
              onClick={() => setSelectedDocType(link.type)}
              className="p-10 bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-center group hover:border-primary hover:shadow-2xl hover:translate-y-[-4px] transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-700 pointer-events-none" />
              <div className="p-6 bg-slate-50 rounded-[1.5rem] text-slate-400 group-hover:bg-[#001F3D] group-hover:text-white transition-all duration-700 shadow-sm relative z-10">
                <Icon className="h-10 w-10" />
              </div>
              <div className="space-y-1 relative z-10">
                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1">Matrix Node</p>
                 <span className="text-sm font-black uppercase text-[#001F3D] tracking-tight transition-colors leading-tight">{link.label}</span>
              </div>
              <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                 <ChevronRight className="h-4 w-4 text-primary" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
