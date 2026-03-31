"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CreditCard, 
  Search, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const mockInvoices: Invoice[] = [
  { id: 'INV-8801', orderId: '103645', customer: 'Automotive Corp', amount: '$12,450.00', date: '01 Mar 2025', dueDate: '15 Mar 2025', status: 'Pending', type: 'Full' },
  { id: 'INV-8802', orderId: '102778', customer: 'Precision Aero', amount: '$2,100.00', date: '02 Mar 2025', dueDate: '16 Mar 2025', status: 'Paid', type: 'Service' },
  { id: 'INV-8803', orderId: '100685', customer: 'Medical Solutions', amount: '$8,900.00', date: '28 Feb 2025', dueDate: '10 Mar 2025', status: 'Paid', type: 'Full' },
  { id: 'INV-8804', orderId: '105542', customer: 'Global Energy', amount: '$5,600.00', date: '25 Feb 2025', dueDate: '05 Mar 2025', status: 'Overdue', type: 'Material' },
  { id: 'INV-8805', orderId: '101230', customer: 'Future Tech', amount: '$4,200.00', date: '03 Mar 2025', dueDate: '17 Mar 2025', status: 'Pending', type: 'Service' },
];

export function BillingManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = mockInvoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <CreditCard className="h-4 w-4" />
            Financial Operations
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Billing & Invoices
          </h2>
          <p className="text-muted-foreground font-medium">Manage production revenue and customer receivables.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-full border-slate-200 gap-2 h-11 px-6 font-bold text-xs uppercase tracking-wider">
             <Download className="h-4 w-4" /> Export Report
           </Button>
           <Button className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20">
             <Plus className="h-4 w-4" /> New Invoice
           </Button>
        </div>
      </header>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Receivables</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +4.2%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-slate-900">$42,350.50</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-primary w-[65%]" />
          </div>
        </Card>

        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-green-500/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Month-to-Date Paid</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +12.8%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-slate-900">$11,000.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-green-500 w-[40%]" />
          </div>
        </Card>

        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-red-500/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Overdue Balance</p>
            <div className="flex items-center gap-1 text-red-500 font-bold text-xs">
              <ArrowDownRight className="h-3 w-3" /> -2.1%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-slate-900">$5,600.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-red-500 w-[15%]" />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by Invoice ID or Customer..." 
              className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-primary/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider gap-2 text-slate-500">
               <Filter className="h-4 w-4" /> Filter
             </Button>
             <div className="h-6 w-[1px] bg-slate-200 mx-1" />
             <p className="text-[10px] font-bold uppercase text-slate-400">Show:</p>
             <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold">All 42</Badge>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Invoice ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Date Issued</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Due Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Category</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Amount</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center text-slate-400 w-[140px]">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-slate-50/50 h-20 border-slate-50 transition-colors group">
                <TableCell className="font-bold text-sm text-primary px-8">
                  {inv.id}
                </TableCell>
                <TableCell className="text-slate-900 font-semibold">{inv.customer}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{inv.date}</TableCell>
                <TableCell className="text-xs text-slate-500 font-code">{inv.dueDate}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200">
                    {inv.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-display font-bold text-slate-900">
                  {inv.amount}
                </TableCell>
                <TableCell className="text-center">
                  <div className={cn(
                    "inline-flex px-3 py-1 rounded-full text-[10px] font-bold min-w-[90px] justify-center uppercase tracking-widest",
                    inv.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                    inv.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  )}>
                    {inv.status}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-slate-200">
                      <DropdownMenuItem className="text-xs font-bold uppercase tracking-tight gap-2 cursor-pointer">
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs font-bold uppercase tracking-tight gap-2 cursor-pointer">
                        <CreditCard className="h-3.5 w-3.5" /> Mark as Paid
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center opacity-30">
                    <CreditCard className="h-12 w-12 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No matching invoices found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
