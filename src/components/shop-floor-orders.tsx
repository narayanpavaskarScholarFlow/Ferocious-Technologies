
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, ArchiveX } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-headline font-bold text-xl text-slate-800 uppercase tracking-tight">Current Production Orders</h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9 h-9 text-xs bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="default" 
            size="sm" 
            className="h-9 gap-2 bg-[#003d6b] hover:bg-[#002d4f] font-bold uppercase text-[10px] tracking-wider shadow-sm"
            onClick={() => onNavigateToOrderDetails?.(null)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Order
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 min-w-[100px]">Order ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[150px]">Customer</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[100px]">Start Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[100px]">End Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[120px]">Status in %</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[100px]">Priority</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[120px]">Project Owner</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[100px]">Amount Spent</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-right text-slate-400 min-w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="flex-1">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 h-16 border-slate-100">
                  <TableCell 
                    className="font-bold text-sm text-[#003d6b] cursor-pointer hover:underline underline-offset-4"
                    onClick={() => onNavigateToOrderDetails?.(order.id)}
                  >
                    {order.id}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{order.customer}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-code">{order.startDate}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-code">{order.endDate}</TableCell>
                  <TableCell 
                    className="w-[120px] cursor-pointer group/cell hover:bg-slate-50 transition-colors"
                    onClick={() => onNavigateToOperations?.(order.id)}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400 group-hover/cell:text-primary">{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase py-0.5",
                        order.priority === 'High' ? 'border-red-100 text-red-600 bg-red-50' :
                        order.priority === 'Medium' ? 'border-amber-100 text-amber-600 bg-amber-50' :
                        'border-green-100 text-green-600 bg-green-50'
                      )}
                    >
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {order.owner}
                  </TableCell>
                  <TableCell className="text-xs font-code font-bold text-slate-600">
                    {order.amountSpent}
                  </TableCell>
                  <TableCell className="text-right">
                     <div className={cn(
                       "inline-flex px-3 py-1 rounded-full text-[10px] font-bold min-w-[80px] justify-center uppercase",
                       order.status === 'Active' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                       order.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                       order.status === 'Delayed' ? 'bg-red-50 text-red-700 border border-red-100' :
                       'bg-slate-50 text-slate-700 border border-slate-100'
                     )}>
                       {order.status}
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 py-10">
                      <div className="p-8 bg-slate-50 rounded-[2rem] mb-6">
                        <ArchiveX className="h-16 w-16 text-slate-300" />
                      </div>
                      <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Orders Ledger Offline</p>
                      <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No active production threads detected. Use the "New Order" protocol to initialize production.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 flex flex-col items-center justify-center min-h-[280px] border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-slate-400 font-headline uppercase tracking-[0.2em] text-[10px] font-bold mb-10">Live Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-16">
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="40%" stroke="#f1f5f9" strokeWidth="20" fill="transparent" />
                <circle cx="50%" cy="50%" r="40%" stroke="#003d6b" strokeWidth="20" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * (orders.length > 0 ? 1 : 0))} />
              </svg>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <div className="w-3 h-3 bg-[#003d6b] rounded-sm" /> Active ({orders.length > 0 ? '100' : '0'}%)
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-sm" /> Pending (0%)
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 md:p-8 flex flex-col justify-between min-h-[280px] border border-slate-200 rounded-xl shadow-sm">
           <h3 className="text-slate-400 font-headline uppercase tracking-[0.2em] text-[10px] font-bold mb-8">Shift Telemetry</h3>
           <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-50 p-4 md:p-5 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-1">Planned Time</p>
                <p className="text-xl md:text-2xl font-bold text-slate-800">08:00 h</p>
              </div>
              <div className="bg-slate-50 p-4 md:p-5 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-1">Net Productivity</p>
                <p className="text-xl md:text-2xl font-bold text-slate-300">0 %</p>
              </div>
              <div className="bg-slate-50 p-4 md:p-5 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-1">Cycle Waste</p>
                <p className="text-xl md:text-2xl font-bold text-slate-300">0 %</p>
              </div>
              <div className="bg-slate-50 p-4 md:p-5 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-1">Effective Hours</p>
                <p className="text-xl md:text-2xl font-bold text-slate-300">00:00 h</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
