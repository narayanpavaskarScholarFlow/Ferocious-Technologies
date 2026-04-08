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
  ClipboardList,
  Share2,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Truck
} from 'lucide-react';
import { Invoice, Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses';

interface BillingManagementProps {
  customers: Customer[];
}

export function BillingManagement({ customers }: BillingManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('invoice');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleCreateNew = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCommitRecord = (share = false) => {
    if (!formData.customer || !formData.amount) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Customer Identity and Valuation are required for ledger entry."
      });
      return;
    }

    toast({
      title: share ? "Authorized & Dispatched" : "Ledger Entry Committed",
      description: `${activeCategory.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)} has been processed for ${formData.customer}.`
    });

    setIsCreateDialogOpen(false);
    setFormData({ customer: '', amount: '', reference: '', date: new Date().toISOString().split('T')[0] });
  };

  const getCategoryTitle = () => {
    const titles: Record<BillingCategory, string> = {
      quotation: 'Commercial Quotation',
      invoice: 'Tax Invoice',
      proforma: 'Proforma Invoice',
      inward: 'Inward Procurement',
      outward: 'Outward Logistics',
      expenses: 'Operational Expense'
    };
    return titles[activeCategory];
  };

  const darkInputClasses = "h-12 bg-slate-50 border-none rounded-xl text-xs font-bold focus-visible:ring-primary/20";
  const darkSelectClasses = "h-12 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-primary/20";

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <CreditCard className="h-4 w-4" />
            Financial Operations Hub
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Billing & Invoices
          </h2>
          <p className="text-muted-foreground font-medium">Manage production revenue and customer receivables.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-11 px-6 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50">
             <Download className="h-4 w-4" /> Export Ledger
           </Button>
           <Button 
            onClick={handleCreateNew}
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
           >
             <Plus className="h-4 w-4" /> Create New Record
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-slate-200/60 shadow-xl bg-white group hover:border-primary/50 transition-all rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Receivables</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-[#001F3D]">$0.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-primary w-[0%]" />
          </div>
        </Card>

        <Card className="p-8 border-slate-200/60 shadow-xl bg-white group hover:border-green-500/50 transition-all rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Month-to-Date Paid</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-green-600">$0.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-green-500 w-[0%]" />
          </div>
        </Card>

        <Card className="p-8 border-slate-200/60 shadow-xl bg-white group hover:border-red-500/50 transition-all rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Overdue Balance</p>
            <div className="flex items-center gap-1 text-red-500 font-bold text-xs">
              <ArrowDownRight className="h-3 w-3" /> -0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-red-600">$0.00</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-red-500 w-[0%]" />
          </div>
        </Card>
      </div>

      <Tabs value={activeCategory} onValueChange={(val) => setActiveCategory(val as BillingCategory)} className="w-full">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl mb-8 h-14 inline-flex border border-slate-200/60 shadow-sm gap-2">
          {['quotation', 'invoice', 'proforma', 'inward', 'outward', 'expenses'].map((cat) => (
            <TabsTrigger 
              key={cat}
              value={cat} 
              className="rounded-xl px-6 h-11 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-lg data-[state=active]:border-slate-200 border border-transparent transition-all"
            >
              {cat.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder={`Search ${activeCategory} records...`} 
                className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-primary/20 text-xs font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest gap-2 text-slate-400 hover:text-primary">
                 <Filter className="h-4 w-4" /> Advanced Filter
               </Button>
            </div>
          </div>

          <div className="min-h-[400px]">
            <TabsContent value="invoice" className="m-0">
              <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                <Receipt className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Tax Invoice Ledger Offline</p>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">No active receivables detected. Click "Create New" to initialize billing.</p>
              </div>
            </TabsContent>

            <TabsContent value="quotation" className="m-0">
              <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                <ClipboardList className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Quotation Catalog Empty</p>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">Standardize commercial bids by creating your first quotation.</p>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="m-0">
              <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                <Wallet className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Expense Tracking Standby</p>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">Log operational expenditures to maintain plant-wide profitability metrics.</p>
              </div>
            </TabsContent>

            <TabsContent value="proforma" className="m-0">
              <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                <FileText className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Proforma Matrix Standby</p>
              </div>
            </TabsContent>

            <TabsContent value="inward" className="m-0">
              <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                <ArrowDownLeft className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Inward Supply Chain Offline</p>
              </div>
            </TabsContent>

            <TabsContent value="outward" className="m-0">
              <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                <ArrowUpRightIcon className="h-16 w-16 mb-6 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">Outward Logistics Telemetry Offline</p>
              </div>
            </TabsContent>
          </div>
        </Card>
      </Tabs>

      {/* Creation Wizard Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row h-[600px]">
            {/* Context Sidebar */}
            <div className="w-full md:w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl shadow-primary/20">
                  {activeCategory === 'quotation' && <ClipboardList className="h-7 w-7 text-white" />}
                  {activeCategory === 'invoice' && <Receipt className="h-7 w-7 text-white" />}
                  {activeCategory === 'expenses' && <Wallet className="h-7 w-7 text-white" />}
                  {(activeCategory === 'inward' || activeCategory === 'outward') && <Truck className="h-7 w-7 text-white" />}
                  {activeCategory === 'proforma' && <FileText className="h-7 w-7 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight leading-tight">
                    New {activeCategory} Protocol
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Financial Hub v2.4</p>
                </div>
                
                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Authorization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Document Generation</span>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-relaxed">
                  Record will be committed to the master audit trail and linked to Project #103645.
                </p>
              </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 p-10 md:p-14 flex flex-col justify-between bg-white overflow-y-auto hide-scrollbar">
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Specifications</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> Account Identity
                    </Label>
                    <Select value={formData.customer} onValueChange={(val) => setFormData({...formData, customer: val})}>
                      <SelectTrigger className={darkSelectClasses}>
                        <SelectValue placeholder="Select Customer..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.name} className="text-xs font-bold uppercase">{c.name}</SelectItem>
                        ))}
                        {customers.length === 0 && (
                          <div className="p-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">No customers found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <DollarSign className="h-3 w-3" /> Base Valuation
                    </Label>
                    <Input 
                      placeholder="0.00" 
                      className={darkInputClasses}
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Protocol Date
                    </Label>
                    <Input 
                      type="date" 
                      className={darkInputClasses}
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Package className="h-3 w-3" /> Order Reference
                    </Label>
                    <Input 
                      placeholder="WO-XXXXX" 
                      className={darkInputClasses}
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    />
                  </div>
                </div>

                {activeCategory === 'invoice' && (
                  <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Automated Tax Matrix</span>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px]">GST_ENABLED</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">IGST (18%)</p>
                        <p className="text-sm font-bold text-[#001F3D]">$0.00</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Total Valuation</p>
                        <p className="text-sm font-bold text-primary font-display">${formData.amount || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button 
                  className="flex-[1.5] h-14 bg-white border-2 border-primary/20 hover:border-primary/40 text-primary rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-sm flex gap-2 group"
                  onClick={() => handleCommitRecord(true)}
                >
                  <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Authorize & Share
                </Button>
                <Button 
                  className="flex-[1.5] h-14 bg-primary hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-2 group"
                  onClick={() => handleCommitRecord(false)}
                >
                  <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Commit Entry
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
