
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BookOpen,
  FileDown,
  Download,
  Share2,
  Copy,
  Eye,
  MoreHorizontal,
  ChevronRightSquare,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Briefcase,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet,
  Database,
  FileUp,
  Columns,
  ClipboardCopy,
  Zap,
  Percent,
  Calculator,
  LayoutDashboard,
  Wallet
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem, InventoryItem, ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, isWithinInterval, format, startOfToday, startOfWeek, startOfYear } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  inventory: InventoryItem[];
  permissions: Record<string, PermissionLevel>;
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onTabChange?: (tab: ViewType) => void;
  uiSettings: UISettings;
}

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

function numberToWords(num: number): string {
  if (num === 0) return "ZERO RUPEES ONLY";
  const single = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const double = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  function convert(n: number): string {
    if (n < 20) return single[n];
    if (n < 100) return double[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + single[n % 10] : "");
    if (n < 1000) return single[Math.floor(n / 100)] + " HUNDRED" + (n % 100 !== 0 ? " AND " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " THOUSAND" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " LAKH" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(num)) + " RUPEES ONLY";
  }
  return (convert(Math.floor(num)) + " RUPEES ONLY").trim();
}

export function BillingManagement({ customers, vendors, records, orders, users, inventory, permissions, onSaveRecord, onDeleteRecord, onTabChange, uiSettings }: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState<'quick' | 'analytics'>('quick');
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingLogId] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [previewRecord, setPreviewRecord] = useState<BillingRecord | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGst, setSearchGst] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

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
    paymentTerms: 'Standard Terms & Conditions',
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
    transportationCharges: 0,
  });

  useEffect(() => {
    setLastSyncTime(new Date().toLocaleString());
  }, [records]);

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
        paymentTerms: 'Standard Terms & Conditions apply.',
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
        transportationCharges: 0,
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
    setFormData(prev => {
      const updated = { ...prev, items: [...(prev.items || []), newItem] };
      return calculateTotals(updated);
    });
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => {
      const items = prev.items?.filter(i => i.id !== id) || [];
      return calculateTotals({ ...prev, items });
    });
  };

  const handleDuplicateRow = (id: string) => {
    const item = formData.items?.find(i => i.id === id);
    if (!item) return;
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setFormData(prev => {
      const updated = { ...prev, items: [...(prev.items || []), newItem] };
      return calculateTotals(updated);
    });
    toast({ title: "Node Duplicated", description: "Line item cloned in current matrix." });
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
    const subTotal = items.reduce((acc, i) => acc + ((i.qty || 0) * (i.price || 0)), 0);
    let discountTotal = 0;
    items.forEach(i => {
      const base = (i.qty || 0) * (i.price || 0);
      if (i.discountType === 'percentage') {
        discountTotal += base * ((i.discount || 0) / 100);
      } else {
        discountTotal += (i.discount || 0);
      }
    });
    const taxableTotal = subTotal - discountTotal + (data.transportationCharges || 0);
    const taxTotal = items.reduce((acc, i) => {
      const itemBase = (i.qty || 0) * (i.price || 0);
      const itemTaxable = itemBase - (i.discountType === 'percentage' ? (itemBase * ((i.discount || 0) / 100)) : (i.discount || 0));
      return acc + (itemTaxable * ((i.gstRate || 0) / 100));
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
    return { 
      ...data, 
      items: items.map(i => {
        const itemBase = (i.qty || 0) * (i.price || 0);
        const itemTaxable = itemBase - (i.discountType === 'percentage' ? (itemBase * ((i.discount || 0) / 100)) : (i.discount || 0));
        return { ...i, total: itemTaxable + (itemTaxable * ((i.gstRate || 0) / 100)) };
      }), 
      subTotal, discountTotal, taxTotal, amount: finalAmount, tcsAmount, roundOff 
    };
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." });
      return;
    }
    const invalidItems = formData.items?.some(i => !i.description || (i.qty || 0) <= 0 || (i.price || 0) <= 0);
    if (invalidItems && !activeRecordType.includes('payment')) {
      toast({ variant: "destructive", title: "Data Error", description: "All line items must have a description, positive quantity, and price." });
      return;
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} #${formData.numberPrefix}-${formData.number}-${formData.numberPostfix} committed.` });
    setIsRecordFormOpen(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const docTabs = DOCUMENT_TYPES.map(d => d.id);
      if (docTabs.includes(activeTab) && r.type !== activeTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (searchGst && !(r.gstNumber || '').toLowerCase().includes(searchGst.toLowerCase())) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      const recordDate = parseISO(r.date);
      if (dateFilter === 'today' && !isWithinInterval(recordDate, { start: startOfToday(), end: new Date() })) return false;
      if (dateFilter === 'week' && !isWithinInterval(recordDate, { start: startOfWeek(new Date()), end: new Date() })) return false;
      if (dateFilter === 'month' && !isWithinInterval(recordDate, { start: startOfMonth(new Date()), end: new Date() })) return false;
      if (dateFilter === 'year' && !isWithinInterval(recordDate, { start: startOfYear(new Date()), end: new Date() })) return false;
      return true;
    });
  }, [records, searchTerm, searchGst, dateFilter, statusFilter, activeTab]);

  const summaryMetrics = useMemo(() => {
    const list = filteredRecords;
    return {
      count: list.length,
      total: list.reduce((sum, r) => sum + (r.amount || 0), 0),
      pending: list.filter(r => r.status === 'Pending' || r.status === 'Draft').length,
      approved: list.filter(r => r.status === 'Approved' || r.status === 'Paid').length,
    };
  }, [filteredRecords]);

  const dashboardMetrics = useMemo(() => {
    const today = startOfToday();
    const monthStart = startOfMonth(new Date());
    const todaySales = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), {start: today, end: new Date()})).reduce((sum, r) => sum + r.amount, 0);
    const monthlySales = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), {start: monthStart, end: new Date()})).reduce((sum, r) => sum + r.amount, 0);
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const totalOrders = orders.length || 1;
    const conversion = Math.round((completedOrders / totalOrders) * 100);
    const pendingCollections = records.filter(r => r.type === 'invoice' && r.status !== 'Paid').reduce((sum, r) => sum + r.amount, 0);
    const pendingPayments = records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').reduce((sum, r) => sum + r.amount, 0);
    return { todaySales, monthlySales, conversion, pendingCollections, pendingPayments };
  }, [records, orders]);

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Pending': return "bg-orange-50 text-orange-700 border-orange-100";
      case 'Approved': case 'Paid': return "bg-green-50 text-green-700 border-green-100";
      case 'Rejected': return "bg-red-50 text-red-700 border-red-100";
      case 'Draft': return "bg-slate-100 text-slate-500 border-slate-200";
      case 'Expired': return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case 'Converted': return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const currentTabLabel = useMemo(() => MAIN_TABS.find(t => t.id === activeTab)?.label || 'Document', [activeTab]);

  const FullPageEditor = () => {
    const isPaymentType = activeRecordType === 'inward_payment' || activeRecordType === 'outward_payment';
    const [visibleCols, setVisibleCols] = useState({ hsn: true, discount: true, gst: true });
    const toggleCol = (col: 'hsn' | 'discount' | 'gst') => setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }));
    
    if (isPaymentType) {
      return (
        <div className="flex flex-col bg-white min-h-full animate-in fade-in duration-300 pb-20 font-body">
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#001F3D] rounded text-white shadow-sm">
                <Banknote className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-[#001F3D] uppercase tracking-tight">
                {editingRecordId ? 'Edit' : 'Create'} {DOCUMENT_TYPES.find(d => d.id === activeRecordType)?.label}
              </h2>
            </div>
            <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)}><X className="h-5 w-5 mr-2" /> Back to Ledger</Button>
          </div>

          <div className="max-w-4xl mx-auto w-full p-8 space-y-8 mt-4">
            <div className="grid grid-cols-12 items-center gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase">Receipt No <span className="text-red-500">*</span></Label>
              <div className="col-span-9 flex gap-2">
                <Input className="h-9 bg-slate-50 border-slate-300 text-[10px] font-bold w-28 uppercase px-3 rounded-none" value={formData.numberPrefix || ''} onChange={(e)=>setFormData({...formData, numberPrefix: e.target.value})} />
                <Input className="h-9 border-slate-300 text-xs font-bold flex-1 px-3 rounded-none" value={formData.number || ''} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                <Input className="h-9 bg-slate-50 border-slate-300 text-[10px] font-bold w-28 uppercase px-3 rounded-none" value={formData.numberPostfix || ''} onChange={(e)=>setFormData({...formData, numberPostfix: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-12 items-center gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase">Company Name <span className="text-red-500">*</span></Label>
              <div className="col-span-9">
                <Select value={formData.customerId || ''} onValueChange={(id) => {
                  const identity = customers.find(c => c.id === id) || vendors.find(v => v.id === id);
                  setFormData({
                    ...formData, customerId: id, customerName: identity?.name || '', shipTo: identity?.address || '',
                    contactPerson: (identity as any)?.contactPerson || (identity as any)?.contact || '',
                    contactNumber: (identity as any)?.contactNumber || (identity as any)?.contact || '',
                    gstNumber: identity?.gstNumber || '', panNumber: (identity as any)?.pan || ''
                  });
                }}>
                  <SelectTrigger className="h-9 border-slate-300 rounded-none text-xs font-bold uppercase"><SelectValue placeholder="Identify Partner..." /></SelectTrigger>
                  <SelectContent>{[...customers, ...vendors].map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-12 items-start gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase mt-2">Address</Label>
              <div className="col-span-9"><Textarea className="min-h-[60px] border-slate-300 rounded-none p-3 text-xs font-medium resize-none bg-slate-50" readOnly value={formData.shipTo || ''} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-12 items-center gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase">Payment Date <span className="text-red-500">*</span></Label>
              <div className="col-span-9"><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-9 rounded-none" /></div>
            </div>
            <div className="grid grid-cols-12 items-center gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase">Amount <span className="text-red-500">*</span></Label>
              <div className="col-span-9"><Input type="number" className="h-9 border-slate-300 rounded-none text-sm font-bold" value={formData.amount || 0} onChange={(e)=>setFormData({...formData, amount: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-12 items-center gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase">Payment Type <span className="text-red-500">*</span></Label>
              <div className="col-span-9">
                <Select value={formData.paymentMethod || ''} onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}>
                  <SelectTrigger className="h-9 border-slate-300 rounded-none text-xs font-bold uppercase"><SelectValue placeholder="Select Payment Type" /></SelectTrigger>
                  <SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-12 items-center gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase">Remarks</Label>
              <div className="col-span-9"><Input className="h-9 border-slate-300 rounded-none text-xs font-medium" value={formData.note || ''} onChange={(e)=>setFormData({...formData, note: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-12 items-start gap-6">
              <Label className="col-span-3 text-xs font-bold text-slate-600 uppercase mt-2">Attachment</Label>
              <div className="col-span-9">
                <div className="h-24 border-2 border-dashed border-slate-300 rounded-none flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 group cursor-pointer hover:bg-white transition-all">
                  <Upload className="h-5 w-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Click To Upload Payment Proof</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white flex justify-end gap-3 z-50 shadow-lg">
             <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)} className="h-10 px-8 font-bold uppercase text-xs rounded-none border border-slate-300">Back</Button>
             <Button className="h-10 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs rounded-none shadow-lg" onClick={handleSave}>Save</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col bg-[#F8FAFC] min-h-screen animate-in fade-in duration-300 pb-40 font-body">
        <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#001F3D] rounded text-white shadow-sm">
              <Receipt className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[#001F3D] uppercase tracking-tighter">
              {editingRecordId ? 'Edit' : 'Create'} {currentTabLabel} Matrix
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
        </div>

        <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-300 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest border-b pb-3 mb-4 flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> Customer Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">M/S <span className="text-red-500">*</span></Label>
                  <div className="col-span-8">
                    <Select value={formData.customerId || ''} onValueChange={(id) => {
                      const identity = customers.find(c => c.id === id) || vendors.find(v => v.id === id);
                      setFormData({
                        ...formData, customerId: id, customerName: identity?.name || '', shipTo: identity?.address || '',
                        contactPerson: (identity as any)?.contactPerson || (identity as any)?.contact || '',
                        contactNumber: (identity as any)?.contactNumber || (identity as any)?.contact || '',
                        gstNumber: identity?.gstNumber || '', panNumber: (identity as any)?.pan || ''
                      });
                    }}>
                      <SelectTrigger className="h-8 border-slate-300 rounded-none text-xs font-bold uppercase"><SelectValue placeholder="Identify Partner..." /></SelectTrigger>
                      <SelectContent>{[...customers, ...vendors].map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-12 items-start gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase mt-2">Address</Label>
                  <div className="col-span-8"><Textarea className="min-h-[60px] border-slate-300 rounded-none text-xs p-2 bg-slate-50" value={formData.shipTo || ''} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Contact Person</Label>
                  <div className="col-span-8"><Input className="h-8 border-slate-300 rounded-none text-xs" value={formData.contactPerson || ''} onChange={(e)=>setFormData({...formData, contactPerson: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Phone No</Label>
                  <div className="col-span-8"><Input className="h-8 border-slate-300 rounded-none text-xs" value={formData.contactNumber || ''} onChange={(e)=>setFormData({...formData, contactNumber: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">GSTIN / PAN</Label>
                  <div className="col-span-8 flex gap-2">
                    <Input className="h-8 border-slate-300 rounded-none text-xs uppercase" value={formData.gstNumber || ''} onChange={(e)=>setFormData({...formData, gstNumber: e.target.value})} />
                    <Input className="h-8 border-slate-300 rounded-none text-xs uppercase" placeholder="PAN" value={formData.panNumber || ''} onChange={(e)=>setFormData({...formData, panNumber: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Rev. Charge</Label>
                  <div className="col-span-8">
                     <Select value={formData.revCharge || 'No'} onValueChange={(val: any) => setFormData({...formData, revCharge: val})}>
                        <SelectTrigger className="h-8 border-slate-300 rounded-none text-xs uppercase"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                     </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-300 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest border-b pb-3 mb-4 flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Quotation Detail</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Document No <span className="text-red-500">*</span></Label>
                  <div className="col-span-8 flex gap-1">
                    <Input className="h-8 border-slate-300 rounded-none text-[10px] font-bold w-20 text-center uppercase" value={formData.numberPrefix || ''} onChange={(e)=>setFormData({...formData, numberPrefix: e.target.value})} />
                    <Input className="h-8 border-slate-300 rounded-none text-xs font-bold flex-1 text-center" value={formData.number || ''} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                    <Input className="h-8 border-slate-300 rounded-none text-[10px] font-bold w-20 text-center uppercase" value={formData.numberPostfix || ''} onChange={(e)=>setFormData({...formData, numberPostfix: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Document Date <span className="text-red-500">*</span></Label>
                  <div className="col-span-8"><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-8 rounded-none" /></div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Challan No & Date</Label>
                  <div className="col-span-8 flex gap-2">
                    <Input className="h-8 border-slate-300 rounded-none text-xs" value={formData.challanNo || ''} onChange={(e)=>setFormData({...formData, challanNo: e.target.value})} />
                    <DatePicker value={formData.challanDate} onChange={(val)=>setFormData({...formData, challanDate: val})} className="h-8 rounded-none flex-1" />
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">L.R. No</Label>
                  <div className="col-span-8"><Input className="h-8 border-slate-300 rounded-none text-xs" value={formData.lrNo || ''} onChange={(e)=>setFormData({...formData, lrNo: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Delivery Mode</Label>
                  <div className="col-span-8">
                    <Select value={formData.deliveryMode || ''} onValueChange={(val) => setFormData({...formData, deliveryMode: val})}>
                      <SelectTrigger className="h-8 border-slate-300 rounded-none text-xs uppercase"><SelectValue placeholder="Select Mode" /></SelectTrigger>
                      <SelectContent><SelectItem value="Truck">Road (Truck)</SelectItem><SelectItem value="Courier">Courier</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-300 overflow-hidden shadow-sm">
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent border-b border-slate-300">
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-12 text-center border-r border-slate-300">SR.</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-4 border-r border-slate-300 min-w-[300px]">Product / Other Charges</TableHead>
                  {visibleCols.hsn && <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-4 w-32 border-r border-slate-300">HSN/SAC</TableHead>}
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-24 text-center border-r border-slate-300">Qty.</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-24 text-center border-r border-slate-300">UOM</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-32 text-center border-r border-slate-300">Price</TableHead>
                  {visibleCols.discount && <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-28 text-center border-r border-slate-300">Discount</TableHead>}
                  {visibleCols.gst && <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-28 text-center border-r border-slate-300">IGST (%)</TableHead>}
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-4 w-40 text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items?.map((item, idx) => (
                  <TableRow key={item.id} className="border-b border-slate-300 align-top group">
                    <TableCell className="text-center text-xs font-bold text-slate-400 border-r border-slate-300 py-4">{idx + 1}</TableCell>
                    <TableCell className="p-0 border-r border-slate-300">
                      <div className="flex flex-col">
                        <Input placeholder="Enter Product name" className="h-10 border-none bg-white text-xs font-bold px-4 rounded-none" value={item.description || ''} onChange={(e)=>updateItem(item.id, 'description', e.target.value)} />
                        <Textarea placeholder="Item Note..." className="min-h-[60px] border-none bg-slate-50/50 text-[10px] px-4 py-2 rounded-none resize-none" value={item.note || ''} onChange={(e)=>updateItem(item.id, 'note', e.target.value)} />
                      </div>
                    </TableCell>
                    {visibleCols.hsn && <TableCell className="p-0 border-r border-slate-300"><Input className="h-10 border-none bg-transparent text-xs text-center font-code rounded-none" value={item.hsn || ''} onChange={(e)=>updateItem(item.id, 'hsn', e.target.value)} /></TableCell>}
                    <TableCell className="p-0 border-r border-slate-300"><Input type="number" className="h-10 text-center text-xs border-none bg-transparent rounded-none font-bold" value={item.qty || 0} onChange={(e)=>updateItem(item.id, 'qty', Number(e.target.value))} /></TableCell>
                    <TableCell className="p-0 border-r border-slate-300"><Input className="h-10 text-center text-xs border-none bg-transparent rounded-none" value={item.unit || ''} onChange={(e)=>updateItem(item.id, 'unit', e.target.value)} /></TableCell>
                    <TableCell className="p-0 border-r border-slate-300"><Input type="number" className="h-10 text-center text-xs border-none bg-transparent rounded-none font-bold text-primary" value={item.price || 0} onChange={(e)=>updateItem(item.id, 'price', Number(e.target.value))} /></TableCell>
                    {visibleCols.discount && <TableCell className="p-0 border-r border-slate-300"><div className="flex items-center"><Input type="number" className="h-10 text-center text-xs border-none bg-transparent rounded-none w-full" value={item.discount || 0} onChange={(e)=>updateItem(item.id, 'discount', Number(e.target.value))} /><button className="px-2 text-[8px] font-bold text-slate-400" onClick={() => updateItem(item.id, 'discountType', item.discountType === 'percentage' ? 'amount' : 'percentage')}>{item.discountType === 'percentage' ? '%' : '₹'}</button></div></TableCell>}
                    {visibleCols.gst && <TableCell className="p-0 border-r border-slate-300"><Input type="number" className="h-10 text-center text-xs border-none bg-transparent rounded-none" value={item.gstRate || 0} onChange={(e)=>updateItem(item.id, 'gstRate', Number(e.target.value))} /></TableCell>}
                    <TableCell className="text-right px-4 text-xs font-bold py-4">₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="p-1 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-yellow-100/50 hover:bg-yellow-100/50 border-t-2 border-slate-300">
                  <TableCell colSpan={2} className="text-right font-black text-[10px] uppercase text-[#001F3D] py-4 px-6 border-r border-slate-300">Total Quotation Val.</TableCell>
                  {visibleCols.hsn && <TableCell className="border-r border-slate-300"></TableCell>}
                  <TableCell className="text-center font-bold text-xs border-r border-slate-300">{formData.items?.reduce((acc, i) => acc + (i.qty || 0), 0)}</TableCell>
                  <TableCell className="border-r border-slate-300"></TableCell>
                  <TableCell className="text-center font-bold text-xs border-r border-slate-300">₹ {formData.items?.reduce((acc, i) => acc + (i.price || 0), 0).toLocaleString()}</TableCell>
                  {visibleCols.discount && <TableCell className="text-center font-bold text-xs border-r border-slate-300">₹ {formData.discountTotal?.toLocaleString()}</TableCell>}
                  {visibleCols.gst && <TableCell className="text-center font-bold text-xs border-r border-slate-300">₹ {formData.taxTotal?.toLocaleString()}</TableCell>}
                  <TableCell className="text-right font-black text-sm text-[#001F3D] px-4">₹ {(formData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="p-4 border-t bg-white flex justify-start">
               <Button variant="ghost" onClick={handleAddItem} className="h-9 px-6 rounded-xl text-primary font-bold uppercase text-[9px] tracking-widest gap-2 hover:bg-primary/5"><Plus className="h-4 w-4" /> Add Row</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white border border-slate-300 p-6 space-y-6">
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Bank Interface Selection</Label><Select><SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-none text-xs font-bold uppercase"><SelectValue placeholder="Hide Bank Details" /></SelectTrigger><SelectContent><SelectItem value="none">Hide Bank Details</SelectItem></SelectContent></Select></div>
              <div className="space-y-4 border-t pt-6">
                 <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Terms & Condition / Additional Note</h4>
                 <div className="space-y-3"><Input placeholder="Title (e.g. Validity)" className="h-10 border-slate-200 rounded-none text-xs font-bold" /><Textarea placeholder="Detail (e.g. Subject to our home jurisdiction...)" className="min-h-[80px] border-slate-200 rounded-none text-xs font-medium" /><Button variant="outline" size="sm" className="h-9 rounded-none font-bold uppercase text-[9px] tracking-widest gap-2"><Plus className="h-3.5 w-3.5" /> Add Notes</Button></div>
              </div>
              <div className="space-y-2 border-t pt-6"><Label className="text-[10px] font-bold uppercase text-slate-400">Internal Document Note / Remarks</Label><Textarea className="min-h-[80px] border-slate-200 rounded-none text-xs font-medium bg-slate-50/50" placeholder="Not Visible on Print" value={formData.note || ''} onChange={(e)=>setFormData({...formData, note: e.target.value})} /></div>
            </div>
            <div className="bg-white border border-slate-300 p-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-600"><span>Taxable Value</span><span className="font-code">₹ {(formData.subTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                 <div className="pt-2 flex justify-between items-center text-xs font-bold uppercase text-emerald-600 cursor-pointer hover:underline"><span className="flex items-center gap-2"><Plus className="h-3 w-3" /> Add Additional Charge</span><span>₹ {(formData.transportationCharges || 0).toLocaleString()}</span></div>
                 <div className="pt-4 border-t flex justify-between items-center text-xs font-black uppercase text-[#001F3D]"><span>Total Taxable</span><span className="font-code">₹ {(formData.subTotal! - formData.discountTotal! + (formData.transportationCharges || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                 <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-600"><span>Total Tax (GST)</span><span className="text-primary font-code">₹ {(formData.taxTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                 <div className="flex justify-between items-center pt-4 border-t"><span className="text-[10px] font-bold uppercase text-slate-500">Automatic Round Off</span><Switch checked={formData.isRoundOffActive} onCheckedChange={(val)=>setFormData({...formData, isRoundOffActive: val})} /></div>
              </div>
              <div className="bg-yellow-400 p-6 flex justify-between items-center -mx-8 shadow-inner"><div className="space-y-1"><span className="text-xs font-black uppercase text-[#001F3D] tracking-tighter">Grand Total Settlement</span><p className="text-[8px] font-bold text-[#001F3D]/60 uppercase">Final Valuation Matrix</p></div><span className="text-4xl font-display font-black text-[#001F3D] tracking-tighter">₹ {(formData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              <div className="space-y-4 pt-4"><div className="space-y-2"><span className="text-[10px] font-bold uppercase text-slate-400">Total in Words</span><p className="text-11px font-bold text-slate-700 bg-slate-50 p-4 border border-slate-100 rounded-lg leading-relaxed shadow-inner">{numberToWords(formData.amount || 0)}</p></div></div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white flex justify-between items-center z-50 shadow-lg">
           <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)} className="h-12 px-10 font-bold uppercase text-[10px] tracking-widest border border-slate-200 rounded-xl">Back</Button>
             <Button variant="outline" className="h-12 px-10 font-bold uppercase text-[10px] tracking-widest border border-slate-200 rounded-xl">Save Draft</Button>
           </div>
           <div className="flex items-center gap-4">
             <Button className="h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-xl flex gap-3"><Printer className="h-4 w-4" /> Save & Print</Button>
             <Button className="h-12 px-12 bg-[#001F3D] hover:bg-black text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-xl flex gap-3" onClick={handleSave}><Save className="h-4 w-4" /> Commit to Ledger</Button>
           </div>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const modules = [
      { id: 'quotation', label: 'Quotation', icon: FileBox, color: 'text-blue-500', bg: 'bg-blue-50', counts: { total: records.filter(r => r.type === 'quotation').length, pending: records.filter(r => r.type === 'quotation' && r.status === 'Pending').length } },
      { id: 'sale_order', label: 'Sales Order', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', counts: { total: records.filter(r => r.type === 'sale_order').length, pending: records.filter(r => r.type === 'sale_order' && r.status === 'Pending').length } },
      { id: 'purchase_order', label: 'Purchase Order', icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-50', counts: { total: records.filter(r => r.type === 'purchase_order').length, pending: records.filter(r => r.type === 'purchase_order' && r.status === 'Pending').length } },
      { id: 'invoice', label: 'Sales Invoice', icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-50', counts: { total: records.filter(r => r.type === 'invoice').length, unpaid: records.filter(r => r.type === 'invoice' && r.status !== 'Paid').length } },
      { id: 'purchase_invoice', label: 'Purchase Invoice', icon: ShoppingCart, color: 'text-rose-500', bg: 'bg-rose-50', counts: { total: records.filter(r => r.type === 'purchase_invoice').length, unpaid: records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').length } },
      { id: 'delivery_challan', label: 'Delivery Challan', icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-50', counts: { total: records.filter(r => r.type === 'delivery_challan').length, pending: records.filter(r => r.type === 'delivery_challan' && r.status === 'Pending').length } },
      { id: 'proforma', label: 'Proforma', icon: FileCheck, color: 'text-purple-500', bg: 'bg-purple-50', counts: { total: records.filter(r => r.type === 'proforma').length, pending: records.filter(r => r.type === 'proforma' && r.status === 'Pending').length } },
      { id: 'credit_note', label: 'Credit Note', icon: ArrowDownLeft, color: 'text-slate-500', bg: 'bg-slate-50', counts: { total: records.filter(r => r.type === 'credit_note').length, value: records.filter(r => r.type === 'credit_note').reduce((s, x) => s + x.amount, 0) } },
      { id: 'debit_note', label: 'Debit Note', icon: ArrowUpRight, color: 'text-slate-500', bg: 'bg-slate-50', counts: { total: records.filter(r => r.type === 'debit_note').length, value: records.filter(r => r.type === 'debit_note').reduce((s, x) => s + x.amount, 0) } },
      { id: 'inward_payment', label: 'Inward Payment', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-100', counts: { total: records.filter(r => r.type === 'inward_payment').length, value: records.filter(r => r.type === 'inward_payment').reduce((s, x) => s + x.amount, 0) } },
      { id: 'outward_payment', label: 'Outward Payment', icon: ArrowUpRight, color: 'text-rose-600', bg: 'bg-rose-100', counts: { total: records.filter(r => r.type === 'outward_payment').length, value: records.filter(r => r.type === 'outward_payment').reduce((s, x) => s + x.amount, 0) } },
      { id: 'customer', label: 'Customer Master', icon: Building2, color: 'text-blue-700', bg: 'bg-blue-100', counts: { total: customers.length, active: customers.filter(c => c.status !== 'Closed').length } },
      { id: 'vendor', label: 'Vendor Master', icon: Truck, color: 'text-orange-700', bg: 'bg-orange-100', counts: { total: vendors.length, active: vendors.filter(v => v.status === 'Active').length } },
      { id: 'inventory', label: 'Product Master', icon: Package, color: 'text-indigo-700', bg: 'bg-indigo-100', counts: { total: inventory.length, low: inventory.filter(i => i.status === 'Low Stock').length } },
      { id: 'job_work', label: 'Job Work', icon: Briefcase, color: 'text-slate-700', bg: 'bg-slate-100', counts: { total: orders.length, active: orders.filter(o => o.status === 'Active').length } },
      { id: 'service_request', label: 'Service Request', icon: Settings2, color: 'text-teal-700', bg: 'bg-teal-100', counts: { total: 0, pending: 0 } },
    ];
    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700 font-body">
        <div className="flex justify-center"><div className="bg-slate-100 p-1 rounded-full flex gap-1 border border-slate-200 shadow-inner"><button onClick={() => setDashboardView('analytics')} className={cn("px-8 py-2 rounded-full text-[10px] font-bold uppercase transition-all", dashboardView === 'analytics' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>Analytics</button><button onClick={() => setDashboardView('quick')} className={cn("px-8 py-2 rounded-full text-[10px] font-bold uppercase transition-all", dashboardView === 'quick' ? "bg-primary text-white shadow-sm shadow-primary/20" : "text-slate-400")}>Quick Links</button></div></div>
        {dashboardView === 'quick' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card key={mod.id} className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl group hover:border-primary/30 hover:shadow-xl transition-all flex flex-col justify-between min-h-[180px]">
                  <div className="flex justify-between items-start"><div className={cn("p-3 rounded-xl shadow-sm transition-all group-hover:scale-110", mod.bg)}><Icon className={cn("h-5 w-5", mod.color)} /></div><button onClick={() => { if(mod.id === 'customer' || mod.id === 'vendor' || mod.id === 'inventory') { onTabChange?.(mod.id as any); } else { setActiveTab(mod.id); } }} className="text-slate-300 hover:text-primary transition-colors"><ChevronRight className="h-5 w-5" /></button></div>
                  <div className="space-y-4"><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mod.label}</p><div className="flex items-center gap-4 mt-1"><span className="text-2xl font-display font-bold text-[#001F3D]">{mod.counts.total || mod.counts.value?.toLocaleString() || 0}</span>{mod.counts.pending !== undefined && mod.counts.pending > 0 && (<Badge className="bg-orange-50 text-orange-600 border-orange-100 text-[8px] font-bold uppercase">{mod.counts.pending} PENDING</Badge>)}{mod.counts.unpaid !== undefined && mod.counts.unpaid > 0 && (<Badge className="bg-red-50 text-red-600 border-red-100 text-[8px] font-bold uppercase">{mod.counts.unpaid} UNPAID</Badge>)}</div></div><div className="flex gap-2"><Button onClick={() => handleOpenForm(mod.id)} className="h-8 rounded-lg bg-[#001F3D] hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest px-4 shadow-sm">+ New</Button><Button variant="ghost" onClick={() => setActiveTab(mod.id)} className="h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest px-4 text-slate-400 hover:text-primary hover:bg-primary/5">View All</Button></div></div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
             <Card className="p-8 border-slate-100 shadow-xl rounded-[2.5rem] space-y-6"><div className="flex items-center gap-4 border-l-4 border-primary pl-4"><TrendingUp className="h-5 w-5 text-primary" /><h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Revenue Analytics</h4></div><div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[11px] font-bold text-slate-600 uppercase">Today's Sales</span><span className="text-xl font-display font-bold text-[#001F3D]">₹ {dashboardMetrics.todaySales.toLocaleString()}</span></div><div className="flex justify-between items-center"><span className="text-[11px] font-bold text-slate-600 uppercase">Monthly Yield</span><span className="text-xl font-display font-bold text-[#001F3D]">₹ {dashboardMetrics.monthlySales.toLocaleString()}</span></div></div></Card>
             <Card className="p-8 border-slate-100 shadow-xl rounded-[2.5rem] space-y-6"><div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-4"><FileCheck className="h-5 w-5 text-emerald-500" /><h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Efficiency Index</h4></div><div className="flex flex-col items-center justify-center py-4"><div className="text-4xl font-display font-bold text-[#001F3D]">{dashboardMetrics.conversion}%</div><span className="text-[9px] font-bold text-slate-400 uppercase mt-2">Order Conversion Rate</span></div></Card>
             <Card className="p-8 border-slate-100 shadow-xl rounded-[2.5rem] space-y-6"><div className="flex items-center gap-4 border-l-4 border-orange-500 pl-4"><Wallet className="h-5 w-5 text-orange-500" /><h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Financial Health</h4></div><div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[11px] font-bold text-slate-600 uppercase">Pending Col.</span><span className="text-lg font-display font-bold text-orange-600">₹ {dashboardMetrics.pendingCollections.toLocaleString()}</span></div><div className="flex justify-between items-center"><span className="text-[11px] font-bold text-slate-600 uppercase">Pending Pay.</span><span className="text-lg font-display font-bold text-red-600">₹ {dashboardMetrics.pendingPayments.toLocaleString()}</span></div></div></Card>
             <Card className="p-8 border-slate-100 shadow-xl rounded-[2.5rem] space-y-6"><div className="flex items-center gap-4 border-l-4 border-indigo-500 pl-4"><Package className="h-5 w-5 text-indigo-500" /><h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Inventory Status</h4></div><div className="flex items-center justify-between"><div className="text-center flex-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Total Items</p><p className="text-2xl font-display font-bold text-[#001F3D]">{inventory.length}</p></div><div className="h-10 w-px bg-slate-100" /><div className="text-center flex-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Low Stock</p><p className="text-2xl font-display font-bold text-rose-600">{inventory.filter(i => i.status === 'Low Stock').length}</p></div></div></Card>
          </div>
        )}
      </div>
    );
  };

  const LedgerView = () => {
    return (
      <div className="flex flex-col bg-white min-h-screen font-body">
        <header className="px-6 py-4 border-b border-slate-100 flex flex-col gap-4 bg-white sticky top-0 z-40">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Commercial Operations</span> <ChevronRight className="h-2.5 w-2.5" /> <span>Financial Hub</span> <ChevronRight className="h-2.5 w-2.5" /> <span className="text-[#001F3D]">{currentTabLabel} Ledger</span></div>
                 <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tighter">{currentTabLabel} Ledger</h2>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm" onClick={() => {}}><FileDown className="h-3.5 w-3.5" /> Export PDF</Button>
                 <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm" onClick={() => {}}><Download className="h-3.5 w-3.5" /> Export Excel</Button>
                 <Button className="h-10 rounded-xl bg-[#001F3D] hover:bg-black text-white px-8 text-[10px] font-bold uppercase tracking-widest shadow-xl flex gap-2" onClick={() => handleOpenForm(activeTab)}><Plus className="h-4 w-4" /> New {currentTabLabel}</Button>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <Card className="p-4 border-slate-100 shadow-sm flex flex-col gap-1 bg-slate-50/50"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total {currentTabLabel}s</span><p className="text-2xl font-display font-bold text-[#001F3D]">{summaryMetrics.count}</p></Card>
              <Card className="p-4 border-slate-100 shadow-sm flex flex-col gap-1 bg-slate-50/50"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Valuation</span><p className="text-2xl font-display font-bold text-emerald-600">₹ {summaryMetrics.total.toLocaleString()}</p></Card>
              <Card className="p-4 border-slate-100 shadow-sm flex flex-col gap-1 bg-slate-50/50"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Protocol</span><p className="text-2xl font-display font-bold text-orange-600">{summaryMetrics.pending}</p></Card>
              <Card className="p-4 border-slate-100 shadow-sm flex flex-col gap-1 bg-slate-50/50"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Nodes</span><p className="text-2xl font-display font-bold text-blue-600">{summaryMetrics.approved}</p></Card>
           </div>
        </header>
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center gap-4">
           <div className="flex-1 min-w-[200px] relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" /><Input placeholder="SEARCH NUMBER OR CUSTOMER..." className="pl-9 h-10 border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /></div>
           <Select value={dateFilter} onValueChange={setDateFilter}><SelectTrigger className="w-40 h-10 border-slate-200 rounded-xl text-[10px] font-bold uppercase"><SelectValue placeholder="Period" /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="all">All Time</SelectItem><SelectItem value="today">Today</SelectItem><SelectItem value="week">This Week</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="year">This Year</SelectItem></SelectContent></Select>
           <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40 h-10 border-slate-200 rounded-xl text-[10px] font-bold uppercase"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="all">All Status</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Rejected">Rejected</SelectItem><SelectItem value="Expired">Expired</SelectItem></SelectContent></Select>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4">
           <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-slate-50/80 sticky top-0 z-20 border-b">
                   <TableRow className="hover:bg-transparent h-14">
                      <TableHead className="w-12 px-6"><Checkbox onCheckedChange={()=>{}} /></TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-6 whitespace-nowrap">Document No</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-4">Date</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-4">Customer Identity</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-4 text-right">Grand Total</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-8 text-center">Status</TableHead>
                      <TableHead className="sticky right-0 bg-slate-50/80 z-30 font-bold text-[10px] uppercase text-slate-400 px-6 text-right">Actions</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredRecords.map((record) => (
                      <TableRow key={record.id} className="h-16 border-b border-slate-50 group hover:bg-slate-50/50 cursor-pointer" onClick={() => setPreviewRecord(record)}>
                         <TableCell className="px-6" onClick={(e)=>e.stopPropagation()}><Checkbox checked={selectedRecords.includes(record.id)} onCheckedChange={()=>toggleRecordSelection(record.id)} /></TableCell>
                         <TableCell className="px-6 font-code text-[11px] font-bold text-primary whitespace-nowrap">{record.numberPrefix}-{record.number}</TableCell>
                         <TableCell className="px-4 text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">{record.date}</TableCell>
                         <TableCell className="px-4"><span className="text-[12px] font-bold text-[#001F3D] uppercase truncate max-w-[200px] inline-block">{record.customerName}</span></TableCell>
                         <TableCell className="px-4 text-right font-display font-black text-[#001F3D] text-[13px]">₹ {(record.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                         <TableCell className="px-8 text-center"><Badge className={cn("text-[9px] font-bold uppercase px-3 py-1 rounded-full border shadow-sm", getStatusBadgeStyles(record.status))}>{record.status}</Badge></TableCell>
                         <TableCell className="sticky right-0 bg-white group-hover:bg-slate-50/50 z-30 px-6 text-right" onClick={(e)=>e.stopPropagation()}>
                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-[#001F3D]"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-1"><DropdownMenuItem onClick={() => setPreviewRecord(record)} className="rounded-lg gap-2 text-xs font-bold uppercase"><Eye className="h-3.5 w-3.5" /> View Ledger</DropdownMenuItem><DropdownMenuItem onClick={() => handleOpenForm(record.type, record)} className="rounded-lg gap-2 text-xs font-bold uppercase"><Edit3 className="h-3.5 w-3.5" /> Edit Record</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => onDeleteRecord(record.id)} className="rounded-lg gap-2 text-xs font-bold uppercase text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete Protocol</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
              </Table>
           </div>
        </div>
        <Sheet open={!!previewRecord} onOpenChange={(open) => !open && setPreviewRecord(null)}>
           <SheetContent className="w-[500px] sm:max-w-[600px] p-0 border-none shadow-2xl bg-white flex flex-col font-body">
              {previewRecord && (
                <>
                  <div className="p-8 bg-[#001F3D] text-white flex justify-between items-start shrink-0">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3"><div className="p-2 bg-primary/20 rounded-lg"><FileText className="h-6 w-6 text-primary" /></div><h3 className="text-2xl font-display font-black uppercase tracking-tight">{previewRecord.numberPrefix}-{previewRecord.number}</h3></div>
                        <div className="space-y-1"><p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Client Identity</p><p className="text-lg font-bold uppercase">{previewRecord.customerName}</p></div>
                     </div>
                     <Badge className={cn("text-[10px] font-bold uppercase py-2 px-6 rounded-full", getStatusBadgeStyles(previewRecord.status))}>{previewRecord.status}</Badge>
                  </div>
                  <ScrollArea className="flex-1 p-8">
                     <div className="space-y-10 pb-20">
                        <div className="grid grid-cols-2 gap-8"><div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document Date</p><p className="text-xs font-bold text-slate-700">{previewRecord.date}</p></div><div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GST Number</p><p className="text-xs font-bold font-code text-slate-700">{previewRecord.gstNumber || 'UNREGISTERED'}</p></div></div>
                        <div className="space-y-4"><h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b pb-2">Line Item Matrix</h4><div className="space-y-2">{previewRecord.items?.map((item, idx) => (<div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group"><div className="flex flex-col gap-1"><span className="text-[11px] font-bold text-slate-700 uppercase">{item.description}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{item.qty} {item.unit} • ₹{item.price}/ea</span></div><span className="text-[11px] font-display font-black text-[#001F3D]">₹ {(item.total ?? 0).toLocaleString()}</span></div>))}</div></div>
                        <div className="p-6 bg-slate-50 rounded-2xl space-y-4"><div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500"><span>Taxable Base</span><span>₹ {(previewRecord.subTotal || 0).toLocaleString()}</span></div><div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500"><span>Integrated Tax</span><span className="text-primary">₹ {(previewRecord.taxTotal || 0).toLocaleString()}</span></div><div className="pt-4 border-t flex justify-between items-end"><span className="text-xs font-black uppercase text-[#001F3D]">Total Settlement</span><span className="text-2xl font-display font-black text-[#001F3D]">₹ {(previewRecord.amount || 0).toLocaleString()}</span></div></div>
                     </div>
                  </ScrollArea>
                  <div className="p-8 border-t bg-slate-50 flex justify-end gap-3">
                     <Button variant="ghost" onClick={()=>setPreviewRecord(null)} className="h-11 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Close</Button>
                     <Button className="h-11 px-10 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl" onClick={() => handleOpenForm(previewRecord.type, previewRecord)}>Edit Ledger</Button>
                  </div>
                </>
              )}
           </SheetContent>
        </Sheet>
      </div>
    );
  };

  return (
    <div className="bg-[#F8FAFC] flex flex-col animate-in fade-in duration-700 font-body">
      {isRecordFormOpen ? (
        <FullPageEditor />
      ) : (
        <>
          <div className="bg-white border-b border-slate-200 shrink-0 px-1 z-50 shadow-sm overflow-x-hidden no-print">
            <div className="max-w-[1700px] mx-auto">
              <div className="flex h-12 items-center justify-between gap-0.5">
                {MAIN_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-1.5 h-full text-[8.5px] font-bold uppercase tracking-tight border-b-2 transition-all whitespace-nowrap flex items-center gap-1", activeTab === tab.id ? "border-emerald-500 text-emerald-600 bg-emerald-50/10" : "border-transparent text-slate-500 hover:text-slate-900")}>{tab.icon && <tab.icon className={cn("h-2.5 w-2.5", activeTab === tab.id ? "text-emerald-500" : "text-slate-400")} />}{tab.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">{activeTab === 'dashboard' ? <DashboardView /> : activeTab === 'report' ? ( <div className="h-[calc(100vh-140px)] flex gap-0 animate-in fade-in duration-700 no-print"> <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto"> <div className="p-6 border-b border-slate-100"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><FileBarChart className="h-4 w-4" /></div><h4 className="text-xs font-bold text-[#001F3D] uppercase tracking-widest">Report Matrix</h4></div></div> <div className="p-2 space-y-6 py-6">{REPORT_STRUCTURE.map((cat) => (<div key={cat.title} className="space-y-1"><div className="px-4 py-2 bg-emerald-50/50 rounded-lg"><h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{cat.title}</h5></div><div className="space-y-0.5 pt-1">{cat.items.map((item) => (<button key={item.id} onClick={() => setActiveReportId(item.id)} className={cn("w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all", activeReportId === item.id ? "bg-[#001F3D] text-white" : "text-slate-500 hover:bg-slate-50")}>{item.label}</button>))}</div></div>))}</div> </div> <div className="flex-1 flex flex-col bg-white overflow-hidden"> <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0"><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{REPORT_STRUCTURE.flatMap(c => c.items).find(i => i.id === activeReportId)?.label}</h3></div> <ScrollArea className="flex-1"><div className="p-8"> <Table><TableHeader className="bg-slate-50/50"><TableRow className="border-b-2 border-slate-200"><TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Doc Ref</TableHead><TableHead className="font-bold text-[10px] uppercase text-slate-400">Party Node</TableHead><TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Date</TableHead><TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Amount</TableHead></TableRow></TableHeader><TableBody>{records.filter(r => r.type === REPORT_STRUCTURE.flatMap(c => c.items).find(i => i.id === activeReportId)?.type || r.type !== 'all').map((r) => (<TableRow key={r.id} className="h-16 border-b border-slate-50 hover:bg-slate-50/30"><TableCell className="px-10 font-code font-bold text-xs text-primary">{r.number}</TableCell><TableCell className="text-[11px] font-bold text-slate-700 uppercase">{r.customerName}</TableCell><TableCell className="text-center font-code text-[10px] text-slate-400">{r.date}</TableCell><TableCell className="text-right px-10 font-display text-sm font-black text-[#001F3D]">₹ {(r.amount || 0).toLocaleString()}</TableCell></TableRow>))}</TableBody></Table></div></ScrollArea> </div> </div> ) : <LedgerView />}</div>
        </>
      )}
    </div>
  );
}
