
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, ArchiveX, Edit2, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ShopFloorOrdersProps {
  orders: Order[];
  onNavigateToOperations?: (orderId: string) => void;
  onNavigateToOrderDetails?: (orderId: string | null) => void;
}

export function ShopFloorOrders({ orders, onNavigateToOperations, onNavigateToOrderDetails }: ShopFloorOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => 
    order.id.includes(searchTerm) || 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search master ledger..." 
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
            {filteredOrders.length} Threads Loaded
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Thread ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-32">Start Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center w-32">End Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[160px]">Velocity Index</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Priority</TableHead>
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
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{order.customer}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lead: {order.owner}</span>
                    </div>
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
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}
                    >
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-display font-bold text-[#001F3D]">
                      {order.amountSpent || "₹ 0.00"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                     <Badge className={cn(
                       "inline-flex px-5 py-2 rounded-full text-[9px] font-bold justify-center uppercase tracking-widest border shadow-lg",
                       order.status === 'Active' ? "bg-[#001F3D] text-white border-[#001F3D]" :
                       order.status === 'Completed' ? "bg-emerald-600 text-white border-emerald-600" :
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
                  <TableCell colSpan={10} className="h-[480px] text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 py-10">
                      <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                        <ArchiveX className="h-20 w-20 text-slate-300" />
                      </div>
                      <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Ledger Offline</p>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium leading-relaxed">No active production threads detected in the matrix. Initialize a new protocol to begin tracking.</p>
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
