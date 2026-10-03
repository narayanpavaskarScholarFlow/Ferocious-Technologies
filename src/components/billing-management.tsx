
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
  LayoutGrid,
  Filter,
  FileBarChart,
  Banknote,
  MoreVertical,
  Download,
  Send,
  Eye,
  Settings2,
  ArrowRight,
  Hash,
  Edit3,
  ShieldCheck,
  RefreshCw,
  Archive,
  ArchiveX,
  BarChart3,
  ChevronDown
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
import { differenceInDays, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

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

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'customer', label: 'Customer / Vendor', icon: Building2 },
  { id: 'products', label: 'Products / Services', icon: Settings2 },
  { id: 'sale', label: 'Sale Invoice', icon: FileText },
  { id: 'purchase', label: 'Purchase Invoice', icon: ShoppingCart },
  { id: 'payment', label: 'Payment', icon: Banknote },
  { id: 'expense', label: 'Expense Income', icon: Receipt, locked: true },
  { id: 'other', label: 'Other Documents', icon: FileBox, locked: true },
  { id: 'report', label: 'Report', icon: FileBarChart, locked: true },
];

export function BillingManagement({ customers, vendors, records, orders, users, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSubView, setDashboardSubView] = useState<'analytics' | 'quick-links'>('analytics');
  
  // Record Form State
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingLogId] = useState<string | null>(null);
  
  // Filter States for listing
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

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
      setEditingLogId(record.id);
      setFormData(record);
    } else {
      const docType = DOCUMENT_TYPES.find(d => d.id === type);
      const nextNum = records.filter(r => r.type === type).length + 1;
      const formattedNum = `${docType?.prefix || 'DOC'}-${new Date().getFullYear()}-${nextNum.toString().padStart(4, '0')}`;
      
      setEditingLogId(null);
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

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = (activeTab === 'sale' && r.type === 'invoice') || 
                         (activeTab === 'purchase' && r.type === 'purchase_invoice') ||
                         (activeTab === 'other' && !['invoice', 'purchase_invoice'].includes(r.type)) ||
                         (activeTab === 'payment' && r.type === 'payment');
      
      if (activeTab === 'dashboard' || activeTab === 'customer' || activeTab === 'products') return true;
      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, activeTab]);

  const filteredPartners = useMemo(() => {
    const combined = [
      ...customers.map(c => ({ ...c, partnerType: 'Customer' })),
      ...vendors.map(v => ({ ...v, partnerType: 'Vendor' }))
    ];
    return combined.filter(p => 
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      (p.gstNumber && p.gstNumber.toLowerCase().includes(partnerSearch.toLowerCase()))
    );
  }, [customers, vendors, partnerSearch]);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

    const monthlySales = records
      .filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), currentMonthInterval))
      .reduce((sum, r) => sum + r.amount, 0);

    const monthlyPurchases = records
      .filter(r => r.type === 'purchase_invoice' && isWithinInterval(parseISO(r.date), currentMonthInterval))
      .reduce((sum, r) => sum + r.amount, 0);

    const calculateOutstanding = (type: 'invoice' | 'purchase_invoice') => {
      const outstandingRecords = records.filter(r => r.type === type && r.status !== 'Paid' && r.status !== 'Completed');
      const total = outstandingRecords.reduce((sum, r) => sum + r.amount, 0);
      
      const buckets = {
        current: 0,
        overdue1_15: 0,
        overdue16_30: 0,
        overdue30Plus: 0
      };

      outstandingRecords.forEach(r => {
        const days = differenceInDays(now, parseISO(r.date));
        if (days <= 0) buckets.current += r.amount;
        else if (days <= 15) buckets.overdue1_15 += r.amount;
        else if (days <= 30) buckets.overdue16_30 += r.amount;
        else buckets.overdue30Plus += r.amount;
      });

      return { total, ...buckets };
    };

    return {
      monthlySales,
      monthlyPurchases,
      salesOutstanding: calculateOutstanding('invoice'),
      purchaseOutstanding: calculateOutstanding('purchase_invoice'),
      income: monthlySales, 
      expense: monthlyPurchases
    };
  }, [records]);

  return (
    <div className="h-[calc(100vh-64px)] bg-[#F8FAFC] flex flex-col overflow-hidden animate-in fade-in duration-700 font-body">
      {/* Top professional navigation bar */}
      <div className="bg-white border-b border-slate-200 shrink-0 px-6 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto overflow-x-auto hide-scrollbar">
          <div className="flex h-16 items-center">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 h-full text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-3",
                  activeTab === tab.id 
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50/10" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-emerald-500" : "text-slate-400")} />
                {tab.label}
                {tab.locked && <Lock className="h-2.5 w-2.5 text-slate-300" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-[1500px] mx-auto p-6 md:p-10 space-y-10">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col items-center justify-center gap-8 mb-4">
                <div className="flex bg-white border border-slate-200 p-1 rounded-full shadow-sm">
                  <button 
                    onClick={() => setDashboardSubView('analytics')}
                    className={cn(
                      "px-10 h-10 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                      dashboardSubView === 'analytics' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Analytics
                  </button>
                  <button 
                    onClick={() => setDashboardSubView('quick-links')}
                    className={cn(
                      "px-10 h-10 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                      dashboardSubView === 'quick-links' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Quick Links
                  </button>
                </div>
                
                {dashboardSubView === 'analytics' && (
                  <div className="w-full flex flex-col md:flex-row justify-end items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Last Updated {lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date().toLocaleDateString('en-GB')} TO {new Date().toLocaleDateString('en-GB')}</span>
                      <ChevronDown className="h-3 w-3 ml-2" />
                    </div>
                    <Button 
                      variant="outline" 
                      className="h-10 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white border-none gap-3 shadow-lg"
                      onClick={() => setLastUpdated(new Date().toLocaleTimeString())}
                    >
                      Refresh <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {dashboardSubView === 'analytics' ? (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sale</span>
                         <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</p>
                         <h3 className="text-3xl font-display font-bold text-slate-900">₹ {analyticsData.monthlySales.toLocaleString('en-IN')}</h3>
                      </div>
                      <div className="mt-10 flex gap-1">
                         {[1,2,3,4,5,6,7].map(i => <div key={i} className="flex-1 h-1 rounded-full bg-emerald-500/20" />)}
                      </div>
                    </Card>

                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Purchase</span>
                         <ShoppingCart className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</p>
                         <h3 className="text-3xl font-display font-bold text-slate-900">₹ {analyticsData.monthlyPurchases.toLocaleString('en-IN')}</h3>
                      </div>
                      <div className="mt-10 flex gap-1">
                         {[1,2,3,4,5,6,7].map(i => <div key={i} className="flex-1 h-1 rounded-full bg-emerald-500/20" />)}
                      </div>
                    </Card>

                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl flex flex-col justify-between group">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expense</span>
                            <p className="text-xl font-display font-bold text-slate-900">₹ {analyticsData.expense.toLocaleString('en-IN')}</p>
                         </div>
                         <div className="text-right space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Income</span>
                            <p className="text-xl font-display font-bold text-slate-900">₹ {analyticsData.income.toLocaleString('en-IN')}</p>
                         </div>
                         <BarChart3 className="absolute right-4 bottom-4 h-6 w-6 text-slate-100" />
                      </div>
                      <div className="h-12 w-full flex items-center justify-center opacity-10">
                         <div className="h-px w-full bg-slate-900" />
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl space-y-8">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Sales Outstanding</h3>
                             <Filter className="h-3 w-3 text-slate-300" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span>Total Receivables</span>
                             <span>₹ {analyticsData.salesOutstanding.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                          </div>
                       </div>
                       <div className="grid grid-cols-4 gap-4 pt-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Current</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold">₹ {analyticsData.salesOutstanding.current.toFixed(2)}</span>
                             </div>
                          </div>
                          <div className="space-y-1 border-l pl-4">
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Overdue</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-xs font-bold">₹ {analyticsData.salesOutstanding.overdue1_15.toFixed(2)}</span>
                             </div>
                             <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">1-15 Days</p>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] font-bold text-transparent select-none uppercase">...</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                <span className="text-xs font-bold">₹ {analyticsData.salesOutstanding.overdue16_30.toFixed(2)}</span>
                             </div>
                             <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">16-30 Days</p>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] font-bold text-transparent select-none uppercase">...</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-600" />
                                <span className="text-xs font-bold">₹ {analyticsData.salesOutstanding.overdue30Plus.toFixed(2)}</span>
                             </div>
                             <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">30+ Days</p>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-2xl space-y-8">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Purchase Outstanding</h3>
                             <Filter className="h-3 w-3 text-slate-300" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span>Total Payables</span>
                             <span>₹ {analyticsData.purchaseOutstanding.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                          </div>
                       </div>
                       <div className="grid grid-cols-4 gap-4 pt-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Current</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold">₹ {analyticsData.purchaseOutstanding.current.toFixed(2)}</span>
                             </div>
                          </div>
                          <div className="space-y-1 border-l pl-4">
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Overdue</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-xs font-bold">₹ {analyticsData.purchaseOutstanding.overdue1_15.toFixed(2)}</span>
                             </div>
                             <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">1-15 Days</p>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] font-bold text-transparent select-none uppercase">...</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                <span className="text-xs font-bold">₹ {analyticsData.purchaseOutstanding.overdue16_30.toFixed(2)}</span>
                             </div>
                             <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">16-30 Days</p>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] font-bold text-transparent select-none uppercase">...</span>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-600" />
                                <span className="text-xs font-bold">₹ {analyticsData.purchaseOutstanding.overdue30Plus.toFixed(2)}</span>
                             </div>
                             <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">30+ Days</p>
                          </div>
                       </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {DOCUMENT_TYPES.map((link) => (
                      <Card 
                        key={link.id} 
                        onClick={() => handleOpenForm(link.id)}
                        className="bg-white border-slate-200 shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all rounded-[1.5rem] overflow-hidden group cursor-pointer h-40 flex flex-col items-center justify-center gap-4 text-center p-4"
                      >
                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                          <link.icon className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest leading-tight">{link.label}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl shadow-primary/20">
                      <Building2 className="h-6 w-6" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Registry</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global Partner Matrix (Read Only)</p>
                   </div>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    placeholder="Search partner by name or GST..." 
                    className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase shadow-sm"
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                  />
                </div>
              </div>

              <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Partner Node</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">GSTIN / Tax ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Primary Contact</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-slate-50/50 h-24 border-b border-slate-50 transition-all">
                        <TableCell className="px-10">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{partner.name}</span>
                            <span className="text-[9px] text-slate-400 font-code font-bold uppercase mt-1">ID: {partner.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-bold uppercase px-3 py-1",
                            partner.partnerType === 'Customer' ? "border-emerald-200 text-emerald-600 bg-emerald-50/30" : "border-blue-200 text-blue-600 bg-blue-50/30"
                          )}>
                            {partner.partnerType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-500 font-code">{partner.gstNumber || '---'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700">{partner.contactPerson || (partner as any).contact || '---'}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{partner.contactNumber || (partner as any).email || '---'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-bold uppercase px-3 py-1">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPartners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-96 text-center">
                           <div className="flex flex-col items-center justify-center opacity-30 py-10">
                              <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                                 <ArchiveX className="h-20 w-20 text-slate-300" />
                              </div>
                              <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Identity Hub Offline</p>
                              <p className="text-xs text-slate-400 mt-2 max-sm mx-auto font-medium">No partner identities detected in the master registry.</p>
                           </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {!['dashboard', 'customer', 'products'].includes(activeTab) && (
            <div className="space-y-8 animate-in fade-in duration-700">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl shadow-primary/20">
                        {MAIN_TABS.find(t => t.id === activeTab)?.icon && (
                          (() => {
                            const Icon = MAIN_TABS.find(t => t.id === activeTab)!.icon;
                            return <Icon className="h-6 w-6" />;
                          })()
                        )}
                     </div>
                     <div>
                        <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{MAIN_TABS.find(t => t.id === activeTab)?.label} Ledger</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial Commercial Registry v2.4</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input 
                          placeholder="Search document no or party..." 
                          className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase shadow-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <Button 
                      className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3"
                      onClick={() => handleOpenForm(activeTab === 'sale' ? 'invoice' : activeTab === 'purchase' ? 'purchase_invoice' : 'quotation')}
                     >
                       <Plus className="h-4 w-4" /> Create New Entry
                     </Button>
                  </div>
               </div>

               <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Doc Window</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identity / Party Node</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Amount (₹)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Status</TableHead>
                        <TableHead className="text-right px-10 w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-slate-50/50 h-24 border-b border-slate-50 group transition-all">
                          <TableCell className="px-10">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#001F3D] font-code">{record.number}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{record.date}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{record.customerName}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">PO: {record.orderId || '---'}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-center">
                             <span className="text-lg font-display font-bold text-[#001F3D]">₹ {record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </TableCell>
                          <TableCell className="text-center">
                             <Badge className={cn(
                               "text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                               record.status === 'Paid' || record.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                             )}>{record.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right px-10">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl" onClick={() => handleOpenForm(record.type, record)}><Edit3 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => onDeleteRecord(record.id)}><Trash2 className="h-4 w-4" /></Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-96 text-center">
                             <div className="flex flex-col items-center justify-center opacity-30 py-10">
                                <div className="p-10 bg-slate-50 rounded-[3rem] mb-8">
                                   <ArchiveX className="h-20 w-20 text-slate-300" />
                                </div>
                                <p className="text-[#001F3D] font-headline font-bold text-2xl uppercase tracking-tight">Ledger Matrix Null</p>
                                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium">No commercial records detected for this node classification.</p>
                             </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
               </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Main Billing Form Dialog */}
      <Dialog open={isRecordFormOpen} onOpenChange={setIsRecordFormOpen}>
        <DialogContent className="max-w-7xl h-[92vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-[#001F3D] rounded-2xl text-white shadow-xl shadow-primary/20">
                {DOCUMENT_TYPES.find(d => d.id === activeRecordType)?.icon ? 
                  (() => {
                    const Icon = DOCUMENT_TYPES.find(d => d.id === activeRecordType)!.icon;
                    return <Icon className="h-8 w-8" />;
                  })() : <Receipt className="h-8 w-8" />
                }
              </div>
              <div>
                <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight leading-none">
                  {DOCUMENT_TYPES.find(d => d.id === activeRecordType)?.label} Protocol
                </DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Master Commercial Matrix v2.4 • Secure Session Active</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-12 w-12 text-slate-300 hover:text-red-500 transition-all"><X className="h-8 w-8" /></Button>
          </DialogHeader>

          <ScrollArea className="flex-1 p-10 lg:p-14 bg-white">
             <div className="space-y-16 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Document Node ID</Label>
                      <div className="relative group">
                        <Input 
                          className="h-14 bg-slate-50/50 border-none rounded-2xl font-code font-bold text-lg text-primary shadow-inner pl-12" 
                          value={formData.number}
                          onChange={(e) => setFormData({...formData, number: e.target.value})}
                        />
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Protocol Release Date</Label>
                      <DatePicker 
                        value={formData.date}
                        onChange={(val) => setFormData({...formData, date: val})}
                        className="h-14 rounded-2xl shadow-inner border-none bg-slate-50/50"
                      />
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Identity Selection (Party Node)</Label>
                      <Select 
                        value={formData.customerId} 
                        onValueChange={(id) => {
                          const identity = customers.find(c => c.id === id) || vendors.find(v => v.id === id);
                          setFormData({...formData, customerId: id, customerName: identity?.name || ''});
                        }}
                      >
                         <SelectTrigger className="h-14 bg-slate-50/50 border-none rounded-2xl font-bold uppercase text-sm shadow-inner pl-12 relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <SelectValue placeholder="Identify Partner Node..." />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <div className="px-4 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b mb-1">Customer Ledger</div>
                            {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase py-3">{c.name}</SelectItem>)}
                            <div className="px-4 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b my-1">Vendor Ledger</div>
                            {vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-xs font-bold uppercase py-3">{v.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-primary/10 rounded-2xl text-primary"><LayoutGrid className="h-6 w-6" /></div>
                         <div>
                            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#001F3D]">Commercial Line Items</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">HSN/SAC-Compliant Yield Tracking</p>
                         </div>
                      </div>
                      <Button variant="ghost" onClick={handleAddItem} className="h-12 px-6 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest gap-3 hover:bg-primary/5 transition-all">
                        <Plus className="h-5 w-5" /> Append Commercial Line
                      </Button>
                   </div>

                   <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm bg-slate-50/20">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="hover:bg-transparent border-b-2 border-slate-100">
                            <TableHead className="text-[10px] font-bold uppercase py-6 px-8">Description of Services/Goods</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase w-32">HSN/SAC</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-center w-28">Qty</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-center w-36">Rate (₹)</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-center w-24">Disc %</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-center w-28">GST %</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-right px-10 w-40">Total (₹)</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items?.map((item) => (
                            <TableRow key={item.id} className="border-b border-slate-50 hover:bg-white transition-all group h-16">
                              <TableCell className="px-6">
                                <Input 
                                  className="h-11 border-none bg-transparent font-bold text-sm focus:ring-0" 
                                  placeholder="e.g. High-Precision VMC Job Work"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  className="h-11 border-none bg-transparent font-code font-bold text-xs uppercase text-slate-500 focus:ring-0" 
                                  placeholder="9988"
                                  value={item.hsn}
                                  onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  className="h-11 border-none bg-transparent text-center font-bold text-sm focus:ring-0" 
                                  value={item.qty}
                                  onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  className="h-11 border-none bg-transparent text-center font-bold text-sm text-primary focus:ring-0" 
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input 
                                  type="number"
                                  className="h-11 border-none bg-transparent text-center font-bold text-sm text-emerald-600 focus:ring-0" 
                                  value={item.discount}
                                  onChange={(e) => updateItem(item.id, 'discount', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Select value={item.gstRate.toString()} onValueChange={(v) => updateItem(item.id, 'gstRate', v)}>
                                   <SelectTrigger className="h-9 border-none bg-transparent font-bold text-xs shadow-none">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                      {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()} className="text-[10px] font-bold">{r}%</SelectItem>)}
                                   </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right px-10 font-display font-bold text-sm text-[#001F3D]">
                                ₹ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="px-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleRemoveItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t border-slate-100">
                   <div className="lg:col-span-7 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                           <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                              <Truck className="h-3 w-3 text-primary" /> Logistical Node (Vehicle No.)
                           </Label>
                           <Input 
                            placeholder="e.g. MH-12-XX-0000" 
                            className="h-14 bg-slate-50/50 border-none rounded-2xl text-sm font-bold uppercase font-code shadow-inner" 
                            value={formData.vehicleNo}
                            onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})}
                           />
                         </div>
                         <div className="space-y-4">
                           <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                              <Landmark className="h-3 w-3 text-primary" /> Place of Supply
                           </Label>
                           <Input 
                            placeholder="e.g. Maharashtra" 
                            className="h-14 bg-slate-50/50 border-none rounded-2xl text-sm font-bold uppercase shadow-inner" 
                            value={formData.placeOfSupply}
                            onChange={(e) => setFormData({...formData, placeOfSupply: e.target.value})}
                           />
                         </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Terms & Conditions Protocol</Label>
                        <Textarea 
                          className="min-h-[160px] bg-slate-50/50 border-none rounded-[2rem] text-xs font-medium resize-none focus-visible:ring-primary/20 shadow-inner p-8" 
                          placeholder="Standard institutional terms apply. Payment must be cleared within the defined temporal window..."
                          value={formData.terms}
                          onChange={(e) => setFormData({...formData, terms: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="lg:col-span-5">
                      <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden flex flex-col justify-between h-full">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                        <div className="relative z-10 space-y-8">
                           <div className="flex justify-between items-center border-b border-white/10 pb-6">
                              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Sub Total Yield</span>
                              <span className="text-xl font-display font-bold">₹ {formData.subTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/10 pb-6">
                              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Tax Matrix (GST)</span>
                              <span className="text-xl font-display font-bold text-primary">₹ {formData.taxTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-white/10 pb-6">
                              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Discount Margin</span>
                              <span className="text-xl font-display font-bold text-emerald-400">- ₹ {formData.discountTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="pt-8 flex flex-col gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-white/40 text-center">Total Net Valuation</p>
                              <h3 className="text-6xl font-display font-bold tracking-tighter text-center">₹ {formData.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                              <div className="flex justify-center mt-4">
                                <Badge className="bg-primary/20 text-primary border-none font-bold uppercase text-[9px] px-6 py-2 rounded-full tracking-widest animate-pulse">AUTO_VALUATION_SYNC</Badge>
                              </div>
                           </div>
                        </div>
                      </Card>
                   </div>
                </div>
             </div>
          </ScrollArea>

          <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Financial Integrity Verified</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Matrix protocols nominal. Data fidelity synchronized.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)} className="h-14 px-10 rounded-2xl font-bold uppercase text-[11px] tracking-widest text-slate-400 hover:text-red-500 transition-all">Abort Protocol</Button>
                <Button 
                  onClick={handleSave}
                  className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-primary/20 flex gap-4 group transition-all"
                >
                  <Save className="h-5 w-5" /> {editingRecordId ? 'Update Ledger' : 'Commit Document'}
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Node */}
      <div className="fixed bottom-12 right-12 z-[100] print:hidden">
        <Button 
          onClick={() => handleOpenForm('invoice')}
          className="h-20 w-20 rounded-[2.5rem] bg-[#001F3D] hover:bg-black text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:scale-110 hover:-rotate-12 transition-all flex items-center justify-center border-4 border-white/10"
        >
          <Plus className="h-10 w-10" />
        </Button>
      </div>
    </div>
  );
}
