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

const MONTHS_LIST = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
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

const SmartKPICard = ({ title, value, target, achievement, icon: Icon, type = 'linear', colorScheme }: any) => {
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
  });

  const biMetrics = useMemo(() => {
    const targetDate = parseISO(selectedAnalyticsDate);
    const mStart = startOfMonth(targetDate);
    const mEnd = endOfMonth(targetDate);
    const today = startOfToday();
    
    const targetKey = format(targetDate, 'yyyy-MM');
    const monthlyBillingTarget = uiSettings.monthlyBillingTargets?.[targetKey] || 0;

    // Filter STRICTLY for Sales Invoices in the selected month
    const monthInvoices = records.filter(r => 
      r.type === 'invoice' && 
      isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd })
    );

    const actualBillingAchieved = monthInvoices.reduce((sum, r) => sum + (r.amount || 0), 0);
    const remainingToTarget = Math.max(0, monthlyBillingTarget - actualBillingAchieved);
    const achievementPercent = monthlyBillingTarget > 0 ? (actualBillingAchieved / monthlyBillingTarget) * 100 : 0;

    // Calculate Days Remaining and Required Daily Billing
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

    // Business Health Score (Placeholder for other metrics while focusing on requested billing system)
    const collectionVal = records.filter(r => r.type === 'inward_payment').reduce((s, r) => s + r.amount, 0);
    const healthScore = Math.round(
      (Math.min(achievementPercent, 100) * 0.4) + 
      (Math.min((collectionVal / (monthlyBillingTarget || 1)) * 100, 100) * 0.3) +
      (80 * 0.3) // Static high production/inventory score for MVP
    );

    return { 
      monthlyBillingTarget,
      actualBillingAchieved,
      remainingToTarget,
      achievementPercent,
      daysRemaining,
      requiredDailyBilling,
      healthScore
    };
  }, [records, uiSettings.monthlyBillingTargets, selectedAnalyticsDate]);

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
      });
    }
    setIsRecordFormOpen(true);
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
      if (DOCUMENT_TYPES.map(d => d.id).includes(activeTab) && r.type !== activeTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
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
          <p className="text-xs text-white/40 leading-relaxed font-medium">Calculated from actual billing, collection efficiency, and inventory health matrix.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <SmartKPICard title="Monthly Billing Target" value={biMetrics.monthlyBillingTarget} target={biMetrics.monthlyBillingTarget} achievement={100} icon={Target} />
        <SmartKPICard title="Actual Achieved" value={biMetrics.actualBillingAchieved} target={biMetrics.monthlyBillingTarget} achievement={biMetrics.achievementPercent} icon={TrendingUp} />
        <SmartKPICard title="Remaining To Target" value={biMetrics.remainingToTarget} target={biMetrics.monthlyBillingTarget} achievement={biMetrics.achievementPercent} icon={DollarSign} />
        <SmartKPICard title="Achievement Rate" value={`${Math.round(biMetrics.achievementPercent)}%`} target={100} achievement={biMetrics.achievementPercent} icon={Percent} type="circular" />
        <SmartKPICard title="Days Remaining" value={`${biMetrics.daysRemaining} Days`} target={getDaysInMonth(parseISO(selectedAnalyticsDate))} achievement={(biMetrics.daysRemaining / getDaysInMonth(parseISO(selectedAnalyticsDate))) * 100} icon={Clock} />
        <SmartKPICard title="Req. Daily Billing" value={biMetrics.requiredDailyBilling} target={biMetrics.requiredDailyBilling * 1.2} achievement={80} icon={Calculator} />
      </div>
    </div>
  );

  const DashboardView = () => {
    if (dashboardView === 'analytics') return <AnalyticsView />;

    const modules = [
      { id: 'quotation', label: 'Quotation', icon: FileBox, color: 'text-blue-500', bg: 'bg-blue-50', counts: { total: records.filter(r => r.type === 'quotation').length, pending: records.filter(r => r.type === 'quotation' && r.status === 'Pending').length } },
      { id: 'sale_order', label: 'Sales Order', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', counts: { total: records.filter(r => r.type === 'sale_order').length, pending: records.filter(r => r.type === 'sale_order' && r.status === 'Pending').length } },
      { id: 'invoice', label: 'Sales Invoice', icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-50', counts: { total: records.filter(r => r.type === 'invoice').length, unpaid: records.filter(r => r.type === 'invoice' && r.status !== 'Paid').length } },
      { id: 'purchase_invoice', label: 'Pur Inv', icon: ShoppingCart, color: 'text-rose-500', bg: 'bg-rose-50', counts: { total: records.filter(r => r.type === 'purchase_invoice').length, unpaid: records.filter(r => r.type === 'purchase_invoice' && r.status !== 'Paid').length } },
    ];

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

  const FullPageEditor = () => (
    <div className="flex flex-col bg-[#F8FAFC] min-h-screen animate-in fade-in duration-300 pb-40">
      <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#001F3D] rounded text-white"><Receipt className="h-5 w-5" /></div>
          <h2 className="text-xl font-bold text-[#001F3D] uppercase tracking-tighter">{editingRecordId ? 'Edit' : 'Create'} {activeRecordType} Matrix</h2>
        </div>
        <Button variant="ghost" onClick={() => setIsRecordFormOpen(false)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
      </div>
      <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-8 space-y-6">
         {/* Form content mapping similar to restoration request */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 border-slate-200 bg-white rounded-2xl space-y-6">
               <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest border-b pb-3">Customer Information</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-12 items-center gap-4">
                     <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">M/S</Label>
                     <Select value={formData.customerId} onValueChange={(id) => {
                       const c = customers.find(x => x.id === id);
                       setFormData({ ...formData, customerId: id, customerName: c?.name || '' });
                     }}>
                        <SelectTrigger className="col-span-8 bg-slate-50 border-none h-10 text-xs font-bold uppercase"><SelectValue placeholder="Identify identity..." /></SelectTrigger>
                        <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}</SelectContent>
                     </Select>
                  </div>
               </div>
            </Card>
            <Card className="p-8 border-slate-200 bg-white rounded-2xl space-y-6">
               <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest border-b pb-3">Quotation Detail</h3>
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-12 items-center gap-4">
                     <Label className="col-span-4 text-[11px] font-bold text-slate-500 uppercase">Doc No.</Label>
                     <Input readOnly className="col-span-8 bg-slate-50 border-none h-10 font-code text-xs font-bold" value={formData.number} />
                  </div>
               </div>
            </Card>
         </div>
         <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white flex justify-end gap-3 z-50">
            <Button variant="outline" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px]" onClick={()=>setIsRecordFormOpen(false)}>Back</Button>
            <Button className="bg-[#001F3D] hover:bg-black text-white rounded-xl h-12 px-12 font-bold uppercase text-[10px]" onClick={handleSave}>Save & Commit</Button>
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
                    <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase">{MAIN_TABS.find(t=>t.id===activeTab)?.label} Ledger</h3>
                    <Button onClick={() => handleOpenForm(activeTab)} className="h-10 rounded-xl bg-[#001F3D] hover:bg-black text-white px-8 text-[10px] font-bold uppercase"><Plus className="h-4 w-4 mr-2" /> New Entry</Button>
                  </div>
                  <Table>
                    <TableHeader className="bg-white">
                      <TableRow className="hover:bg-transparent h-14">
                        <TableHead className="px-8 font-bold text-[10px] uppercase text-slate-400">Doc No.</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identity</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Amount</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                        <TableHead className="text-right px-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map(r => (
                        <TableRow key={r.id} className="h-16 hover:bg-slate-50/50 cursor-pointer" onClick={()=>setPreviewRecord(r)}>
                          <TableCell className="px-8 font-code text-xs font-bold text-primary">{r.number}</TableCell>
                          <TableCell className="text-[11px] font-bold text-[#001F3D] uppercase">{r.customerName}</TableCell>
                          <TableCell className="text-right font-display font-bold text-[#001F3D]">₹ {(r.amount || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-center"><Badge className="text-[8px] font-bold uppercase px-3 rounded-full">{r.status}</Badge></TableCell>
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
                        // Note: In real app, call a handler to update the database. For MVP simulation:
                        const adminUser = users.find(u => u.name?.toLowerCase() === 'master admin');
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
