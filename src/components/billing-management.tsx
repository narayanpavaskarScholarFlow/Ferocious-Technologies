
"use client";

import { useState, useMemo } from 'react';
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
  Receipt,
  ClipboardList,
  Share2,
  Building2,
  Calendar,
  Trash2,
  Printer,
  ChevronRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses';

interface LineItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  gst: number; // percentage
}

interface BillingRecord {
  id: string;
  type: BillingCategory;
  customerName: string;
  customerId: string;
  date: string;
  number: string;
  amount: number;
  status: string;
  items: LineItem[];
  note: string;
}

interface BillingManagementProps {
  customers: Customer[];
}

export function BillingManagement({ customers }: BillingManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('quotation');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<'form' | 'preview'>('form');
  const [records, setRecords] = useState<BillingRecord[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    note: 'Material cost 100% advance. Product warranty 1 year',
    discount: 0,
    amountPaid: 0,
    declaration: 'We declare that this quotation shows the actual price of the goods described and that all particulars are true and correct.'
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'Service 1', unit: 'Hour', quantity: 1, pricePerUnit: 50, gst: 12 },
  ]);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === formData.customerId), 
  [customers, formData.customerId]);

  const totals = useMemo(() => {
    const subTotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
    const totalGst = lineItems.reduce((acc, item) => {
      const amount = item.quantity * item.pricePerUnit;
      return acc + (amount * (item.gst / 100));
    }, 0);
    const grossTotal = subTotal + totalGst;
    const finalAmount = grossTotal - formData.discount;
    const balance = finalAmount - formData.amountPaid;

    return {
      subTotal,
      totalGst,
      grossTotal,
      finalAmount,
      balance
    };
  }, [lineItems, formData.discount, formData.amountPaid]);

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: `Service ${lineItems.length + 1}`,
      unit: 'Hour',
      quantity: 1,
      pricePerUnit: 0,
      gst: 12
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const handleCreateNew = () => {
    const prefix = activeCategory === 'quotation' ? 'QT' : activeCategory === 'invoice' ? 'INV' : 'DOC';
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: 'Material cost 100% advance. Product warranty 1 year',
      discount: 0,
      amountPaid: 0,
      declaration: 'We declare that this record shows true particulars and actual pricing.'
    });
    setLineItems([{ id: '1', description: 'Service 1', unit: 'Hour', quantity: 1, pricePerUnit: 0, gst: 12 }]);
    setWizardStep('form');
    setIsCreateDialogOpen(true);
  };

  const handleSaveRecord = (status: string = 'Active') => {
    if (!formData.customerId) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Customer Identity is required for ledger entry."
      });
      return;
    }

    const newRecord: BillingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeCategory,
      customerName: selectedCustomer?.name || 'Unknown',
      customerId: formData.customerId,
      date: formData.date,
      number: formData.number,
      amount: totals.finalAmount,
      status: status,
      items: [...lineItems],
      note: formData.note
    };

    setRecords([newRecord, ...records]);
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Ledger Entry Committed",
      description: `${activeCategory.toUpperCase()} #${formData.number} has been saved for ${selectedCustomer?.name}.`
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.type === activeCategory && 
      (r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       r.number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [records, activeCategory, searchTerm]);

  const financialSummary = useMemo(() => {
    const total = records.filter(r => r.type === 'invoice').reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalReceivables: total,
      paid: records.filter(r => r.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0),
      overdue: records.filter(r => r.status === 'Overdue').reduce((acc, curr) => acc + curr.amount, 0),
    };
  }, [records]);

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
             <Plus className="h-4 w-4" /> Create New {activeCategory.replace('-', ' ')}
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-slate-200/60 shadow-xl bg-white group hover:border-primary/50 transition-all rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Receivables</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +{records.length > 0 ? '12' : '0'}%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-[#001F3D]">${financialSummary.totalReceivables.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-primary" style={{ width: records.length > 0 ? '45%' : '0%' }} />
          </div>
        </Card>

        <Card className="p-8 border-slate-200/60 shadow-xl bg-white group hover:border-green-500/50 transition-all rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Month-to-Date Paid</p>
            <div className="flex items-center gap-1 text-green-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-green-600">${financialSummary.paid.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-green-500" style={{ width: financialSummary.paid > 0 ? '20%' : '0%' }} />
          </div>
        </Card>

        <Card className="p-8 border-slate-200/60 shadow-xl bg-white group hover:border-red-500/50 transition-all rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Overdue Balance</p>
            <div className="flex items-center gap-1 text-red-500 font-bold text-xs">
              <ArrowDownRight className="h-3 w-3" /> -0%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-red-600">${financialSummary.overdue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <div className="h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-red-500" style={{ width: financialSummary.overdue > 0 ? '10%' : '0%' }} />
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
            <TabsContent value={activeCategory} className="m-0">
              {filteredRecords.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Identity / Ref</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer Name</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Date Issued</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                      <TableHead className="text-right px-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                        <TableCell className="px-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#001F3D]">{record.number}</span>
                            <span className="text-[9px] text-slate-400 font-code uppercase">REF_{record.id.substr(0,6)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{record.customerName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] font-medium text-slate-500">{record.date}</span>
                        </TableCell>
                        <TableCell className="text-right font-display font-bold text-[#001F3D]">
                          ${record.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(
                            "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                            record.status === 'Paid' ? "bg-green-50 text-green-700 border-green-100" :
                            record.status === 'Overdue' ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                          )}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-2xl">
                              <DropdownMenuItem className="text-xs font-bold gap-2">
                                <FileText className="h-3.5 w-3.5" /> Open Sheet
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs font-bold gap-2">
                                <Printer className="h-3.5 w-3.5" /> Print PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs font-bold gap-2 text-red-600">
                                <Trash2 className="h-3.5 w-3.5" /> Void Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center opacity-30 text-center">
                  <ClipboardList className="h-16 w-16 mb-6 text-slate-300" />
                  <p className="text-sm font-bold uppercase tracking-widest text-[#001F3D]">{activeCategory.replace('-', ' ')} Ledger Offline</p>
                  <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">No active records detected. Click "Create New" to initialize data entry.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Card>
      </Tabs>

      {/* Creation Wizard Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-5xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
          {wizardStep === 'form' ? (
            <div className="flex flex-col md:flex-row h-[85vh] max-h-[800px]">
              {/* Context Sidebar */}
              <div className="w-full md:w-72 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-8">
                  <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl shadow-primary/20">
                    <ClipboardList className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight leading-tight">
                      New {activeCategory} Protocol
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Industrial Ledger v2.4</p>
                  </div>
                  
                  <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-relaxed">
                      Enter itemized specifications. All calculations will follow standardized industrial tax matrices.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-10">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                    <span>Sub Total</span>
                    <span>${totals.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                    <span>GST Total</span>
                    <span>${totals.totalGst.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between items-center text-xs font-bold uppercase text-[#001F3D]">
                    <span>Final Amount</span>
                    <span className="text-primary font-display">${totals.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Main Form */}
              <div className="flex-1 p-10 md:p-12 flex flex-col bg-white overflow-y-auto hide-scrollbar">
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Metadata</h4>
                    </div>
                    <Badge variant="outline" className="font-code text-[10px]">{formData.number}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Receiver Identity
                      </Label>
                      <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                        <SelectTrigger className={darkSelectClasses}>
                          <SelectValue placeholder="Select Customer from CRM..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                          {customers.map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Itemized Specifications</h4>
                      <Button variant="ghost" size="sm" onClick={handleAddLineItem} className="h-8 text-[9px] font-bold uppercase gap-2 text-primary hover:bg-primary/5">
                        <Plus className="h-3.5 w-3.5" /> Append Row
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {lineItems.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100 group">
                          <div className="col-span-1 text-[10px] font-bold text-slate-300 mb-3">{idx + 1}</div>
                          <div className="col-span-4 space-y-1.5">
                            <Label className="text-[8px] font-bold uppercase text-slate-400">Description</Label>
                            <Input 
                              value={item.description} 
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              className="h-9 bg-white border-none text-[11px] font-bold"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <Label className="text-[8px] font-bold uppercase text-slate-400">Quantity</Label>
                            <Input 
                              type="number"
                              value={item.quantity} 
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="h-9 bg-white border-none text-[11px] font-bold text-center"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <Label className="text-[8px] font-bold uppercase text-slate-400">Price / Unit</Label>
                            <Input 
                              type="number"
                              value={item.pricePerUnit} 
                              onChange={(e) => updateLineItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                              className="h-9 bg-white border-none text-[11px] font-bold text-center"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <Label className="text-[8px] font-bold uppercase text-slate-400">GST %</Label>
                            <Input 
                              type="number"
                              value={item.gst} 
                              onChange={(e) => updateLineItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                              className="h-9 bg-white border-none text-[11px] font-bold text-center"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} className="h-9 w-9 text-slate-200 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Commercial Note / Remark</Label>
                      <Input 
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                        className={darkInputClasses}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Discount ($)</Label>
                        <Input 
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                          className={darkInputClasses}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Amount Paid ($)</Label>
                        <Input 
                          type="number"
                          value={formData.amountPaid}
                          onChange={(e) => setFormData({...formData, amountPaid: parseFloat(e.target.value) || 0})}
                          className={darkInputClasses}
                        />
                      </div>
                    </div>
                  </div>
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
                    variant="outline"
                    className="flex-1 h-14 border-slate-200 text-[#001F3D] rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50"
                    onClick={() => handleSaveRecord()}
                  >
                    Save to Ledger
                  </Button>
                  <Button 
                    className="flex-[2] h-14 bg-primary hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-2"
                    onClick={() => setWizardStep('preview')}
                  >
                    Generate Sheet Preview <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW STEP */
            <div className="flex flex-col h-[90vh] max-h-[900px] bg-white">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <Button variant="ghost" size="sm" onClick={() => setWizardStep('form')} className="text-[10px] font-bold uppercase gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Editor
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="h-10 rounded-xl gap-2 font-bold text-[10px] uppercase">
                    <Printer className="h-4 w-4" /> Print PDF
                  </Button>
                  <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold text-[10px] uppercase shadow-lg shadow-emerald-600/20" onClick={() => handleSaveRecord('Shared')}>
                    <Share2 className="h-4 w-4" /> Authorize & Share
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-slate-100/30">
                <div className="max-w-[800px] mx-auto bg-white shadow-2xl border-4 border-[#e8f5e9] p-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
                    <div className="absolute top-6 right-[-35px] w-[150px] bg-[#22c55e] text-white text-[10px] font-bold text-center py-1 rotate-45 uppercase tracking-widest">
                      Draft
                    </div>
                  </div>

                  <div className="p-10 space-y-8">
                    <header className="bg-[#e8f5e9] -mx-10 -mt-10 p-6 flex flex-col items-center border-b border-green-200">
                      <h1 className="text-3xl font-display font-bold tracking-[0.2em] text-[#1b5e20] uppercase">Quotation</h1>
                    </header>

                    <div className="flex justify-end pt-4">
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Date: <span className="text-slate-900 ml-2">{formData.date}</span></p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Quotation No.: <span className="text-slate-900 ml-2">{formData.number}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                      {/* Shipper */}
                      <div className="space-y-4">
                        <div className="bg-[#e8f5e9] py-1.5 px-4 text-center font-bold text-[10px] uppercase tracking-widest text-[#1b5e20] border-b-2 border-green-600">Shipper</div>
                        <div className="px-2 space-y-3">
                          <p className="text-xs font-bold text-[#001F3D]">Company name : <span className="font-normal text-slate-600 ml-2">TOOLROOM 2.0 INDUSTRIAL</span></p>
                          <p className="text-xs font-bold text-[#001F3D]">Address: <span className="font-normal text-slate-600 ml-2">Plot No. 45, Sector 12, Industrial Hub, IN</span></p>
                          <div className="pt-4 space-y-2">
                            <p className="text-[10px] font-bold text-[#001F3D]">Contact: <span className="font-normal text-slate-600 ml-2">+91 98765 43210</span></p>
                            <p className="text-[10px] font-bold text-[#001F3D]">CIN: <span className="font-normal text-slate-600 ml-2">U29253PN2025PTC123456</span></p>
                            <p className="text-[10px] font-bold text-[#001F3D]">Email: <span className="font-normal text-slate-600 ml-2">accounts@toolroom.tech</span></p>
                          </div>
                          <div className="pt-2 border-t border-green-600 mt-4">
                            <p className="text-[10px] font-bold text-[#001F3D]">GSTIN: <span className="font-normal text-slate-600 ml-2">27AAACT1234A1Z1</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Receiver */}
                      <div className="space-y-4">
                        <div className="bg-[#e8f5e9] py-1.5 px-4 text-center font-bold text-[10px] uppercase tracking-widest text-[#1b5e20] border-b-2 border-green-600">Receiver</div>
                        <div className="px-2 space-y-3">
                          <p className="text-xs font-bold text-[#001F3D]">Name: <span className="font-normal text-slate-600 ml-2">{selectedCustomer?.name || '---'}</span></p>
                          <p className="text-xs font-bold text-[#001F3D]">Address: <span className="font-normal text-slate-600 ml-2">{selectedCustomer?.address || '---'}</span></p>
                          <div className="pt-4 space-y-2">
                            <p className="text-[10px] font-bold text-[#001F3D]">Cell: <span className="font-normal text-slate-600 ml-2">{selectedCustomer?.contactNumber || '---'}</span></p>
                            <p className="text-[10px] font-bold text-[#001F3D]">Email: <span className="font-normal text-slate-600 ml-2">{selectedCustomer?.email || '---'}</span></p>
                            <p className="text-[10px] font-bold text-[#001F3D]">GSTIN: <span className="font-normal text-slate-600 ml-2">{selectedCustomer?.gstNumber || '---'}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-y-2 border-slate-900 py-3 px-6 text-center">
                      <p className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest">Note / Remark : <span className="font-normal italic ml-2">{formData.note}</span></p>
                    </div>

                    {/* Line Items Table */}
                    <div className="border border-slate-900">
                      <Table>
                        <TableHeader className="bg-[#e8f5e9]">
                          <TableRow className="hover:bg-transparent border-b border-slate-900">
                            <TableHead className="text-[9px] font-bold uppercase border-r border-slate-900 py-2 px-2 text-center text-[#1b5e20] w-10">S.No.</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase border-r border-slate-900 py-2 text-[#1b5e20]">Description</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase border-r border-slate-900 py-2 px-2 text-center text-[#1b5e20]">Unit</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase border-r border-slate-900 py-2 px-2 text-center text-[#1b5e20]">Quantity</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase border-r border-slate-900 py-2 px-2 text-center text-[#1b5e20]">Price/unit</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase border-r border-slate-900 py-2 px-2 text-center text-[#1b5e20]">GST (%)</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase py-2 px-4 text-right text-[#1b5e20]">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineItems.map((item, idx) => {
                            const lineTotal = item.quantity * item.pricePerUnit;
                            const lineWithGst = lineTotal * (1 + (item.gst / 100));
                            return (
                              <TableRow key={item.id} className="border-b border-slate-900 hover:bg-transparent">
                                <TableCell className="text-center border-r border-slate-900 font-bold text-[10px] py-2">{idx + 1}</TableCell>
                                <TableCell className="border-r border-slate-900 text-[10px] py-2 font-medium">{item.description}</TableCell>
                                <TableCell className="text-center border-r border-slate-900 text-[10px] py-2">{item.unit}</TableCell>
                                <TableCell className="text-center border-r border-slate-900 text-[10px] py-2">{item.quantity}</TableCell>
                                <TableCell className="text-center border-r border-slate-900 text-[10px] py-2">{item.pricePerUnit}</TableCell>
                                <TableCell className="text-center border-r border-slate-900 text-[10px] py-2">{item.gst}%</TableCell>
                                <TableCell className="text-right text-[10px] font-bold py-2 px-4">₹ {lineWithGst.toFixed(2)}</TableCell>
                              </TableRow>
                            );
                          })}
                          
                          <TableRow className="bg-white hover:bg-transparent">
                            <TableCell colSpan={5} className="border-r border-slate-900 pt-10">
                              <p className="text-[9px] font-bold uppercase text-slate-400">Amount in Words:</p>
                              <p className="text-[10px] font-medium italic mt-2">Zero Indian Rupees Only</p>
                            </TableCell>
                            <TableCell className="text-right border-r border-slate-900 text-[9px] font-bold uppercase text-[#1b5e20] py-2">Sub Total</TableCell>
                            <TableCell className="text-right text-[10px] font-bold py-2 px-4">₹ {totals.subTotal.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={5} className="border-r border-slate-900" />
                            <TableCell className="text-right border-r border-slate-900 text-[9px] font-bold uppercase text-[#1b5e20] py-2">Discount</TableCell>
                            <TableCell className="text-right text-[10px] font-bold py-2 px-4">₹ {formData.discount.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent bg-[#e8f5e9]">
                            <TableCell colSpan={5} className="border-r border-slate-900" />
                            <TableCell className="text-right border-r border-slate-900 text-[9px] font-bold uppercase text-[#1b5e20] py-2">Final Amount</TableCell>
                            <TableCell className="text-right text-[10px] font-bold py-2 px-4 text-[#1b5e20]">₹ {totals.finalAmount.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={5} className="border-r border-slate-900" />
                            <TableCell className="text-right border-r border-slate-900 text-[9px] font-bold uppercase text-[#1b5e20] py-2">Amount Paid</TableCell>
                            <TableCell className="text-right text-[10px] font-bold py-2 px-4">₹ {formData.amountPaid.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent border-b border-slate-900">
                            <TableCell colSpan={5} className="border-r border-slate-900" />
                            <TableCell className="text-right border-r border-slate-900 text-[9px] font-bold uppercase text-[#1b5e20] py-2">Balance</TableCell>
                            <TableCell className="text-right text-[10px] font-bold py-2 px-4">₹ {totals.balance.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-4">
                      <div className="border border-slate-900 p-4">
                        <p className="text-[9px] font-bold uppercase text-[#1b5e20] mb-2">Declaration:</p>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{formData.declaration}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 pt-20 pb-10">
                      <div className="text-center">
                        <div className="h-px bg-slate-300 w-48 mx-auto mb-2" />
                        <p className="text-[9px] font-bold uppercase text-slate-400">Client's Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="h-px bg-slate-300 w-48 mx-auto mb-2" />
                        <p className="text-[9px] font-bold uppercase text-slate-400">Business Signature</p>
                      </div>
                    </div>

                    <footer className="bg-[#e8f5e9] -mx-10 -mb-10 p-4 text-center border-t border-green-200">
                      <p className="text-[10px] font-bold text-[#1b5e20]">Thanks for business with us!!! Please visit us again !!!</p>
                    </footer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
