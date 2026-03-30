"use client";

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomerOrder } from '@/lib/types';
import { cn } from '@/lib/utils';

const customerOrders: CustomerOrder[] = [
  { id: 'PO-88452', customer: 'Automotive Corp', partName: 'Gear Housing V6', quantity: 500, dueDate: '20.03.2025', status: 'Production' },
  { id: 'PO-88453', customer: 'Precision Aero', partName: 'Turbine Blade X-1', quantity: 50, dueDate: '15.03.2025', status: 'Production' },
  { id: 'PO-88454', customer: 'Medical Solutions', partName: 'Surgical Tray #4', quantity: 1200, dueDate: '25.03.2025', status: 'Pending' },
  { id: 'PO-88455', customer: 'Global Energy', partName: 'Valve Assembly', quantity: 15, dueDate: '10.03.2025', status: 'Shipping' },
  { id: 'PO-88456', customer: 'Future Tech', partName: 'Custom Proto Chassis', quantity: 1, dueDate: '08.03.2025', status: 'Delivered' },
];

export function CustomerOrders() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase text-slate-800">Customer Order Pipeline</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white">Monthly Target: $1.2M</Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-600">Pending: 42</Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase">Order ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Part Description</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center">Qty</TableHead>
              <TableHead className="font-bold text-[10px] uppercase">Due Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50">
                <TableCell className="font-bold text-sm">{order.id}</TableCell>
                <TableCell className="text-slate-600 font-medium">{order.customer}</TableCell>
                <TableCell className="text-xs font-medium">{order.partName}</TableCell>
                <TableCell className="text-center font-code">{order.quantity}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.dueDate}</TableCell>
                <TableCell className="text-right">
                  <Badge 
                    className={cn(
                      "text-[10px] uppercase",
                      order.status === 'Production' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Pending' ? 'bg-slate-100 text-slate-700' :
                      order.status === 'Shipping' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    )}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
