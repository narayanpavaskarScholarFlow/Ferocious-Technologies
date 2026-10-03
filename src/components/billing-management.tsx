"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  ShoppingCart, 
  Lock,
  Truck, 
  Building2, 
  Briefcase, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus,
  Landmark,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Receipt,
  FileBox,
  Wallet,
  Settings,
  X,
  Trash2,
  Calendar,
  User,
  Calculator,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

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

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'Quotation', icon: FileBox, prefix: 'QT' },
  { id: 'invoice', label: 'Sale Invoice', icon: FileText, prefix: 'INV' },
  { id: 'purchase_invoice', label: 'Purchase Invoice', icon: ShoppingCart, prefix: 'PI' },
  { id: 'delivery_challan', label: 'Delivery Challan', icon: Truck, prefix: 'DC' },
  { id: 'proforma', label: 'Proforma Invoice', icon: FileCheck, prefix: 'PFI' },
  { id: 'purchase_order', label: 'Purchase Order', icon: ShoppingCart, prefix: 'PO' },
  { id: 'sale_order', label: 'Sale Order', icon: FileText, prefix: 'SO' },
  { id: 'credit_note', label: 'Credit Note', icon: ArrowDownLeft, prefix: 'CN' },
  { id: 'debit_note', label: 'Debit Note', icon: ArrowUpRight, prefix: 'DN' },
];

export function BillingManagement({ customers, vendors, records, orders, users, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'analytics' | 'quick-links'>('quick-links');
  
  // Record Form State
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '',
    type: 'invoice',
    customerName: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    status: 'Pending',
    note: '',
    items: [],
    subTotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    amount: 0,
    paymentTerms: 'NET 30',
    placeOfSupply: '',
    vehicleNo: '',
  });

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    setActiveRecordType(type);
    if (record) {
      setEditingRecordId(record.id);
      setFormData(record);
    } else {
      const docType = DOCUMENT_TYPES.find(d => d.id === type);
      const nextNum = records.filter(r => r.type === type).length + 1;
      const formattedNum = `${docType?.prefix || 'DOC'}-${new Date().getFullYear()}-${nextNum.toString().padStart(4, '0')}`;
      
      setEditingRecordId(null);
      setFormData({
        id: `REC-${Date.now()}`,
        type,
        customerName: '',
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        number: formattedNum,
        status: type === 'quotation' ? 'Draft' : 'Pending',
        note: '',
        items: [{ id: '1', description: '', hsn: '', qty: 0, unit: 'Nos', price: 0, discount: 0, gstRate: 18, total: 0 }],
        subTotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        amount: 0,
        paymentTerms: 'NET 30',
        placeOfSupply: 'State Matrix',
        vehicleNo: '',
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleAddItem = () => {
    const newItem: BillingLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      hsn: '',
      qty: 0,
      unit: 'Nos',
      price: 0,
      discount: 0,
      gstRate: 18,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(i => i.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof BillingLineItem, value: any) => {
    setFormData(prev => {
      const items = (prev.items || []).map(item => {
        if (item.id !== id) return item;
        const updatedItem = { ...item, [field]: value };
        
        // Automation Logic: Calculate Total for the row
        const qty = parseFloat(updatedItem.qty.toString()) || 0;
        const price = parseFloat(updatedItem.price.toString()) || 0;
        const discount = parseFloat(updatedItem.discount.toString()) || 0;
        const gstRate = parseFloat(updatedItem.gstRate.toString()) || 0;
        
        const base = qty * price;
        const afterDiscount = base - (base * (discount / 100));
        const tax = afterDiscount * (gstRate / 100);
        updatedItem.total = afterDiscount + tax;
        
        return updatedItem;
      });

      // Automation Logic: Recalculate Grand Totals
      const subTotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0);
      const discountTotal = items.reduce((acc, i) => acc + ((i.qty * i.price) * (i.discount / 100)), 0);
      const taxTotal = items.reduce((acc, i) => acc + (((i.qty * i.price) - ((i.qty * i.price) * (i.discount / 100))) * (i.gstRate / 100)), 0);
      const amount = subTotal - discountTotal + taxTotal;

      return { ...prev, items, subTotal, discountTotal, taxTotal, amount };
    });
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." });
      return;
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} #${formData.number} committed to master archive.` });
    setIsRecordFormOpen(false);
  };

  const quickLinks = [
    { label: 'Sale Invoice', icon: FileText, type: 'invoice' },
    { label: 'Purchase Invoice', icon: ShoppingCart, type: 'purchase_invoice' },
    { label: 'Quotation', icon: FileBox, type: 'quotation' },
    { label: 'Delivery Challan', icon: Truck, type: 'delivery_challan' },
    { label: 'Proforma', icon: FileCheck, type: 'proforma' },
    { label: 'Purchase Order', icon: ShoppingCart, type: 'purchase_order' },
    { label: 'Sale Order', icon: FileText, type: 'sale_order' },
    { label: 'Credit Note', icon: ArrowDownLeft, type: 'credit_note' },
    { label: 'Debit Note', icon: ArrowUpRight, type: 'debit_note' },
  ];

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'customer', label: 'Customer / Vendor' },
    { id: 'products', label: 'Products / Services' },
    { id: 'sale', label: 'Sale Invoice' },
    { id: 'purchase', label: 'Purchase Invoice' },
    { id: 'payment', label: 'Payment' },
    { id: 'expense', label: 'Expense Income' },
    { id: 'other', label: 'Other Documents' },
    { id: 'report', label: 'Report' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 animate-in fade-in duration-700 font-body">
      {/* Top Professional Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4">
        <div className="max-w-[1600px] mx-auto overflow-x-auto hide-scrollbar">
          <div className="flex h-14 items-center">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 h-full text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id 
                    ? "border-red-500 text-red-500 bg-red-50/10" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                {tab.label}
                {['expense', 'other', 'report'].includes(tab.id) && <Lock className="h-3 w-3 text-slate-300" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        {/* Profile Completion Section */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl">
           <h3 className="text-sm font-bold text-slate-800 mb-6">Complete your profile</h3>
           <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                 <div>
                    <p className="text-xs font-bold text-slate-700">Add Your Business Logo</p>
                    <p className="text-[10px] text-slate-400 mt-1">Print your business logo on your invoice to impress your customer with a beautiful invoice.</p>
                 </div>
                 <Button variant="outline" className="h-9 px-6 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest">Add Logo</Button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <p className="text-xs font-bold text-slate-700">Add Your Bank & UPI Details</p>
                    <p className="text-[10px] text-slate-400 mt-1">Get a faster payment with a UPI QR code. These UPI & Bank details will be printed on your invoice.</p>
                 </div>
                 <Button variant="outline" className="h-9 px-6 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest">Add Bank</Button>
              </div>
           </div>
        </Card>

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-200/50 p-1 rounded-full flex border border-slate-200">
            <button 
              onClick={() => setViewMode('analytics')}
              className={cn(
                "px-8 h-9 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === 'analytics' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
              )}
            >
              Analytics
            </button>
            <button 
              onClick={() => setViewMode('quick-links')}
              className={cn(
                "px-8 h-9 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === 'quick-links' ? "bg-emerald-50 text-white shadow-lg" : "text-slate-400"
              )}
            >
              Quick Links
            </button>
          </div>
        </div>

        {/* Quick Links Grid */}
        {viewMode === 'quick-links' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {quickLinks.map((link) => (
              <Card 
                key={link.label} 
                onClick={() => handleOpenForm(link.type)}
                className="bg-white border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all rounded-xl overflow-hidden group cursor-pointer h-40 flex flex-col items-center justify-center gap-4"
              >
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <link.icon className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{link.label}</span>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
             {[
               { label: 'Total Receivables', val: `₹ ${records.filter(r => r.type === 'invoice').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-500' },
               { label: 'Pending Payables', val: '₹ 0.00', icon: ArrowDownLeft, color: 'text-red-500' },
               { label: 'Bank Liquidity', val: '₹ 8,15,000', icon: Landmark, color: 'text-emerald-500' },
             ].map((stat, i) => (
               <Card key={i} className="p-8 bg-white border-slate-200 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{stat.label}</p>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-[#001F3D]">{stat.val}</h3>
               </Card>
             ))}
          </div>
        )}
      </div>

      {/* Main Billing Form Dialog */}
      <Dialog open={isRecordFormOpen} onOpenChange={setIsRecordFormOpen}>
        <DialogContent className="max-w-6xl h-[90vh] bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl shadow-primary/20">
                {DOCUMENT_TYPES.find(d => d.id === activeRecordType)?.icon ? 
                  (() => {
                    const Icon = DOCUMENT_TYPES.find(d => d.id === activeRecordType)!.icon;
                    return <Icon className="h-7 w-7" />;
                  })() : <Receipt className="h-7 w-7" />
                }
              </div>
              <div>
                <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">
                  {DOCUMENT_TYPES.find(d => d.id === activeRecordType)?.label} Protocol
                </DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Commercial Matrix v2.4</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full text-slate-300 hover:text-[#001F3D]"><X className="h-6 w-6" /></Button>
          </DialogHeader>

          <ScrollArea className="flex-1 p-10 bg-white">
             <div className="space-y-12">
                {/* Header Matrix: Date, Number, Identity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Document Number</Label>
                      <Input 
                        className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold text-[#001F3D]" 
                        value={formData.number}
                        onChange={(e) => setFormData({...formData, number: e.target.value})}
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Protocol Date</Label>
                      <DatePicker 
                        value={formData.date}
                        onChange={(val) => setFormData({...formData, date: val})}
                        className="h-12 rounded-xl"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Identity Selection (Customer/Vendor)</Label>
                      <Select 
                        value={formData.customerId} 
                        onValueChange={(id) => {
                          const identity = customers.find(c => c.id === id) || vendors.find(v => v.id === id);
                          setFormData({...formData, customerId: id, customerName: identity?.name || ''});
                        }}
                      >
                         <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase">
                            <SelectValue placeholder="Identify Partner Node..." />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <div className="px-2 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b">Customer Ledger</div>
                            {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}
                            <div className="px-2 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b">Vendor Ledger</div>
                            {vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-xs font-bold uppercase">{v.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                {/* Line Item Matrix */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><LayoutGrid className="h-4 w-4" /></div>
                         <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#001F3D]">Commercial Line Items</h4>
                      </div>
                      <Button variant="ghost" onClick={handleAddItem} className="h-9 px-4 rounded-xl text-primary font-bold uppercase text-[9px] tracking-widest gap-2 hover:bg-primary/5">
                        <Plus className="h-4 w-4" /> Append Line
                      </Button>
                   </div>

                   <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="hover:bg-transparent border-b border-slate-100">
                            <TableHead className="text-[9px] font-bold uppercase py-4 px-6">Description of Services/Goods</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase w-32">HSN/SAC</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase text-center w-24">Qty</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase text-center w-32">Rate (₹)</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase text-center w-24">Disc %</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase text-center w-24">GST %</TableHead>
                            <TableHead className="text-[9px] font-bold uppercase text-right px-6 w-32">Total (₹)</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items?.map((item, idx) => (
                            <TableRow key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                              <TableCell className="px-4">
                                <Input 
                                  className="h-10 border-none bg-transparent font-bold text-xs" 
                                  placeholder="e.g. VMC Machining Job Work"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  className="h-10 border-none bg-transparent font-code text-xs uppercase" 
                                  placeholder="9988"
                                  value={item.hsn}
                                  onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  className="h-10 border-none bg-transparent text-center font-bold text-xs" 
                                  value={item.qty}
                                  onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  className="h-10 border-none bg-transparent text-center font-bold text-xs text-primary" 
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  className="h-10 border-none bg-transparent text-center font-bold text-xs text-emerald-600" 
                                  value={item.discount}
                                  onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Select value={item.gstRate.toString()} onValueChange={(v) => updateItem(item.id, 'gstRate', v)}>
                                   <SelectTrigger className="h-8 border-none bg-transparent font-bold text-xs shadow-none">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-xl">
                                      {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()} className="text-xs font-bold">{r}%</SelectItem>)}
                                   </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right px-6 font-display font-bold text-xs text-[#001F3D]">
                                ₹ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="px-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500" onClick={() => handleRemoveItem(item.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </div>
                </div>

                {/* Footer Section: Notes & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   <div className="lg:col-span-7 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                           <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Logistical Node (Vehicle No.)</Label>
                           <Input 
                            placeholder="e.g. MH-12-XX-0000" 
                            className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase font-code" 
                            value={formData.vehicleNo}
                            onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})}
                           />
                         </div>
                         <div className="space-y-3">
                           <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Place of Supply</Label>
                           <Input 
                            placeholder="e.g. Maharashtra" 
                            className="h-12 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase" 
                            value={formData.placeOfSupply}
                            onChange={(e) => setFormData({...formData, placeOfSupply: e.target.value})}
                           />
                         </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Terms & Conditions Protocol</Label>
                        <Textarea 
                          className="min-h-[120px] bg-slate-50 border-none rounded-2xl text-xs font-medium resize-none focus-visible:ring-primary/20" 
                          placeholder="Standard institutional terms apply..."
                          value={formData.terms}
                          onChange={(e) => setFormData({...formData, terms: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="lg:col-span-5">
                      <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                        <div className="relative z-10 space-y-6">
                           <div className="flex justify-between items-center border-b border-white/10 pb-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sub Total</span>
                              <span className="text-sm font-display font-bold">₹ {formData.subTotal?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/10 pb-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tax Matrix (GST)</span>
                              <span className="text-sm font-display font-bold text-primary">₹ {formData.taxTotal?.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/10 pb-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Loyalty Discount</span>
                              <span className="text-sm font-display font-bold text-emerald-400">- ₹ {formData.discountTotal?.toLocaleString()}</span>
                           </div>
                           <div className="pt-4 flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Total Valuation</p>
                                 <h3 className="text-4xl font-display font-bold tracking-tighter">₹ {formData.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                              </div>
                              <Badge className="bg-primary/20 text-primary border-none font-bold uppercase text-[8px] px-3 py-1 mb-2">AUTO_CALC_SYNC</Badge>
                           </div>
                        </div>
                      </Card>
                   </div>
                </div>
             </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 animate-pulse"><CheckCircle2 className="h-4 w-4" /></div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Financial verification protocols <br />nominal. Data fidelity verified.</p>
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)} className="h-12 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Abort Protocol</Button>
                <Button 
                  onClick={handleSave}
                  className="h-12 px-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary/20 flex gap-3 group"
                >
                  <Save className="h-4 w-4" /> Commit Document
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-10 right-10 z-[100] print:hidden">
        <Button 
          onClick={() => handleOpenForm('invoice')}
          className="h-16 w-16 rounded-full bg-[#001F3D] text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
