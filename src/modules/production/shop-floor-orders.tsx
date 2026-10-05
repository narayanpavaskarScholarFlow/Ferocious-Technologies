
"use client";

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order, BillingRecord, WorkLogEntry, Machine } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Edit2, TrendingUp, Filter, Receipt, Cpu, DollarSign, ChevronRight, Info, Link2, Archive, CalendarDays, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShopFloorOrdersProps {
  orders: Order[];
  onNavigateToOperations?: (orderId: string) => void;
  onNavigateToOrderDetails?: (orderId: string | null) => void;
  billing?: BillingRecord[];
  logs?: WorkLogEntry[];
  machines?: Machine[];
}

export function ShopFloorOrders({ orders, onNavigateToOperations, onNavigateToOrderDetails, billing = [], logs = [], machines = [] }: ShopFloorOrdersProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [breakupOrderId, setBreakupOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.includes(searchTerm) || 
                           order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const isTerminal = order.status === 'Delivered';
      return matchesSearch && !isTerminal;
    });
  }, [orders, searchTerm]);

  const selectedOrderForBreakup = useMemo(() => {
    return orders.find(o => o.id === breakupOrderId);
  }, [orders, breakupOrderId]);

  const expenseBreakup = useMemo(() => {
    if (!breakupOrderId) return { external: [], internal: [], totalExternal: 0, totalInternal: 0 };
    const external = billing.filter(r => r.type === 'inward' && r.orderId === breakupOrderId);
    const internalLogs = logs.filter(l => l.workOrderId === breakupOrderId);
    const internal = internalLogs.map(log => {
      const machine = machines.find(m => m.id === log.resourceId);
      const hours = parseFloat(log.duration.replace('h', '')) || 0;
      const rate = machine?.costPerHour || 0;
      return { id: log.id, resourceName: log.resourceName, operator: log.operator, hours, rate, cost: hours * rate, date: log.date };
    });
    const totalExternal = external.reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInternal = internal.reduce((acc, l) => acc + l.cost, 0);
    return { external, internal, totalExternal, totalInternal };
  }, [breakupOrderId, billing, logs, machines]);

  const getStatusStyles = (status: Order['status']) => {
    switch (status) {
      case 'Draft': return "bg-slate-100 text-slate-500 border-slate-200";
      case 'Planning': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'Production': return "bg-amber-50 text-amber-700 border-amber-100 animate-pulse";
      case 'Inspection': return "bg-purple-50 text-purple-700 border-purple-100";
      case 'Dispatch': return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case 'Completed': return "bg-[#001F3D] text-white border-[#001F3D]";
      default: return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-lg font-display font-black text-primary">#{order.id}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.typeOfWork || 'GENERAL'}</span>
        </div>
        <Badge className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border", getStatusStyles(order.status))}>
          {order.status}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{order.customer}</p>
        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase">
          <User className="h-3 w-3" /> {order.owner || 'UNSET'}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <span>Production Yield</span>
          <span>{order.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <Progress value={order.progress || 0} className="h-full rounded-full transition-all duration-1000" />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase">Target Delivery</span>
          <span className="text-[10px] font-code font-bold text-primary">{order.endDate}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-slate-50 rounded-xl" onClick={() => onNavigateToOrderDetails?.(order.id)}>
            <Edit2 className="h-4 w-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-[#001F3D] text-white rounded-xl" onClick={() => onNavigateToOperations?.(order.id)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 md:gap-10 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-2">
        <div className="relative flex-1 w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search active orders..." 
            className="pl-12 h-12 rounded-2xl bg-white border-none shadow-xl shadow-blue-900/5 text-xs font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          className="w-full sm:w-auto h-12 px-8 gap-3 bg-[#001F3D] hover:bg-black text-white font-bold uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 rounded-2xl transition-all"
          onClick={() => onNavigateToOrderDetails?.(null)}
        >
          <Plus className="h-4 w-4" />
          Initialize Order
        </Button>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-6 px-2">
          {filteredOrders.length > 0 ? filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          )) : (
            <div className="py-20 text-center opacity-30">
               <Archive className="h-16 w-16 mx-auto mb-4" />
               <p className="text-xs font-bold uppercase tracking-widest">No Active Threads</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
          <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#001F3D] rounded-lg text-white shadow-lg"><Filter className="h-4 w-4" /></div>
              <span className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Master Ledger</span>
            </div>
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-8 px-4 uppercase tracking-widest">
              {filteredOrders.length} Execution Threads
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">WO Node</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 hidden xl:table-cell">Linked PO</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-32 hidden md:table-cell">Timeline</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[160px]">Velocity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-32 hidden xl:table-cell">Expenses</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                  <TableHead className="text-right px-10 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group transition-colors">
                    <TableCell className="px-10 font-display font-bold text-lg text-primary">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{order.customer}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 hidden sm:inline">Lead: {order.owner || 'UNSET'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-[10px] font-bold text-slate-500 font-code uppercase">{order.poNumber || 'MANUAL'}</span>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                       <span className="text-[9px] font-code text-primary font-bold">{order.endDate}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-3 cursor-pointer" onClick={() => onNavigateToOperations?.(order.id)}>
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yield: {order.progress || 0}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <Progress value={order.progress || 0} className="h-full rounded-full transition-all duration-1000" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden xl:table-cell">
                      <button onClick={() => setBreakupOrderId(order.id)} className="text-xs font-display font-bold text-[#001F3D] hover:scale-110 transition-transform">
                        {order.amountSpent || "₹ 0.00"}
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn("inline-flex px-4 py-1.5 rounded-full text-[9px] font-bold justify-center uppercase tracking-widest border", getStatusStyles(order.status))}>
                         {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-200 hover:text-primary rounded-xl" onClick={() => onNavigateToOrderDetails?.(order.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={!!breakupOrderId} onOpenChange={(open) => !open && setBreakupOrderId(null)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-100 flex flex-row items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                <DollarSign className="h-3.5 w-3.5" />
                Financial Breakup Protocol
              </div>
              <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">
                WO #{breakupOrderId}
              </DialogTitle>
            </div>
            <Badge className="bg-[#001F3D] text-white border-none px-4 py-1.5 rounded-full font-display text-lg">
              {selectedOrderForBreakup?.amountSpent || "₹ 0.00"}
            </Badge>
          </DialogHeader>

          <ScrollArea className="max-h-[500px]">
            <div className="p-6 md:p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">External Procurement</h4>
                  <span className="text-xs font-bold text-[#001F3D]">₹ {expenseBreakup.totalExternal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-3">
                  {expenseBreakup.external.map(record => (
                    <div key={record.id} className="p-4 bg-slate-50/50 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 uppercase">{record.itemName || 'Supply'}</span>
                      <span className="text-xs font-bold text-slate-900">₹ {record.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-accent pl-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resource Yield</h4>
                  <span className="text-xs font-bold text-[#001F3D]">₹ {expenseBreakup.totalInternal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-3">
                  {expenseBreakup.internal.map(log => (
                    <div key={log.id} className="p-4 bg-slate-50/50 rounded-xl flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 uppercase">{log.resourceName}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">{log.hours}h @ ₹{log.rate}/hr</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹ {log.cost.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-slate-50/80 border-t border-slate-100">
            <Button className="w-full sm:w-auto bg-[#001F3D] text-white rounded-xl h-12 px-10 font-bold uppercase text-[10px]" onClick={() => setBreakupOrderId(null)}>Close Matrix</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
