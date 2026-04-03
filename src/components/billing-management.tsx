"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Search, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  MoreVertical,
  FileText,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  Wallet,
  ClipboardList
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const mockInvoices: Invoice[] = [];

const mockQuotations = [];

const mockExpenses = [];

export function BillingManagement() {
  const [searchTerm, setSearchTerm] = useState('');

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
             <Plus className="h-4 w-4" /> Create New
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Receivables</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-slate-900">$0.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-primary w-[0%]" />
          </div>
        </Card>

        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-green-500/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Month-to-Date Paid</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-slate-900">$0.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-green-500 w-[0%]" />
          </div>
        </Card>

        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-red-500/50 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Overdue Balance</p>
            <div className="flex items-center gap-1 text-red-500 font-bold text-xs">
              <ArrowDownRight className="h-3 w-3" /> -0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-slate-900">$0.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-red-500 w-[0%]" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200">
          <TabsTrigger value="quotation" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Quotation
          </TabsTrigger>
          <TabsTrigger value="invoice" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Invoice
          </TabsTrigger>
          <TabsTrigger value="proforma" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Proforma Invoice
          </TabsTrigger>
          <TabsTrigger value="inward" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Inward
          </TabsTrigger>
          <TabsTrigger value="outward" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Outward
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Expenses
          </TabsTrigger>
        </TabsList>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search financial records..." 
                className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-primary/20 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider gap-2 text-slate-500">
                 <Filter className="h-4 w-4" /> Filter
               </Button>
            </div>
          </div>

          <TabsContent value="invoice" className="m-0">
            {mockInvoices.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Invoice ID</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Amount</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center text-slate-400">Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                      <TableCell className="font-bold text-sm text-primary px-8">{inv.id}</TableCell>
                      <TableCell className="text-slate-900 font-semibold">{inv.customer}</TableCell>
                      <TableCell className="text-right font-display font-bold text-slate-900">{inv.amount}</TableCell>
                      <TableCell className="text-center">
                        <div className={cn(
                          "inline-flex px-3 py-1 rounded-full text-[10px] font-bold min-w-[90px] justify-center uppercase",
                          inv.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center opacity-40">
                <Receipt className="h-12 w-12 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No Invoices Found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quotation" className="m-0">
            {mockQuotations.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Quotation ID</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Value</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockQuotations.map((qt) => (
                    <TableRow key={qt.id} className="hover:bg-slate-50/50 h-20 border-slate-50">
                      <TableCell className="font-bold text-sm text-slate-700 px-8">{qt.id}</TableCell>
                      <TableCell className="text-slate-900 font-semibold">{qt.customer}</TableCell>
                      <TableCell className="text-right font-display font-bold text-slate-900">{qt.value}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{qt.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center opacity-40">
                <ClipboardList className="h-12 w-12 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No Quotations Found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="expenses" className="m-0">
            {mockExpenses.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4 px-8">Expense ID</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Vendor</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Category</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-right text-slate-400">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExpenses.map((ex) => (
                    <TableRow key={ex.id} className="hover:bg-slate-50/50 h-20 border-slate-50">
                      <TableCell className="font-bold text-sm text-red-600 px-8">{ex.id}</TableCell>
                      <TableCell className="text-slate-900 font-semibold">{ex.vendor}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-bold uppercase">{ex.category}</TableCell>
                      <TableCell className="text-right font-display font-bold text-slate-900">{ex.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center opacity-40">
                <Wallet className="h-12 w-12 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No Expenses Recorded</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="proforma" className="m-0">
            <div className="h-64 flex flex-col items-center justify-center opacity-40">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No Proforma Invoices Issued</p>
            </div>
          </TabsContent>

          <TabsContent value="inward" className="m-0">
            <div className="h-64 flex flex-col items-center justify-center opacity-40">
              <ArrowDownLeft className="h-12 w-12 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No Inward Transactions</p>
            </div>
          </TabsContent>

          <TabsContent value="outward" className="m-0">
            <div className="h-64 flex flex-col items-center justify-center opacity-40">
              <ArrowUpRightIcon className="h-12 w-12 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No Outward Logistics Recorded</p>
            </div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
