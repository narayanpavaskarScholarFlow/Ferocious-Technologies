"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockOrders: Order[] = [
  { id: '103645', customer: 'Automotive Corp', startDate: '01.03.2025', endDate: '05.03.2025', priority: 'High', status: 'Active', owner: 'John Doe', progress: 85 },
  { id: '102778', customer: 'Precision Aero', startDate: '02.03.2025', endDate: '10.03.2025', priority: 'Medium', status: 'Pending', owner: 'Jane Smith', progress: 15 },
  { id: '100685', customer: 'Medical Solutions', startDate: '03.03.2025', endDate: '04.03.2025', priority: 'Low', status: 'Completed', owner: 'Mike Weber', progress: 100 },
  { id: '105542', customer: 'Global Energy', startDate: '28.02.2025', endDate: '03.03.2025', priority: 'High', status: 'Delayed', owner: 'Sarah Miller', progress: 45 },
  { id: '101230', customer: 'Future Tech', startDate: '05.03.2025', endDate: '12.03.2025', priority: 'Medium', status: 'Active', owner: 'John Doe', progress: 60 },
];

interface ShopFloorOrdersProps {
  onNavigateToOperations?: (orderId: string) => void;
  onNavigateToOrderDetails?: (orderId: string) => void;
}

export function ShopFloorOrders({ onNavigateToOperations, onNavigateToOrderDetails }: ShopFloorOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = mockOrders.filter(order => 
    order.id.includes(searchTerm) || 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-bold text-xl text-slate-800 uppercase tracking-tight">Current Production Orders</h2>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9 h-9 text-xs bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Admin User</span>
          </div>
        </div>
      </div>

      <div className="glass-card border border-slate-200 bg-white shadow-sm rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Order ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Start Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">End Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Status in %</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Priority</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Project Owner</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50 h-16">
                <TableCell 
                  className="font-bold text-sm text-slate-700 cursor-pointer hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                  onClick={() => onNavigateToOrderDetails?.(order.id)}
                >
                  {order.id}
                </TableCell>
                <TableCell className="text-slate-600 font-medium">{order.customer}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.startDate}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.endDate}</TableCell>
                <TableCell 
                  className="w-[120px] cursor-pointer group/cell hover:bg-slate-100/50 transition-colors"
                  onClick={() => onNavigateToOperations?.(order.id)}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 group-hover/cell:text-primary transition-colors">{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      order.priority === 'High' ? 'border-red-200 text-red-600 bg-red-50' :
                      order.priority === 'Medium' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                      'border-green-200 text-green-600 bg-green-50'
                    )}
                  >
                    {order.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-medium">
                  {order.owner}
                </TableCell>
                <TableCell className="text-right">
                   <div className={cn(
                     "inline-flex px-3 py-1 rounded-full text-[10px] font-bold min-w-[80px] justify-center uppercase",
                     order.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                     order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                     order.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                     'bg-slate-100 text-slate-700'
                   )}>
                     {order.status}
                   </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400 text-xs">
                  No production orders found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[260px] border border-slate-200 bg-white">
          <h3 className="text-slate-400 font-headline uppercase tracking-widest text-[10px] font-bold mb-8">Order Distribution</h3>
          <div className="flex items-center gap-16">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#005a9c" strokeWidth="24" fill="transparent" strokeDasharray="376.8" strokeDashoffset="135" />
                <circle cx="72" cy="72" r="60" stroke="#f59e0b" strokeWidth="24" fill="transparent" strokeDasharray="376.8" strokeDashoffset="310" />
              </svg>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <div className="w-3 h-3 bg-[#005a9c] rounded-sm" /> Active Orders (64%)
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-sm" /> Pending (36%)
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-between min-h-[260px] border border-slate-200 bg-white">
           <h3 className="text-slate-400 font-headline uppercase tracking-widest text-[10px] font-bold mb-6">Shift Summary</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Planned Time</p>
                <p className="text-2xl font-bold text-slate-700">08:00 h</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Effective Time</p>
                <p className="text-2xl font-bold text-primary">07:12 h</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Waste</p>
                <p className="text-2xl font-bold text-red-500">2.4 %</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Productivity</p>
                <p className="text-2xl font-bold text-green-500">94.1 %</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
