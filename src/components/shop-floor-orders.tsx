
"use client";

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order, BillingRecord, WorkLogEntry, Machine } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, ArchiveX, Edit2, TrendingUp, Filter, User, Receipt, Cpu, DollarSign, ChevronRight, Info } from 'lucide-react';
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

interface ShopFloorOrdersProps {
  orders: Order[];
  onNavigateToOperations?: (orderId: string) => void;
  onNavigateToOrderDetails?: (orderId: string | null) => void;
  billing?: BillingRecord[];
  logs?: WorkLogEntry[];
  machines?: Machine[];
}

export function ShopFloorOrders({ orders, onNavigateToOperations, onNavigateToOrderDetails, billing = [], logs = [], machines = [] }: ShopFloorOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [breakupOrderId, setBreakupOrderId] = useState<string | null>(null);

  // Filter Logic: Hide terminal orders (Completed, Ready for Delivery, Delivered) from the active list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.includes(searchTerm) || 
                           order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isTerminal = ['Completed', 'Ready for Delivery', 'Delivered'].includes(order.status);
      
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
      return {
        id: log.id,
        resourceName: log.resourceName,
        operator: log.operator,
        hours,
        rate,
        cost: hours * rate,
        date: log.date
      };
    });

    const totalExternal = external.reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInternal = internal.reduce((acc, l) => acc + l.cost, 0);

    return { external, internal, totalExternal, totalInternal };
  }, [breakupOrderId, billing, logs, machines]);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-display font-bold text-3xl text-[#001F3D] uppercase tracking-tight">Active Production Threads</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Master Ledger v2.4.0</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search active master ledger..." 
              className="pl-12 h-12 rounded-2xl bg-white border-none shadow-xl shadow-blue-900/5 text-xs font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            className="h-12 px-8 gap-3 bg-[#001F3D] hover:bg-black text-white font-bold uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 rounded-2xl transition-all"
            onClick={() => onNavigateToOrderDetails?.(null)}
          >
            <Plus className="h-4 w-4" />
            Initialize New Order
          </Button>
        </div>
      </div>

      <Card className="premium-card shadow-2xl border-none">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#001F3D] rounded-lg text-white shadow-lg"><Filter className="h-4 w-4" /></div>
            <span className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Operational Filter Active</span>
          </div>
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-8 px-4 uppercase tracking-widest">
            {filteredOrders.length} Active Threads Loaded
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">WO. ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">PO No.</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Type of Work</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-32">Start Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-32">End Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[160px]">Velocity Index</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Priority</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Project Owner</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center w-32">Expenses</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                <TableHead className="text-right px-10 w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group transition-colors">
                  <TableCell 
                    className="px-10 font-display font-bold text-lg text-primary cursor-pointer transition-all hover:translate-x-1"
                    onClick={() => onNavigateToOrderDetails?.(order.id)}
                  >
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold text-slate-500 font-code uppercase">{order.poNumber || '---'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{order.customer}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Matrix Active</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase px-3 py-1 bg-white border-slate-200 text-slate-500">
                      {order.typeOfWork || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-code text-[10px] font-bold text-slate-600 bg-slate-50 border-slate-200 px-3 py-1 rounded-lg">
                      {order.startDate}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-code text-[10px] font-bold text-primary bg-blue-50 border-primary/10 px-3 py-1 rounded-lg">
                      {order.endDate}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-3 cursor-pointer group/progress" onClick={() => onNavigateToOperations?.(order.id)}>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/progress:text-primary">Yield: {order.progress || 0}%</span>
                        <TrendingUp className={cn("h-3 w-3 transition-colors", (order.progress || 0) > 0 ? "text-emerald-500" : "text-slate-200")} />
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner p-[1px]">
                        <Progress value={order.progress || 0} className="h-full rounded-full transition-all duration-1000" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                        order.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                        order.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      )}
                    >
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 uppercase">{order.owner || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => setBreakupOrderId(order.id)}
                      className="group/expense flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
                    >
                      <span className="text-xs font-display font-bold text-[#001F3D] flex flex-col items-center">
                        <span className="text-[8px] text-slate-400 font-bold mb-0.5 opacity-0 group-hover/expense:opacity-100 transition-opacity">BREAKUP</span>
                        {order.amountSpent || "₹ 0.00"}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn(
                       "inline-flex px-5 py-2 rounded-full text-[9px] font-bold justify-center uppercase tracking-widest border shadow-lg",
                       order.status === 'Active' ? "bg-[#001F3D] text-white border-[#001F3D]" :
                       order.status === 'Delayed' ? "bg-red-600 text-white border-red-600" :
                       'bg-slate-100 text-slate-400 border-slate-200'
                     )}>
                       {order.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-200 hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => onNavigateToOrderDetails?.(order.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={12} className="h-[480px] text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 py-10">
                      <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                        <ArchiveX className="h-20 w-20 text-slate-300" />
                      </div>
                      <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Ledger Offline</p>
                      <p className="text-xs text-slate-400 mt-2 max-sm mx-auto font-medium leading-relaxed">No active production threads detected in the matrix. Initialize a new protocol to begin tracking.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!breakupOrderId} onOpenChange={(open) => !open && setBreakupOrderId(null)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
          <DialogHeader className="p-10 bg-slate-50/50 border-b border-slate-100 flex flex-row items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                <DollarSign className="h-3.5 w-3.5" />
                Financial Breakup Protocol
              </div>
              <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">
                WO #{breakupOrderId} <span className="text-slate-400 font-medium ml-2">Breakup</span>
              </DialogTitle>
              <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Client: {selectedOrderForBreakup?.customer}
              </DialogDescription>
            </div>
            <Badge className="bg-[#001F3D] text-white border-none px-4 py-1.5 rounded-full font-display text-lg">
              {selectedOrderForBreakup?.amountSpent || "₹ 0.00"}
            </Badge>
          </DialogHeader>

          <ScrollArea className="max-h-[500px]">
            <div className="p-10 space-y-10">
              {/* External Procurement Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-primary" />
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">External Procurement (Inward)</h4>
                  </div>
                  <span className="text-xs font-bold text-[#001F3D]">₹ {expenseBreakup.totalExternal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="space-y-3">
                  {expenseBreakup.external.map(record => (
                    <div key={record.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-primary/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 uppercase">{record.itemName || 'Raw Material/Service'}</span>
                        <span className="text-[9px] text-slate-400 font-code font-bold uppercase mt-1">{record.number} • {record.date}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹ {record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  {expenseBreakup.external.length === 0 && (
                    <p className="text-[10px] text-slate-300 font-medium italic text-center py-4">No external procurement nodes recorded.</p>
                  )}
                </div>
              </div>

              {/* Internal Resource Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-accent pl-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-4 w-4 text-accent" />
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Resource Utilization</h4>
                  </div>
                  <span className="text-xs font-bold text-[#001F3D]">₹ {expenseBreakup.totalInternal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="space-y-3">
                  {expenseBreakup.internal.map(log => (
                    <div key={log.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-accent/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 uppercase">{log.resourceName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[8px] font-bold border-slate-200">{log.hours}h @ ₹{log.rate}/hr</Badge>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Op: {log.operator}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹ {log.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  {expenseBreakup.internal.length === 0 && (
                    <p className="text-[10px] text-slate-300 font-medium italic text-center py-4">No asset utilization nodes recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 animate-pulse"><Info className="h-4 w-4" /></div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
                Net valuation synchronized with <br />master ledger matrix v2.4.
              </p>
            </div>
            <Button 
              className="bg-[#001F3D] hover:bg-black text-white rounded-xl h-12 px-10 font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl"
              onClick={() => setBreakupOrderId(null)}
            >
              Close Matrix <ChevronRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
