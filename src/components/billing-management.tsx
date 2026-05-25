
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
  Landmark,
  ListOrdered,
  PackageCheck,
  Info
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, BillingLineItem, PermissionLevel, UISettings } from '@/lib/types';
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
import { ScrollArea } from '@/components/ui/scroll-area';

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses' | 'bank' | 'delivery_challan';

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  permissions?: Record<string, PermissionLevel>;
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  uiSettings: UISettings;
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

const DC_TERMS = `1. Goods received in good condition.
2. Any shortages or damages must be reported immediately upon receipt.
3. This challan is for internal logistical verification only.`;

export function BillingManagement({ customers, vendors, records, orders, users, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('quotation');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<BillingRecord | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const availableCategories = useMemo(() => {
    const allCats: { id: BillingCategory; label: string; permKey: string }[] = [
      { id: 'quotation', label: 'Quotation', permKey: 'billing-quotation' },
      { id: 'invoice', label: 'Invoice', permKey: 'billing-invoice' },
      { id: 'delivery_challan', label: 'Delivery Challan', permKey: 'billing-dc' },
      { id: 'proforma', label: 'Proforma', permKey: 'billing-proforma' },
      { id: 'inward', label: 'Inward', permKey: 'billing-inward' },
      { id: 'outward', label: 'Outward', permKey: 'billing-outward' },
      { id: 'bank', label: 'Bank Ledger', permKey: 'billing-bank' },
    ];

    return allCats.filter(cat => {
      const level = permissions?.[cat.permKey];
      return level && level !== 'none';
    });
  }, [permissions]);

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.find(c => c.id === activeCategory)) {
      setActiveCategory(availableCategories[0].id);
    }
  }, [availableCategories, activeCategory]);

  const canEditCurrent = useMemo(() => {
    const globalEdit = permissions?.['billing-edit'];
    if (globalEdit === 'edit' || globalEdit === 'full') return true;
    
    const permKey = `billing-${activeCategory === 'bank' ? 'bank' : activeCategory === 'delivery_challan' ? 'dc' : activeCategory}`;
    const level = permissions?.[permKey];
    return level === 'edit' || level === 'full';
  }, [permissions, activeCategory]);

  const canDeleteCurrent = useMemo(() => {
    const globalDelete = permissions?.['billing-delete'];
    if (globalDelete === 'full') return true;

    const permKey = `billing-${activeCategory === 'bank' ? 'bank' : activeCategory === 'delivery_challan' ? 'dc' : activeCategory}`;
    const level = permissions?.[permKey];
    return level === 'full';
  }, [permissions, activeCategory]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

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
    bankEntryType: 'Deposit' as 'Deposit' | 'Withdrawal',
    transportationCharges: 0,
    packingCharges: 0,
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

  const bankBalance = useMemo(() => {
    const totalInflow = records.reduce((acc, r) => {
      if (r.status !== 'Paid') return acc;
      if (['invoice', 'quotation', 'proforma', 'delivery_challan'].includes(r.type)) return acc + r.amount;
      if (r.type === 'bank' && (r as any).bankEntryType === 'Deposit') return acc + r.amount;
      return acc;
    }, 0);

    const totalOutflow = records.reduce((acc, r) => {
      if (r.status !== 'Paid') return acc;
      if (['inward', 'outward', 'expenses'].includes(r.type)) return acc + r.amount;
      if (r.type === 'bank' && (r as any).bankEntryType === 'Withdrawal') return acc + r.amount;
      return acc;
    }, 0);

    return totalInflow - totalOutflow;
  }, [records]);

  const totals = useMemo(() => {
    let itemSubTotal = 0;
    let itemDiscountTotal = 0;
    let itemTaxTotal = 0;

    lineItems.forEach(item => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const discPercent = Number(item.discount) || 0;
      const gstPercent = Number(item.gstRate) || 0;

      const lineGross = Number((qty * price).toFixed(2));
      const lineDiscount = Number((lineGross * (discPercent / 100)).toFixed(2));
      const lineTaxable = Number((lineGross - lineDiscount).toFixed(2));
      const lineTax = Number((lineTaxable * (gstPercent / 100)).toFixed(2));

      itemSubTotal += lineGross;
      itemDiscountTotal += lineDiscount;
      itemTaxTotal += lineTax;
    });

    const transportation = Number(formData.transportationCharges || 0);
    const packing = Number(formData.packingCharges || 0);
    
    const taxableBase = Number((itemSubTotal - itemDiscountTotal + transportation + packing).toFixed(2));
    const chargesTax = Number(((transportation + packing) * 0.18).toFixed(2));
    const finalTaxTotal = Number((itemTaxTotal + chargesTax).toFixed(2));

    return {
      subTotal: Number(itemSubTotal.toFixed(2)),
      discountTotal: Number(itemDiscountTotal.toFixed(2)),
      taxableValue: taxableBase,
      taxTotal: finalTaxTotal,
      grandTotal: Number((taxableBase + finalTaxTotal).toFixed(2)),
      cgst: Number((finalTaxTotal / 2).toFixed(2)),
      sgst: Number((finalTaxTotal / 2).toFixed(2))
    };
  }, [lineItems, formData.transportationCharges, formData.packingCharges]);

  const selectedEntity = useMemo(() => {
    if (activeCategory === 'inward') return vendors.find(v => v.id === formData.customerId);
    return customers.find(c => c.id === formData.customerId || c.name === formData.customerId);
  }, [customers, vendors, formData.customerId, activeCategory]);

  const availableOrders = useMemo(() => {
    // For Invoice, only show "Completed" orders that don't already have an invoice
    // UNLESS we are currently editing that invoice.
    return orders.filter(order => {
      if (activeCategory === 'invoice') {
        if (order.status !== 'Completed') return false;
        
        const hasExistingInvoice = records.some(r => r.type === 'invoice' && r.orderId === order.id && r.id !== editingRecordId);
        return !hasExistingInvoice;
      }
      return true;
    });
  }, [orders, records, activeCategory, editingRecordId]);

  const handleCreateNew = () => {
    const prefix = activeCategory === 'quotation' ? 'QT' : 
                   activeCategory === 'invoice' ? 'INV' : 
                   activeCategory === 'proforma' ? 'PI' : 
                   activeCategory === 'delivery_challan' ? 'DC' :
                   activeCategory === 'inward' ? 'INW' : 
                   activeCategory === 'bank' ? 'BNK' : 'DOC';
    
    setEditingRecordId(null);
    setLineItems([]);
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: activeCategory === 'invoice' ? INVOICE_TERMS : (activeCategory === 'inward' ? 'Inward logistical record initialized.' : activeCategory === 'bank' ? 'Bank ledger reconciliation entry.' : activeCategory === 'delivery_challan' ? DC_TERMS : QUOTATION_TERMS),
      amount: 0,
      itemName: '',
      orderId: '',
      receiverName: '',
      paymentStatus: activeCategory === 'bank' ? 'Paid' : 'Pending',
      paymentMethod: 'Bank Transfer',
      transactionDetails: '',
      bankEntryType: 'Deposit',
      transportationCharges: 0,
      packingCharges: 0
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
      bankEntryType: (record as any).bankEntryType || 'Deposit',
      transportationCharges: record.transportationCharges || 0,
      packingCharges: record.packingCharges || 0
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = () => {
    if (activeCategory !== 'bank' && !formData.customerId) {
      toast({ variant: "destructive", title: "Identity Required", description: "Please select a client or vendor node." });
      return;
    }

    const isFinancialDoc = ['quotation', 'invoice', 'proforma', 'delivery_challan'].includes(activeCategory);
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
      transportationCharges: formData.transportationCharges,
      packingCharges: formData.packingCharges,
      ...((activeCategory === 'bank') ? { bankEntryType: formData.bankEntryType } : {})
    } as any;

    onSaveRecord(record);

    // Automated DC Creation Protocol
    if (activeCategory === 'invoice' && !editingRecordId) {
      const dcRecord: BillingRecord = {
        ...record,
        id: `DC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'delivery_challan',
        number: `DC-${record.number.split('-')[1] || Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Completed',
        note: `Delivery Challan generated automatically from Invoice ${record.number}.`,
        items: [...lineItems]
      };
      onSaveRecord(dcRecord);
      toast({
        title: "Protocol Automation Active",
        description: "Matching Delivery Challan initialized and committed to ledger."
      });
    }

    toast({ title: "Ledger Entry Committed", description: `${record.number} has been synchronized.` });
    setIsCreateDialogOpen(false);
  };

  const updateLineItem = (idx: number, field: keyof BillingLineItem, value: any) => {
    const updated = [...lineItems];
    (updated[idx] as any)[field] = field === 'description' || field === 'unit' ? value : Number(value);
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Math.random().toString(36).substr(2, 9), description: '', hsn: '', qty: 0, unit: 'Nos', price: 0, discount: 0, gstRate: 18 }]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const colWidths = uiSettings.billingTableSettings?.colWidths || {
    description: 300,
    hsn: 100,
    qty: 80,
    unit: 100,
    price: 140,
    discount: 80,
    gst: 80,
    total: 160,
  };
  const rowHeight = uiSettings.billingTableSettings?.rowHeight || 48;

  return (
    <div className="space-y-6 animate-in fade-in duration-1000 print:space-y-0 print:p-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <CreditCard className="h-3.5 w-3.5" />
            Commercial Operations Hub
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Billing & <span className="text-slate-400 font-medium">Invoices</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-10 px-6 font-bold text-[10px] uppercase tracking-widest shadow-sm" onClick={() => window.print()}>
             <Printer className="h-3.5 w-3.5" /> Print Matrix
           </Button>
           {selectedRecords.length > 0 && canDeleteCurrent && (
             <Button variant="destructive" className="rounded-xl gap-2 h-10 px-6 font-bold text-[10px] uppercase tracking-widest shadow-xl" onClick={() => { selectedRecords.forEach(onDeleteRecord); setSelectedRecords([]); }}>
               <Trash2 className="h-3.5 w-3.5" /> Delete ({selectedRecords.length})
             </Button>
           )}
           {canEditCurrent && (
             <Button className="rounded-xl bg-[#001F3D] hover:bg-black text-white gap-2 h-10 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleCreateNew}>
               <Plus className="h-3.5 w-3.5" /> Initialize Record
             </Button>
           )}
        </div>
      </header>

      <Tabs value={activeCategory} onValueChange={(val) => { setActiveCategory(val as any); setSelectedRecords([]); }} className="print:block">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-6 h-12 inline-flex border border-slate-200 shadow-sm gap-1 print:hidden">
          {availableCategories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="rounded-full px-6 h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="overflow-hidden border-slate-200/60 bg-white shadow-xl rounded-[1.5rem] print:shadow-none print:border-none">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 print:hidden">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input placeholder="Search records..." className="pl-9 h-10 bg-white border-slate-200 text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
                  </SelectContent>
                </Select>
              </div>
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
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">WO ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
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
                  <TableCell>
                    {record.orderId ? (
                      <Badge variant="outline" className="text-[8px] border-primary/20 text-primary font-bold uppercase">#{record.orderId}</Badge>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">---</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-display font-bold text-[#001F3D]">₹ {record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "text-[9px] font-bold uppercase px-3",
                      record.status === 'Paid' || record.status === 'Completed' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                    )}>{record.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8 print:hidden">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {canEditCurrent && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary" onClick={() => handleEdit(record)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteCurrent && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => onDeleteRecord(record.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[90vh] bg-white border-none shadow-2xl p-0 overflow-hidden flex flex-col rounded-[2.5rem]">
          <div className="p-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl"><Receipt className="h-8 w-8" /></div>
                <div>
                   <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Initialize Protocol: {activeCategory.replace('_', ' ')}</DialogTitle>
                   <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial valuation and logistical commitment ledger.</DialogDescription>
                </div>
             </div>
             <div className="flex gap-3">
                <Button variant="ghost" className="h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsCreateDialogOpen(false)}>Abort</Button>
                <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 group" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Commit Ledger Entry <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 overflow-y-auto p-8 space-y-10 border-r border-slate-100">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Account Node</Label>
                    <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner">
                        <SelectValue placeholder="Identify entity..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        {activeCategory === 'inward' ? (
                          vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-xs font-bold uppercase">{v.name}</SelectItem>)
                        ) : (
                          customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Linked Work Order</Label>
                    <Select value={formData.orderId} onValueChange={(val) => setFormData({...formData, orderId: val})}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner">
                        <SelectValue placeholder="Select completed WO..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="none" className="text-xs font-bold uppercase">No Link</SelectItem>
                        {availableOrders.map(o => (
                          <SelectItem key={o.id} value={o.id} className="text-xs font-bold uppercase">#{o.id} - {o.customer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Document No.</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code shadow-inner" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Protocol Date</Label>
                    <DatePicker value={formData.date} onChange={(val) => setFormData({...formData, date: val})} className="h-12 rounded-xl border-none bg-slate-50 shadow-inner" />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Itemization Matrix</h3>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-primary gap-2 font-bold text-[9px] uppercase tracking-widest hover:bg-primary/5" onClick={addLineItem}><Plus className="h-3.5 w-3.5" /> Append Measurement</Button>
                  </div>

                  <div className="border border-slate-100 rounded-3xl bg-white overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-bold text-[9px] uppercase py-3" style={{ width: colWidths.description }}>Description of Goods</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase py-3" style={{ width: colWidths.hsn }}>HSN/SAC</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-center py-3" style={{ width: colWidths.qty }}>Qty</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase py-3" style={{ width: colWidths.unit }}>Unit</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-right py-3" style={{ width: colWidths.price }}>Rate (₹)</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-center py-3" style={{ width: colWidths.discount }}>Disc%</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-center py-3" style={{ width: colWidths.gst }}>GST%</TableHead>
                          <TableHead className="font-bold text-[9px] uppercase text-right py-3" style={{ width: colWidths.total }}>Total (₹)</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, idx) => {
                          const lineGross = Number((item.qty * item.price).toFixed(2));
                          const lineDiscount = Number((lineGross * (item.discount / 100)).toFixed(2));
                          const lineTaxable = Number((lineGross - lineDiscount).toFixed(2));
                          const lineGST = Number((lineTaxable * (item.gstRate / 100)).toFixed(2));
                          const lineTotal = Number((lineTaxable + lineGST).toFixed(2));

                          return (
                            <TableRow key={item.id} className="h-14 border-slate-50 group">
                              <TableCell style={{ width: colWidths.description, height: rowHeight }}>
                                <Input className="h-9 border-none bg-transparent text-[11px] font-bold uppercase focus:ring-0" placeholder="Description..." value={item.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.hsn }}>
                                <Input className="h-9 border-none bg-transparent text-[10px] font-code focus:ring-0" placeholder="Code..." value={item.hsn} onChange={(e) => updateLineItem(idx, 'hsn', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.qty }}>
                                <Input type="number" className="h-9 border-none bg-transparent text-center text-xs font-bold focus:ring-0" value={item.qty} onChange={(e) => updateLineItem(idx, 'qty', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.unit }}>
                                <Input className="h-9 border-none bg-transparent text-xs font-medium focus:ring-0" value={item.unit} onChange={(e) => updateLineItem(idx, 'unit', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.price }}>
                                <Input type="number" className="h-9 border-none bg-transparent text-right text-xs font-display font-bold focus:ring-0" value={item.price} onChange={(e) => updateLineItem(idx, 'price', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.discount }}>
                                <Input type="number" className="h-9 border-none bg-transparent text-center text-xs font-medium focus:ring-0" value={item.discount} onChange={(e) => updateLineItem(idx, 'discount', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.gst }}>
                                <Input type="number" className="h-9 border-none bg-transparent text-center text-xs font-medium focus:ring-0" value={item.gstRate} onChange={(e) => updateLineItem(idx, 'gstRate', e.target.value)} />
                              </TableCell>
                              <TableCell style={{ width: colWidths.total }} className="text-right">
                                <span className="text-[11px] font-display font-bold text-[#001F3D]">₹ {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => removeLineItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-96 bg-[#001F3D] p-10 text-white flex flex-col justify-between shrink-0 overflow-y-auto">
               <div className="space-y-10">
                  <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
                     <Calculator className="h-4 w-4" /> Summary Matrix
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-3">
                          <Label className="text-[9px] font-bold uppercase text-white/40 tracking-widest ml-1">Transportation Charges</Label>
                          <div className="relative">
                            <Input type="number" className="bg-white/5 border-none h-12 text-lg font-display font-bold text-white shadow-inner pl-10" value={formData.transportationCharges} onChange={(e) => setFormData({...formData, transportationCharges: Number(e.target.value)})} />
                            <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[9px] font-bold uppercase text-white/40 tracking-widest ml-1">Packing Charges</Label>
                          <div className="relative">
                            <Input type="number" className="bg-white/5 border-none h-12 text-lg font-display font-bold text-white shadow-inner pl-10" value={formData.packingCharges} onChange={(e) => setFormData({...formData, packingCharges: Number(e.target.value)})} />
                            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                          <span>Taxable Value</span>
                          <span className="text-white">₹ {totals.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                          <span>CGST (9%)</span>
                          <span className="text-white">₹ {totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                          <span>SGST (9%)</span>
                          <span className="text-white">₹ {totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-white/10 mt-10">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Final Net Valuation</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-5xl font-display font-bold text-white tracking-tighter">₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Info className="h-4 w-4 text-primary" />
                    <p className="text-[9px] font-bold uppercase text-white/40 leading-tight">Net valuation reflects item taxes plus associated industrial surcharges.</p>
                  </div>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
