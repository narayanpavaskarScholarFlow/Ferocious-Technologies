
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CreditCard, 
  Search, 
  Plus, 
  ArrowRight,
  Receipt,
  Building2,
  Calendar,
  Hash,
  Truck,
  User,
  Package,
  CheckCircle2,
  Clock,
  Banknote,
  Edit2,
  FileText,
  TrendingUp,
  DollarSign,
  Trash2,
  Printer,
  ChevronRight,
  Calculator,
  Download,
  Box
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, BillingLineItem } from '@/lib/types';
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
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses';

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
}

const QUOTATION_TERMS = `1. Validity: 30 Days from date of issue.
2. Payment: 50% advance along with P.O., Balance before dispatch.
3. Taxes: GST 18% extra as applicable.
4. Delivery: Within 4-6 weeks from receipt of P.O. and CAD data.
5. Transportation: Ex-works, Freight charges extra at actuals.`;

const INVOICE_TERMS = `1. Subject to Pune jurisdiction only.
2. Payment to be made via Bank Transfer / NEFT only.
3. Any discrepancy must be reported within 24 hours of receipt.
4. Interest @ 18% p.a. will be charged for delayed payments beyond due date.
5. Goods once sold will not be taken back.`;

export function BillingManagement({ customers, vendors, records, orders, users, onSaveRecord, onDeleteRecord }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('quotation');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<BillingRecord | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  // Advanced Billing State
  const [lineItems, setLineItems] = useState<BillingLineItem[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    note: QUOTATION_TERMS,
    amount: 0,
    itemName: '',
    orderId: '',
    receiverName: '',
    paymentStatus: 'pending',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer',
    transactionDetails: ''
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.type === activeCategory && (
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [records, activeCategory, searchTerm]);

  // Quotation Specific Metrics
  const quoteMetrics = useMemo(() => {
    const qts = records.filter(r => r.type === 'quotation');
    return {
      totalValue: qts.reduce((acc, curr) => acc + (curr.amount || 0), 0),
      pendingCount: qts.filter(r => r.status === 'Pending').length,
      totalCount: qts.length
    };
  }, [records]);

  // Document totals calculation
  const totals = useMemo(() => {
    let subTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    lineItems.forEach(item => {
      const lineBase = item.qty * item.price;
      const lineDiscount = (lineBase * item.discount) / 100;
      const taxableAmount = lineBase - lineDiscount;
      const lineTax = (taxableAmount * item.gstRate) / 100;

      subTotal += lineBase;
      discountTotal += lineDiscount;
      taxTotal += lineTax;
    });

    return {
      subTotal,
      discountTotal,
      taxTotal,
      grandTotal: subTotal - discountTotal + taxTotal
    };
  }, [lineItems]);

  const selectedEntity = useMemo(() => {
    if (activeCategory === 'inward') return vendors.find(v => v.id === formData.customerId);
    return customers.find(c => c.id === formData.customerId || c.name === formData.customerId);
  }, [customers, vendors, formData.customerId, activeCategory]);

  const handleCreateNew = () => {
    const prefix = activeCategory === 'quotation' ? 'QT' : activeCategory === 'invoice' ? 'INV' : activeCategory === 'proforma' ? 'PI' : activeCategory === 'inward' ? 'INW' : 'DOC';
    setEditingRecordId(null);
    setLineItems([]);
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: activeCategory === 'invoice' ? INVOICE_TERMS : QUOTATION_TERMS,
      amount: 0,
      itemName: '',
      orderId: '',
      receiverName: '',
      paymentStatus: 'pending',
      paymentMethod: 'Bank Transfer',
      transactionDetails: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (record: BillingRecord) => {
    setEditingRecordId(record.id);
    setLineItems(record.items || []);
    setFormData({
      customerId: record.customerId,
      date: record.date,
      number: record.number,
      note: record.note,
      amount: record.amount,
      itemName: record.itemName || '',
      orderId: record.orderId || '',
      receiverName: record.receiverName || '',
      paymentStatus: record.status.toLowerCase() === 'paid' ? 'paid' : 'pending',
      paymentMethod: record.paymentMethod || 'Bank Transfer',
      transactionDetails: record.transactionDetails || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onDeleteRecord(id);
    setSelectedRecords(prev => prev.filter(rid => rid !== id));
    toast({
      variant: "destructive",
      title: "Record Purged",
      description: "Billing document has been removed from the ledger."
    });
  };

  const handleBulkDelete = () => {
    selectedRecords.forEach(id => onDeleteRecord(id));
    setSelectedRecords([]);
    toast({
      variant: "destructive",
      title: "Batch Purge Complete",
      description: `Successfully removed ${selectedRecords.length} records from the master ledger.`
    });
  };

  const toggleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleAddLineItem = () => {
    const newItem: BillingLineItem = {
      id: `ITEM-${Date.now()}`,
      description: '',
      hsn: '',
      qty: 1,
      unit: 'Units',
      price: 0,
      discount: 0,
      gstRate: 18
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof BillingLineItem, value: any) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (!formData.customerId) {
      toast({ variant: "destructive", title: "Identity Required", description: "Please select a client or vendor node." });
      return;
    }

    const isFinancialDoc = ['quotation', 'invoice', 'proforma'].includes(activeCategory);
    const finalAmount = isFinancialDoc ? totals.grandTotal : formData.amount;

    const record: BillingRecord = {
      id: editingRecordId || `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: activeCategory,
      customerName: selectedEntity?.name || 'Unknown',
      customerId: formData.customerId,
      date: formData.date,
      number: formData.number,
      amount: finalAmount,
      status: formData.paymentStatus === 'paid' ? 'Paid' : 'Pending',
      note: formData.note,
      itemName: formData.itemName,
      orderId: formData.orderId,
      receiverName: formData.receiverName,
      paymentMethod: formData.paymentMethod,
      transactionDetails: formData.transactionDetails,
      items: lineItems,
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      discountTotal: totals.discountTotal
    };

    onSaveRecord(record);
    toast({ title: "Ledger Entry Committed", description: `${record.number} has been synchronized.` });
    setIsCreateDialogOpen(false);
  };

  const handlePreview = (record: BillingRecord) => {
    setPreviewRecord(record);
    setIsPreviewDialogOpen(true);
  };

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
          <p className="text-muted-foreground font-medium">Commercial lifecycle management from Quote to Final Settlement.</p>
        </div>
        <div className="flex items-center gap-3">
           {selectedRecords.length > 0 && (
             <Button variant="destructive" className="rounded-xl gap-2 h-11 px-6 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20" onClick={handleBulkDelete}>
               <Trash2 className="h-4 w-4" /> Delete Selected ({selectedRecords.length})
             </Button>
           )}
           <Button className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleCreateNew}>
             <Plus className="h-4 w-4" /> Create New Record
           </Button>
        </div>
      </header>

      <Tabs value={activeCategory} onValueChange={(val) => { setActiveCategory(val as any); setSelectedRecords([]); }}>
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 h-14 inline-flex border border-slate-200/60 shadow-sm gap-2">
          {['quotation', 'invoice', 'proforma', 'inward', 'outward'].map((cat) => (
            <TabsTrigger key={cat} value={cat} className="rounded-xl px-6 h-11 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeCategory === 'quotation' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in slide-in-from-top-2 duration-500">
            <Card className="p-8 bg-white border-slate-200/60 shadow-lg rounded-2xl flex items-center gap-6 group hover:border-primary/30 transition-all">
              <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <DollarSign className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quoted Value</p>
                <p className="text-2xl font-display font-bold text-[#001F3D]">₹ {quoteMetrics.totalValue.toLocaleString('en-IN')}</p>
              </div>
            </Card>
            <Card className="p-8 bg-white border-slate-200/60 shadow-lg rounded-2xl flex items-center gap-6 group hover:border-amber-500/30 transition-all">
              <div className="h-14 w-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Protocols</p>
                <p className="text-2xl font-display font-bold text-[#001F3D]">{quoteMetrics.pendingCount}</p>
              </div>
            </Card>
            <Card className="p-8 bg-white border-slate-200/60 shadow-lg rounded-2xl flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
              <div className="h-14 w-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Records</p>
                <p className="text-2xl font-display font-bold text-[#001F3D]">{quoteMetrics.totalCount}</p>
              </div>
            </Card>
          </div>
        )}

        <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-2xl">
          <div className="p-8 border-b border-slate-100 flex items-center bg-slate-50/50">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search records..." className="pl-10 h-11 bg-white border-slate-200 text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-12 py-6 px-6">
                  <Checkbox 
                    checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0} 
                    onCheckedChange={toggleSelectAll} 
                  />
                </TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6">Identity / Ref</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account / Entity Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="h-20 border-slate-50 hover:bg-slate-50/50 group">
                  <TableCell className="px-6">
                    <Checkbox 
                      checked={selectedRecords.includes(record.id)} 
                      onCheckedChange={() => toggleSelectRow(record.id)} 
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D]">{record.number}</span>
                      <span className="text-[9px] text-slate-400 font-code">{record.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-700 uppercase">{record.customerName}</TableCell>
                  <TableCell className="text-right font-display font-bold text-[#001F3D]">₹ {record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase",
                      record.status === 'Paid' ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                    )}>{record.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary" onClick={() => handlePreview(record)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary" onClick={() => handleEdit(record)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400 text-xs font-medium italic">No records detected in this category ledger.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Tabs>

      {/* Main Creation/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[1200px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <div className="p-8 md:p-12 overflow-y-auto hide-scrollbar flex-1">
            <DialogHeader className="mb-10 flex flex-row justify-between items-start">
              <div>
                <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                  <Calculator className="h-4 w-4" />
                  Financial Protocol Implementation
                </div>
                <DialogTitle className="text-4xl font-display font-bold text-[#001F3D] tracking-tight">
                  {editingRecordId ? 'Modify Record' : 'Initialize Protocol'}: {activeCategory.toUpperCase()}
                </DialogTitle>
              </div>
              <Badge className="bg-slate-100 text-slate-400 border-none font-code text-[10px] px-4 py-1.5 h-fit">{formData.number}</Badge>
            </DialogHeader>
            
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <Building2 className="h-3 w-3" /> Select Identity (from CRM)
                  </Label>
                  <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                      <SelectValue placeholder="Identify entity..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {['inward'].includes(activeCategory) ? (
                        vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-xs font-bold uppercase">{v.name}</SelectItem>)
                      ) : (
                        customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Protocol Date
                  </Label>
                  <Input type="date" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <Receipt className="h-3 w-3" /> Linked Work Order
                  </Label>
                  <Select value={formData.orderId} onValueChange={(val) => setFormData({...formData, orderId: val})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold">
                      <SelectValue placeholder="Production link..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">General / No Link</SelectItem>
                      {orders.map(o => <SelectItem key={o.id} value={o.id}>#{o.id} - {o.customer}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Multi-Item Editor for Financial Docs */}
              {['quotation', 'invoice', 'proforma'].includes(activeCategory) ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <Box className="h-3.5 w-3.5 text-primary" /> Itemized Commercial Matrix
                    </h4>
                    <Button variant="ghost" size="sm" onClick={handleAddLineItem} className="text-[10px] font-bold uppercase gap-2 text-primary hover:bg-primary/5">
                      <Plus className="h-3.5 w-3.5" /> Append Item
                    </Button>
                  </div>

                  <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-inner bg-slate-50/30">
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="text-[9px] font-bold uppercase py-4 px-6">Description</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-24">HSN</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-24">Qty</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-24">Unit</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-32">Unit Price</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-24">Disc %</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-24">GST %</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-right px-6 w-32">Total (₹)</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => {
                          const itemTotal = (item.qty * item.price) * (1 - item.discount / 100) * (1 + item.gstRate / 100);
                          return (
                            <TableRow key={item.id} className="border-slate-50 hover:bg-white/50 group transition-colors">
                              <TableCell className="px-6">
                                <Input placeholder="Item Description" className="h-9 bg-white border-none rounded-lg text-xs font-bold" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} />
                              </TableCell>
                              <TableCell><Input className="h-9 bg-white border-none rounded-lg text-[10px] font-code text-center" value={item.hsn} onChange={(e) => updateLineItem(item.id, 'hsn', e.target.value)} /></TableCell>
                              <TableCell><Input type="number" className="h-9 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', Number(e.target.value))} /></TableCell>
                              <TableCell><Input className="h-9 bg-white border-none rounded-lg text-[10px] font-bold text-center" value={item.unit} onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)} /></TableCell>
                              <TableCell><Input type="number" className="h-9 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.price} onChange={(e) => updateLineItem(item.id, 'price', Number(e.target.value))} /></TableCell>
                              <TableCell><Input type="number" className="h-9 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.discount} onChange={(e) => updateLineItem(item.id, 'discount', Number(e.target.value))} /></TableCell>
                              <TableCell><Input type="number" className="h-9 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.gstRate} onChange={(e) => updateLineItem(item.id, 'gstRate', Number(e.target.value))} /></TableCell>
                              <TableCell className="text-right px-6 font-display font-bold text-[#001F3D]">₹ {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeLineItem(item.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {lineItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                                <Plus className="h-8 w-8 text-slate-400" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Protocol Null: Append line items to initialize valuation.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Document Terms & Conditions</Label>
                      <textarea 
                        className="w-full h-48 bg-slate-50 border-none rounded-2xl p-6 text-xs font-medium text-slate-600 focus:ring-primary/20 resize-none"
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                      />
                    </div>
                    <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="h-32 w-32" />
                      </div>
                      <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>Sub Total (Base)</span>
                          <span>₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-red-400">
                          <span>Total Discount (-)</span>
                          <span>- ₹ {totals.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                          <span>GST (SGST + CGST / IGST)</span>
                          <span>+ ₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Valuation</p>
                            <p className="text-4xl font-display font-bold tracking-tighter">₹ {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          <Badge className="bg-primary text-white border-none font-bold text-[9px] px-4 py-1.5 rounded-full mb-1">FINAL_NET</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Simple Form for Logistics Docs (Inward/Outward) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Item / Batch Identification</Label>
                      <Input placeholder="e.g. Rough Casting Lot #12" className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Net Transaction Value (₹)</Label>
                      <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-xl font-display font-bold text-primary" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Internal Logistics Note</Label>
                    <textarea className="w-full h-full min-h-[140px] bg-slate-50 border-none rounded-2xl p-6 text-xs font-medium text-slate-600 focus:ring-primary/20 resize-none" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 md:px-12 md:py-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Synchronized</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsCreateDialogOpen(false)}>Abort Protocol</Button>
              <Button className="h-12 px-10 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-3 group" onClick={handleSave}>
                {editingRecordId ? 'Update Ledger' : 'Commit to Master Ledger'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Industrial Print Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-[900px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[95vh]">
          <div className="p-12 overflow-y-auto hide-scrollbar print:p-0">
            <div id="print-document" className="space-y-10">
              <div className="flex justify-between items-start border-b-2 border-[#001F3D] pb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#001F3D] rounded-xl text-white">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-display font-bold tracking-tighter">BHARAT<span className="text-primary">AXIS</span></h1>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Industrial Tooling & Precision Components</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 space-y-0.5 leading-relaxed">
                    <p>Sector 10, Industrial Estate, Bhosari</p>
                    <p>Pune, Maharashtra - 411026</p>
                    <p>GSTIN: 27AABCB1234F1Z1</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <h2 className="text-4xl font-display font-bold text-[#001F3D] uppercase tracking-tighter">{previewRecord?.type}</h2>
                  <p className="text-xs font-bold text-primary uppercase font-code"># {previewRecord?.number}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">DATE: {previewRecord?.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-20">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest border-b border-slate-100 pb-2">Client Identity</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 uppercase">{previewRecord?.customerName}</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-xs">{selectedEntity?.address}</p>
                    <p className="text-[10px] font-bold text-slate-700 uppercase mt-2">GST: {selectedEntity?.gstNumber}</p>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <h3 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-widest border-b border-slate-100 pb-2">Dispatch Protocol</h3>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Linked Order: <span className="text-slate-900">#{previewRecord?.orderId || 'Direct'}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status: <span className="text-primary font-bold">{previewRecord?.status}</span></p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-slate-200">
                      <TableHead className="text-[9px] font-bold uppercase py-4 px-6 text-[#001F3D]">SR.</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-[#001F3D]">Description of Goods / Services</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center text-[#001F3D]">HSN</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center text-[#001F3D]">Qty</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-center text-[#001F3D]">Rate (₹)</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right px-6 text-[#001F3D]">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRecord?.items?.map((item, idx) => (
                      <TableRow key={item.id} className="border-slate-100">
                        <TableCell className="text-center font-bold text-[10px] text-slate-400 px-6">{idx + 1}</TableCell>
                        <TableCell className="font-bold text-xs text-slate-700 uppercase">{item.description}</TableCell>
                        <TableCell className="text-center font-code text-[10px] text-slate-500">{item.hsn}</TableCell>
                        <TableCell className="text-center text-[10px] font-bold text-slate-700">{item.qty} {item.unit}</TableCell>
                        <TableCell className="text-center text-[10px] font-bold text-slate-700">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right px-6 text-[10px] font-bold text-[#001F3D]">{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Terms & Notes</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-wrap italic font-medium">{previewRecord?.note}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-8 rounded-3xl space-y-4 border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                      <span>Sub-Total Matrix</span>
                      <span>₹ {previewRecord?.subTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-red-500 uppercase">
                      <span>Industrial Discount</span>
                      <span>- ₹ {previewRecord?.discountTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 uppercase">
                      <span>Total Tax (GST)</span>
                      <span>+ ₹ {previewRecord?.taxTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#001F3D] uppercase">Grand Total Protocol</span>
                      <span className="text-2xl font-display font-bold text-[#001F3D]">₹ {previewRecord?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-20 grid grid-cols-2 gap-40">
                <div className="text-center space-y-4">
                  <div className="h-[1px] bg-slate-200 w-full" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Customer Authorization</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="h-[1px] bg-slate-200 w-full" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                  <p className="text-[8px] font-bold text-primary uppercase">FOR BHARAT AXIS PVT LTD</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:px-12 md:py-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[9px] font-bold uppercase h-8 px-4 border-slate-200 bg-white">Format: ISO_BILLING_v2.4</Badge>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Print Document
              </Button>
              <Button className="h-12 px-10 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-3 group" onClick={() => setIsPreviewDialogOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
