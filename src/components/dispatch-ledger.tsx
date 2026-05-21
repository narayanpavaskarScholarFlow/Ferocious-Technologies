
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
  Filter,
  AlertCircle,
  X,
  FileText,
  Lock,
  ExternalLink,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { Order, QualityReport, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DispatchLedgerProps {
  orders: Order[];
  reports: QualityReport[];
  billing: BillingRecord[];
  onSaveOrder: (order: Order) => void;
}

export function DispatchLedger({ orders, reports, billing, onSaveOrder }: DispatchLedgerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interactive Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalType, setModalType] = useState<'hold' | 'quality' | 'financial' | null>(null);

  const getVerificationStats = (orderId: string) => {
    const orderReports = reports.filter(r => r.workOrderId === orderId);
    const orderBilling = billing.filter(b => b.orderId === orderId && b.type === 'invoice');
    
    return {
      reportsReleased: orderReports.filter(r => r.status === 'Released').length,
      totalReports: orderReports.length,
      invoicesPaid: orderBilling.filter(b => b.status === 'Paid').length,
      totalInvoices: orderBilling.length,
      allReports: orderReports,
      allBilling: orderBilling
    };
  };

  const getProtocolStatus = (order: Order) => {
    if (order.status === 'Delivered') return 'Delivered';
    if (order.status === 'Ready for Delivery') return 'Ready for Delivery';
    
    const v = getVerificationStats(order.id);
    const qualityComplete = v.totalReports > 0 && v.reportsReleased === v.totalReports;
    const financialComplete = v.totalInvoices > 0 && v.invoicesPaid === v.totalInvoices;
    
    if (qualityComplete && financialComplete) return 'Ready for Delivery';
    return 'HOLD';
  };

  const readyOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.includes(searchTerm) || order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const isTerminal = order.status === 'Ready for Delivery' || order.status === 'Delivered' || order.status === 'Completed';
      return matchesSearch && isTerminal;
    }).sort((a, b) => {
        const statusA = getProtocolStatus(a);
        const statusB = getProtocolStatus(b);
        if (statusA === 'Ready for Delivery' && statusB !== 'Ready for Delivery') return -1;
        if (statusA === 'HOLD' && statusB === 'Delivered') return -1;
        return 0;
    });
  }, [orders, searchTerm, reports, billing]);

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

  const openVerificationModal = (order: Order, type: 'hold' | 'quality' | 'financial') => {
    setSelectedOrder(order);
    setModalType(type);
    setIsModalOpen(true);
  };

  const activeStats = selectedOrder ? getVerificationStats(selectedOrder.id) : null;

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
            className="pl-12 h-12 rounded-2xl bg-white border-none shadow-xl shadow-emerald-900/5 text-xs font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Ready for Loading</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-display font-bold text-emerald-600">
              {readyOrders.filter(o => getProtocolStatus(o) === 'Ready for Delivery').length}
            </h3>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Truck className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex flex-col justify-between group hover:border-amber-500/50 transition-all">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Blocked / HOLD</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-display font-bold text-amber-600">
              {readyOrders.filter(o => getProtocolStatus(o) === 'HOLD').length}
            </h3>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Lock className="h-6 w-6" /></div>
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
                const displayStatus = getProtocolStatus(order);
                const isReady = displayStatus === 'Ready for Delivery';
                const onHold = displayStatus === 'HOLD';
                
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
                       <div 
                        className="flex items-center gap-3 cursor-pointer group/lock"
                        onClick={() => openVerificationModal(order, 'quality')}
                       >
                          <div className={cn(
                            "p-2 rounded-lg transition-all group-hover/lock:scale-110", 
                            v.reportsReleased === v.totalReports && v.totalReports > 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                             <FileBadge className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1 group-hover/lock:text-primary">
                               Quality Reports <ExternalLink className="h-2 w-2 opacity-0 group-hover/lock:opacity-100" />
                             </span>
                             <span className="text-[9px] text-slate-400 font-bold">{v.reportsReleased} / {v.totalReports || 0} Released</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div 
                        className="flex items-center gap-3 cursor-pointer group/lock"
                        onClick={() => openVerificationModal(order, 'financial')}
                       >
                          <div className={cn(
                            "p-2 rounded-lg transition-all group-hover/lock:scale-110", 
                            v.invoicesPaid === v.totalInvoices && v.totalInvoices > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                             <Receipt className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1 group-hover/lock:text-primary">
                               Financial Lock <ExternalLink className="h-2 w-2 opacity-0 group-hover/lock:opacity-100" />
                             </span>
                             <span className="text-[9px] text-slate-400 font-bold">{v.invoicesPaid} / {v.totalInvoices || 0} Settled</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <button onClick={() => onHold && openVerificationModal(order, 'hold')}>
                         <Badge className={cn(
                           "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm transition-all",
                           displayStatus === 'Delivered' ? "bg-slate-100 text-slate-400 border-slate-200" : 
                           onHold ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse cursor-pointer hover:bg-amber-100" :
                           "bg-emerald-50 text-emerald-700 border-emerald-100"
                         )}>
                           {displayStatus}
                         </Badge>
                       </button>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       {isReady ? (
                         <Button 
                          className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-600/20 flex gap-3 group/btn"
                          onClick={() => handleDispatch(order)}
                         >
                           <Send className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" /> Execute Dispatch
                         </Button>
                       ) : onHold ? (
                         <div className="flex flex-col items-end gap-1 opacity-60">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Blocked</span>
                            <span className="text-[8px] text-slate-300 font-medium">Verify Locks to Unlock</span>
                         </div>
                       ) : (
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Terminal Archive</span>
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

      {/* Interactive Verification Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh]">
          {selectedOrder && activeStats && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Verification Detail Protocol</DialogTitle>
                <DialogDescription>Verification matrix details for the selected work order node.</DialogDescription>
              </DialogHeader>

              <div className={cn(
                "p-8 text-white flex justify-between items-center shrink-0",
                modalType === 'hold' ? "bg-amber-600" : modalType === 'quality' ? "bg-[#001F3D]" : "bg-emerald-600"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    {modalType === 'hold' && <AlertCircle className="h-7 w-7" />}
                    {modalType === 'quality' && <FileBadge className="h-7 w-7" />}
                    {modalType === 'financial' && <Receipt className="h-7 w-7" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
                      {modalType === 'hold' && 'Protocol Bottleneck Analysis'}
                      {modalType === 'quality' && 'Quality Verification Registry'}
                      {modalType === 'financial' && 'Financial Settlement Ledger'}
                    </h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Work Order Node: #{selectedOrder.id} - {selectedOrder.customer}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white hover:bg-white/10 rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-10">
                {modalType === 'hold' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="p-6 border-slate-100 shadow-sm bg-slate-50/50 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Operations</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">100% Sequence Yield</p>
                        <Badge className="bg-emerald-50 text-emerald-700 w-fit text-[8px] uppercase font-bold">VERIFIED</Badge>
                      </Card>

                      <Card className={cn(
                        "p-6 border-slate-100 shadow-sm flex flex-col gap-4",
                        activeStats.reportsReleased === activeStats.totalReports && activeStats.totalReports > 0 ? "bg-slate-50/50" : "bg-amber-50/50 border-amber-100"
                      )}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Quality Lock</span>
                          {activeStats.reportsReleased === activeStats.totalReports && activeStats.totalReports > 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                        </div>
                        <p className="text-xs font-bold text-slate-700">{activeStats.reportsReleased} / {activeStats.totalReports} Released</p>
                        <Badge className={cn("w-fit text-[8px] uppercase font-bold", activeStats.reportsReleased === activeStats.totalReports && activeStats.totalReports > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-500 text-white")}>
                          {activeStats.reportsReleased === activeStats.totalReports && activeStats.totalReports > 0 ? 'RELEASED' : 'PENDING'}
                        </Badge>
                      </Card>

                      <Card className={cn(
                        "p-6 border-slate-100 shadow-sm flex flex-col gap-4",
                        activeStats.invoicesPaid === activeStats.totalInvoices && activeStats.totalInvoices > 0 ? "bg-slate-50/50" : "bg-red-50/50 border-red-100"
                      )}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Financial Lock</span>
                          {activeStats.invoicesPaid === activeStats.totalInvoices && activeStats.totalInvoices > 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className="text-xs font-bold text-slate-700">{activeStats.invoicesPaid} / {activeStats.totalInvoices} Settled</p>
                        <Badge className={cn("w-fit text-[8px] uppercase font-bold", activeStats.invoicesPaid === activeStats.totalInvoices && activeStats.totalInvoices > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-500 text-white")}>
                          {activeStats.invoicesPaid === activeStats.totalInvoices && activeStats.totalInvoices > 0 ? 'PAID' : 'AWAITING'}
                        </Badge>
                      </Card>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                       <h4 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest mb-4 flex items-center gap-2">
                         <ShieldAlert className="h-3.5 w-3.5" /> Temporal Hold Protocol
                       </h4>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">
                         Terminal dispatch node is locked. {activeStats.reportsReleased < activeStats.totalReports ? 'Quality reports are still in Draft or Review Pending status. ' : ''} 
                         {activeStats.invoicesPaid < activeStats.totalInvoices ? 'Commercial settlement for linked invoices is pending in the Financial Hub.' : ''}
                       </p>
                    </div>
                  </div>
                )}

                {modalType === 'quality' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspection Ledger</h4>
                      <Badge className="bg-primary text-white text-[8px] font-bold uppercase">{activeStats.totalReports} Reports</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeStats.allReports.map(r => (
                        <div key={r.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><FileText className="h-4 w-4" /></div>
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-bold text-slate-700 uppercase truncate max-w-[150px]">{r.drawingName}</span>
                                 <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{r.id}</span>
                              </div>
                           </div>
                           <Badge className={cn(
                             "text-[8px] font-bold uppercase",
                             r.status === 'Released' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                           )}>{r.status}</Badge>
                        </div>
                      ))}
                      {activeStats.totalReports === 0 && (
                        <div className="col-span-2 py-10 flex flex-col items-center justify-center opacity-30 text-center">
                           <ShieldAlert className="h-8 w-8 mb-2" />
                           <p className="text-[9px] font-bold uppercase tracking-widest">No Quality Nodes Discovered</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {modalType === 'financial' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commercial Ledger</h4>
                      <Badge className="bg-emerald-600 text-white text-[8px] font-bold uppercase">Valuation Sync Active</Badge>
                    </div>
                    <div className="space-y-3">
                      {activeStats.allBilling.map(b => (
                        <div key={b.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Receipt className="h-5 w-5" /></div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-700 uppercase">{b.number}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{b.date} • {b.paymentMethod || 'Bank'}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <div className="text-right">
                                 <span className="text-[11px] font-display font-bold text-[#001F3D]">₹ {b.amount.toLocaleString('en-IN')}</span>
                              </div>
                              <Badge className={cn(
                                "w-20 justify-center text-[8px] font-bold uppercase",
                                b.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                              )}>{b.status}</Badge>
                           </div>
                        </div>
                      ))}
                      {activeStats.totalInvoices === 0 && (
                        <div className="py-10 flex flex-col items-center justify-center opacity-30 text-center">
                           <Wallet className="h-8 w-8 mb-2" />
                           <p className="text-[9px] font-bold uppercase tracking-widest">No Commercial Invoices Discovered</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>

              <DialogFooter className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fidelity Protocol Verified</span>
                </div>
                <Button 
                  className="h-12 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close Analysis
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
