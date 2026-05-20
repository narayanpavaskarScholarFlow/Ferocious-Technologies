
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PackageCheck, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Landmark, 
  Receipt,
  FileBadge,
  Send,
  Archive,
  ArrowRight,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Order, QualityReport, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DispatchLedgerProps {
  orders: Order[];
  reports: QualityReport[];
  billing: BillingRecord[];
  onSaveOrder: (order: Order) => void;
}

export function DispatchLedger({ orders, reports, billing, onSaveOrder }: DispatchLedgerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const readyOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.includes(searchTerm) || order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const isTerminal = order.status === 'Ready for Delivery' || order.status === 'Delivered';
      return matchesSearch && isTerminal;
    }).sort((a, b) => {
        if (a.status === 'Ready for Delivery' && b.status === 'Delivered') return -1;
        if (a.status === 'Delivered' && b.status === 'Ready for Delivery') return 1;
        return 0;
    });
  }, [orders, searchTerm]);

  const handleDispatch = (order: Order) => {
    const updated: Order = {
      ...order,
      status: 'Delivered',
      deliveredAt: new Date().toISOString()
    };
    onSaveOrder(updated);
    toast({
      title: "Logistics Transmitted",
      description: `Order #${order.id} for ${order.customer} marked as Delivered.`
    });
  };

  const getVerificationStats = (orderId: string) => {
    const orderReports = reports.filter(r => r.workOrderId === orderId);
    const orderBilling = billing.filter(b => b.orderId === orderId && b.type === 'invoice');
    
    return {
      reportsReleased: orderReports.filter(r => r.status === 'Released').length,
      totalReports: orderReports.length,
      invoicesPaid: orderBilling.filter(b => b.status === 'Paid').length,
      totalInvoices: orderBilling.length
    };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-[0.3em]">
            <PackageCheck className="h-4 w-4" />
            Terminal Logistics Ledger
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Dispatch <span className="text-slate-400 font-medium">& Delivery</span>
          </h2>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Authorized orders cleared through the Triple-Lock Verification Matrix.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <Input 
            placeholder="Search dispatch queue..." 
            className="pl-12 h-12 rounded-2xl bg-white border-none shadow-xl shadow-emerald-900/5 text-xs font-bold uppercase tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Ready for Loading</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-display font-bold text-emerald-600">{readyOrders.filter(o => o.status === 'Ready for Delivery').length}</h3>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Truck className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-500/50 transition-all">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Total Delivered (MTD)</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-display font-bold text-blue-600">{readyOrders.filter(o => o.status === 'Delivered').length}</h3>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><CheckCircle2 className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest mb-2">System Integrity</p>
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-display font-bold uppercase tracking-tight">Verified</h3>
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#001F3D] rounded-lg text-white"><Archive className="h-4 w-4" /></div>
             <span className="text-[11px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Operational Dispatch Matrix</span>
          </div>
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-9 px-6 uppercase tracking-widest">
            {readyOrders.length} Terminal Entries
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Thread Node (WO)</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identity Account</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Quality Lock</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Financial Lock</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                <TableHead className="text-right px-10 w-48">Authorization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readyOrders.map((order) => {
                const v = getVerificationStats(order.id);
                return (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                    <TableCell className="px-10">
                       <div className="flex flex-col">
                          <span className="text-lg font-display font-bold text-primary">#{order.id}</span>
                          <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">PO: {order.poNumber || '---'}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{order.customer}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase mt-1">{order.typeOfWork}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", v.reportsReleased === v.totalReports ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                             <FileBadge className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-700 uppercase">Reports Released</span>
                             <span className="text-[9px] text-slate-400 font-bold">{v.reportsReleased} / {v.totalReports} Verified</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", v.invoicesPaid === v.totalInvoices ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                             <Receipt className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-700 uppercase">Invoices Paid</span>
                             <span className="text-[9px] text-slate-400 font-bold">{v.invoicesPaid} / {v.totalInvoices} Cleared</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn(
                         "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                         order.status === 'Delivered' ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                       )}>
                         {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       {order.status === 'Ready for Delivery' ? (
                         <Button 
                          className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-600/20 flex gap-3"
                          onClick={() => handleDispatch(order)}
                         >
                           <Send className="h-4 w-4" /> Execute Dispatch
                         </Button>
                       ) : (
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Archived Terminal</span>
                            <span className="text-[8px] font-code text-slate-200">{order.deliveredAt}</span>
                         </div>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {readyOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-96 text-center">
                     <div className="flex flex-col items-center justify-center opacity-30 py-10">
                        <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                           <ShieldCheck className="h-20 w-20 text-slate-300" />
                        </div>
                        <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Triple-Lock Active</p>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium leading-relaxed">No orders have cleared the complete verification matrix yet. Ensure all Operations, Quality Reports, and Invoices are finalized.</p>
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

