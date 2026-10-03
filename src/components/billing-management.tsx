"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  Wallet,
  ArrowUp,
  ArrowDown,
  Activity,
  Globe,
  Gauge,
  Target,
  BrainCircuit,
  Settings,
  CircleDot,
  Cpu,
  Landmark,
  ClipboardList
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem, InventoryItem, ViewType, NumberSeries } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, isWithinInterval, format, startOfToday, startOfYesterday, subDays } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  Cell, 
  ComposedChart, 
  Line, 
  Pie, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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

const DEFAULT_NUMBER_SERIES: NumberSeries = {
  prefix: 'DOC',
  startingNumber: 1,
  currentNumber: 1,
  length: 4,
  fyFormat: 'YYYY',
  separator: '-',
  resetEveryFY: true,
  manualOverride: false,
};

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

const CircularGauge = ({ achievement, size = 120, strokeWidth = 10, children }: { achievement: number, size?: number, strokeWidth?: number, children?: React.ReactNode }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(achievement, 100) / 100) * circumference;
  const color = achievement >= 100 ? "#22c55e" : achievement >= 70 ? "#eab308" : "#f43f5e";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          stroke={color} strokeWidth={strokeWidth} 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            <span className="text-xl font-display font-black text-[#001F3D]">{Math.round(achievement)}%</span>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Achievement</span>
          </>
        )}
      </div>
    </div>
  );
};

const SmartKPICard = ({ title, value, target, achievement, icon: Icon, type = 'linear' }: any) => {
  const colorClass = achievement >= 100 ? 'text-emerald-500' : achievement >= 70 ? 'text-amber-500' : 'text-rose-500';
  const bgClass = achievement >= 100 ? 'bg-emerald-50' : achievement >= 70 ? 'bg-amber-50' : 'bg-rose-50';
  const progressClass = achievement >= 100 ? 'bg-emerald-500' : achievement >= 70 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="p-6 bg-white border border-slate-100 shadow-xl rounded-[1.5rem] relative overflow-hidden group hover:border-primary/30 transition-all cursor-help">
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                  <h3 className="text-2xl font-display font-bold text-[#001F3D]">
                    {typeof value === 'number' ? `₹ ${value.toLocaleString()}` : value}
                  </h3>
                </div>
                <div className={cn("p-2 rounded-lg", bgClass, colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              {type === 'circular' ? (
                <div className="flex justify-center">
                  <CircularGauge achievement={achievement} size={100} />
                </div>
              ) : type === 'doughnut' ? (
                <div className="h-[100px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Achieved', value: Math.min(achievement, 100) },
                          { name: 'Remaining', value: Math.max(0, 100 - achievement) }
                        ]}
                        cx="50%" cy="50%" innerRadius={30} outerRadius={40} paddingAngle={5} dataKey="value"
                      >
                        <Cell fill={progressClass} />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pt-2">
                    <span className={cn("text-xs font-black", colorClass)}>{Math.round(achievement)}%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Target: {target.toLocaleString()}</span>
                    <span className={cn("text-[10px] font-black", colorClass)}>{Math.round(achievement)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", progressClass)}
                      style={{ width: `${Math.min(achievement, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", progressClass)} />
                <span className={cn("text-[8px] font-bold uppercase", colorClass)}>
                  {achievement >= 100 ? 'Target Achieved' : achievement >= 70 ? 'In Progress' : 'Critical Deficit'}
                </span>
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="bg-[#001F3D] text-white border-none p-4 rounded-xl shadow-2xl space-y-1">
           <p className="text-[9px] font-bold uppercase text-white/40">Performance Breakdown</p>
           <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2">
              <span className="text-[10px] text-white/60 uppercase">Target:</span>
              <span className="text-[10px] font-bold">{target.toLocaleString()}</span>
              <span className="text-[10px] text-white/60 uppercase">Current:</span>
              <span className="text-[10px] font-bold">{value.toLocaleString()}</span>
              <span className="text-[10px] text-white/60 uppercase">Difference:</span>
              <span className={cn("text-[10px] font-bold", achievement >= 100 ? "text-emerald-400" : "text-rose-400")}>
                {Math.abs(target - value).toLocaleString()} {achievement >= 100 ? 'SURPLUS' : 'DEFICIT'}
              </span>
           </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function BillingManagement({ customers, vendors, records, orders, users, inventory, permissions, onSaveRecord, onDeleteRecord, onTabChange, uiSettings }: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState<'quick' | 'analytics'>('analytics');
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [previewRecord, setPreviewRecord] = useState<BillingRecord | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [activeReportId, setActiveReportId] = useState('sales');
  
  const [targets, setTargets] = useState({
    monthlySales: 2500000,
    monthlyQuotations: 50,
    collectionTarget: 2000000,
    purchaseBudget: 1500000,
    monthlyOrders: 40,
    jobTarget: 60,
    productionTarget: 10000
  });

  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);

  const generateNextNumber = useCallback((type: string) => {
    const seriesMap = uiSettings.numberSeries || {};
    const series = seriesMap[type] || { ...DEFAULT_NUMBER_SERIES, prefix: DOCUMENT_TYPES.find(d => d.id === type)?.prefix || 'DOC' };
    const numStr = series.currentNumber.toString().padStart(series.length, '0');
    const fy = new Date().getFullYear();
    const fyStr = series.fyFormat === 'YYYY' ? fy.toString() : 
                 series.fyFormat === 'YY-YY' ? `${fy.toString().slice(-2)}-${(fy+1).toString().slice(-2)}` : '';
    
    return [series.prefix, numStr, fyStr].filter(Boolean).join(` ${series.separator} `);
  }, [uiSettings.numberSeries]);

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
    paymentTerms: 'Standard Terms & Conditions',
    placeOfSupply: 'Karnataka',
    vehicleNo: '',
    revCharge: 'No',
    shipTo: '',
    distanceEWay: '',
    challanNo: '',
    challanDate: '',
    deliveryMode: '',
    tcsRate: 0,
    tcsAmount: 0,
    roundOff: 0,
    isRoundOffActive: true,
    transportationCharges: 0,
  });

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

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    setActiveRecordType(type);
    if (record) {
      setEditingRecordId(record.id);
      setFormData(record);
    } else {
      const generatedNumber = generateNextNumber(type);
      setEditingRecordId(null);
      setFormData({
        id: `REC-${Date.now()}`,
        type,
        customerName: '',
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        number: generatedNumber,
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

  const updateItem = (id: string, field: keyof BillingLineItem, value: any) => {
    setFormData(prev => {
      const items = (prev.items || []).map(item => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      });
      return calculateTotals({ ...prev, items });
    });
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." });
      return;
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} #${formData.number} committed.` });
    setIsRecordFormOpen(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const docTabs = DOCUMENT_TYPES.map(d => d.id);
      if (docTabs.includes(activeTab) && r.type !== activeTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, searchTerm, statusFilter, activeTab]);

  const summaryMetrics = useMemo(() => {
    const list = filteredRecords;
    return {
      count: list.length,
      total: list.reduce((sum, r) => sum + (r.amount || 0), 0),
      pending: list.filter(r => r.status === 'Pending' || r.status === 'Draft').length,
      approved: list.filter(r => r.status === 'Approved' || r.status === 'Paid').length,
    };
  }, [filteredRecords]);

  const biMetrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    
    const invoices = records.filter(r => r.type === 'invoice');
    const purchases = records.filter(r => r.type === 'purchase_invoice');
    const quotations = records.filter(r => r.type === 'quotation');
    const payments = records.filter(r => r.type === 'inward_payment');
    const saleOrders = records.filter(r => r.type === 'sale_order');

    const monthlyRev = invoices.filter(r => isWithinInterval(parseISO(r.date), {start: monthStart, end: now})).reduce((s, r) => s + r.amount, 0);
    const receivables = invoices.filter(r => r.status !== 'Paid').reduce((s, r) => s + r.amount, 0);
    const payables = purchases.filter(r => r.status !== 'Paid').reduce((s, r) => s + r.amount, 0);
    
    const monthlyExp = purchases.filter(r => isWithinInterval(parseISO(r.date), {start: monthStart, end: now})).reduce((s, r) => s + r.amount, 0);

    const quotationCount = quotations.filter(r => isWithinInterval(parseISO(r.date), {start: monthStart, end: now})).length;
    const orderCount = saleOrders.filter(r => isWithinInterval(parseISO(r.date), {start: monthStart, end: now})).length;
    const paymentRec = payments.filter(r => isWithinInterval(parseISO(r.date), {start: monthStart, end: now})).reduce((s, r) => s + r.amount, 0);

    const conversionRate = quotations.length > 0 ? Math.round((quotations.filter(q => q.status === 'Converted').length / quotations.length) * 100) : 0;

    const salesByDay = Array.from({length: 7}, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayLabel = format(date, 'EEE');
      const value = invoices.filter(r => {
        const rDate = parseISO(r.date);
        return rDate.getDate() === date.getDate() && rDate.getMonth() === date.getMonth();
      }).reduce((s, r) => s + r.amount, 0);
      return { name: dayLabel, value, target: targets.monthlySales / 30 };
    });

    const revAchievement = Math.min((monthlyRev / (targets.monthlySales || 1)) * 100, 150);
    const collectionEfficiency = (paymentRec / (targets.collectionTarget || 1)) * 100;
    const inventoryHealth = inventory.length > 0 ? (inventory.filter(i => i.status === 'In Stock').length / inventory.length) * 100 : 100;
    
    const completedJobs = orders.filter(o => o.status === 'Completed').length;
    const jobAchievement = (completedJobs / (targets.jobTarget || 1)) * 100;

    const healthScore = Math.round((revAchievement * 0.3) + (Math.min(collectionEfficiency, 100) * 0.3) + (inventoryHealth * 0.2) + (jobAchievement * 0.2));

    return { 
      monthlyRev, receivables, payables, conversionRate, salesByDay, 
      healthScore, monthlyExp, quotationCount, orderCount, 
      paymentRec, completedJobs, jobAchievement, revAchievement, 
      collectionEfficiency, inventoryHealth 
    };
  }, [records, targets, inventory, orders]);

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

  const AnalyticsView = () => (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#001F3D] rounded-2xl shadow-xl"><BrainCircuit className="h-7 w-7 text-primary" /></div>
          <div>
            <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tighter">Business Intelligence Matrix</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Institutional Yield & Strategy Hub v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest gap-2 bg-white border-slate-200 shadow-sm" onClick={() => setIsTargetDialogOpen(true)}>
            <Target className="h-4 w-4" /> Calibration Targets
          </Button>
        </div>
      </div>

      <Card className="p-10 bg-[#001F3D] border-none shadow-2xl rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 space-y-6 max-w-sm">
          <div>
            <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold uppercase px-3 mb-2">Institutional Fidelity</Badge>
            <h4 className="text-3xl font-display font-black text-white uppercase tracking-tight">Business Health Score</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[8px] text-white/30 uppercase font-bold tracking-widest mb-1">Conversion</p>
              <p className="text-lg font-bold text-primary">{biMetrics.conversionRate}%</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex-1 flex justify-center">
          <CircularGauge achievement={biMetrics.healthScore} size={240} strokeWidth={20}>
             <span className="text-7xl font-display font-black text-white">{biMetrics.healthScore}</span>
          </CircularGauge>
        </div>
        <div className="relative z-10 flex-1 space-y-6">
           <div className="space-y-3">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                 <span>Inventory Health</span>
                 <span className="text-emerald-400">{Math.round(biMetrics.inventoryHealth)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500" style={{ width: `${biMetrics.inventoryHealth}%` }} />
              </div>
           </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SmartKPICard title="Revenue Growth" value={biMetrics.monthlyRev} target={targets.monthlySales} achievement={biMetrics.revAchievement} icon={TrendingUp} type="circular" />
        <SmartKPICard title="Quotation Performance" value={biMetrics.quotationCount} target={targets.monthlyQuotations} achievement={(biMetrics.quotationCount/targets.monthlyQuotations)*100} icon={FileBox} type="circular" />
        <SmartKPICard title="Sales Order Velocity" value={biMetrics.orderCount} target={targets.monthlyOrders} achievement={(biMetrics.orderCount/targets.monthlyOrders)*100} icon={ShoppingCart} type="doughnut" />
        <SmartKPICard title="Purchase Management" value={biMetrics.monthlyExp} target={targets.purchaseBudget} achievement={(biMetrics.monthlyExp/targets.purchaseBudget)*100} icon={Banknote} type="linear" />
      </div>
    </div>
  );

  const DashboardView = () => {
    const modules = [
      { id: 'quotation', label: 'Quotation', icon: FileBox, color: 'text-blue-500', bg: 'bg-blue-50', counts: { total: records.filter(r => r.type === 'quotation').length, pending: records.filter(r => r.type === 'quotation' && r.status === 'Pending').length } },
      { id: 'sale_order', label: 'Sales Order', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', counts: { total: records.filter(r => r.type === 'sale_order').length, pending: records.filter(r => r.type === 'sale_order' && r.status === 'Pending').length } },
      { id: 'purchase_order', label: 'Purchase Order', icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-50', counts: { total: records.filter(r => r.type === 'purchase_order').length, pending: records.filter(r => r.type === 'purchase_order' && r.status === 'Pending').length } },
      { id: 'invoice', label: 'Sales Invoice', icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-50', counts: { total: records.filter(r => r.type === 'invoice').length, unpaid: records.filter(r => r.type === 'invoice' && r.status !== 'Paid').length } },
      { id: 'purchase_invoice', label: 'Purchase Invoice', icon: ShoppingCart, color: 'text-rose-500', bg: 'bg-rose-50', counts: { total: records.filter(r => r.type === 'purchase_invoice').length, unpaid: records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').length } },
      { id: 'delivery_challan', label: 'Delivery Challan', icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-50', counts: { total: records.filter(r => r.type === 'delivery_challan').length, pending: records.filter(r => r.type === 'delivery_challan' && r.status === 'Pending').length } },
      { id: 'proforma', label: 'Proforma', icon: FileCheck, color: 'text-purple-500', bg: 'bg-purple-50', counts: { total: records.filter(r => r.type === 'proforma').length, pending: records.filter(r => r.type === 'proforma' && r.status === 'Pending').length } },
      { id: 'inward_payment', label: 'Inward Payment', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-100', counts: { total: records.filter(r => r.type === 'inward_payment').length, value: records.filter(r => r.type === 'inward_payment').reduce((s, x) => s + x.amount, 0) } },
      { id: 'outward_payment', label: 'Outward Payment', icon: ArrowUpRight, color: 'text-rose-600', bg: 'bg-rose-100', counts: { total: records.filter(r => r.type === 'outward_payment').length, value: records.filter(r => r.type === 'outward_payment').reduce((s, x) => s + x.amount, 0) } },
      { id: 'inventory', label: 'Stock Ledger', icon: Package, color: 'text-indigo-700', bg: 'bg-indigo-100', counts: { total: inventory.length, low: inventory.filter(i => i.status === 'Low Stock').length } },
    ];

    if (dashboardView === 'analytics') return <AnalyticsView />;

    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700">
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-full flex gap-1 border border-slate-200 shadow-inner">
            <button onClick={() => setDashboardView('analytics')} className={cn("px-8 py-2 rounded-full text-[10px] font-bold uppercase transition-all", dashboardView === 'analytics' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>Analytics</button>
            <button onClick={() => setDashboardView('quick')} className={cn("px-8 py-2 rounded-full text-[10px] font-bold uppercase transition-all", dashboardView === 'quick' ? "bg-primary text-white shadow-sm" : "text-slate-400")}>Quick Links</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.id} className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl group hover:border-primary/30 hover:shadow-xl transition-all flex flex-col justify-between min-h-[180px]">
                <div className="flex justify-between items-start">
                  <div className={cn("p-3 rounded-xl", mod.bg)}><Icon className={cn("h-5 w-5", mod.color)} /></div>
                  <button onClick={() => setActiveTab(mod.id)} className="text-slate-300 hover:text-primary"><ChevronRight className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mod.label}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-2xl font-display font-bold text-[#001F3D]">{mod.counts.total ?? mod.counts.value?.toLocaleString() ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleOpenForm(mod.id)} className="h-8 rounded-lg bg-[#001F3D] hover:bg-black text-white text-[9px] font-bold uppercase px-4 shadow-sm">+ New</Button>
                    <Button variant="ghost" onClick={() => setActiveTab(mod.id)} className="h-8 rounded-lg text-[9px] font-bold uppercase px-4 text-slate-400">View All</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const FullPageEditor = () => {
    const seriesConfig = (uiSettings.numberSeries && uiSettings.numberSeries[activeRecordType]) || DEFAULT_NUMBER_SERIES;
    
    return (
      <div className="flex flex-col bg-[#F8FAFC] min-h-screen animate-in fade-in duration-300 pb-40">
        <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#001F3D] rounded text-white shadow-sm"><Receipt className="h-5 w-5" /></div>
            <h2 className="text-xl font-bold text-[#001F3D] uppercase tracking-tighter">{editingRecordId ? 'Edit' : 'Create'} {activeRecordType} Matrix</h2>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white border border-slate-300 p-8 space-y-4 rounded-none shadow-none">
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
                        gstNumber: identity?.gstNumber || '', panNumber: (identity as any)?.pan || '',
                        placeOfSupply: identity?.location || 'Karnataka'
                      });
                    }}>
                      <SelectTrigger className="h-9 border-slate-300 rounded-none text-xs font-bold uppercase shadow-none"><SelectValue placeholder="Identify Partner..." /></SelectTrigger>
                      <SelectContent>{[...customers, ...vendors].map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">GSTIN / PAN</Label>
                  <div className="col-span-8"><Input className="h-9 border-slate-300 rounded-none text-xs font-bold uppercase shadow-none" value={formData.gstNumber || ''} onChange={(e)=>setFormData({...formData, gstNumber: e.target.value})} /></div>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-slate-300 p-8 space-y-4 rounded-none shadow-none">
              <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest border-b pb-3 mb-4 flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Document Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Document No <span className="text-red-500">*</span></Label>
                  <div className="col-span-8">
                    <Input 
                      readOnly={!seriesConfig.manualOverride}
                      className={cn("h-9 border-slate-300 rounded-none text-xs font-bold w-full text-center shadow-none", !seriesConfig.manualOverride && "bg-slate-50 opacity-60")} 
                      value={formData.number || ''} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center gap-4">
                  <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Date <span className="text-red-500">*</span></Label>
                  <div className="col-span-8"><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-9 rounded-none shadow-none" /></div>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white border border-slate-300 overflow-hidden shadow-none">
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent border-b border-slate-300">
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-12 text-center border-r border-slate-300">SR.</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-4 border-r border-slate-300 min-w-[300px]">Product / Other Charges</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-24 text-center border-r border-slate-300">Qty.</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-2 w-32 text-center border-r border-slate-300">Price</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase text-slate-700 py-3 px-4 w-40 text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items?.map((item, idx) => (
                  <TableRow key={item.id} className="border-b border-slate-300 align-top group">
                    <TableCell className="text-center text-xs font-bold text-slate-400 border-r border-slate-300 py-4">{idx + 1}</TableCell>
                    <TableCell className="p-0 border-r border-slate-300">
                      <Input placeholder="Enter Product name" className="h-10 border-none bg-white text-xs font-bold px-4 rounded-none" value={item.description || ''} onChange={(e)=>updateItem(item.id, 'description', e.target.value)} />
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-300"><Input type="number" className="h-10 text-center text-xs border-none bg-transparent rounded-none font-bold" value={item.qty || 0} onChange={(e)=>updateItem(item.id, 'qty', Number(e.target.value))} /></TableCell>
                    <TableCell className="p-0 border-r border-slate-300"><Input type="number" className="h-10 text-center text-xs border-none bg-transparent rounded-none font-bold text-primary" value={item.price || 0} onChange={(e)=>updateItem(item.id, 'price', Number(e.target.value))} /></TableCell>
                    <TableCell className="text-right px-4 text-xs font-bold py-4">₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="p-1">
                       <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t bg-white flex justify-start">
               <Button variant="ghost" onClick={handleAddItem} className="h-9 px-6 rounded-none text-primary font-bold uppercase text-[9px] tracking-widest gap-2 hover:bg-primary/5 border border-slate-200"><Plus className="h-4 w-4" /> Add Row</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <Card className="bg-white border border-slate-300 p-6 space-y-4 rounded-none shadow-none">
                <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest border-b pb-3 flex justify-between items-center">
                  <div className="flex items-center gap-2"><Landmark className="h-3.5 w-3.5" /> Bank Details</div>
                  <Switch checked={true} onCheckedChange={()=>{}} />
                </h3>
              </Card>
              <Card className="bg-white border border-slate-300 p-6 space-y-4 rounded-none shadow-none">
                <h3 className="text-xs font-bold uppercase text-[#001F3D] tracking-widest border-b pb-3 mb-4 flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5" /> Terms & Conditions</h3>
                <Textarea className="min-h-[100px] border-slate-300 rounded-none text-xs" value={formData.paymentTerms || ''} onChange={(e)=>setFormData({...formData, paymentTerms: e.target.value})} />
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white border border-slate-300 p-8 space-y-6 rounded-none shadow-none">
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[11px] font-bold uppercase text-slate-500">
                      <span>Subtotal</span>
                      <span>₹ {(formData.subTotal || 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-t-2 border-[#001F3D] bg-yellow-400 -mx-8 px-8">
                      <span className="text-sm font-black uppercase text-[#001F3D]">Grand Total</span>
                      <span className="text-4xl font-display font-black text-[#001F3D]">₹ {(formData.amount || 0).toLocaleString()}</span>
                   </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white flex justify-end items-center z-50 shadow-2xl">
           <Button className="h-12 px-16 bg-[#001F3D] hover:bg-black text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-none shadow-xl flex gap-3" onClick={handleSave}>
             <Save className="h-4 w-4" /> Commit to Ledger
           </Button>
        </div>
      </div>
    );
  };

  const LedgerView = () => (
    <div className="flex flex-col bg-white min-h-screen font-body">
      <header className="px-6 py-4 border-b border-slate-100 flex flex-col gap-4 bg-white sticky top-0 z-40">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Commercial Operations</span> <ChevronRight className="h-2.5 w-2.5" /> <span className="text-[#001F3D]">{MAIN_TABS.find(t=>t.id===activeTab)?.label} Ledger</span></div>
               <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tighter">{MAIN_TABS.find(t=>t.id===activeTab)?.label} Ledger</h2>
            </div>
            <div className="flex items-center gap-3">
               <Button className="h-10 rounded-xl bg-[#001F3D] hover:bg-black text-white px-8 text-[10px] font-bold uppercase tracking-widest shadow-xl flex gap-2" onClick={() => handleOpenForm(activeTab)}><Plus className="h-4 w-4" /> New {MAIN_TABS.find(t=>t.id===activeTab)?.label}</Button>
            </div>
         </div>
      </header>
      <div className="flex-1 overflow-auto px-6 py-4">
         <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-slate-50/80 sticky top-0 z-20 border-b">
                 <TableRow className="hover:bg-transparent h-14">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-6">Document No</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-4">Customer Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-4 text-right">Grand Total</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 px-6 text-right">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="h-16 border-b border-slate-50 group hover:bg-slate-50/50 cursor-pointer" onClick={() => setPreviewRecord(record)}>
                       <TableCell className="px-6 font-code text-[11px] font-bold text-primary">{record.number}</TableCell>
                       <TableCell className="px-4"><span className="text-[12px] font-bold text-[#001F3D] uppercase truncate max-w-[200px] inline-block">{record.customerName}</span></TableCell>
                       <TableCell className="px-4 text-right font-display font-black text-[#001F3D] text-[13px]">₹ {(record.amount || 0).toLocaleString()}</TableCell>
                       <TableCell className="px-8 text-center"><Badge className={cn("text-[9px] font-bold uppercase px-3 rounded-full border shadow-sm", getStatusBadgeStyles(record.status))}>{record.status}</Badge></TableCell>
                       <TableCell className="px-6 text-right" onClick={(e)=>e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => onDeleteRecord(record.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
            </Table>
         </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] flex flex-col animate-in fade-in duration-700 min-h-screen">
      {isRecordFormOpen ? (
        <FullPageEditor />
      ) : (
        <>
          <div className="bg-white border-b border-slate-200 shrink-0 px-1 z-50 shadow-sm overflow-x-hidden no-print">
            <div className="max-w-[1700px] mx-auto">
              <div className="flex h-12 items-center justify-between gap-0.5">
                {MAIN_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-4 h-full text-[10px] font-bold uppercase tracking-tight border-b-2 transition-all whitespace-nowrap flex items-center gap-2", activeTab === tab.id ? "border-emerald-500 text-emerald-600 bg-emerald-50/10" : "border-transparent text-slate-500 hover:text-slate-900")}>
                    {tab.icon && <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-emerald-500" : "text-slate-400")} />}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {activeTab === 'dashboard' ? <DashboardView /> : activeTab === 'report' ? ( 
              <div className="flex gap-0 animate-in fade-in duration-700 no-print min-h-full"> 
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto"> 
                  <div className="p-6 border-b border-slate-100"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><FileBarChart className="h-4 w-4" /></div><h4 className="text-xs font-bold text-[#001F3D] uppercase tracking-widest">Report Matrix</h4></div></div> 
                  <div className="p-2 space-y-6 py-6">{REPORT_STRUCTURE.map((cat) => (<div key={cat.title} className="space-y-1"><div className="px-4 py-2 bg-emerald-50/50 rounded-lg"><h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{cat.title}</h5></div><div className="space-y-0.5 pt-1">{cat.items.map((item) => (<button key={item.id} onClick={() => setActiveReportId(item.id)} className={cn("w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all", activeReportId === item.id ? "bg-[#001F3D] text-white" : "text-slate-500 hover:bg-slate-50")}>{item.label}</button>))}</div></div>))}</div> 
                </div> 
                <div className="flex-1 flex flex-col bg-white overflow-hidden"> 
                  <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0"><h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{REPORT_STRUCTURE.flatMap(c => c.items).find(i => i.id === activeReportId)?.label}</h3></div> 
                  <ScrollArea className="flex-1"><div className="p-8"> <Table><TableHeader className="bg-slate-50/50"><TableRow className="border-b-2 border-slate-200"><TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10">Doc Ref</TableHead><TableHead className="font-bold text-[10px] uppercase text-slate-400">Party Node</TableHead><TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Date</TableHead><TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Amount</TableHead></TableRow></TableHeader><TableBody>{records.filter(r => r.type === REPORT_STRUCTURE.flatMap(c => c.items).find(i => i.id === activeReportId)?.type || r.type !== 'all').map((r) => (<TableRow key={r.id} className="h-16 border-b border-slate-50 hover:bg-slate-50/30"><TableCell className="px-10 font-code font-bold text-xs text-primary">{r.number}</TableCell><TableCell className="text-[11px] font-bold text-slate-700 uppercase">{r.customerName}</TableCell><TableCell className="text-center font-code text-[10px] text-slate-400">{r.date}</TableCell><TableCell className="text-right px-10 font-display text-sm font-black text-[#001F3D]">₹ {(r.amount || 0).toLocaleString()}</TableCell></TableRow>))}</TableBody></Table></div></ScrollArea> </div> 
              </div> 
            ) : <LedgerView />}
          </div>
        </>
      )}

      <Sheet open={!!previewRecord} onOpenChange={(open) => !open && setPreviewRecord(null)}>
         <SheetContent className="w-[500px] sm:max-w-[600px] p-0 border-none shadow-2xl bg-white flex flex-col">
            {previewRecord && (
              <>
                <div className="p-8 bg-[#001F3D] text-white flex justify-between items-start shrink-0">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3"><div className="p-2 bg-primary/20 rounded-lg"><FileText className="h-6 w-6 text-primary" /></div><h3 className="text-2xl font-display font-black uppercase tracking-tight">{previewRecord.number}</h3></div>
                      <div className="space-y-1"><p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Client Identity</p><p className="text-lg font-bold uppercase">{previewRecord.customerName}</p></div>
                   </div>
                   <Badge className={cn("text-[10px] font-bold uppercase py-2 px-6 rounded-full", getStatusBadgeStyles(previewRecord.status))}>{previewRecord.status}</Badge>
                </div>
                <ScrollArea className="flex-1 p-8">
                   <div className="space-y-10 pb-20">
                      <div className="grid grid-cols-2 gap-8"><div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document Date</p><p className="text-xs font-bold text-slate-700">{previewRecord.date}</p></div></div>
                      <div className="space-y-4"><h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b pb-2">Line Item Matrix</h4><div className="space-y-2">{previewRecord.items?.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group"><div className="flex flex-col gap-1"><span className="text-[11px] font-bold text-slate-700 uppercase">{item.description}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{item.qty} {item.unit} • ₹{item.price}/ea</span></div><span className="text-[11px] font-display font-black text-[#001F3D]">₹ {(item.total ?? 0).toLocaleString()}</span></div>
                      ))}</div></div>
                   </div>
                </ScrollArea>
                <div className="p-8 border-t bg-slate-50 flex justify-end gap-3">
                   <Button variant="ghost" onClick={()=>setPreviewRecord(null)} className="h-11 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Close</Button>
                </div>
              </>
            )}
         </SheetContent>
      </Sheet>

      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[2rem] p-10">
          <DialogHeader className="mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4"><Target className="h-8 w-8 text-primary" /></div>
            <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Strategic Calibration</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">Define institutional targets for achievement comparison.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Monthly Sales Target (₹)</Label>
              <Input type="number" value={targets.monthlySales} onChange={(e) => setTargets({...targets, monthlySales: Number(e.target.value)})} />
            </div>
            <Button className="w-full h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsTargetDialogOpen(false)}>Synchronize Targets</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
