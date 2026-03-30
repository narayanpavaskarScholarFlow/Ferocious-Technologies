"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown } from 'lucide-react';
import { CustomerOrder } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const initialOrders: CustomerOrder[] = [
  { siNo: 1, id: 'PO-88452', customer: 'Automotive Corp', customerType: 'Tier 1 Supplier', numberOfPOs: 12, value: '$24,500', quantity: 500, location: 'Detroit, MI', status: 'Production' },
  { siNo: 2, id: 'PO-88453', customer: 'Precision Aero', customerType: 'OEM Manufacturer', numberOfPOs: 5, value: '$85,000', quantity: 50, location: 'Seattle, WA', status: 'Production' },
  { siNo: 3, id: 'PO-88454', customer: 'Medical Solutions', customerType: 'Healthcare Provider', numberOfPOs: 24, value: '$12,200', quantity: 1200, location: 'Boston, MA', status: 'Pending' },
  { siNo: 4, id: 'PO-88455', customer: 'Global Energy', customerType: 'Utility Provider', numberOfPOs: 2, value: '$4,500', quantity: 15, location: 'Houston, TX', status: 'Shipping' },
  { siNo: 5, id: 'PO-88456', customer: 'Future Tech', customerType: 'R&D Lab', numberOfPOs: 1, value: '$9,800', quantity: 1, location: 'Palo Alto, CA', status: 'Delivered' },
];

export function CustomerOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active');

  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-headline font-bold uppercase text-slate-800">Customer Order Pipeline</h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Customer:</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px] h-9 bg-white text-xs border-slate-200">
                <SelectValue placeholder="List" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="tier1">Tier 1 List</SelectItem>
                <SelectItem value="oem">OEM List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              suppressHydrationWarning
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
            <TableRow className="hover:bg-transparent border-slate-800" suppressHydrationWarning>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 w-[80px]">Si. No.</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">No. of PO's</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Type of Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Value</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Qty</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Location</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 ml-auto hover:text-white transition-colors uppercase outline-none" suppressHydrationWarning>
                    Status ({activeFilter}) <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#111827] border-slate-800 text-slate-300">
                    <DropdownMenuItem onClick={() => setActiveFilter('Active')} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('Close')} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">Close</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-[#1f2937]/30 border-slate-800 transition-colors" suppressHydrationWarning>
                <TableCell className="font-bold text-sm text-white py-4">{order.siNo}</TableCell>
                <TableCell className="text-slate-400 font-medium">{order.customer}</TableCell>
                <TableCell className="text-center font-code text-slate-300">{order.numberOfPOs}</TableCell>
                <TableCell className="text-xs font-medium text-slate-300">{order.customerType}</TableCell>
                <TableCell className="text-right font-code text-primary font-bold">{order.value}</TableCell>
                <TableCell className="text-center font-code text-slate-300">{order.quantity}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{order.location}</TableCell>
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
              <TableRow suppressHydrationWarning>
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
