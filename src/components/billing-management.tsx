
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
  AlertCircle,
  FilePlus,
  Maximize2,
  Settings2,
  RefreshCw,
  Mail,
  ChevronLeft
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
import { Switch } from '@/components/ui/switch';
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

const QUOTATION_TERMS = `Subject to our home Jurisdiction. Our Responsibility Ceases as soon as goods leaves our Premises.`;

export function BillingManagement({ customers, vendors, records, orders, users, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('invoice');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  
  // Document Form State (Matching Reference Image)
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    address: '',
    contactPerson: '',
    phoneNo: '',
    gstin: '',
    revCharge: 'No',
    shipTo: '--',
    distance: '',
    placeOfSupply: '',
    prefix: '',
    number: '',
    postfix: '',
    date: new Date().toISOString().split('T')[0],
    deliveryMode: '',
    termsTitle: 'Terms & Condition / Additional Note',
    termsDetail: QUOTATION_TERMS,
    remarks: '',
    roundOff: true,
    shareOnEmail: false,
    discountType: 'percentage' as 'rs' | 'percentage',
  });

  const availableCategories = useMemo(() => {
    const allCats: { id: BillingCategory; label: string; permKey: string }[] = [
      { id: 'invoice', label: 'Invoices', permKey: 'billing-invoice' },
      { id: 'quotation', label: 'Quotations', permKey: 'billing-quotation' },
      { id: 'purchase_order', label: 'Purchase Orders', permKey: 'billing-po' },
      { id: 'delivery_challan', label: 'Challans', permKey: 'billing-dc' },
      { id: 'inward', label: 'Inward', permKey: 'billing-inward' },
    ];
    return allCats.filter(cat => permissions?.[cat.permKey] !== 'none');
  }, [permissions]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesType = r.type === activeCategory;
      const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, activeCategory, searchTerm]);

  const totals = useMemo(() => {
    let taxable = 0;
    let taxTotal = 0;
    
    lineItems.forEach(item => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      const disc = parseFloat(item.discount) || 0;
      const taxRate = parseFloat(item.gstRate) || 0;
      
      const lineBase = qty * price;
      const lineDisc = formData.discountType === 'percentage' ? (lineBase * (disc/100)) : disc;
      const lineTaxable = lineBase - lineDisc;
      const lineTax = lineTaxable * (taxRate/100);
      
      taxable += lineTaxable;
      taxTotal += lineTax;
    });

    const grandTotalRaw = taxable + taxTotal;
    const grandTotal = formData.roundOff ? Math.round(grandTotalRaw) : grandTotalRaw;
    const roundValue = grandTotal - grandTotalRaw;

    return { taxable, taxTotal, grandTotal, roundValue };
  }, [lineItems, formData.roundOff, formData.discountType]);

  const handleCreateNew = () => {
    const defaultPrefix = activeCategory === 'quotation' ? 'QT' : 'INV';
    setEditingRecordId(null);
    setLineItems([{ id: '1', description: '', note: '', qty: 1, uom: 'PCS', price: 0, discount: 0, gstRate: 18 }]);
    setFormData({
      customerId: '',
      address: '',
      contactPerson: '',
      phoneNo: '',
      gstin: '',
      revCharge: 'No',
      shipTo: '--',
      distance: '',
      placeOfSupply: '',
      prefix: defaultPrefix,
      number: Math.floor(1000 + Math.random() * 9000).toString(),
      postfix: '',
      date: new Date().toISOString().split('T')[0],
      deliveryMode: '',
      termsTitle: 'Terms & Condition / Additional Note',
      termsDetail: QUOTATION_TERMS,
      remarks: '',
      roundOff: true,
      shareOnEmail: false,
      discountType: 'percentage'
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = () => {
    const recordNumber = `${formData.prefix}${formData.number}${formData.postfix}`;
    const record: BillingRecord = {
      id: editingRecordId || `BIL-${Date.now()}`,
      type: activeCategory,
      customerName: customers.find(c => c.id === formData.customerId)?.name || 'Unknown',
      customerId: formData.customerId,
      date: formData.date,
      number: recordNumber,
      amount: totals.grandTotal,
      status: 'Pending',
      note: formData.termsDetail,
      items: lineItems,
      subTotal: totals.taxable,
      taxTotal: totals.taxTotal
    } as any;

    onSaveRecord(record);
    toast({ title: "Document Synchronized", description: `${recordNumber} committed to ledger.` });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 px-4 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
            <Landmark className="h-4 w-4" />
            Financial Governance
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Billing <span className="text-slate-300 font-medium">& Invoices</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
           <Button className="rounded-xl bg-[#001F3D] hover:bg-black text-white gap-3 h-12 px-10 font-bold text-[10px] uppercase tracking-widest shadow-2xl" onClick={handleCreateNew}>
             <Plus className="h-5 w-5" /> Initialize Record
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Sales (MTD)', val: records.filter(r => r.type === 'invoice').reduce((acc, r) => acc + r.amount, 0), icon: TrendingUp, color: 'text-primary' },
           { label: 'Collections', val: records.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0), icon: CheckCircle2, color: 'text-emerald-500' },
           { label: 'Net Outstanding', val: records.reduce((acc, r) => acc + (r.status !== 'Paid' ? r.amount : 0), 0), icon: AlertCircle, color: 'text-red-500' },
           { label: 'Tax Liability', val: records.reduce((acc, r) => acc + (r.taxTotal || 0), 0), icon: ShieldCheck, color: 'text-blue-500' },
         ].map((stat, i) => (
           <Card key={i} className="p-6 bg-white border-slate-100 shadow-xl rounded-2xl flex flex-col justify-between group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{stat.label}</p>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <h3 className="text-2xl font-display font-bold text-[#001F3D]">₹ {stat.val.toLocaleString('en-IN')}</h3>
           </Card>
         ))}
      </div>

      <Card className="overflow-hidden border-slate-100 bg-white shadow-2xl rounded-[2.5rem]">
        <Tabs value={activeCategory} onValueChange={(v: any) => setActiveCategory(v)}>
          <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <TabsList className="bg-slate-200/50 p-1 rounded-full h-12 inline-flex border border-slate-200">
              {availableCategories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="rounded-full px-6 h-10 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search ledger..." className="pl-12 h-11 rounded-xl bg-white border-slate-200 text-xs font-bold uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Doc Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account / Entity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Date</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                  <TableHead className="w-20 px-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="h-20 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="px-10 font-code font-bold text-slate-700">{record.number}</TableCell>
                    <TableCell className="font-bold text-[#001F3D] uppercase tracking-tight">{record.customerName}</TableCell>
                    <TableCell className="text-center font-code text-[11px] text-slate-400">{record.date}</TableCell>
                    <TableCell className="text-right font-display font-bold text-primary">₹ {record.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-[9px] font-bold uppercase", record.status === 'Paid' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{record.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="text-xs font-bold uppercase gap-2"><Edit2 className="h-3 w-3" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-bold uppercase gap-2 text-primary"><FileDown className="h-3 w-3" /> Download</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs font-bold uppercase gap-2 text-red-500" onClick={() => onDeleteRecord(record.id)}><Trash2 className="h-3 w-3" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </Card>

      {/* Industrial Document Architect Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[95vh] bg-[#F8FAFC] border-none shadow-2xl p-0 overflow-hidden flex flex-col rounded-[2.5rem]">
          <div className="p-8 border-b bg-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FilePlus className="h-5 w-5" /></div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Create {activeCategory.replace('_', ' ')}</h3>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setIsCreateDialogOpen(false)} className="rounded-full"><X className="h-5 w-5 text-slate-400" /></Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-10 space-y-10 max-w-6xl mx-auto">
              {/* Top Section: Info & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-5 p-8 bg-white border-slate-200 rounded-2xl space-y-6">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Customer Information</h4>
                     <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300"><MoreHorizontal className="h-4 w-4" /></Button>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">M/S. <span className="text-red-500">*</span></Label>
                        <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                          <SelectTrigger className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold uppercase"><SelectValue placeholder="Identify client..." /></SelectTrigger>
                          <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-start gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500 mt-2">Address</Label>
                        <Textarea className="flex-1 bg-slate-50 border-slate-100 min-h-[80px] rounded-lg text-xs font-medium" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Contact Person</Label>
                        <Input className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs" value={formData.contactPerson} onChange={(e)=>setFormData({...formData, contactPerson: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Phone No</Label>
                        <Input className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs" value={formData.phoneNo} onChange={(e)=>setFormData({...formData, phoneNo: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">GSTIN / PAN</Label>
                        <Input className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs font-code uppercase" value={formData.gstin} onChange={(e)=>setFormData({...formData, gstin: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Rev. Charge</Label>
                        <Select value={formData.revCharge} onValueChange={(val)=>setFormData({...formData, revCharge: val})}>
                          <SelectTrigger className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Ship To</Label>
                        <Select value={formData.shipTo} onValueChange={(val)=>setFormData({...formData, shipTo: val})}>
                          <SelectTrigger className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="--">--</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500 leading-tight">Distance for E-Way bill (km)</Label>
                        <Input className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs" value={formData.distance} onChange={(e)=>setFormData({...formData, distance: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Place of Supply <span className="text-red-500">*</span></Label>
                        <Input className="flex-1 h-10 bg-slate-50 border-slate-100 rounded-lg text-xs" value={formData.placeOfSupply} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} />
                      </div>
                   </div>
                </Card>

                <Card className="lg:col-span-7 p-8 bg-white border-slate-200 rounded-2xl space-y-6">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Document Details</h4>
                     <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300"><RefreshCw className="h-4 w-4" /></Button>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Type</Label>
                         <Select defaultValue="Tax Invoice">
                            <SelectTrigger className="flex-1 h-11 bg-slate-50 border-slate-100 rounded-xl text-sm font-bold uppercase"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Tax Invoice">Tax Invoice</SelectItem><SelectItem value="Bill of Supply">Bill of Supply</SelectItem></SelectContent>
                         </Select>
                      </div>
                      <div className="flex items-center gap-4">
                         <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Doc No. <span className="text-red-500">*</span></Label>
                         <div className="flex-1 flex gap-2">
                            <Input className="w-24 bg-slate-50 border-slate-100 rounded-lg text-center font-bold text-xs" placeholder="Prefix" value={formData.prefix} onChange={(e)=>setFormData({...formData, prefix: e.target.value})} />
                            <Input className="flex-1 bg-slate-50 border-slate-100 rounded-lg font-bold text-xs" placeholder="Number" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                            <Input className="w-24 bg-slate-50 border-slate-100 rounded-lg text-center font-bold text-xs" placeholder="Postfix" value={formData.postfix} onChange={(e)=>setFormData({...formData, postfix: e.target.value})} />
                         </div>
                         <div className="flex items-center gap-4 ml-6">
                           <Label className="w-24 text-[10px] font-bold uppercase text-slate-500">Date <span className="text-red-500">*</span></Label>
                           <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="w-48 bg-slate-50 border-slate-100 rounded-lg" />
                         </div>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                         <Label className="w-32 text-[10px] font-bold uppercase text-slate-500">Delivery</Label>
                         <Select value={formData.deliveryMode} onValueChange={(val)=>setFormData({...formData, deliveryMode: val})}>
                            <SelectTrigger className="flex-1 h-11 bg-slate-50 border-slate-100 rounded-xl text-xs"><SelectValue placeholder="Select Delivery Mode" /></SelectTrigger>
                            <SelectContent><SelectItem value="Ex-Works">Ex-Works</SelectItem><SelectItem value="Door Delivery">Door Delivery</SelectItem></SelectContent>
                         </Select>
                      </div>
                   </div>
                </Card>
              </div>

              {/* Product Items Table Section */}
              <Card className="bg-white border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
                   <h4 className="text-[10px] font-bold uppercase text-[#001F3D] tracking-widest">Product Items</h4>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Discount:</span>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                         <Button variant={formData.discountType === 'rs' ? 'default' : 'ghost'} size="sm" className="h-7 text-[10px] px-3 rounded-md" onClick={()=>setFormData({...formData, discountType: 'rs'})}>Rs</Button>
                         <Button variant={formData.discountType === 'percentage' ? 'default' : 'ghost'} size="sm" className="h-7 text-[10px] px-3 rounded-md" onClick={()=>setFormData({...formData, discountType: 'percentage'})}>%</Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300"><MoreHorizontal className="h-4 w-4" /></Button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-tighter">
                        <th className="py-4 px-4 w-12 border-r text-center">Sr.</th>
                        <th className="py-4 px-4 text-left border-r min-w-[300px]">Product / Other Charges</th>
                        <th className="py-4 px-4 text-center border-r w-24">Qty.</th>
                        <th className="py-4 px-4 text-center border-r w-24">UOM</th>
                        <th className="py-4 px-4 text-center border-r w-32">Price</th>
                        <th className="py-4 px-4 text-center border-r w-24">Discount</th>
                        <th className="py-4 px-4 text-center border-r w-28">Tax Rate (%)</th>
                        <th className="py-4 px-4 text-center w-32">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-50 group hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 text-center font-bold text-slate-300 border-r">{idx + 1}</td>
                          <td className="p-2 border-r space-y-2">
                             <Input className="h-9 border-slate-100 rounded text-xs font-bold uppercase" placeholder="Enter Product Name" value={item.description} onChange={(e)=>{
                               const newItems = [...lineItems]; newItems[idx].description = e.target.value; setLineItems(newItems);
                             }} />
                             <Textarea className="h-20 border-slate-100 bg-amber-50/20 rounded p-3 text-[10px] italic placeholder:text-slate-300 resize-none" placeholder="Item Note..." value={item.note} onChange={(e)=>{
                               const newItems = [...lineItems]; newItems[idx].note = e.target.value; setLineItems(newItems);
                             }} />
                          </td>
                          <td className="p-2 border-r"><Input type="number" className="h-9 text-center border-slate-100 rounded text-xs font-bold" value={item.qty} onChange={(e)=>{
                               const newItems = [...lineItems]; newItems[idx].qty = e.target.value; setLineItems(newItems);
                             }} /></td>
                          <td className="p-2 border-r"><Input className="h-9 text-center border-slate-100 rounded text-xs font-bold" value={item.uom} onChange={(e)=>{
                               const newItems = [...lineItems]; newItems[idx].uom = e.target.value; setLineItems(newItems);
                             }} /></td>
                          <td className="p-2 border-r relative">
                             <Input type="number" className="h-9 text-center border-slate-100 rounded text-xs font-bold pl-6" value={item.price} onChange={(e)=>{
                               const newItems = [...lineItems]; newItems[idx].price = e.target.value; setLineItems(newItems);
                             }} />
                             <Info className="h-3 w-3 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                          </td>
                          <td className="p-2 border-r"><Input type="number" className="h-9 text-center border-slate-100 rounded text-xs font-bold" value={item.discount} onChange={(e)=>{
                               const newItems = [...lineItems]; newItems[idx].discount = e.target.value; setLineItems(newItems);
                             }} /></td>
                          <td className="p-2 border-r">
                             <Select value={item.gstRate.toString()} onValueChange={(val)=>{
                               const newItems = [...lineItems]; newItems[idx].gstRate = val; setLineItems(newItems);
                             }}>
                                <SelectTrigger className="h-9 bg-transparent border-slate-100 text-center"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                             </Select>
                          </td>
                          <td className="p-2 text-center font-bold text-slate-700">
                             {((parseFloat(item.qty)||0) * (parseFloat(item.price)||0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={()=>setLineItems(lineItems.filter((_,i)=>i!==idx))}><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-amber-100/50 border-b border-amber-200 text-slate-900 font-bold">
                        <td colSpan={2} className="py-3 px-10 text-[10px] uppercase border-r text-right">Total Val.</td>
                        <td className="text-center border-r">{lineItems.reduce((acc,i)=>acc+(parseFloat(i.qty)||0),0)}</td>
                        <td className="border-r"></td>
                        <td className="text-center border-r">{lineItems.reduce((acc,i)=>acc+(parseFloat(i.price)||0),0).toLocaleString()}</td>
                        <td className="text-center border-r">{lineItems.reduce((acc,i)=>acc+(parseFloat(i.discount)||0),0).toLocaleString()}</td>
                        <td className="border-r"></td>
                        <td className="text-center">{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-white border-t flex justify-end">
                   <Button variant="ghost" className="h-9 px-6 rounded-lg text-primary font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-primary/5" onClick={() => setLineItems([...lineItems, { id: Date.now().toString(), description: '', note: '', qty: 1, uom: 'PCS', price: 0, discount: 0, gstRate: 18 }])}>
                     <Plus className="h-4 w-4" /> Add Line Item
                   </Button>
                </div>
              </Card>

              {/* Bottom Section: Notes & Totals Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-7 space-y-10">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Bank Details</Label>
                      <Select defaultValue="Hide">
                         <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                         <SelectContent><SelectItem value="Hide">Hide Bank Details</SelectItem><SelectItem value="Show">Show Primary Node</SelectItem></SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-6 p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Terms Title</Label>
                        <Input className="h-11 bg-slate-50 border-slate-100 rounded-xl text-sm" value={formData.termsTitle} onChange={(e)=>setFormData({...formData, termsTitle: e.target.value})} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Detail Node</Label>
                        <div className="relative">
                          <Textarea className="min-h-[100px] bg-slate-50 border-slate-100 rounded-xl text-xs font-medium pr-10" value={formData.termsDetail} onChange={(e)=>setFormData({...formData, termsDetail: e.target.value})} />
                          <Maximize2 className="absolute right-4 top-4 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                      <Button variant="ghost" className="h-9 gap-2 text-primary font-bold text-[9px] uppercase tracking-widest"><Plus className="h-3 w-3" /> Add Notes</Button>
                   </div>

                   <div className="space-y-3 p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Document Remarks (Not visible on print)</Label>
                      <Textarea className="min-h-[80px] bg-slate-50 border-slate-100 rounded-xl text-xs font-medium" value={formData.remarks} onChange={(e)=>setFormData({...formData, remarks: e.target.value})} />
                   </div>
                </div>

                <div className="lg:col-span-5">
                   <Card className="p-8 bg-white border-slate-200 rounded-[2rem] space-y-6 shadow-sm">
                      <div className="space-y-5 border-b pb-6">
                         <div className="flex justify-between items-center text-sm font-bold text-slate-600 uppercase">
                            <span>Taxable Value</span>
                            <span>{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <button className="text-[10px] font-bold uppercase text-emerald-600 hover:underline">+ Add Additional Charge</button>
                            <span className="text-sm font-bold text-slate-400">0.00</span>
                         </div>
                         <div className="flex justify-between items-center text-sm font-bold text-slate-900 uppercase">
                            <span>Net Taxable</span>
                            <span>{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm font-bold text-slate-600 uppercase">
                            <span>Total Tax</span>
                            <span>{totals.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                         </div>
                         <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-3">
                               <Label className="text-[10px] font-bold uppercase text-slate-500">Round Off</Label>
                               <Switch checked={formData.roundOff} onCheckedChange={(v)=>setFormData({...formData, roundOff: v})} />
                            </div>
                            <span className="text-sm font-code text-slate-400">{totals.roundValue.toFixed(2)}</span>
                         </div>
                      </div>

                      <div className="bg-amber-100/50 p-6 rounded-2xl flex justify-between items-center border border-amber-200">
                         <span className="text-base font-bold uppercase text-slate-900 tracking-tighter">Grand Total</span>
                         <span className="text-2xl font-display font-bold text-[#001F3D]">₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Total in words</Label>
                        <p className="text-[10px] font-bold text-slate-600 uppercase italic">RUPEES {totals.grandTotal.toLocaleString('en-IN')} ONLY</p>
                      </div>

                      <div className="pt-6 space-y-4">
                         <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Smart Suggestion</span>
                            <div className="h-5 w-8 bg-emerald-500 rounded-md" />
                         </div>
                         <div className="flex items-center gap-3 px-1">
                            <Checkbox checked={formData.shareOnEmail} onCheckedChange={(v: any)=>setFormData({...formData, shareOnEmail: v})} id="email-share" />
                            <Label htmlFor="email-share" className="text-[10px] font-bold uppercase text-slate-500 cursor-pointer flex items-center gap-2">
                               Share on Email <Mail className="h-3 w-3" />
                            </Label>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                         <Button variant="ghost" className="h-14 rounded-xl border border-slate-200 font-bold uppercase text-[10px] tracking-widest text-slate-400 gap-2" onClick={() => setIsCreateDialogOpen(false)}>
                            <ChevronLeft className="h-4 w-4" /> Back
                         </Button>
                         <Button variant="outline" className="h-14 rounded-xl border-slate-200 font-bold uppercase text-[10px] tracking-widest text-slate-600 gap-3">
                            <Save className="h-4 w-4" /> Save Draft
                         </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <Button className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-4" onClick={handleSave}>
                            <Printer className="h-5 w-5" /> Save & Print
                         </Button>
                         <Button className="h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-4" onClick={handleSave}>
                            <Save className="h-5 w-5" /> Commit Ledger
                         </Button>
                      </div>
                   </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

