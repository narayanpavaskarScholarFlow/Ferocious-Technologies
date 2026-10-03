"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  Building2, 
  Receipt, 
  Plus,
  ChevronRight,
  TrendingUp,
  FileBox,
  LayoutGrid,
  X,
  Trash2,
  Calendar,
  User,
  Save,
  Search,
  Filter,
  FileBarChart,
  Banknote,
  Edit3,
  ShieldCheck,
  RefreshCw,
  ArchiveX,
  BarChart3,
  ChevronDown,
  PieChart,
  Package,
  Layers,
  Hash,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck,
  Info,
  ExternalLink,
  Printer,
  ChevronUp,
  CreditCard,
  MoreVertical,
  Settings2,
  DollarSign,
  Sparkles,
  History,
  Coins,
  ImageIcon,
  Upload,
  Send,
  TableProperties,
  ArrowLeft,
  BookOpen
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
import { differenceInDays, parseISO, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'Quotation', icon: FileBox, prefix: 'QT' },
  { id: 'proforma', label: 'Proforma', icon: FileCheck, prefix: 'PFI' },
  { id: 'invoice', label: 'Sale Inv', icon: FileText, prefix: 'INV' },
  { id: 'purchase_invoice', label: 'Pur Inv', icon: ShoppingCart, prefix: 'PI' },
  { id: 'delivery_challan', label: 'Challan', icon: Truck, prefix: 'DC' },
  { id: 'purchase_order', label: 'Pur Order', icon: ShoppingCart, prefix: 'PO' },
  { id: 'sale_order', label: 'Sale Order', icon: FileText, prefix: 'SO' },
  { id: 'credit_note', label: 'Cr Note', icon: ArrowDownLeft, prefix: 'CN' },
  { id: 'debit_note', label: 'Db Note', icon: ArrowUpRight, prefix: 'DN' },
  { id: 'inward_payment', label: 'Inward Pay', icon: ArrowDownLeft, prefix: 'REC' },
  { id: 'outward_payment', label: 'Outward Pay', icon: ArrowUpRight, prefix: 'PAY' },
];

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'customer', label: 'Identity', icon: Building2 },
  { id: 'products', label: 'Catalog', icon: Settings2 },
  ...DOCUMENT_TYPES.map(t => ({ id: t.id, label: t.label, icon: t.icon })),
  { id: 'report', label: 'Report', icon: FileBarChart },
];

const REPORT_STRUCTURE = [
  {
    title: 'Sales Reports',
    items: [
      { id: 'sales', label: 'Sales', type: 'invoice' },
      { id: 'sales_outstanding', label: 'Sales Outstanding', type: 'invoice', status: 'Pending' },
      { id: 'sales_product', label: 'Sales Product Report', type: 'invoice' },
      { id: 'inward_payment', label: 'Inward Payment', type: 'inward_payment' },
    ]
  },
  {
    title: 'Purchase Reports',
    items: [
      { id: 'purchase', label: 'Purchase', type: 'purchase_invoice' },
      { id: 'purchase_outstanding', label: 'Purchase Outstanding', type: 'purchase_invoice', status: 'Pending' },
      { id: 'purchase_product', label: 'Purchase Product Report', type: 'purchase_invoice' },
      { id: 'outward_payment', label: 'Outward Payment', type: 'outward_payment' },
    ]
  },
  {
    title: 'Other Reports',
    items: [
      { id: 'other_document', label: 'Other Document', type: 'quotation' },
      { id: 'other_document_product', label: 'Other Document Product Report', type: 'quotation' },
      { id: 'company_ledger', label: 'Company Ledger', type: 'all' },
      { id: 'company_outstanding', label: 'Company Outstanding', type: 'all', status: 'Pending' },
      { id: 'p_l', label: 'Profit & Loss Report', type: 'all' },
      { id: 'bill_p_l', label: 'Bill Wise Profit & Loss', type: 'invoice' },
      { id: 'product_p_l', label: 'Product Wise Profit & Loss', type: 'invoice' },
      { id: 'customer_p_l', label: 'Customer Wise Profit & Loss', type: 'invoice' },
      { id: 'day_p_l', label: 'Day Wise Profit & Loss', type: 'invoice' },
      { id: 'stock_report', label: 'Stock Report', type: 'all' },
      { id: 'manufacture_report', label: 'Manufacture Report', type: 'all' },
      { id: 'product_report', label: 'Product Report', type: 'all' },
      { id: 'daily_expenses', label: 'Daily Expenses', type: 'outward_payment' },
      { id: 'other_income', label: 'Other Income', type: 'inward_payment' },
      { id: 'daybook', label: 'Daybook', type: 'all' },
    ]
  },
  {
    title: 'GST Reports',
    items: [
      { id: 'gstr1', label: 'GSTR-1', type: 'invoice' },
      { id: 'gstr2b', label: 'GSTR-2B', type: 'purchase_invoice' },
      { id: 'gstr3b', label: 'GSTR-3B', type: 'all' },
    ]
  }
];

export function BillingManagement({ customers, vendors, records, orders, users, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSubView, setDashboardSubView] = useState<'analytics' | 'quick-links'>('analytics');
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingLogId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Report State
  const [activeReportId, setActiveReportId] = useState('sales');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '',
    type: 'invoice',
    customerName: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    numberPrefix: '',
    numberPostfix: '',
    status: 'Pending',
    note: '',
    items: [],
    subTotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    amount: 0,
    paymentTerms: 'NET 30',
    placeOfSupply: 'Karnataka',
    vehicleNo: '',
    revCharge: 'No',
    shipTo: '',
    distanceEWay: '',
    challanNo: '',
    challanDate: '',
    lrNo: '',
    deliveryMode: '',
    tcsRate: 0,
    tcsAmount: 0,
    roundOff: 0,
    isRoundOffActive: true,
  });

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    setActiveRecordType(type);
    if (record) {
      setEditingLogId(record.id);
      setFormData(record);
    } else {
      const docType = DOCUMENT_TYPES.find(d => d.id === type);
      const nextNum = records.filter(r => r.type === type).length + 1;
      
      setEditingLogId(null);
      setFormData({
        id: `REC-${Date.now()}`,
        type,
        customerName: '',
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        number: nextNum.toString(),
        numberPrefix: docType?.prefix || 'DOC',
        numberPostfix: new Date().getFullYear().toString(),
        status: type === 'quotation' ? 'Draft' : 'Pending',
        note: '',
        items: type.includes('payment') ? [] : [{ id: '1', description: '', note: '', hsn: '', qty: 0, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage' as const, gstRate: 18, total: 0 }],
        subTotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        amount: 0,
        paymentTerms: 'NET 30',
        placeOfSupply: 'Karnataka',
        vehicleNo: '',
        revCharge: 'No',
        shipTo: '',
        distanceEWay: '',
        challanNo: '',
        challanDate: '',
        lrNo: '',
        deliveryMode: '',
        tcsRate: 0,
        tcsAmount: 0,
        roundOff: 0,
        isRoundOffActive: true,
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleAddItem = () => {
    const newItem: BillingLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      note: '',
      hsn: '',
      qty: 0,
      unit: 'Nos',
      price: 0,
      discount: 0,
      discountType: 'percentage',
      gstRate: 18,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => {
      const items = prev.items?.filter(i => i.id !== id) || [];
      return calculateTotals({ ...prev, items });
    });
  };

  const updateItem = (id: string, field: keyof BillingLineItem, value: any) => {
    setFormData(prev => {
      const items = (prev.items || []).map(item => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      });
      return calculateTotals({ ...prev, items });
    });
  };

  const calculateTotals = (data: Partial<BillingRecord>) => {
    const items = data.items || [];
    const subTotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0);
    
    let discountTotal = 0;
    items.forEach(i => {
      if (i.discountType === 'percentage') {
        discountTotal += (i.qty * i.price) * (i.discount / 100);
      } else {
        discountTotal += i.discount;
      }
    });

    const taxableTotal = subTotal - discountTotal;
    const taxTotal = items.reduce((acc, i) => {
      const itemTaxable = (i.qty * i.price) - (i.discountType === 'percentage' ? (i.qty * i.price * (i.discount / 100)) : i.discount);
      return acc + (itemTaxable * (i.gstRate / 100));
    }, 0);

    const baseAmount = taxableTotal + taxTotal;
    const tcsAmount = baseAmount * ((data.tcsRate || 0) / 100);
    
    let finalAmount = baseAmount + tcsAmount;
    let roundOff = 0;
    
    if (data.isRoundOffActive) {
      const rounded = Math.round(finalAmount);
      roundOff = rounded - finalAmount;
      finalAmount = rounded;
    }

    return { ...data, items: items.map(i => {
      const itemTaxable = (i.qty * i.price) - (i.discountType === 'percentage' ? (i.qty * i.price * (i.discount / 100)) : i.discount);
      return { ...i, total: itemTaxable + (itemTaxable * (i.gstRate / 100)) };
    }), subTotal, discountTotal, taxTotal, amount: finalAmount, tcsAmount, roundOff };
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." });
      return;
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} #${formData.numberPrefix}-${formData.number}-${formData.numberPostfix} committed.` });
    setIsRecordFormOpen(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const docTabs = DOCUMENT_TYPES.map(d => d.id);
      if (docTabs.includes(activeTab)) {
        return matchesSearch && r.type === activeTab;
      }
      return matchesSearch;
    });
  }, [records, searchTerm, activeTab]);

  const reportRecords = useMemo(() => {
    if (activeTab !== 'report') return [];
    
    let currentReportItem: any = null;
    REPORT_STRUCTURE.forEach(cat => {
      const found = cat.items.find(i => i.id === activeReportId);
      if (found) currentReportItem = found;
    });

    if (!currentReportItem) return [];

    return records.filter(r => {
      let matches = true;
      if (currentReportItem.type !== 'all' && r.type !== currentReportItem.type) matches = false;
      if (currentReportItem.status && r.status !== currentReportItem.status) matches = false;
      
      if (reportStartDate && r.date < reportStartDate) matches = false;
      if (reportEndDate && r.date > reportEndDate) matches = false;
      
      return matches;
    });
  }, [records, activeReportId, activeTab, reportStartDate, reportEndDate]);

  const reportAggregates = useMemo(() => {
    return {
      taxable: reportRecords.reduce((acc, r) => acc + ((r.subTotal || 0) - (r.discountTotal || 0)), 0),
      tax: reportRecords.reduce((acc, r) => acc + (r.taxTotal || 0), 0),
      total: reportRecords.reduce((acc, r) => acc + (r.amount || 0), 0)
    };
  }, [reportRecords]);

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
      return { total };
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

  const currentTabLabel = useMemo(() => {
    return MAIN_TABS.find(t => t.id === activeTab)?.label || 'Document';
  }, [activeTab]);

  const isPaymentType = activeRecordType === 'inward_payment' || activeRecordType === 'outward_payment';

  return (
    <div className="h-[calc(100vh-64px)] bg-[#F8FAFC] flex flex-col overflow-hidden animate-in fade-in duration-700 font-body">
      <div className="bg-white border-b border-slate-200 shrink-0 px-1 z-50 shadow-sm overflow-x-hidden no-print">
        <div className="max-w-[1700px] mx-auto">
          <div className="flex h-12 items-center justify-between gap-0.5">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-1.5 h-full text-[8.5px] font-bold uppercase tracking-tight border-b-2 transition-all whitespace-nowrap flex items-center gap-1",
                  activeTab === tab.id 
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50/10" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                <tab.icon className={cn("h-2.5 w-2.5", activeTab === tab.id ? "text-emerald-500" : "text-slate-400")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
            
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
                </div>

                {dashboardSubView === 'analytics' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl relative group">
                        <div className="flex justify-between items-start mb-6">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sale</span>
                           <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</p>
                           <h3 className="text-3xl font-display font-bold text-slate-900">₹ {(analyticsData.monthlySales || 0).toLocaleString('en-IN')}</h3>
                        </div>
                      </Card>
                      <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl relative group">
                        <div className="flex justify-between items-start mb-6">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Purchase</span>
                           <ShoppingCart className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</p>
                           <h3 className="text-3xl font-display font-bold text-slate-900">₹ {(analyticsData.monthlyPurchases || 0).toLocaleString('en-IN')}</h3>
                        </div>
                      </Card>
                      <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between group">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expense</span>
                              <p className="text-xl font-display font-bold text-slate-900">₹ {(analyticsData.expense || 0).toLocaleString('en-IN')}</p>
                           </div>
                           <div className="text-right space-y-1">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Income</span>
                              <p className="text-xl font-display font-bold text-slate-900">₹ {(analyticsData.income || 0).toLocaleString('en-IN')}</p>
                           </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {DOCUMENT_TYPES.map((link) => (
                      <Card 
                        key={link.id} 
                        onClick={() => handleOpenForm(link.id)}
                        className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:translate-y-[-4px] transition-all rounded-[1.5rem] overflow-hidden group cursor-pointer h-40 flex flex-col items-center justify-center gap-4 text-center p-4"
                      >
                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                          <link.icon className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest leading-tight">{link.label}</span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'customer' && (
              <div className="space-y-4 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><Building2 className="h-6 w-6" /></div>
                     <div>
                        <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Registry</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Read-Only Financial View</p>
                     </div>
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Partner Node</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">GSTIN / Tax ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400">Primary Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...customers, ...vendors].map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-slate-50/50 h-20 border-b border-slate-50">
                        <TableCell className="px-10"><span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{partner.name}</span></TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase">{ (partner as any).companyType || 'Node' }</Badge></TableCell>
                        <TableCell><span className="text-xs font-bold text-slate-500 font-code">{partner.gstNumber || '---'}</span></TableCell>
                        <TableCell><span className="text-[11px] font-bold text-slate-700">{partner.contactPerson || (partner as any).contact || '---'}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === 'report' && (
              <div className="h-[calc(100vh-140px)] flex gap-0 animate-in fade-in duration-700 no-print">
                {/* Side Report Navigator */}
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto hide-scrollbar">
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><FileBarChart className="h-4 w-4" /></div>
                      <h4 className="text-xs font-bold text-[#001F3D] uppercase tracking-widest">Report Matrix</h4>
                    </div>
                  </div>
                  <div className="p-2 space-y-6 py-6">
                    {REPORT_STRUCTURE.map((cat) => (
                      <div key={cat.title} className="space-y-1">
                        <div className="px-4 py-2 bg-emerald-50/50 rounded-lg">
                          <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{cat.title}</h5>
                        </div>
                        <div className="space-y-0.5 pt-1">
                          {cat.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveReportId(item.id)}
                              className={cn(
                                "w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all",
                                activeReportId === item.id 
                                  ? "bg-[#001F3D] text-white shadow-lg shadow-blue-900/10" 
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Display Node */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">
                        {(() => {
                          let label = '';
                          REPORT_STRUCTURE.forEach(c => c.items.forEach(i => { if(i.id === activeReportId) label = i.label; }));
                          return label;
                        })()}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                          <DatePicker 
                            value={reportStartDate} 
                            onChange={setReportStartDate} 
                            placeholder="Start Date" 
                            className="h-9 border-none bg-transparent w-36" 
                          />
                          <div className="h-4 w-px bg-slate-200" />
                          <DatePicker 
                            value={reportEndDate} 
                            onChange={setReportEndDate} 
                            placeholder="End Date" 
                            className="h-9 border-none bg-transparent w-36" 
                          />
                       </div>
                       <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold uppercase text-[9px] gap-2 border-slate-200 shadow-sm" onClick={() => window.print()}>
                          <Printer className="h-3.5 w-3.5" /> Print Protocol
                       </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-8">
                       <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b-2 border-slate-200">
                              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Doc Ref</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Party Node</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Date</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Taxable</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Tax</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right px-10">Net Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportRecords.map((r) => (
                              <TableRow key={r.id} className="h-16 border-b border-slate-50 hover:bg-slate-50/30">
                                <TableCell className="px-10 font-code font-bold text-xs text-primary">{r.number}</TableCell>
                                <TableCell className="text-[11px] font-bold text-slate-700 uppercase">{r.customerName}</TableCell>
                                <TableCell className="text-center font-code text-[10px] text-slate-400">{r.date}</TableCell>
                                <TableCell className="text-right font-display text-xs font-bold text-slate-600">₹ {((r.subTotal || 0) - (r.discountTotal || 0)).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-display text-xs font-bold text-slate-600">₹ {(r.taxTotal || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right px-10 font-display text-sm font-black text-[#001F3D]">₹ {(r.amount || 0).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            {reportRecords.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center opacity-30">
                                   <div className="flex flex-col items-center gap-4">
                                      <ArchiveX className="h-12 w-12 text-slate-300" />
                                      <p className="text-xs font-bold uppercase tracking-[0.2em]">Query Yield Null</p>
                                   </div>
                                </TableCell>
                              </TableRow>
                            )}
                            {reportRecords.length > 0 && (
                              <TableRow className="bg-emerald-50/30 border-t-2 border-emerald-500">
                                <TableCell colSpan={3} className="text-right font-black uppercase text-[10px] text-emerald-800">Report Aggregate Matrix:</TableCell>
                                <TableCell className="text-right font-display text-sm font-bold text-emerald-800">₹ {reportAggregates.taxable.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-display text-sm font-bold text-emerald-800">₹ {reportAggregates.tax.toLocaleString()}</TableCell>
                                <TableCell className="text-right px-10 font-display text-lg font-black text-emerald-900">₹ {reportAggregates.total.toLocaleString()}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                       </Table>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {!['dashboard', 'customer', 'products', 'report'].includes(activeTab) && (
              <div className="space-y-4 animate-in fade-in duration-700">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg">
                          {(() => {
                            const Icon = MAIN_TABS.find(t => t.id === activeTab)?.icon || FileBox;
                            return <Icon className="h-6 w-6" />;
                          })()}
                       </div>
                       <div>
                          <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{currentTabLabel} Ledger</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial Commercial Registry V2.4</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                         <Input 
                            placeholder="SEARCH DOCUMENT..." 
                            className="pl-9 h-10 w-72 bg-white border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                      </div>
                      <Button className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold uppercase text-[10px] tracking-widest shadow-lg flex gap-3" onClick={() => handleOpenForm(activeTab)}>
                        <Plus className="h-4 w-4" /> Create New Entry
                      </Button>
                    </div>
                 </div>

                 <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Doc Window</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identity / Party Node</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Amount (₹)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-center text-slate-400">Status</TableHead>
                        <TableHead className="text-right px-10 w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                          <TableCell className="px-10">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#001F3D] font-code">{record.number}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{record.date}</span>
                             </div>
                          </TableCell>
                          <TableCell><span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{record.customerName}</span></TableCell>
                          <TableCell className="text-center"><span className="text-lg font-display font-bold text-[#001F3D]">₹ {(record.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></TableCell>
                          <TableCell className="text-center"><Badge className={cn("text-[9px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm", record.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100")}>{record.status}</Badge></TableCell>
                          <TableCell className="text-right px-10">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary" onClick={() => handleOpenForm(record.type, record)}><Edit3 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-red-500" onClick={() => onDeleteRecord(record.id)}><Trash2 className="h-4 w-4" /></Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                 </Table>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isRecordFormOpen} onOpenChange={setIsRecordFormOpen}>
        <DialogContent className={cn("bg-[#F8FAFC] border-none shadow-2xl rounded-[1.5rem] p-0 overflow-hidden flex flex-col", isPaymentType ? "max-w-4xl h-[92vh]" : "max-w-7xl h-[94vh]")}>
          <DialogHeader className="p-4 bg-white border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-lg font-headline font-bold text-slate-800 uppercase tracking-tight">
                {editingRecordId ? 'Edit' : 'Create'} {MAIN_TABS.find(d => d.id === activeRecordType)?.label}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-8 w-8 text-slate-400 hover:text-red-500"><X className="h-5 w-5" /></Button>
          </DialogHeader>

          <ScrollArea className="flex-1">
            {isPaymentType ? (
              <div className="p-6 space-y-6 bg-white max-w-3xl mx-auto mt-4 mb-6 rounded-2xl shadow-sm border border-slate-100">
                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Receipt No <span className="text-red-500">*</span></Label>
                    <div className="col-span-9 flex gap-2">
                       <Input className="h-9 bg-slate-50 border-slate-200 text-[10px] font-bold w-28 uppercase px-3" placeholder="Receipt Prefix" value={formData.numberPrefix} onChange={(e)=>setFormData({...formData, numberPrefix: e.target.value})} />
                       <Input className="h-9 bg-white border-slate-200 text-xs font-bold flex-1 px-3" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                       <Input className="h-9 bg-slate-50 border-slate-200 text-[10px] font-bold w-28 uppercase px-3" placeholder="Receipt Postfix" value={formData.numberPostfix} onChange={(e)=>setFormData({...formData, numberPostfix: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Company Name <span className="text-red-500">*</span></Label>
                    <div className="col-span-9">
                      <Select 
                        value={formData.customerId} 
                        onValueChange={(id) => {
                          const identity = customers.find(c => c.id === id) || vendors.find(v => v.id === id);
                          setFormData({...formData, customerId: id, customerName: identity?.name || ''});
                        }}
                      >
                        <SelectTrigger className="h-10 bg-white border-slate-200 rounded-md text-xs font-bold uppercase">
                          <SelectValue placeholder="Identify Partner..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                          {[...customers, ...vendors].map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-start gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase mt-3">Address</Label>
                    <div className="col-span-9">
                       <Textarea className="min-h-[60px] bg-slate-100 border-none rounded-md p-3 text-xs font-medium resize-none" readOnly placeholder="Address matrix node..." value={formData.shipTo} />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">GSTIN / PAN</Label>
                    <div className="col-span-9">
                       <Input className="h-10 bg-slate-100 border-none rounded-md px-3 font-code text-xs font-bold" readOnly />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Total Outstanding</Label>
                    <div className="col-span-9">
                       <span className="text-sm font-display font-bold text-[#001F3D]">₹ 0.00</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Payment Date <span className="text-red-500">*</span></Label>
                    <div className="col-span-9">
                       <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} placeholder="Enter your payment date" className="h-10 rounded-md border-slate-200 bg-white" />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Amount <span className="text-red-500">*</span></Label>
                    <div className="col-span-9">
                       <Input type="number" placeholder="Enter your amount" className="h-10 border-slate-200 rounded-md px-3 text-sm font-bold" value={formData.amount} onChange={(e)=>setFormData({...formData, amount: Number(e.target.value)})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Payment Type <span className="text-red-500">*</span></Label>
                    <div className="col-span-9">
                       <Select value={formData.paymentMethod} onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}>
                          <SelectTrigger className="h-10 border-slate-200 rounded-md text-xs font-bold uppercase"><SelectValue placeholder="Select Payment Type" /></SelectTrigger>
                          <SelectContent className="rounded-xl"><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Share</Label>
                    <div className="col-span-9 flex items-center gap-8">
                       <div className="flex items-center space-x-2">
                          <Checkbox id="email-share" />
                          <Label htmlFor="email-share" className="text-xs font-bold text-slate-500 cursor-pointer">Email</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                          <Checkbox id="sms-share" />
                          <Label htmlFor="sms-share" className="text-xs font-bold text-slate-500 cursor-pointer">SMS</Label>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-center gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase">Remarks</Label>
                    <div className="col-span-9">
                       <Input placeholder="Enter your Remarks" className="h-10 border-slate-200 rounded-md px-3 text-xs font-medium" value={formData.note} onChange={(e)=>setFormData({...formData, note: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 items-start gap-4">
                    <Label className="col-span-3 text-[11px] font-bold text-slate-600 uppercase mt-3">Attachment</Label>
                    <div className="col-span-9">
                       <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50/30 text-slate-400 group cursor-pointer hover:bg-white hover:border-emerald-500 transition-all">
                          <div className="p-2 bg-white rounded-full shadow-sm"><ImageIcon className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-widest">Click To Upload</span>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl space-y-6 relative">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Vendor Information</h3>
                      <div className="p-1 bg-slate-50 rounded-md border text-slate-400"><MoreVertical className="h-3 w-3" /></div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">M/S <span className="text-red-500">*</span></Label>
                        <div className="col-span-8">
                          <Select 
                            value={formData.customerId} 
                            onValueChange={(id) => {
                              const identity = customers.find(c => c.id === id) || vendors.find(v => v.id === id);
                              setFormData({...formData, customerId: id, customerName: identity?.name || ''});
                            }}
                          >
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-xs font-bold uppercase">
                              <SelectValue placeholder="Identify Partner..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                              {[...customers, ...vendors].map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-start gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase mt-2">Address</Label>
                        <div className="col-span-8">
                          <Textarea 
                            className="min-h-[60px] bg-slate-50 border-slate-200 text-xs font-medium resize-none p-2" 
                            placeholder="Partner Address Ledger..."
                            value={formData.shipTo}
                            onChange={(e) => setFormData({...formData, shipTo: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Contact Person</Label>
                        <div className="col-span-8"><Input className="h-9 bg-slate-50 border-slate-200 text-xs font-bold" /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Phone No</Label>
                        <div className="col-span-8"><Input className="h-9 bg-slate-50 border-slate-200 text-xs font-bold" /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">GSTIN / PAN</Label>
                        <div className="col-span-8"><Input className="h-9 bg-slate-50 border-slate-200 text-xs font-bold uppercase" /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Rev. Charge</Label>
                        <div className="col-span-8">
                          <Select value={formData.revCharge} onValueChange={(val: any) => setFormData({...formData, revCharge: val})}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Place of Supply <span className="text-red-500">*</span></Label>
                        <div className="col-span-8"><Input className="h-9 bg-slate-50 border-slate-200 text-xs font-bold" value={formData.placeOfSupply} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} /></div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl space-y-6">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{currentTabLabel} Detail</h3>
                      <div className="p-1 bg-slate-50 rounded-md border text-slate-400"><History className="h-3 w-3" /></div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Type</Label>
                        <div className="col-span-8">
                          <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                            <SelectContent>{DOCUMENT_TYPES.map(t => <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase">{t.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Order No <span className="text-red-500">*</span></Label>
                        <div className="col-span-8 flex gap-2">
                          <Input className="h-9 bg-slate-100 border-slate-200 text-[9px] font-bold w-16 text-center uppercase" placeholder="Prefix" value={formData.numberPrefix} onChange={(e)=>setFormData({...formData, numberPrefix: e.target.value})} />
                          <div className="relative flex-1">
                            <Input className="h-9 bg-white border-slate-200 text-xs font-bold w-full text-center pl-8" placeholder="1" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                          </div>
                          <Input className="h-9 bg-slate-100 border-slate-200 text-[9px] font-bold w-20 text-center uppercase" placeholder="Postfix" value={formData.numberPostfix} onChange={(e)=>setFormData({...formData, numberPostfix: e.target.value})} />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Order Date <span className="text-red-500">*</span></Label>
                        <div className="col-span-8"><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-9 border-slate-200 bg-white" /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Challan No.</Label>
                        <div className="col-span-8"><Input className="h-9 bg-white border-slate-200 text-xs font-bold" value={formData.challanNo} onChange={(e)=>setFormData({...formData, challanNo: e.target.value})} /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Challan Date</Label>
                        <div className="col-span-8"><DatePicker value={formData.challanDate} onChange={(val)=>setFormData({...formData, challanDate: val})} className="h-9 border-slate-200 bg-white" /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">L.R. No.</Label>
                        <div className="col-span-8"><Input className="h-9 bg-white border-slate-200 text-xs font-bold" value={formData.lrNo} onChange={(e)=>setFormData({...formData, lrNo: e.target.value})} /></div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 pt-3 border-t">
                        <Label className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Delivery</Label>
                        <div className="col-span-8">
                          <Select value={formData.deliveryMode} onValueChange={(val) => setFormData({...formData, deliveryMode: val})}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-xs font-bold uppercase"><SelectValue placeholder="Select Delivery Mode" /></SelectTrigger>
                            <SelectContent><SelectItem value="Truck">Road (Truck)</SelectItem><SelectItem value="Courier">Courier</SelectItem><SelectItem value="Hand">Hand Delivery</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-4 bg-slate-50/50 border-b flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Commercial Line Items</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase">Discount:</Label>
                        <div className="flex gap-1">
                          <button className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", formData.items?.[0]?.discountType === 'amount' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}>Rs</button>
                          <button className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", formData.items?.[0]?.discountType === 'percentage' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}>%</button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400"><Settings2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="border-collapse">
                      <TableHeader className="bg-white">
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-10 text-center">SR.</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3">PRODUCT / OTHER CHARGES</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-20 text-center">QTY.</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-20 text-center">UOM</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-28 text-center">PRICE (RS)</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-20 text-center">DISCOUNT</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-20 text-center">IGST</TableHead>
                          <TableHead className="text-[8px] font-bold uppercase text-slate-400 py-2 px-3 w-28 text-right">TOTAL</TableHead>
                          <TableHead className="w-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items?.map((item, idx) => (
                          <TableRow key={item.id} className="border-b hover:bg-slate-50/30 transition-all">
                            <TableCell className="text-center text-xs font-bold text-slate-400">{idx + 1}</TableCell>
                            <TableCell className="p-3 space-y-1.5">
                              <Input className="h-8 border-slate-200 text-xs font-bold" placeholder="Enter Product name" value={item.description} onChange={(e)=>updateItem(item.id, 'description', e.target.value)} />
                              <Input className="h-6 bg-slate-50 border-none text-[9px] font-medium" placeholder="Item Note..." value={item.note} onChange={(e)=>updateItem(item.id, 'note', e.target.value)} />
                            </TableCell>
                            <TableCell className="px-1.5"><Input type="number" className="h-8 text-center text-xs font-bold" value={item.qty} onChange={(e)=>updateItem(item.id, 'qty', Number(e.target.value))} /></TableCell>
                            <TableCell className="px-1.5"><Input className="h-8 text-center text-xs font-bold uppercase" value={item.unit} onChange={(e)=>updateItem(item.id, 'unit', e.target.value)} /></TableCell>
                            <TableCell className="px-1.5"><Input type="number" className="h-8 text-center text-xs font-bold text-primary" value={item.price} onChange={(e)=>updateItem(item.id, 'price', Number(e.target.value))} /></TableCell>
                            <TableCell className="px-1.5"><Input type="number" className="h-8 text-center text-xs font-bold text-emerald-600" value={item.discount} onChange={(e)=>updateItem(item.id, 'discount', Number(e.target.value))} /></TableCell>
                            <TableCell className="px-1.5">
                               <Select value={item.gstRate.toString()} onValueChange={(val)=>updateItem(item.id, 'gstRate', Number(val))}>
                                  <SelectTrigger className="h-8 text-[9px] font-bold border-slate-200"><SelectValue /></SelectTrigger>
                                  <SelectContent>{[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()} className="text-[9px] font-bold">{r}%</SelectItem>)}</SelectContent>
                               </Select>
                            </TableCell>
                            <TableCell className="text-right font-display font-bold text-slate-700 px-3 text-xs">
                              ₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="px-1.5"><Button variant="ghost" size="icon" className="h-7 w-7 text-slate-200 hover:text-red-500" onClick={()=>handleRemoveItem(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-yellow-50/30">
                          <TableCell colSpan={2} className="py-2 px-4 text-[9px] font-bold text-slate-500 uppercase text-right">Total Order Val:</TableCell>
                          <TableCell className="text-center text-xs font-bold text-slate-900">{formData.items?.reduce((acc, i)=>acc+i.qty,0) || 0}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-center text-xs font-bold text-slate-900">{(formData.subTotal || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-center text-xs font-bold text-slate-900">{(formData.discountTotal || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-center text-xs font-bold text-slate-900">{(formData.taxTotal || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-display font-black text-slate-900 px-3 text-xs">₹ {(formData.amount || 0).toLocaleString()}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="p-3 border-t bg-white flex justify-start">
                     <Button variant="ghost" onClick={handleAddItem} className="h-8 px-4 rounded-xl text-primary font-bold uppercase text-[8px] tracking-widest gap-2 hover:bg-primary/5">
                        <Plus className="h-3.5 w-3.5" /> Add New Row
                     </Button>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                   <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-3xl">
                         <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Terms & Condition / Additional Note</h4>
                         <div className="space-y-3">
                            <div className="space-y-1.5">
                               <Label className="text-[8px] font-bold uppercase text-slate-400">Title</Label>
                               <Input className="h-8 bg-slate-50 border-slate-200 text-xs font-bold" value={formData.paymentTerms} onChange={(e)=>setFormData({...formData, paymentTerms: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <Label className="text-[8px] font-bold uppercase text-slate-400">Detail</Label>
                               <Textarea className="min-h-[80px] bg-slate-50 border-slate-200 text-xs font-medium p-3 resize-none" value={formData.note} onChange={(e)=>setFormData({...formData, note: e.target.value})} />
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-3xl">
                         <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Document Note / Remarks</h4>
                         <Textarea className="min-h-[60px] bg-slate-50 border-slate-200 text-xs font-medium p-3 resize-none" placeholder="Not Visible on Print" />
                      </div>
                   </div>

                   <div className="lg:col-span-5 space-y-4">
                      <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                         <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                               <span>Taxable</span>
                               <span>₹ {((formData.subTotal || 0) - (formData.discountTotal || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <button className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1 hover:underline"><Plus className="h-2.5 w-2.5" /> Add Additional Charge</button>
                            
                            <div className="pt-4 border-t space-y-3">
                               <div className="flex justify-between items-center text-[11px] font-black text-slate-800 uppercase">
                                  <span>Total Taxable</span>
                                  <span>₹ {((formData.subTotal || 0) - (formData.discountTotal || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                               </div>
                               <div className="flex justify-between items-center text-[11px] font-black text-slate-800 uppercase">
                                  <span>Total Tax</span>
                                  <span>₹ {(formData.taxTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                               </div>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                               <div className="flex gap-3 items-center">
                                  <div className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase">TCS</span>
                                     <div className="flex items-center gap-1.5">
                                        <Input type="number" className="w-14 h-7 text-center bg-white font-bold text-xs" value={formData.tcsRate} onChange={(e)=>setFormData(calculateTotals({...formData, tcsRate: Number(e.target.value)}))} />
                                        <span className="text-[9px] font-bold">%</span>
                                     </div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">₹ {(formData.tcsAmount || 0).toFixed(2)}</span>
                               </div>
                            </div>

                            <div className="pt-4 border-t flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold text-slate-800 uppercase">Round Off</span>
                                  <Switch checked={formData.isRoundOffActive} onCheckedChange={(val)=>setFormData(calculateTotals({...formData, isRoundOffActive: val}))} />
                               </div>
                               <span className="text-xs font-bold text-slate-800">{(formData.roundOff || 0).toFixed(2)}</span>
                            </div>

                            <div className="pt-6 mt-2 border-t-4 border-slate-900 flex justify-between items-center bg-yellow-50/30 p-3 -mx-6">
                               <span className="text-base font-black text-slate-900 uppercase tracking-tighter">Grand Total</span>
                               <span className="text-2xl font-display font-black text-slate-900">₹ {(formData.amount || 0).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="pt-4 text-center space-y-1">
                               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total in Words</p>
                               <p className="text-[10px] font-bold text-[#001F3D] uppercase flex items-center justify-center gap-2">
                                  <DollarSign className="h-3 w-3 text-primary" /> INDIAN RUPEES ONLY
                               </p>
                            </div>
                         </div>
                      </Card>

                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-100 transition-all">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm"><Sparkles className="h-3.5 w-3.5" /></div>
                            <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest">Smart Suggestion Protocol</span>
                         </div>
                         <Plus className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-90 transition-transform" />
                      </div>
                   </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-4 bg-white border-t flex items-center justify-between shrink-0">
             <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)} className="h-10 px-6 font-bold uppercase text-[9px] tracking-widest text-slate-400 border border-slate-200 rounded-lg flex items-center gap-2">
                  <X className="h-3.5 w-3.5" /> Close
                </Button>
                {!isPaymentType && (
                  <Button variant="outline" className="h-10 px-6 border-slate-200 text-slate-600 font-bold uppercase text-[9px] tracking-widest gap-2 shadow-sm hover:bg-slate-50"><Save className="h-3.5 w-3.5" /> Save Draft</Button>
                )}
             </div>
             <div className="flex gap-2">
                {!isPaymentType && (
                  <Button className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg flex gap-2"><Printer className="h-3.5 w-3.5" /> Save & Print</Button>
                )}
                <Button 
                  onClick={handleSave}
                  className="h-10 px-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg flex gap-2"
                >
                  <Save className="h-3.5 w-3.5" /> {editingRecordId ? 'Update' : 'Save'}
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Node */}
      <div className="fixed bottom-12 right-12 z-[100] print:hidden">
        <Button 
          onClick={() => handleOpenForm('invoice')}
          className="h-20 w-20 rounded-[2.5rem] bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:scale-110 hover:-rotate-12 transition-all flex items-center justify-center border-4 border-white/10"
        >
          <Plus className="h-10 w-10" />
        </Button>
      </div>
    </div>
  );
}
