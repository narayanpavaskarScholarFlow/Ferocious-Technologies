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
  Info,
  Save,
  ChevronDown,
  MoreHorizontal,
  FileDown,
  ShieldCheck,
  AlertCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BillingCategory = 'quotation' | 'invoice' | 'purchase_order' | 'proforma' | 'inward' | 'outward' | 'bank' | 'delivery_challan';

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

export function BillingManagement({ customers, vendors, records, orders, users, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('invoice');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const availableCategories = useMemo(() => {
    const allCats: { id: BillingCategory; label: string; permKey: string }[] = [
      { id: 'invoice', label: 'Sales Invoices', permKey: 'billing-invoice' },
      { id: 'quotation', label: 'Quotations', permKey: 'billing-quotation' },
      { id: 'purchase_order', label: 'Purchase Orders', permKey: 'billing-po' },
      { id: 'delivery_challan', label: 'Challans', permKey: 'billing-dc' },
      { id: 'proforma', label: 'Proforma', permKey: 'billing-proforma' },
      { id: 'inward', label: 'Purchases (Inward)', permKey: 'billing-inward' },
      { id: 'bank', label: 'Bank & Cash', permKey: 'billing-bank' },
    ];

    return allCats.filter(cat => {
      const level = permissions?.[cat.permKey];
      return level && level !== 'none';
    });
  }, [permissions]);

  const stats = useMemo(() => {
    const invoices = records.filter(r => r.type === 'invoice');
    const totalSales = invoices.reduce((acc, r) => acc + r.amount, 0);
    const paidSales = invoices.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0);
    const pendingSales = totalSales - paidSales;

    return {
      totalSales,
      paidSales,
      pendingSales,
      totalCount: invoices.length,
      unpaidCount: invoices.filter(r => r.status !== 'Paid').length
    };
  }, [records]);

  const [lineItems, setLineItems] = useState<BillingLineItem[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    note: INVOICE_TERMS,
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
      return matchesType && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, activeCategory, searchTerm]);

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
    const finalTaxTotal = Number((itemTaxTotal + ((transportation + packing) * 0.18)).toFixed(2));

    return {
      subTotal: itemSubTotal,
      discountTotal: itemDiscountTotal,
      taxableValue: taxableBase,
      taxTotal: finalTaxTotal,
      grandTotal: taxableBase + finalTaxTotal,
      cgst: finalTaxTotal / 2,
      sgst: finalTaxTotal / 2
    };
  }, [lineItems, formData.transportationCharges, formData.packingCharges]);

  const selectedEntity = useMemo(() => {
    if (activeCategory === 'inward' || activeCategory === 'purchase_order') return vendors.find(v => v.id === formData.customerId);
    return customers.find(c => c.id === formData.customerId || c.name === formData.customerId);
  }, [customers, vendors, formData.customerId, activeCategory]);

  const handleCreateNew = () => {
    const prefix = activeCategory === 'quotation' ? 'QT' : 
                   activeCategory === 'invoice' ? 'INV' : 
                   activeCategory === 'purchase_order' ? 'PO' : 'DOC';
    
    setEditingRecordId(null);
    setLineItems([{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, gstRate: 18 }]);
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: activeCategory === 'invoice' ? INVOICE_TERMS : QUOTATION_TERMS,
      amount: 0,
      itemName: '',
      orderId: '',
      receiverName: '',
      paymentStatus: 'Pending',
      paymentMethod: 'Bank Transfer',
      transactionDetails: '',
      bankEntryType: 'Deposit',
      transportationCharges: 0,
      packingCharges: 0
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId && activeCategory !== 'bank') {
      toast({ variant: "destructive", title: "Identity Required", description: "Please select a client or vendor node." });
      return;
    }

    const record: BillingRecord = {
      id: editingRecordId || `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: activeCategory,
      customerName: selectedEntity?.name || 'Unknown',
      customerId: formData.customerId,
      date: formData.date,
      number: formData.number,
      amount: totals.grandTotal,
      status: formData.paymentStatus,
      note: formData.note,
      items: lineItems,
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      discountTotal: totals.discountTotal,
      transportationCharges: formData.transportationCharges,
      packingCharges: formData.packingCharges
    } as any;

    onSaveRecord(record);
    toast({ title: "Ledger Entry Committed", description: `${record.number} synchronized.` });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 px-2 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Wallet className="h-4 w-4" />
            Financial Operations Matrix
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Billing <span className="text-slate-400 font-medium">& Accounts</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-12 px-6 font-bold text-[10px] uppercase tracking-widest shadow-sm">
             <FileBarChart className="h-4 w-4 text-slate-400" /> Financial Reports
           </Button>
           <Button className="rounded-xl bg-[#001F3D] hover:bg-black text-white gap-3 h-12 px-10 font-bold text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20" onClick={handleCreateNew}>
             <Plus className="h-5 w-5" /> Initialize Record
           </Button>
        </div>
      </header>

      {/* Financial Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><TrendingUp className="h-20 w-20" /></div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Total Sales (MTD)</p>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold text-[#001F3D]">₹ {stats.totalSales.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +12.5% vs Last Month</p>
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><CheckCircle2 className="h-20 w-20" /></div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Total Collected</p>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold text-emerald-600">₹ {stats.paidSales.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{Math.round((stats.paidSales/stats.totalSales)*100 || 0)}% Realization Rate</p>
          </div>
        </Card>

        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><AlertCircle className="h-20 w-20" /></div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Net Outstanding</p>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold text-red-600">₹ {stats.pendingSales.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stats.unpaidCount} Pending Invoices</p>
          </div>
        </Card>

        <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg"><ShieldCheck className="h-4 w-4 text-primary" /></div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">GST Compliance</span>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Est. GST Liability</p>
               <h3 className="text-2xl font-display font-bold">₹ {(stats.totalSales * 0.18).toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-2">
        <Tabs value={activeCategory} onValueChange={(val) => setActiveCategory(val as any)}>
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-slate-100 p-1.5 rounded-full h-14 inline-flex border border-slate-200 shadow-sm gap-1">
              {availableCategories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search ledger..." 
                className="pl-12 h-12 rounded-2xl bg-white border-slate-200 text-xs font-bold uppercase tracking-widest focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2.5rem]">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10 w-40">Doc Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account / Entity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Date</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-40">Status</TableHead>
                  <TableHead className="text-right px-10 w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/50 h-24 border-b border-slate-50 group transition-colors">
                    <TableCell className="px-10">
                       <div className="flex flex-col">
                          <span className="text-base font-bold text-[#001F3D] font-code">{record.number}</span>
                          <Badge variant="outline" className="w-fit text-[8px] border-slate-100 text-slate-400 font-bold uppercase mt-1">ID_{record.id.slice(-4)}</Badge>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">{record.customerName.charAt(0)}</div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{record.customerName}</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verified Account</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-[11px] font-bold text-slate-500 font-code">{record.date}</span>
                    </TableCell>
                    <TableCell className="text-right">
                       <span className="text-lg font-display font-bold text-[#001F3D]">₹ {record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn(
                         "text-[9px] font-bold uppercase px-6 py-2 rounded-full border shadow-sm",
                         record.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                         record.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                         "bg-blue-50 text-blue-700 border-blue-100"
                       )}>
                         {record.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-[#001F3D] opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-5 w-5" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-2xl border-slate-100">
                             <DropdownMenuItem className="rounded-xl h-10 text-xs font-bold uppercase gap-3"><Edit2 className="h-4 w-4" /> Edit Record</DropdownMenuItem>
                             <DropdownMenuItem className="rounded-xl h-10 text-xs font-bold uppercase gap-3 text-primary"><FileDown className="h-4 w-4" /> Export PDF</DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="rounded-xl h-10 text-xs font-bold uppercase gap-3 text-red-600" onClick={() => onDeleteRecord(record.id)}><Trash2 className="h-4 w-4" /> Delete Node</DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center">
                       <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                             <Receipt className="h-20 w-20 text-slate-300" />
                          </div>
                          <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Ledger Matrix Null</p>
                          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium">No records identified in the current financial category. Initialize a new protocol to begin tracking.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </Tabs>
      </div>

      {/* Invoice Editor Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[92vh] bg-white border-none shadow-2xl p-0 overflow-hidden flex flex-col rounded-[3rem]">
          <div className="p-10 border-b bg-slate-50 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-[#001F3D] rounded-3xl text-white shadow-2xl shadow-primary/20"><DollarSign className="h-10 w-10" /></div>
                <div>
                   <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Initialize {activeCategory.replace('_', ' ')}</DialogTitle>
                   <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Matrix Identity: {formData.number}</DialogDescription>
                </div>
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900" onClick={() => setIsCreateDialogOpen(false)}>Abort Protocol</Button>
                <Button className="h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl px-12 font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl flex gap-4 transition-all group" onClick={handleSave}>
                  <Save className="h-5 w-5" /> Commit Ledger Entry <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            <ScrollArea className="flex-1">
              <div className="p-12 space-y-16">
                 {/* Header Blocks */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                       <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                          <Building2 className="h-4 w-4 text-primary" />
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Identification</h4>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identity Node (Account)</Label>
                             <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                                <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase shadow-inner">
                                   <SelectValue placeholder="Identify client..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                   {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase py-3">{c.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          {selectedEntity && (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-in fade-in duration-500">
                               <p className="text-[11px] font-bold text-slate-700 uppercase leading-relaxed">{selectedEntity.address}</p>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 w-fit px-3 py-1 rounded-lg">
                                  <ShieldCheck className="h-3.5 w-3.5" /> GST: {selectedEntity.gstNumber}
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                          <Clock className="h-4 w-4 text-accent" />
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Temporal Nodes</h4>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Reference No.</Label>
                             <Input className="h-14 bg-slate-50 border-none rounded-2xl font-code font-bold text-primary shadow-inner" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Issue Date</Label>
                             <DatePicker value={formData.date} onChange={(val) => setFormData({...formData, date: val})} className="h-14 bg-slate-50 border-none rounded-2xl shadow-inner" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Payment Protocol</Label>
                             <Select value={formData.paymentMethod} onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}>
                                <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl"><SelectItem value="Bank Transfer" className="text-xs font-bold uppercase">Bank Transfer</SelectItem><SelectItem value="Cash" className="text-xs font-bold uppercase">Cash Node</SelectItem></SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase text-slate-500 tracking-widest ml-1">Settlement State</Label>
                             <Select value={formData.paymentStatus} onValueChange={(val) => setFormData({...formData, paymentStatus: val})}>
                                <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl"><SelectItem value="Pending" className="text-xs font-bold uppercase">Pending</SelectItem><SelectItem value="Paid" className="text-xs font-bold uppercase">Paid / Settled</SelectItem></SelectContent>
                             </Select>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Item Matrix */}
                 <div className="space-y-8">
                    <div className="flex justify-between items-center px-2">
                       <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                          <ListOrdered className="h-4 w-4 text-primary" />
                          <h4 className="text-[10px] font-bold text-[#001F3D] uppercase tracking-[0.2em]">Itemization Matrix</h4>
                       </div>
                       <Button variant="ghost" onClick={() => setLineItems([...lineItems, { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, gstRate: 18 }])} className="h-10 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest text-primary hover:bg-primary/5 gap-2">
                          <Plus className="h-4 w-4" /> Append Sequence
                       </Button>
                    </div>

                    <div className="border border-slate-100 rounded-[2rem] bg-white overflow-hidden shadow-sm">
                       <Table>
                          <TableHeader className="bg-slate-50/80">
                             <TableRow className="hover:bg-transparent">
                                <TableHead className="text-[9px] font-bold uppercase text-slate-400 py-5 px-6">Description of Goods / Matrix</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase text-slate-400 w-24">HSN</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-center w-24">Qty</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase text-slate-400 w-24">Unit</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-right w-32">Rate (₹)</TableHead>
                                <TableHead className="text-[9px] font-bold uppercase text-slate-400 text-right w-32">Total (₹)</TableHead>
                                <TableHead className="w-16"></TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {lineItems.map((item, idx) => (
                               <TableRow key={item.id} className="h-20 border-b border-slate-50 group">
                                  <TableCell className="px-6">
                                     <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner" placeholder="Enter product/service identity..." value={item.description} onChange={(e) => {
                                       const newItems = [...lineItems];
                                       newItems[idx].description = e.target.value;
                                       setLineItems(newItems);
                                     }} />
                                  </TableCell>
                                  <TableCell>
                                     <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-code font-bold shadow-inner" placeholder="HSN" value={item.hsn} onChange={(e) => {
                                       const newItems = [...lineItems];
                                       newItems[idx].hsn = e.target.value;
                                       setLineItems(newItems);
                                     }} />
                                  </TableCell>
                                  <TableCell>
                                     <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-center text-xs font-bold shadow-inner" value={item.qty} onChange={(e) => {
                                       const newItems = [...lineItems];
                                       newItems[idx].qty = Number(e.target.value);
                                       setLineItems(newItems);
                                     }} />
                                  </TableCell>
                                  <TableCell>
                                     <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner" value={item.unit} onChange={(e) => {
                                       const newItems = [...lineItems];
                                       newItems[idx].unit = e.target.value;
                                       setLineItems(newItems);
                                     }} />
                                  </TableCell>
                                  <TableCell className="text-right">
                                     <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-right text-xs font-display font-bold shadow-inner" value={item.price} onChange={(e) => {
                                       const newItems = [...lineItems];
                                       newItems[idx].price = Number(e.target.value);
                                       setLineItems(newItems);
                                     }} />
                                  </TableCell>
                                  <TableCell className="text-right">
                                     <span className="text-sm font-display font-bold text-[#001F3D]">₹ {(item.qty * item.price).toLocaleString()}</span>
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                     <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}>
                                        <Trash2 className="h-4 w-4" />
                                     </Button>
                                  </TableCell>
                               </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </div>
                 </div>
              </div>
            </ScrollArea>

            {/* Sidebar Valuation Matrix */}
            <div className="w-full lg:w-[420px] bg-[#001F3D] p-12 text-white flex flex-col justify-between shrink-0 overflow-y-auto">
               <div className="space-y-12">
                  <div className="flex items-center gap-4 text-primary font-bold text-[11px] uppercase tracking-[0.4em]">
                     <Calculator className="h-5 w-5" /> Summary Matrix
                  </div>

                  <div className="space-y-10">
                     <div className="grid grid-cols-1 gap-10">
                        <div className="space-y-4">
                           <Label className="text-[10px] font-bold uppercase text-white/40 tracking-widest ml-1 flex items-center gap-2"><Truck className="h-3.5 w-3.5" /> Transportation Surcharge</Label>
                           <div className="relative">
                             <Input type="number" className="h-16 bg-white/5 border-none rounded-2xl text-2xl font-display font-bold text-white shadow-inner pl-12" value={formData.transportationCharges} onChange={(e) => setFormData({...formData, transportationCharges: Number(e.target.value)})} />
                             <span className="absolute left-5 top-1/2 -translate-y-1/2 font-display text-2xl text-white/20">₹</span>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[10px] font-bold uppercase text-white/40 tracking-widest ml-1 flex items-center gap-2"><Package className="h-3.5 w-3.5" /> Packing Charges</Label>
                           <div className="relative">
                             <Input type="number" className="h-16 bg-white/5 border-none rounded-2xl text-2xl font-display font-bold text-white shadow-inner pl-12" value={formData.packingCharges} onChange={(e) => setFormData({...formData, packingCharges: Number(e.target.value)})} />
                             <span className="absolute left-5 top-1/2 -translate-y-1/2 font-display text-2xl text-white/20">₹</span>
                           </div>
                        </div>
                     </div>

                     <div className="pt-10 border-t border-white/10 space-y-6">
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-white/40">
                           <span>Taxable Valuation</span>
                           <span className="text-white text-base">₹ {totals.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-white/40">
                           <span>CGST (9%)</span>
                           <span className="text-white text-base">₹ {totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-white/40">
                           <span>SGST (9%)</span>
                           <span className="text-white text-base">₹ {totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-12 border-t border-white/10 mt-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.5em] relative z-10">Grand Net Total</span>
                  <div className="flex items-baseline gap-4 mt-4 relative z-10">
                    <span className="text-6xl font-display font-bold text-white tracking-tighter">₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5 relative z-10 flex gap-4 items-start">
                     <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">System calculated net valuation includes all item taxes and associated surcharges. Verified Node.</p>
                  </div>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

