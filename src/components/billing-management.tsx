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
  ChevronLeft,
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
  ClipboardList,
  FileBadge
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
import { 
  differenceInDays, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  format, 
  startOfToday, 
  startOfYesterday, 
  subDays,
  getDaysInMonth,
  getDate,
  isValid
} from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
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
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'Quotation', icon: FileBox, prefix: 'QT' },
  { id: 'proforma', label: 'Proforma', icon: FileCheck, prefix: 'PFI' },
  { id: 'invoice', label: 'Sale Inv', icon: FileText, prefix: 'INV' },
  { id: 'purchase_invoice', label: 'Pur Inv', icon: ShoppingCart, prefix: 'PI' },
  { id: 'delivery_challan', label: 'Challan', icon: Truck, prefix: 'DC' },
  { id: 'purchase_order', label: 'Customer PO', icon: FileBadge, prefix: 'PO' },
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
  const isRed = achievement < 70;
  const isYellow = achievement >= 70 && achievement < 100;
  const isGreen = achievement >= 100;

  const colorClass = isGreen ? 'text-emerald-500' : isYellow ? 'text-amber-500' : 'text-rose-500';
  const bgClass = isGreen ? 'bg-emerald-50' : isYellow ? 'bg-amber-50' : 'bg-rose-50';
  const progressClass = isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="p-6 bg-white border border-slate-100 shadow-xl rounded-[1.5rem] relative overflow-hidden group hover:border-primary/30 transition-all cursor-help">
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                  <h3 className="text-xl font-display font-bold text-[#001F3D]">
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
                  {isGreen ? 'Target Achieved' : isYellow ? 'In Progress' : 'Critical Deficit'}
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
              <span className={cn("text-[10px] font-bold", isGreen ? "text-emerald-400" : "text-rose-400")}>
                {Math.abs(target - value).toLocaleString()} {isGreen ? 'SURPLUS' : 'DEFICIT'}
              </span>
           </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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

export function BillingManagement({ customers, vendors, records, orders, users, inventory, permissions, onSaveRecord, onDeleteRecord, onTabChange, uiSettings }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState<'quick' | 'analytics'>('analytics');
  const [selectedAnalyticsDate, setSelectedAnalyticsDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<BillingRecord | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    items: [],
    subTotal: 0,
    amount: 0,
    taxTotal: 0,
    discountTotal: 0,
    additionalCharges: 0,
    roundOff: 0,
    notes: '',
    terms: '',
    quotationId: ''
  });

  const biMetrics = useMemo(() => {
    const targetDate = parseISO(selectedAnalyticsDate);
    const mStart = startOfMonth(targetDate);
    const mEnd = endOfMonth(targetDate);
    const today = startOfToday();
    
    const targetKey = format(targetDate, 'yyyy-MM');
    const monthlyBillingTarget = uiSettings.monthlyBillingTargets?.[targetKey] || 0;

    const monthInvoices = records.filter(r => 
      r.type === 'invoice' && 
      isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd })
    );

    const actualBillingAchieved = monthInvoices.reduce((sum, r) => sum + (r.amount || 0), 0);
    const remainingToTarget = Math.max(0, monthlyBillingTarget - actualBillingAchieved);
    const achievementPercent = monthlyBillingTarget > 0 ? (actualBillingAchieved / monthlyBillingTarget) * 100 : 0;

    // PO Metrics for Dashboard
    const monthPOs = records.filter(r => 
      r.type === 'purchase_order' && 
      isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd })
    );
    const totalPOValue = monthPOs.reduce((s, r) => s + (r.amount || 0), 0);
    const pendingPOs = monthPOs.filter(r => r.status === 'Pending').length;
    const poToInvoiceRate = monthPOs.length > 0 ? (records.filter(r => r.type === 'invoice' && r.quotationId).length / monthPOs.length) * 100 : 0;

    let daysRemaining = 1;
    const daysInM = getDaysInMonth(targetDate);
    const currentDay = getDate(today);

    if (format(today, 'yyyy-MM') === targetKey) {
      daysRemaining = Math.max(1, daysInM - currentDay + 1);
    } else if (today > mEnd) {
      daysRemaining = 0;
    } else {
      daysRemaining = daysInM;
    }

    const requiredDailyBilling = daysRemaining > 0 ? remainingToTarget / daysRemaining : 0;

    const inventoryVal = inventory.length > 0 ? (inventory.filter(i => i.status === 'In Stock').length / inventory.length) * 100 : 80;
    const healthScore = Math.round(
      (Math.min(achievementPercent, 110) * 0.4) + 
      (Math.min(poToInvoiceRate, 100) * 0.3) +
      (inventoryVal * 0.3)
    );

    return { 
      monthlyBillingTarget,
      actualBillingAchieved,
      remainingToTarget,
      achievementPercent,
      daysRemaining,
      requiredDailyBilling,
      totalPOValue,
      pendingPOs,
      poToInvoiceRate,
      healthScore,
      monthPOsCount: monthPOs.length
    };
  }, [records, uiSettings.monthlyBillingTargets, selectedAnalyticsDate, inventory]);

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
        status: 'Pending',
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0,
        amount: 0,
        taxTotal: 0,
        discountTotal: 0,
        additionalCharges: 0,
        roundOff: 0,
        notes: '',
        terms: '',
        quotationId: ''
      });
    }
    setIsRecordFormOpen(true);
  };

  const calculateTotals = (items: BillingLineItem[], addCharges: number = 0) => {
    let sub = 0;
    let tax = 0;
    let disc = 0;

    items.forEach(item => {
      const lineBase = item.qty * item.price;
      const lineDisc = item.discountType === 'percentage' ? (lineBase * item.discount / 100) : item.discount;
      const lineTaxable = lineBase - lineDisc;
      const lineTax = lineTaxable * item.gstRate / 100;
      
      sub += lineTaxable;
      tax += lineTax;
      disc += lineDisc;
    });

    const totalRaw = sub + tax + Number(addCharges);
    const roundOff = Math.round(totalRaw) - totalRaw;
    const grand = Math.round(totalRaw);

    setFormData(prev => ({
      ...prev,
      subTotal: sub,
      taxTotal: tax,
      discountTotal: disc,
      amount: grand,
      roundOff: Number(roundOff.toFixed(2))
    }));
  };

  const handleLineItemChange = (idx: number, field: keyof BillingLineItem, value: any) => {
    const newItems = [...(formData.items || [])];
    (newItems[idx] as any)[field] = value;
    
    const line = newItems[idx];
    const base = line.qty * line.price;
    const d = line.discountType === 'percentage' ? (base * line.discount / 100) : line.discount;
    const taxable = base - d;
    const t = taxable * line.gstRate / 100;
    line.total = taxable + t;

    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.additionalCharges);
  };

  const handleAddRow = () => {
    const newItems = [...(formData.items || []), { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }];
    setFormData({ ...formData, items: newItems as BillingLineItem[] });
  };

  const handleDuplicateRow = (idx: number) => {
    const source = formData.items![idx];
    const newItems = [...(formData.items || [])];
    newItems.splice(idx + 1, 0, { ...source, id: Date.now().toString() });
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.additionalCharges);
  };

  const handleRemoveRow = (idx: number) => {
    const newItems = formData.items!.filter((_, i) => i !== idx);
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.additionalCharges);
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." });
      return;
    }
    
    onSaveRecord(formData as BillingRecord);

    // Auto update linked quotation status
    if (activeRecordType === 'purchase_order' && formData.quotationId) {
      const qRef = doc(db, 'billing', formData.quotationId);
      updateDocumentNonBlocking(qRef, { status: 'Converted To PO' });
    }

    toast({ title: "Ledger Synchronized", description: `${formData.type} #${formData.number} committed.` });
    setIsRecordFormOpen(false);
  };

  const handleLinkQuotation = (qId: string) => {
    const quotation = records.find(r => r.id === qId);
    if (!quotation) return;

    setFormData(prev => ({
      ...prev,
      quotationId: qId,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      items: quotation.items?.map(i => ({...i, id: Math.random().toString()})) || [],
      subTotal: quotation.subTotal,
      taxTotal: quotation.taxTotal,
      amount: quotation.amount,
      discountTotal: quotation.discountTotal,
      terms: quotation.terms,
    }));

    toast({
      title: "Quotation Linked",
      description: `Imported details from Quotation #${quotation.number}.`
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (DOCUMENT_TYPES.map(d => d.id).includes(activeTab) && r.type !== activeTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (r.quotationId && records.find(x => x.id === r.quotationId)?.number.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, searchTerm, statusFilter, activeTab]);

  const AnalyticsView = () => (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#001F3D] rounded-2xl shadow-xl"><BrainCircuit className="h-7 w-7 text-primary" /></div>
          <div>
            <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tighter">Business Intelligence Matrix</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Monthly Billing Performance Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border shadow-sm">
             <Button variant="ghost" size="icon" onClick={() => {
               const d = parseISO(selectedAnalyticsDate);
               d.setMonth(d.getMonth() - 1);
               setSelectedAnalyticsDate(d.toISOString().split('T')[0]);
             }}><ChevronLeft className="h-4 w-4" /></Button>
             <span className="text-[10px] font-bold uppercase tracking-widest min-w-[120px] text-center">{format(parseISO(selectedAnalyticsDate), 'MMMM yyyy')}</span>
             <Button variant="ghost" size="icon" onClick={() => {
               const d = parseISO(selectedAnalyticsDate);
               d.setMonth(d.getMonth() + 1);
               setSelectedAnalyticsDate(d.toISOString().split('T')[0]);
             }}><ChevronRight className="h-4 w-4" /></Button>
          </div>
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
          <p className="text-xs text-white/40 leading-relaxed font-medium">Calculated from billing targets, customer PO conversion, and operational yield matrix.</p>
        </div>
        <div className="relative z-10 flex-1 flex justify-center">
          <CircularGauge achievement={biMetrics.healthScore} size={240} strokeWidth={20}>
             <span className="text-7xl font-display font-black text-white">{biMetrics.healthScore}</span>
             <Badge className={cn("mt-4 border-none text-white text-[10px] px-6", biMetrics.healthScore > 80 ? "bg-emerald-500" : biMetrics.healthScore > 50 ? "bg-amber-500" : "bg-rose-500")}>
               {biMetrics.healthScore > 80 ? 'EXCELLENT' : biMetrics.healthScore > 50 ? 'AVERAGE' : 'POOR'}
             </Badge>
          </CircularGauge>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SmartKPICard title="Monthly Billing Target" value={biMetrics.monthlyBillingTarget} target={biMetrics.monthlyBillingTarget} achievement={100} icon={Target} />
        <SmartKPICard title="Actual Achieved" value={biMetrics.actualBillingAchieved} target={biMetrics.monthlyBillingTarget} achievement={biMetrics.achievementPercent} icon={TrendingUp} />
        <SmartKPICard title="Customer PO Value" value={biMetrics.totalPOValue} target={biMetrics.monthlyBillingTarget * 1.5} achievement={(biMetrics.totalPOValue / (biMetrics.monthlyBillingTarget * 1.5 || 1)) * 100} icon={FileBadge} />
        <SmartKPICard title="PO Conversion Rate" value={`${Math.round(biMetrics.poToInvoiceRate)}%`} target={100} achievement={biMetrics.poToInvoiceRate} icon={CheckCircle2} type="circular" />
        <SmartKPICard title="PO Nodes Received" value={biMetrics.monthPOsCount} target={20} achievement={(biMetrics.monthPOsCount / 20) * 100} icon={ShoppingCart} />
        <SmartKPICard title="Pending PO Tasks" value={biMetrics.pendingPOs} target={5} achievement={100 - (biMetrics.pendingPOs * 20)} icon={Clock} />
        <SmartKPICard title="Days Remaining" value={`${biMetrics.daysRemaining} Days`} target={getDaysInMonth(parseISO(selectedAnalyticsDate))} achievement={(biMetrics.daysRemaining / getDaysInMonth(parseISO(selectedAnalyticsDate))) * 100} icon={Calendar} />
        <SmartKPICard title="Req. Daily Billing" value={biMetrics.requiredDailyBilling} target={biMetrics.requiredDailyBilling * 1.2} achievement={80} icon={Calculator} />
      </div>
    </div>
  );

  const FullPageEditor = () => {
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const isPO = activeRecordType === 'purchase_order';

    return (
      <div className="flex flex-col bg-[#F1F5F9] min-h-screen font-sans text-slate-900 animate-in fade-in duration-300 pb-40">
        <div className="sticky top-0 z-50 bg-white border-b border-slate-300 px-4 h-12 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="h-8 px-2 hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /></Button>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Transaction Registry</span>
            <span className="text-sm font-bold uppercase text-[#001F3D]">{editingRecordId ? 'Edit' : 'Create'} {isPO ? 'Customer PO' : activeRecordType.replace('_', ' ')} Matrix</span>
          </div>
          <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="sm" className="h-8 rounded-md gap-2 font-bold text-[10px] uppercase border-slate-300"><MoreHorizontal className="h-3.5 w-3.5" /> Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-[10px] font-bold uppercase">
                   <DropdownMenuItem onClick={handleAddRow}><PlusCircle className="h-3.5 w-3.5 mr-2" /> Add Product</DropdownMenuItem>
                   <DropdownMenuItem><Briefcase className="h-3.5 w-3.5 mr-2" /> Add Service</DropdownMenuItem>
                   <DropdownMenuItem><DollarSign className="h-3.5 w-3.5 mr-2" /> Add Additional Charge</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem><FileUp className="h-3.5 w-3.5 mr-2" /> Import Items</DropdownMenuItem>
                   <DropdownMenuItem><FileDown className="h-3.5 w-3.5 mr-2" /> Export Items</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <Card className="bg-white border border-slate-300 rounded-none shadow-none p-4 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">M/S (Customer Name)</Label>
                      <Select value={formData.customerId} onValueChange={(id) => {
                        const c = customers.find(x => x.id === id);
                        setFormData({ ...formData, customerId: id, customerName: c?.name || '' });
                      }}>
                         <SelectTrigger className="h-9 border-slate-300 rounded-none text-xs font-bold bg-white"><SelectValue placeholder="Identify identity..." /></SelectTrigger>
                         <SelectContent className="rounded-none border-slate-300 shadow-xl">{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">GSTIN / PAN</Label>
                      <Input readOnly className="h-9 bg-slate-50 border-slate-300 rounded-none text-xs font-bold uppercase" value={selectedCustomer?.gstNumber || '---'} />
                   </div>
                   <div className="space-y-1 col-span-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Billing Address</Label>
                      <Input readOnly className="h-9 bg-slate-50 border-slate-300 rounded-none text-xs font-medium" value={selectedCustomer?.address || '---'} />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Contact Person</Label>
                      <Input readOnly className="h-9 bg-slate-50 border-slate-300 rounded-none text-xs font-medium" value={selectedCustomer?.contactPerson || '---'} />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Place of Supply</Label>
                      <Input className="h-9 border-slate-300 rounded-none text-xs font-bold uppercase" placeholder="e.g. Maharashtra (27)" value={formData.placeOfSupply} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} />
                   </div>
                </div>
             </Card>

             <Card className="bg-white border border-slate-300 rounded-none shadow-none p-4 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Document Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Quotation Reference</Label>
                      <Select value={formData.quotationId} onValueChange={handleLinkQuotation}>
                        <SelectTrigger className="h-9 border-primary/20 bg-primary/5 rounded-none text-xs font-bold text-primary"><SelectValue placeholder="Link approved quotation..." /></SelectTrigger>
                        <SelectContent className="rounded-none border-slate-300 shadow-xl">
                          {records.filter(r => r.type === 'quotation').map(q => (
                            <SelectItem key={q.id} value={q.id} className="text-xs font-bold">{q.number} - {q.customerName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">{isPO ? 'Customer PO Number' : 'Document Number'}</Label>
                      <Input className="h-9 bg-slate-50 border-slate-300 rounded-none text-xs font-bold font-code" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">{isPO ? 'Customer PO Date' : 'Document Date'}</Label>
                      <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-9 border-slate-300 rounded-none shadow-none" />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Ref. No / Our No.</Label>
                      <Input className="h-9 border-slate-300 rounded-none text-xs font-bold" value={formData.itemName} onChange={(e)=>setFormData({...formData, itemName: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Delivery Mode</Label>
                      <Input className="h-9 border-slate-300 rounded-none text-xs font-medium uppercase" value={formData.deliveryMode} onChange={(e)=>setFormData({...formData, deliveryMode: e.target.value})} />
                   </div>
                </div>
             </Card>
          </div>

          <Card className="border border-slate-300 rounded-none shadow-none bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow className="h-10 hover:bg-transparent border-b border-slate-300">
                  <TableHead className="w-12 text-center font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">SR</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">Product / Service Description</TableHead>
                  <TableHead className="w-24 text-center font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">HSN/SAC</TableHead>
                  <TableHead className="w-20 text-center font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">Qty</TableHead>
                  <TableHead className="w-20 text-center font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">UOM</TableHead>
                  <TableHead className="w-32 text-right font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">Rate (₹)</TableHead>
                  <TableHead className="w-24 text-right font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">Disc (%)</TableHead>
                  <TableHead className="w-24 text-center font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">GST %</TableHead>
                  <TableHead className="w-32 text-right font-bold text-[10px] uppercase text-slate-600 border-r border-slate-300">Amount (₹)</TableHead>
                  <TableHead className="w-10 px-0"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items?.map((item, idx) => (
                  <TableRow key={item.id} className="h-auto hover:bg-slate-50 border-b border-slate-200">
                    <TableCell className="text-center font-bold text-[10px] border-r border-slate-200 bg-slate-50">{idx + 1}</TableCell>
                    <TableCell className="p-0 border-r border-slate-200 min-w-[300px]">
                      <div className="flex flex-col">
                        <Input className="h-9 border-none rounded-none text-xs font-bold bg-transparent shadow-none" value={item.description} onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)} placeholder="Type product name..." />
                        <Input className="h-7 border-t border-slate-100 rounded-none text-[10px] italic text-slate-400 bg-transparent shadow-none" value={item.note || ''} onChange={(e) => handleLineItemChange(idx, 'note', e.target.value)} placeholder="Add internal line note..." />
                      </div>
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-200">
                      <Input className="h-9 border-none rounded-none text-xs text-center bg-transparent shadow-none font-code" value={item.hsn} onChange={(e) => handleLineItemChange(idx, 'hsn', e.target.value)} />
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-200">
                      <Input type="number" className="h-9 border-none rounded-none text-xs text-center bg-transparent shadow-none font-bold" value={item.qty} onChange={(e) => handleLineItemChange(idx, 'qty', Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-200">
                      <Input className="h-9 border-none rounded-none text-xs text-center bg-transparent shadow-none uppercase font-medium" value={item.unit} onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)} />
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-200">
                      <Input type="number" className="h-9 border-none rounded-none text-xs text-right bg-transparent shadow-none font-bold pr-4" value={item.price} onChange={(e) => handleLineItemChange(idx, 'price', Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-200">
                      <Input type="number" className="h-9 border-none rounded-none text-xs text-right bg-transparent shadow-none pr-4" value={item.discount} onChange={(e) => handleLineItemChange(idx, 'discount', Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="p-0 border-r border-slate-200">
                       <Select value={item.gstRate.toString()} onValueChange={(val) => handleLineItemChange(idx, 'gstRate', Number(val))}>
                          <SelectTrigger className="h-9 border-none rounded-none shadow-none bg-transparent font-bold text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-none border-slate-300">
                             {[0, 5, 12, 18, 28].map(v => <SelectItem key={v} value={v.toString()} className="text-xs font-bold">{v}%</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </TableCell>
                    <TableCell className="text-right font-display font-bold text-xs pr-6 border-r border-slate-200 bg-slate-50/50">
                      ₹ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="p-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-10 text-slate-300 hover:text-slate-900"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-[10px] font-bold uppercase">
                           <DropdownMenuItem onClick={() => handleDuplicateRow(idx)}><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate Row</DropdownMenuItem>
                           <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveRow(idx)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Row</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-3 bg-slate-50 border-t border-slate-300 flex justify-between items-center">
               <Button onClick={handleAddRow} variant="outline" className="h-9 px-6 rounded-none border-slate-300 bg-white gap-2 font-bold text-[10px] uppercase tracking-widest"><Plus className="h-3.5 w-3.5" /> Add New Row</Button>
               <div className="flex gap-4">
                  <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase">Total Qty</p><p className="text-xs font-bold">{formData.items?.reduce((s,i)=>s+i.qty, 0)}</p></div>
                  <div className="text-right pr-4"><p className="text-[8px] font-bold text-slate-400 uppercase">Sub-Total</p><p className="text-xs font-bold">₹ {formData.subTotal?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p></div>
               </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-24">
             <div className="lg:col-span-8 space-y-4">
               {isPO && (
                 <Card className="bg-[#001F3D] text-white p-6 space-y-4 rounded-none shadow-none">
                    <h3 className="text-xs font-bold uppercase text-primary tracking-widest border-b border-white/10 pb-3 flex items-center gap-2">
                      <FileBadge className="h-4 w-4" /> Customer Purchase Order Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-white/40">PO Attachment (PDF)</Label>
                        <div className="h-10 border border-white/10 flex items-center px-4 gap-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                          <Upload className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Select PO Document Node</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-white/40">PO Remarks</Label>
                        <Input className="h-10 bg-white/5 border-white/10 text-white text-xs" placeholder="Add specific PO instructions..." />
                      </div>
                    </div>
                 </Card>
               )}

               <Card className="bg-white border border-slate-300 p-4 space-y-4 rounded-none shadow-none">
                 <h3 className="text-[10px] font-black uppercase text-[#001F3D] tracking-widest border-b border-slate-100 pb-2 flex justify-between items-center">
                   <div className="flex items-center gap-2"><Landmark className="h-3 w-3" /> Bank Details</div>
                   <Switch checked={true} onCheckedChange={()=>{}} />
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <Label className="text-[9px] font-bold uppercase text-slate-400">Account Selection</Label>
                       <Select defaultValue="main"><SelectTrigger className="h-9 border-slate-200 rounded-none text-xs"><SelectValue /></SelectTrigger><SelectContent className="rounded-none"><SelectItem value="main" className="text-xs">HDFC Bank - 50100XXXX</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[9px] font-bold uppercase text-slate-400">Digital Identity (UPI/QR)</Label>
                       <div className="h-9 flex items-center px-4 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase">UPI Node: ferocious@hdfc</div>
                    </div>
                 </div>
               </Card>

               <Card className="bg-white border border-slate-300 p-4 space-y-4 rounded-none shadow-none">
                 <h3 className="text-[10px] font-black uppercase text-[#001F3D] tracking-widest border-b border-slate-100 pb-2 flex justify-between items-center">
                   <div className="flex items-center gap-2"><ClipboardList className="h-3 w-3" /> Terms & Conditions</div>
                   <Button variant="ghost" size="sm" className="h-7 text-[8px] uppercase font-bold text-primary">Save as Template</Button>
                 </h3>
                 <Textarea className="bg-slate-50 border-slate-100 rounded-none text-xs min-h-[100px] shadow-none" placeholder="1. Payment 100% against delivery..." value={formData.terms} onChange={(e)=>setFormData({...formData, terms: e.target.value})} />
               </Card>
             </div>

             <div className="lg:col-span-4">
               <Card className="bg-white border-2 border-[#001F3D] shadow-none rounded-none overflow-hidden">
                  <div className="bg-[#001F3D] text-white p-4 font-black uppercase text-[10px] tracking-[0.2em] flex justify-between items-center">
                     <span>Financial Summary</span>
                     <Calculator className="h-4 w-4" />
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                        <span>Total Taxable Amount</span>
                        <span>₹ {formData.subTotal?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                     <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase">
                           <span>Integrated GST (IGST)</span>
                           <span>₹ {formData.taxTotal?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase">
                           <span>Addl. Charges / Transport</span>
                           <div className="flex items-center gap-2">
                             <span className="text-[8px]">₹</span>
                             <Input type="number" className="h-8 w-24 border-slate-200 rounded-none text-right font-bold pr-2 bg-slate-50" value={formData.additionalCharges} onChange={(e)=>{
                               const val = Number(e.target.value);
                               setFormData({...formData, additionalCharges: val});
                               calculateTotals(formData.items!, val);
                             }} />
                           </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase">
                           <span>Discount Total</span>
                           <span className="text-red-500">- ₹ {formData.discountTotal?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase">
                           <span>Round Off</span>
                           <span className="font-code">{formData.roundOff}</span>
                        </div>
                     </div>
                     
                     <div className="pt-6 border-t-2 border-slate-100 flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Payable Matrix Total</span>
                        <h4 className="text-4xl font-display font-black text-[#001F3D]">₹ {formData.amount?.toLocaleString()}</h4>
                     </div>

                     <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-none space-y-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount in words:</span>
                        <p className="text-[10px] font-bold text-[#001F3D] leading-relaxed uppercase">{numberToWords(formData.amount || 0)}</p>
                     </div>
                  </div>
               </Card>
             </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-300 p-3 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[100]">
           <Button variant="outline" className="h-11 rounded-none px-8 font-bold uppercase text-[10px] tracking-widest border-slate-300 bg-white text-slate-600" onClick={()=>setIsRecordFormOpen(false)}>Back to Ledger</Button>
           <Button className="h-11 rounded-none px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={handleSave}><Save className="h-4 w-4" /> Save & Commit</Button>
           <Button className="h-11 rounded-none px-12 bg-[#001F3D] hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={handleSave}><Printer className="h-4 w-4" /> Save & Print</Button>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const modules = [
      { id: 'quotation', label: 'Quotation', icon: FileBox, color: 'text-blue-500', bg: 'bg-blue-50', counts: { total: records.filter(r => r.type === 'quotation').length, pending: records.filter(r => r.type === 'quotation' && r.status === 'Pending').length } },
      { id: 'sale_order', label: 'Sales Order', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', counts: { total: records.filter(r => r.type === 'sale_order').length, pending: records.filter(r => r.type === 'sale_order' && r.status === 'Pending').length } },
      { id: 'invoice', label: 'Sales Invoice', icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-50', counts: { total: records.filter(r => r.type === 'invoice').length, unpaid: records.filter(r => r.type === 'invoice' && r.status !== 'Paid').length } },
      { id: 'purchase_order', label: 'Customer PO', icon: FileBadge, color: 'text-purple-500', bg: 'bg-purple-50', counts: { total: records.filter(r => r.type === 'purchase_order').length, pending: records.filter(r => r.type === 'purchase_order' && r.status === 'Pending').length } },
    ];

    if (dashboardView === 'analytics') return <AnalyticsView />;

    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-full flex gap-1 border border-slate-200">
            <button onClick={() => setDashboardView('analytics')} className={cn("px-8 py-2 rounded-full text-[10px] font-bold uppercase transition-all", dashboardView === 'analytics' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>Analytics</button>
            <button onClick={() => setDashboardView('quick')} className={cn("px-8 py-2 rounded-full text-[10px] font-bold uppercase transition-all", dashboardView === 'quick' ? "bg-primary text-white shadow-sm" : "text-slate-400")}>Quick Links</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.id} className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-3 rounded-xl", mod.bg)}><Icon className={cn("h-5 w-5", mod.color)} /></div>
                  <button onClick={() => setActiveTab(mod.id)} className="text-slate-300 hover:text-primary"><ChevronRight className="h-5 w-5" /></button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mod.label}</p>
                <h4 className="text-2xl font-display font-bold text-[#001F3D] mt-1">{mod.counts.total}</h4>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

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
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-4 h-full text-[10px] font-bold uppercase tracking-tight border-b-2 transition-all flex items-center gap-2", activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-500 hover:text-slate-900")}>
                    {tab.icon && <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-slate-400")} />}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            {activeTab === 'dashboard' ? <DashboardView /> : activeTab === 'report' ? <div className="p-20 text-center opacity-30 text-xs font-bold uppercase">Report Hub Loading...</div> : (
              <div className="p-8">
                <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-[2rem]">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">{activeTab === 'purchase_order' ? 'Customer PO' : MAIN_TABS.find(t=>t.id===activeTab)?.label} Ledger</h3>
                    <Button onClick={() => handleOpenForm(activeTab)} className="h-10 rounded-xl bg-[#001F3D] hover:bg-black text-white px-8 text-[10px] font-bold uppercase"><Plus className="h-4 w-4 mr-2" /> New Entry</Button>
                  </div>
                  <Table>
                    <TableHeader className="bg-white">
                      <TableRow className="hover:bg-transparent h-14">
                        <TableHead className="px-8 font-bold text-[10px] uppercase text-slate-400">Doc No.</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identity</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400">Ref. Quotation</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Amount</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                        <TableHead className="text-right px-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map(r => (
                        <TableRow key={r.id} className="h-16 hover:bg-slate-50/50 cursor-pointer" onClick={()=>handleOpenForm(r.type, r)}>
                          <TableCell className="px-8 font-code text-xs font-bold text-primary">{r.number}</TableCell>
                          <TableCell className="text-[11px] font-bold text-[#001F3D] uppercase">{r.customerName}</TableCell>
                          <TableCell>
                            {r.quotationId ? (
                              <Badge variant="outline" className="text-[9px] font-code border-primary/20 text-primary uppercase">
                                {records.find(x => x.id === r.quotationId)?.number || 'LINKED'}
                              </Badge>
                            ) : (
                              <span className="text-[9px] text-slate-300 italic">DIRECT_ENTRY</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-display font-bold text-[#001F3D]">₹ {(r.amount || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-center"><Badge className={cn("text-[8px] font-bold uppercase px-3 rounded-full", r.status === 'Converted To PO' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500')}>{r.status}</Badge></TableCell>
                          <TableCell className="text-right px-8"><Button variant="ghost" size="icon" onClick={(e)=>{e.stopPropagation(); onDeleteRecord(r.id)}}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4"><Target className="h-8 w-8 text-primary" /></div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Strategic Calibration</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">Configure monthly Sales Invoice targets for performance tracking.</DialogDescription>
          </DialogHeader>
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Calibration Target Month</Label>
                  <Select value={format(parseISO(selectedAnalyticsDate), 'yyyy-MM')} onValueChange={(val) => setSelectedAnalyticsDate(`${val}-01`)}>
                     <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-xl">
                        {Array.from({length: 12}, (_, i) => {
                          const d = new Date();
                          d.setMonth(i);
                          const val = format(d, 'yyyy-MM');
                          return <SelectItem key={val} value={val} className="text-xs font-bold uppercase">{format(d, 'MMMM yyyy')}</SelectItem>;
                        })}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Target Billing Amount (₹)</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      className="h-12 bg-slate-50 border-none rounded-xl pl-10 text-lg font-display font-bold text-[#001F3D]" 
                      value={uiSettings.monthlyBillingTargets?.[format(parseISO(selectedAnalyticsDate), 'yyyy-MM')] || 0} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const key = format(parseISO(selectedAnalyticsDate), 'yyyy-MM');
                        const updated = { ...(uiSettings.monthlyBillingTargets || {}), [key]: val };
                        const adminUser = users.find(u => u.role === 'Master Admin' || u.name?.toLowerCase() === 'master admin');
                        if (adminUser) {
                          setDocumentNonBlocking(doc(db, 'users', adminUser.id), {
                            uiSettings: { ...uiSettings, monthlyBillingTargets: updated }
                          }, { merge: true });
                        }
                      }}
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
               </div>
            </div>
            <Button className="w-full h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl" onClick={() => setIsTargetDialogOpen(false)}>Synchronize Strategic Matrix</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
