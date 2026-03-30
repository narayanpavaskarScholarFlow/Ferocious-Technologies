"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CustomerOrder } from '@/lib/types';
import { cn } from '@/lib/utils';

const initialOrders: CustomerOrder[] = [
  { id: 'PO-88452', customer: 'Automotive Corp', numberOfPOs: 12, partDescription: 'Gear Housing V6', value: '$24,500', quantity: 500, dueDate: '20.03.2025', status: 'Production' },
  { id: 'PO-88453', customer: 'Precision Aero', numberOfPOs: 5, partDescription: 'Turbine Blade X-1', value: '$85,000', quantity: 50, dueDate: '15.03.2025', status: 'Production' },
  { id: 'PO-88454', customer: 'Medical Solutions', numberOfPOs: 24, partDescription: 'Surgical Tray #4', value: '$12,200', quantity: 1200, dueDate: '25.03.2025', status: 'Pending' },
  { id: 'PO-88455', customer: 'Global Energy', numberOfPOs: 2, partDescription: 'Valve Assembly', value: '$4,500', quantity: 15, dueDate: '10.03.2025', status: 'Shipping' },
  { id: 'PO-88456', customer: 'Future Tech', numberOfPOs: 1, partDescription: 'Custom Proto Chassis', value: '$9,800', quantity: 1, dueDate: '08.03.2025', status: 'Delivered' },
];

export function CustomerOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-headline font-bold uppercase text-slate-800">Customer Order Pipeline</h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-9 text-xs bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 h-9 px-4 shrink-0 border-blue-100 font-bold">
            Pending: 42
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-800 bg-[#0a0f18] shadow-2xl">
        <Table>
          <TableHeader className="bg-[#111827] border-b border-slate-800">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4">Order ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">No. of PO's</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Part Description</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Value</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Qty</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Due Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-[#1f2937]/30 border-slate-800 transition-colors">
                <TableCell className="font-bold text-sm text-white py-4">{order.id}</TableCell>
                <TableCell className="text-slate-400 font-medium">{order.customer}</TableCell>
                <TableCell className="text-center font-code text-slate-300">{order.numberOfPOs}</TableCell>
                <TableCell className="text-xs font-medium text-slate-300">{order.partDescription}</TableCell>
                <TableCell className="text-right font-code text-primary font-bold">{order.value}</TableCell>
                <TableCell className="text-center font-code text-slate-300">{order.quantity}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.dueDate}</TableCell>
                <TableCell className="text-right">
                  <Badge 
                    className={cn(
                      "text-[9px] uppercase font-bold tracking-wider px-3 py-0.5",
                      order.status === 'Production' ? 'bg-blue-900/40 text-blue-400 border border-blue-800' :
                      order.status === 'Pending' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                      order.status === 'Shipping' ? 'bg-amber-900/40 text-amber-400 border border-amber-800' :
                      'bg-green-900/40 text-green-400 border border-green-800'
                    )}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500 font-code text-xs italic">
                  NO_MATCHING_RECORDS_FOUND
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
