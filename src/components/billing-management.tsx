"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  Calendar as CalendarIcon,
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
  Box,
  Filter,
  X,
  FileBarChart,
  UserCheck,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark
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
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses' | 'bank';

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

  // Advanced Filtering State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

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
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer',
    transactionDetails: '',
    bankEntryType: 'Deposit' as 'Deposit' | 'Withdrawal'
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesType = r.type === activeCategory;
      const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchesCustomer = filterCustomer === 'all' || r.customerId === filterCustomer;
      const matchesDate = !filterDate || r.date === filterDate;

      return matchesType && matchesSearch && matchesStatus && matchesCustomer && matchesDate;
    });
  }, [records, activeCategory, searchTerm, filterStatus, filterCustomer, filterDate]);

  // Bank Balance Calculation
  const bankBalance = useMemo(() => {
    const totalInflow = records.reduce((acc, r) => {
      if (r.status !== 'Paid') return acc;
      // Invoices/Quotations are inflows if paid
      if (['invoice', 'quotation', 'proforma'].includes(r.type)) return acc + r.amount;
      // Bank deposits
      if (r.type === 'bank' && (r as any).bankEntryType === 'Deposit') return acc + r.amount;
      return acc;
    }, 0);

    const totalOutflow = records.reduce((acc, r) => {
      if (r.status !== 'Paid') return acc;
      // Inward/Outward/Expenses are outflows if paid
      if (['inward', 'outward', 'expenses'].includes(r.type)) return acc + r.amount;
      // Bank withdrawals
      if (r.type === 'bank' && (r as any).bankEntryType === 'Withdrawal') return acc + r.amount;
      return acc;
    }, 0);

    return totalInflow - totalOutflow;
  }, [records]);

  const handlePrintLedger = useCallback(() => {
    window.print();
  }, []);

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterCustomer('all');
    setFilterDate('');
    setSearchTerm('');
  };

  const totals = useMemo(() => {
    let subTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    lineItems.forEach(item => {
      const lineBase = item.qty * item.price;
      const lineDiscount = (lineBase * (item.discount || 0)) / 100;
      const taxableAmount = lineBase - lineDiscount;
      const lineTax = (taxableAmount * (item.gstRate || 0)) / 100;

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
    const prefix = activeCategory === 'quotation' ? 'QT' : 
                   activeCategory === 'invoice' ? 'INV' : 
                   activeCategory === 'proforma' ? 'PI' : 
                   activeCategory === 'inward' ? 'INW' : 
                   activeCategory === 'bank' ? 'BNK' : 'DOC';
    
    setEditingRecordId(null);
    setLineItems([]);
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: activeCategory === 'invoice' ? INVOICE_TERMS : (activeCategory === 'inward' ? 'Inward logistical record initialized.' : activeCategory === 'bank' ? 'Bank ledger reconciliation entry.' : QUOTATION_TERMS),
      amount: 0,
      itemName: '',
      orderId: '',
      receiverName: '',
      paymentStatus: activeCategory === 'bank' ? 'Paid' : 'Pending',
      paymentMethod: 'Bank Transfer',
      transactionDetails: '',
      bankEntryType: 'Deposit'
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
      paymentStatus: record.status || 'Pending',
      paymentMethod: record.paymentMethod || 'Bank Transfer',
      transactionDetails: record.transactionDetails || '',
      bankEntryType: (record as any).bankEntryType || 'Deposit'
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

  const handleSave = () => {
    if (activeCategory !== 'bank' && !formData.customerId) {
      toast({ variant: "destructive", title: "Identity Required", description: "Please select a client or vendor node." });
      return;
    }

    const isFinancialDoc = ['quotation', 'invoice', 'proforma'].includes(activeCategory);
    const finalAmount = isFinancialDoc ? totals.grandTotal : formData.amount;

    const record: BillingRecord = {
      id: editingRecordId || `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: activeCategory,
      customerName: selectedEntity?.name || (activeCategory === 'bank' ? 'BANK_ENTRY' : 'Unknown'),
      customerId: formData.customerId,
      date: formData.date,
      number: formData.number,
      amount: finalAmount,
      status: formData.paymentStatus,
      note: formData.note,
      itemName: formData.itemName,
      orderId: formData.orderId,
      receiverName: formData.receiverName,
      paymentMethod: formData.paymentMethod,
      transactionDetails: formData.transactionDetails,
      items: lineItems,
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      discountTotal: totals.discountTotal,
      // Add bank-specific metadata using type casting or direct assignment
      ...((activeCategory === 'bank') ? { bankEntryType: formData.bankEntryType } : {})
    } as any;

    onSaveRecord(record);

    if (activeCategory === 'inward' && formData.orderId) {
      const linkedOrder = orders.find(o => o.id === formData.orderId);
      if (linkedOrder) {
        const otherRecordsForOrder = records.filter(r => r.type === 'inward' && r.orderId === formData.orderId && r.id !== record.id);
        const totalAmountSpent = [...otherRecordsForOrder, record].reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
        updateDocumentNonBlocking(doc(db, 'orders', linkedOrder.id), {
          amountSpent: `₹ ${totalAmountSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        });
      }
    }

    toast({ title: "Ledger Entry Committed", description: `${record.number} has been synchronized.` });
    setIsCreateDialogOpen(false);
  };

  const handlePreview = (record: BillingRecord) => {
    setPreviewRecord(record);
    setIsPreviewDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <CreditCard className="h-3.5 w-3.5" />
            Commercial Operations Hub
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Billing & <span className="text-slate-400 font-medium">Invoices</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Commercial lifecycle management from Quote to Final Settlement.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-10 px-6 font-bold text-[10px] uppercase tracking-widest shadow-sm" onClick={handlePrintLedger}>
             <Printer className="h-3.5 w-3.5" /> Print Ledger Matrix
           </Button>
           {selectedRecords.length > 0 && (
             <Button variant="destructive" className="rounded-xl gap-2 h-10 px-6 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20" onClick={handleBulkDelete}>
               <Trash2 className="h-3.5 w-3.5" /> Delete ({selectedRecords.length})
             </Button>
           )}
           <Button className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-10 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleCreateNew}>
             <Plus className="h-3.5 w-3.5" /> Initialize Record
           </Button>
        </div>
      </header>

      <Tabs value={activeCategory} onValueChange={(val) => { setActiveCategory(val as any); setSelectedRecords([]); }} className="print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-6 h-12 inline-flex border border-slate-200 shadow-sm gap-1 print:hidden">
          {['quotation', 'invoice', 'proforma', 'inward', 'outward', 'bank'].map((cat) => (
            <TabsTrigger key={cat} value={cat} className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">
              {cat === 'bank' ? 'Bank Ledger' : cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="print:block space-y-6">
          {activeCategory === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6 bg-[#001F3D] text-white border-none shadow-xl rounded-[1.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Landmark className="h-16 w-16" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">Net Bank Balance</p>
                <h3 className="text-3xl font-display font-bold tracking-tight">
                  ₹ {bankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Ledger Synchronized</span>
                </div>
              </Card>
              
              <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-[1.5rem] flex flex-col justify-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Inflow (Paid)</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ArrowUpRight className="h-4 w-4" /></div>
                  <p className="text-xl font-display font-bold text-[#001F3D]">
                    ₹ {records.filter(r => r.status === 'Paid' && (['invoice', 'quotation', 'proforma'].includes(r.type) || (r.type === 'bank' && (r as any).bankEntryType === 'Deposit'))).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-[1.5rem] flex flex-col justify-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Outflow (Paid)</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600"><ArrowDownLeft className="h-4 w-4" /></div>
                  <p className="text-xl font-display font-bold text-[#001F3D]">
                    ₹ {records.filter(r => r.status === 'Paid' && (['inward', 'outward', 'expenses'].includes(r.type) || (r.type === 'bank' && (r as any).bankEntryType === 'Withdrawal'))).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </Card>
            </div>
          )}

          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-[1.5rem] print:shadow-none print:border-none">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 print:hidden">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Search records..." className="pl-9 h-10 bg-white border-slate-200 text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date:</span>
                  <DatePicker 
                    value={filterDate}
                    onChange={setFilterDate}
                    className="h-9 w-40 rounded-xl text-[10px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identity:</span>
                  <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                    <SelectTrigger className="h-9 w-36 bg-white text-[10px] font-bold uppercase border-slate-200 rounded-lg">
                      <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="all" className="text-[10px] font-bold uppercase">All Accounts</SelectItem>
                      {activeCategory === 'inward' ? (
                        vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase">{v.name}</SelectItem>)
                      ) : (
                        customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">State:</span>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 w-32 bg-white text-[10px] font-bold uppercase border-slate-200 rounded-lg">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="all" className="text-[10px] font-bold uppercase">All States</SelectItem>
                      <SelectItem value="Pending" className="text-[10px] font-bold uppercase">Pending</SelectItem>
                      <SelectItem value="Paid" className="text-[10px] font-bold uppercase">Paid</SelectItem>
                      <SelectItem value="Completed" className="text-[10px] font-bold uppercase">Completed</SelectItem>
                      <SelectItem value="Yet to start" className="text-[10px] font-bold uppercase">Yet to start</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(filterStatus !== 'all' || filterCustomer !== 'all' || filterDate || searchTerm) && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[9px] font-bold uppercase gap-2 text-slate-400 hover:text-red-500 h-9">
                    <X className="h-3 w-3" /> Reset
                  </Button>
                )}
              </div>
            </div>

            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-12 py-4 px-6 print:hidden">
                    <Checkbox 
                      checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0} 
                      onCheckedChange={() => {
                        if (selectedRecords.length === filteredRecords.length) setSelectedRecords([]);
                        else setSelectedRecords(filteredRecords.map(r => r.id));
                      }} 
                    />
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-4">Identity / Ref</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account / Entity Name</TableHead>
                  {(activeCategory === 'inward' || activeCategory === 'bank') && <TableHead className="font-bold text-[10px] uppercase text-slate-400">Item / Note</TableHead>}
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                  <TableHead className="w-32 print:hidden"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="h-16 border-slate-50 hover:bg-slate-50/50 group print:h-12">
                    <TableCell className="px-6 print:hidden">
                      <Checkbox 
                        checked={selectedRecords.includes(record.id)} 
                        onCheckedChange={() => {
                          setSelectedRecords(prev => prev.includes(record.id) ? prev.filter(rid => rid !== record.id) : [...prev, record.id]);
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#001F3D]">{record.number}</span>
                        <span className="text-[9px] text-slate-400 font-code">{record.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-700 uppercase">{record.customerName}</TableCell>
                    {(activeCategory === 'inward' || activeCategory === 'bank') && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{record.itemName || (record as any).bankEntryType || '---'}</span>
                          {record.orderId && <Badge variant="outline" className="w-fit text-[8px] border-primary/20 text-primary mt-1 font-bold">WO #{record.orderId}</Badge>}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-sm font-display font-bold",
                          activeCategory === 'bank' && (record as any).bankEntryType === 'Withdrawal' ? "text-red-600" : 
                          activeCategory === 'bank' && (record as any).bankEntryType === 'Deposit' ? "text-emerald-600" :
                          "text-[#001F3D]"
                        )}>
                          {activeCategory === 'bank' && (record as any).bankEntryType === 'Withdrawal' ? '-' : ''}
                          ₹ {record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-bold uppercase",
                        record.status === 'Completed' || record.status === 'Paid' ? "bg-green-50 text-green-700 border-green-100" : 
                        record.status === 'Yet to start' ? "bg-purple-50 text-purple-700 border-purple-100" :
                        "bg-blue-50 text-blue-700 border-blue-100"
                      )}>{record.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8 print:hidden">
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
                    <TableCell colSpan={7} className="h-40 text-center text-slate-400 text-xs font-medium italic">No records detected in this category ledger.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[1000px] bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-8 overflow-y-auto hide-scrollbar flex-1">
            <DialogHeader className="mb-8 flex flex-row justify-between items-start">
              <div>
                <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                  <Calculator className="h-4 w-4" />
                  Financial Protocol Implementation
                </div>
                <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] tracking-tight">
                  {editingRecordId ? 'Modify Record' : 'Initialize Protocol'}: {activeCategory === 'bank' ? 'Bank Entry' : activeCategory.toUpperCase()}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Configure and synchronize financial lifecycle documents.</DialogDescription>
              </div>
              <Badge className="bg-slate-100 text-slate-400 border-none font-code text-[10px] px-4 py-1.5 h-fit">{formData.number}</Badge>
            </DialogHeader>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeCategory !== 'bank' ? (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> Select Identity
                    </Label>
                    <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                      <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify entity..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                        {activeCategory === 'inward' ? (
                          vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-xs font-bold uppercase">{v.name}</SelectItem>)
                        ) : (
                          customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <ArrowUpRight className="h-3 w-3" /> Entry Type
                    </Label>
                    <Select value={formData.bankEntryType} onValueChange={(val: any) => setFormData({...formData, bankEntryType: val})}>
                      <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Deposit" className="text-xs font-bold uppercase text-emerald-600">Deposit / Credit (+)</SelectItem>
                        <SelectItem value="Withdrawal" className="text-xs font-bold uppercase text-red-600">Withdrawal / Debit (-)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" /> Protocol Date
                  </Label>
                  <DatePicker 
                    value={formData.date} 
                    onChange={(val) => setFormData({...formData, date: val})}
                    className="h-11 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <Filter className="h-3 w-3" /> Operational Status
                  </Label>
                  <Select disabled={activeCategory === 'bank'} value={formData.paymentStatus} onValueChange={(val) => setFormData({...formData, paymentStatus: val})}>
                    <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                      <SelectItem value="Pending" className="text-xs font-bold uppercase">Pending</SelectItem>
                      <SelectItem value="Paid" className="text-xs font-bold uppercase">Paid</SelectItem>
                      <SelectItem value="Completed" className="text-xs font-bold uppercase">Completed</SelectItem>
                      <SelectItem value="Yet to start" className="text-xs font-bold uppercase">Yet to start</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(activeCategory === 'inward' || activeCategory === 'bank') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Package className="h-5 w-5 text-primary" />
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeCategory === 'bank' ? 'Transaction Identity' : 'Item & Production Link'}</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{activeCategory === 'bank' ? 'Reference Name' : 'Item Identification'}</Label>
                          <Input placeholder={activeCategory === 'bank' ? 'e.g. GST Refund, Monthly Rent...' : 'e.g. Rough Casting Lot #12'} className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
                        </div>
                        
                        {activeCategory === 'inward' && (
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Linked Production Order (Work Order)</Label>
                            <Select value={formData.orderId} onValueChange={(val) => setFormData({...formData, orderId: val})}>
                              <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold">
                                <SelectValue placeholder="Select active thread..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="none" className="text-xs font-bold uppercase">No Link (Direct Intake)</SelectItem>
                                {orders.map(o => <SelectItem key={o.id} value={o.id} className="text-xs font-bold uppercase">WO #{o.id} - {o.customer}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <p className="text-[8px] text-slate-400 italic px-1">* Linking will automatically update the Order's "Amount Spent" ledger.</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Transaction Value (₹)</Label>
                          <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-2xl font-display font-bold text-[#001F3D] shadow-inner" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>

                    {activeCategory === 'inward' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                          <UserCheck className="h-5 w-5 text-accent" />
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logistics Authorization</h4>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Receiver Identification</Label>
                          <Select value={formData.receiverName} onValueChange={(val) => setFormData({...formData, receiverName: val})}>
                            <SelectTrigger className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold">
                              <SelectValue placeholder="Identify receiver node..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {users.map(u => <SelectItem key={u.id} value={u.name} className="text-xs font-bold uppercase">{u.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className={cn(
                      "p-6 rounded-[1.5rem] border transition-all duration-500",
                      formData.paymentStatus === 'Paid' ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100 opacity-60"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <Wallet className={cn("h-4 w-4", formData.paymentStatus === 'Paid' ? "text-emerald-600" : "text-slate-400")} />
                        <h4 className={cn("text-[10px] font-bold uppercase tracking-widest", formData.paymentStatus === 'Paid' ? "text-emerald-700" : "text-slate-400")}>Settlement Details</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Payment Protocol</Label>
                          <Select disabled={formData.paymentStatus !== 'Paid'} value={formData.paymentMethod} onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}>
                            <SelectTrigger className="h-11 bg-white border-none rounded-xl text-xs font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Bank Transfer" className="text-xs font-bold uppercase">Bank Transfer / NEFT</SelectItem>
                              <SelectItem value="Cash" className="text-xs font-bold uppercase">Cash Settlement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Transaction Reference / Details</Label>
                          <Textarea 
                            disabled={formData.paymentStatus !== 'Paid'}
                            placeholder="UTR No, Reference, or Note..." 
                            className="h-20 bg-white border-none rounded-xl text-xs font-medium" 
                            value={formData.transactionDetails}
                            onChange={(e) => setFormData({...formData, transactionDetails: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Internal Logistics Note</Label>
                      <Textarea placeholder="Specific storage or intake observations..." className="h-24 bg-slate-50 border-none rounded-xl text-xs font-medium" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                    </div>
                  </div>
                </div>
              ) : ['quotation', 'invoice', 'proforma'].includes(activeCategory) ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <Box className="h-3.5 w-3.5 text-primary" /> Itemized Commercial Matrix
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => setLineItems([...lineItems, { id: `ITEM-${Date.now()}`, description: '', hsn: '', qty: 1, unit: 'Units', price: 0, discount: 0, gstRate: 18 }])} className="text-[10px] font-bold uppercase gap-2 text-primary hover:bg-primary/5 h-8">
                      <Plus className="h-3.5 w-3.5" /> Append Item
                    </Button>
                  </div>

                  <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-inner bg-slate-50/30">
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="text-[9px] font-bold uppercase py-3 px-6">Description</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-20">HSN</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-16">Qty</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-20">Unit</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-28">Price</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-16">Disc %</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center w-16">GST %</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-right px-6 w-32">Total (₹)</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => {
                          const itemTotal = (item.qty * item.price) * (1 - (item.discount || 0) / 100) * (1 + (item.gstRate || 0) / 100);
                          return (
                            <TableRow key={item.id} className="border-slate-50 hover:bg-white/50 group transition-colors">
                              <TableCell className="px-6">
                                <Input placeholder="Description" className="h-8 bg-white border-none rounded-lg text-xs font-bold" value={item.description} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, description: e.target.value} : li))} />
                              </TableCell>
                              <TableCell><Input className="h-8 bg-white border-none rounded-lg text-[10px] font-code text-center" value={item.hsn} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, hsn: e.target.value} : li))} /></TableCell>
                              <TableCell><Input type="number" className="h-8 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.qty} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, qty: Number(e.target.value)} : li))} /></TableCell>
                              <TableCell><Input className="h-8 bg-white border-none rounded-lg text-[10px] font-bold text-center" value={item.unit} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, unit: e.target.value} : li))} /></TableCell>
                              <TableCell><Input type="number" className="h-8 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.price} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, price: Number(e.target.value)} : li))} /></TableCell>
                              <TableCell><Input type="number" className="h-8 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.discount} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, discount: Number(e.target.value)} : li))} /></TableCell>
                              <TableCell><Input type="number" className="h-8 bg-white border-none rounded-lg text-xs font-bold text-center" value={item.gstRate} onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, gstRate: Number(e.target.value)} : li))} /></TableCell>
                              <TableCell className="text-right px-6 font-display font-bold text-[#001F3D]">₹ {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setLineItems(lineItems.filter(li => li.id !== item.id))}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Document Terms & Conditions</Label>
                      <Textarea 
                        className="w-full h-32 bg-slate-50 border-none rounded-xl p-4 text-xs font-medium text-slate-600 focus:ring-primary/20 resize-none shadow-inner"
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                      />
                    </div>
                    <div className="bg-[#001F3D] text-white p-8 rounded-[1.5rem] shadow-xl relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                        <TrendingUp className="h-20 w-20" />
                      </div>
                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/40">
                          <span>Sub Total</span>
                          <span>₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-red-400">
                          <span>Discount (-)</span>
                          <span>- ₹ {totals.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                          <span>GST (18%)</span>
                          <span>+ ₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Net Valuation</p>
                            <p className="text-3xl font-display font-bold tracking-tighter">₹ {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          </div>
                          <Badge className="bg-primary text-white border-none font-bold text-[8px] px-3 py-1 rounded-full mb-1">FINAL_NET</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Item / Batch Identification</Label>
                      <Input placeholder="e.g. M10 Hex Bolt (5000 Units)" className="h-11 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Net Transaction Value (₹)</Label>
                      <Input type="number" className="h-11 bg-slate-50 border-none rounded-xl text-xl font-display font-bold text-primary shadow-inner" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Internal Logistics Note</Label>
                    <Textarea className="w-full h-full min-h-[120px] bg-slate-50 border-none rounded-xl p-4 text-xs font-medium text-slate-600 focus:ring-primary/20 resize-none shadow-inner" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Synchronized</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsCreateDialogOpen(false)}>Abort Protocol</Button>
              <Button className="h-11 px-10 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl flex gap-3 group" onClick={handleSave}>
                {editingRecordId ? 'Update Ledger' : 'Commit to Master Ledger'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-[850px] bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:rounded-none">
          <DialogTitle className="sr-only">Billing Record Matrix Preview</DialogTitle>
          <DialogDescription className="sr-only">Print-ready visualization of the selected financial or logistical document.</DialogDescription>
          <div className="p-10 overflow-y-auto hide-scrollbar print:p-0 flex-1">
            <div id="print-document" className="space-y-8">
              <div className="flex justify-between items-start border-b-2 border-[#001F3D] pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#001F3D] rounded-xl text-white">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tighter">BHARAT<span className="text-primary">AXIS</span></h1>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Industrial Tooling & Precision Components</p>
                    </div>
                  </div>
                  <div className="text-[9px] font-medium text-slate-500 space-y-0.5 leading-relaxed">
                    <p>Sector 10, Industrial Estate, Bhosari</p>
                    <p>Pune, Maharashtra - 411026</p>
                    <p>GSTIN: 27AABCB1234F1Z1</p>
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tighter">{previewRecord?.type}</h2>
                  <p className="text-[10px] font-bold text-primary uppercase font-code"># {previewRecord?.number}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">DATE: {previewRecord?.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-3">
                  <h3 className="text-[9px] font-bold text-[#001F3D] uppercase tracking-widest border-b border-slate-100 pb-1.5">Client Identity</h3>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 uppercase">{previewRecord?.customerName}</p>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed max-w-xs">{selectedEntity?.address}</p>
                    <p className="text-[9px] font-bold text-slate-700 uppercase mt-1">GST: {selectedEntity?.gstNumber}</p>
                  </div>
                </div>
                <div className="space-y-3 text-right">
                  <h3 className="text-[9px] font-bold text-[#001F3D] uppercase tracking-widest border-b border-slate-100 pb-1.5">Dispatch Protocol</h3>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Linked Order: <span className="text-slate-900">#{previewRecord?.orderId || 'Direct'}</span></p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Status: <span className="text-primary font-bold">{previewRecord?.status}</span></p>
                  </div>
                </div>
              </div>

              {previewRecord?.type === 'inward' ? (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-3">Intake Specification Matrix</h3>
                  <Card className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl space-y-6">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Item Description</p>
                        <p className="text-xs font-bold text-slate-900 uppercase">{previewRecord?.itemName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Receiver Node</p>
                        <p className="text-xs font-bold text-slate-900 uppercase">{previewRecord?.receiverName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Settlement Status</p>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase font-bold text-[8px]">{previewRecord?.status}</Badge>
                      </div>
                      {previewRecord?.status === 'Paid' && (
                        <>
                          <div className="space-y-1">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Method</p>
                            <p className="text-[10px] font-bold text-slate-700">{previewRecord?.paymentMethod}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reference</p>
                            <p className="text-[10px] font-bold text-slate-700 truncate">{previewRecord?.transactionDetails || '---'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-transparent border-slate-200">
                        <TableHead className="text-[8px] font-bold uppercase py-3 px-6 text-[#001F3D]">SR.</TableHead>
                        <TableHead className="text-[8px] font-bold uppercase text-[#001F3D]">Description of Goods / Services</TableHead>
                        <TableHead className="text-[8px] font-bold uppercase text-center text-[#001F3D]">HSN</TableHead>
                        <TableHead className="text-[8px] font-bold uppercase text-center text-[#001F3D]">Qty</TableHead>
                        <TableHead className="text-[8px] font-bold uppercase text-center text-[#001F3D]">Rate (₹)</TableHead>
                        <TableHead className="text-[8px] font-bold uppercase text-right px-6 text-[#001F3D]">Amount (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRecord?.items?.map((item, idx) => (
                        <TableRow key={item.id} className="border-slate-100 h-10">
                          <TableCell className="text-center font-bold text-[9px] text-slate-400 px-6">{idx + 1}</TableCell>
                          <TableCell className="font-bold text-[10px] text-slate-700 uppercase">{item.description}</TableCell>
                          <TableCell className="text-center font-code text-[9px] text-slate-500">{item.hsn}</TableCell>
                          <TableCell className="text-center text-[9px] font-bold text-slate-700">{item.qty} {item.unit}</TableCell>
                          <TableCell className="text-center text-[9px] font-bold text-slate-700">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right px-6 text-[9px] font-bold text-[#001F3D]">{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Terms & Notes</h3>
                  <p className="text-[9px] text-slate-500 leading-relaxed whitespace-pre-wrap italic font-medium">{previewRecord?.note}</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#001F3D] uppercase">Total Valuation Protocol</span>
                      <span className="text-xl font-display font-bold text-[#001F3D]">₹ {previewRecord?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 grid grid-cols-2 gap-32">
                <div className="text-center space-y-3">
                  <div className="h-[1px] bg-slate-300 w-full" />
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Customer Authorization</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="h-[1px] bg-slate-200 w-full" />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                  <p className="text-[7px] font-bold text-primary uppercase">FOR BHARAT AXIS PVT LTD</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center print:hidden shrink-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[8px] font-bold uppercase h-7 px-3 border-slate-200 bg-white">ISO_BILLING_v2.4</Badge>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5 mr-2" /> Print Matrix
              </Button>
              <Button className="h-10 px-8 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex gap-2 group" onClick={() => setIsPreviewDialogOpen(false)}>
                Close Matrix
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
