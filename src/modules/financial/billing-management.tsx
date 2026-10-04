
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
  Trash2,
  Save,
  Search,
  FileBarChart,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Landmark,
  FileBadge,
  PackageSearch,
  Target,
  DollarSign,
  BrainCircuit,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck,
  ArrowLeft,
  Download,
  Link2,
  Package,
  Box,
  Zap,
  RefreshCw,
  Send,
  CreditCard,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Activity,
  Cpu,
  Gauge,
  Wallet,
  History,
  Factory
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem, InventoryItem, ViewType, NumberSeries, ProductMaster, Machine } from '@/lib/types';
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
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  format, 
  subMonths, 
  eachMonthOfInterval 
} from 'date-fns';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, BarChart, Bar, Cell } from 'recharts';

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'QUOTATION', icon: FileBox, prefix: 'QT' },
  { id: 'proforma', label: 'PROFORMA', icon: FileCheck, prefix: 'PFI' },
  { id: 'invoice', label: 'SALE INV', icon: FileText, prefix: 'INV' },
  { id: 'purchase_invoice', label: 'PUR INV', icon: ShoppingCart, prefix: 'PI' },
  { id: 'delivery_challan', label: 'CHALLAN', icon: Truck, prefix: 'DC' },
  { id: 'purchase_order', label: 'PUR ORDER', icon: FileBadge, prefix: 'PO' },
  { id: 'sale_order', label: 'SALE ORDER', icon: FileSpreadsheet, prefix: 'SO' },
  { id: 'credit_note', label: 'CR NOTE', icon: ArrowDownLeft, prefix: 'CN' },
  { id: 'debit_note', label: 'DB NOTE', icon: ArrowUpRight, prefix: 'DN' },
  { id: 'inward_payment', label: 'INWARD PAY', icon: ArrowDownLeft, prefix: 'REC' },
  { id: 'outward_payment', label: 'OUTWARD PAY', icon: ArrowUpRight, prefix: 'PAY' },
];

const DAILY_UTILIZATION_DATA = [
  { day: 'Mon', value: 72 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 92 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 30 },
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

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  inventory: InventoryItem[];
  products: ProductMaster[];
  machines: Machine[];
  permissions: Record<string, PermissionLevel>;
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  uiSettings: UISettings;
  initialTab?: string;
}

export function BillingManagement({ 
  customers, vendors, records, orders, users, inventory, products, machines, permissions, 
  onSaveRecord, onDeleteRecord, uiSettings, initialTab = 'invoice' 
}: BillingManagementProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'invoice', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Pending', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0
  });

  const biMetrics = useMemo(() => {
    const targetDate = new Date();
    const mStart = startOfMonth(targetDate);
    const mEnd = endOfMonth(targetDate);
    const targetKey = format(targetDate, 'yyyy-MM');
    const monthlyBillingTarget = uiSettings.monthlyBillingTargets?.[targetKey] || 0;
    
    const monthInvoices = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const actualBillingAchieved = monthInvoices.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const customerPOValue = records.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInvoiced = records.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInward = records.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalInward;
    
    const openQuotes = records.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    const activeOrders = orders.filter(o => o.status === 'Active' || o.status === 'Production').length;
    const pendingDispatch = orders.filter(o => o.status === 'Ready for Delivery' || o.status === 'Inspection').length;
    const prodAchievement = orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + (o.progress || 0), 0) / orders.length) : 0;
    const machineUtil = (machines || []).length > 0 ? Math.round(machines.reduce((acc, m) => acc + (m.load || 0), 0) / machines.length) : 0;

    const achievementPercent = monthlyBillingTarget > 0 ? (actualBillingAchieved / monthlyBillingTarget) * 100 : 0;
    const monthInward = records.filter(r => r.type === 'inward_payment' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const totalCollected = monthInward.reduce((acc, r) => acc + (r.amount || 0), 0);
    const collectionAchievement = actualBillingAchieved > 0 ? (totalCollected / actualBillingAchieved) * 100 : 100;
    const healthScore = Math.min(100, Math.round((achievementPercent * 0.3) + (collectionAchievement * 0.3) + (prodAchievement * 0.2) + (machineUtil * 0.2)));

    const months = eachMonthOfInterval({ start: subMonths(targetDate, 5), end: targetDate });
    const financialTrends = months.map(m => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const mLabel = format(m, 'MMM');
      const mInvoices = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), { start, end }));
      const mInward = records.filter(r => r.type === 'inward_payment' && isWithinInterval(parseISO(r.date), { start, end }));
      const mPOs = records.filter(r => r.type === 'purchase_order' && isWithinInterval(parseISO(r.date), { start, end }));
      
      return {
        month: mLabel,
        billing: mInvoices.reduce((acc, r) => acc + (r.amount || 0), 0),
        collection: mInward.reduce((acc, r) => acc + (r.amount || 0), 0),
        po: mPOs.reduce((acc, r) => acc + (r.amount || 0), 0)
      };
    });

    return { 
      monthlyBillingTarget, 
      actualBillingAchieved, 
      customerPOValue,
      outstanding,
      openQuotes,
      activeOrders,
      pendingDispatch,
      prodAchievement,
      machineUtil,
      achievementPercent, 
      healthScore, 
      collected: totalCollected,
      collectionAchievement,
      financialTrends
    };
  }, [records, orders, machines, uiSettings.monthlyBillingTargets]);

  const machineStatuses = useMemo(() => {
    return (machines || []).slice(0, 6).map(m => ({
      id: m.mcNumber || m.id,
      name: m.name,
      status: m.status,
      yield: m.load,
      color: m.status === 'Running' || m.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
    }));
  }, [machines]);

  const filteredRecordsByType = useMemo(() => {
    return records.filter(r => {
      const isTab = r.type === activeTab;
      if (!isTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    if (record) {
      setEditingRecordId(record.id);
      setFormData(record);
    } else {
      setEditingRecordId(null);
      const prefix = DOCUMENT_TYPES.find(t=>t.id===type)?.prefix || 'DOC';
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `${prefix}-${Date.now().toString().slice(-4)}`, status: 'Pending', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0, roundOff: 0, notes: '', terms: '', quotationId: '',
        placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
        revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0
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
    toast({ title: "Ledger Synchronized", description: `${formData.type} committed to master matrix.` });
    setIsRecordFormOpen(false);
  };

  const AnalyticsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 font-body">
      {/* ROW 1: EXECUTIVE KPI MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500/50 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Billing</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-display font-black text-slate-900">₹ {(biMetrics.actualBillingAchieved / 100000).toFixed(1)}L</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Receipt className="h-4 w-4" /></div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection Rate</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-display font-black text-emerald-600">{biMetrics.collectionAchievement.toFixed(1)}%</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Landmark className="h-4 w-4" /></div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-orange-500/50 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Production Achievement</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-display font-black text-orange-600">{biMetrics.prodAchievement}%</span>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Factory className="h-4 w-4" /></div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Machine Utilization</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-display font-black text-primary">{biMetrics.machineUtil}%</span>
            <div className="p-2 bg-primary/5 rounded-lg text-primary"><Cpu className="h-4 w-4" /></div>
          </div>
        </Card>

        <Card className="p-4 bg-[#1E293B] text-white border-none shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Business Health Score</p>
          <div className="flex items-center justify-between mt-2 relative z-10">
            <span className="text-3xl font-display font-black text-white">{biMetrics.healthScore}%</span>
            <div className="h-10 w-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                <circle cx="20" cy="20" r="16" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray="100.5" strokeDashoffset={100.5 - (100.5 * biMetrics.healthScore / 100)} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 2: PERFORMANCE INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 bg-white border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Business Performance Trend</h3>
                <p className="text-[10px] text-slate-400 font-medium">MTD Billing, Collection & PO Matrix</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500" /><span className="text-[8px] font-bold text-slate-500 uppercase">Billing</span></div>
                 <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-bold text-slate-500 uppercase">Collection</span></div>
              </div>
           </div>
           <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={biMetrics.financialTrends}>
                   <defs>
                     <linearGradient id="colorBilling" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.05}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                     <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                   <ChartTooltip />
                   <Area name="Billing" type="monotone" dataKey="billing" stroke="#3b82f6" strokeWidth={3} fill="url(#colorBilling)" />
                   <Area name="Collection" type="monotone" dataKey="collection" stroke="#10b981" strokeWidth={3} fill="url(#colorColl)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer PO Analysis</h4>
                 <ShoppingCart className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-4">
                 <p className="text-3xl font-display font-black text-slate-900">₹ {(biMetrics.customerPOValue / 100000).toFixed(1)}L</p>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase">
                       <span className="text-slate-400">Target Achievement</span>
                       <span className="text-emerald-600">{Math.round(biMetrics.achievementPercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                       <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(biMetrics.achievementPercent, 100)}%` }} />
                    </div>
                 </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Open Quotes</span>
                    <span className="text-sm font-bold text-slate-900">{biMetrics.openQuotes}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* ROW 3: OPERATIONAL DEPTH MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Work Order Analytics</h4>
          </div>
          <div className="space-y-3">
             {[
               { label: 'Active Threads', val: biMetrics.activeOrders, color: 'text-blue-600' },
               { label: 'Pending Dispatch', val: biMetrics.pendingDispatch, color: 'text-amber-600' },
               { label: 'Delayed Protocol', val: orders.filter(o=>o.status==='Delayed').length, color: 'text-rose-600' },
             ].map(item => (
               <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{item.label}</span>
                  <span className={cn("text-sm font-display font-black", item.color)}>{item.val}</span>
               </div>
             ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Factory className="h-4 w-4 text-emerald-600" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Production Analytics</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[7px] font-bold text-slate-400 uppercase">Produced</p>
                <p className="text-lg font-display font-bold text-slate-900">7.1K</p>
             </div>
             <div className="p-3 bg-rose-50 rounded-xl space-y-1">
                <p className="text-[7px] font-bold text-rose-600 uppercase">Rejected</p>
                <p className="text-lg font-display font-bold text-rose-700">142</p>
             </div>
             <div className="p-3 bg-emerald-50 rounded-xl space-y-1">
                <p className="text-[7px] font-bold text-emerald-600 uppercase">Efficiency</p>
                <p className="text-lg font-display font-bold text-emerald-700">84%</p>
             </div>
             <div className="p-3 bg-blue-50 rounded-xl space-y-1">
                <p className="text-[7px] font-bold text-blue-600 uppercase">OEE</p>
                <p className="text-lg font-display font-bold text-blue-700">{biMetrics.machineUtil}%</p>
             </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Quality Analytics</h4>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Inspection Compliance</span>
                <span className="text-[11px] font-black text-indigo-600">96.2%</span>
             </div>
             <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: '96%' }} />
             </div>
             <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col"><span className="text-[7px] font-bold text-slate-400 uppercase">Passed</span><span className="text-sm font-display font-bold text-slate-900">118</span></div>
                <div className="flex flex-col"><span className="text-[7px] font-bold text-slate-400 uppercase">NCR Released</span><span className="text-sm font-display font-bold text-rose-600">6</span></div>
             </div>
          </div>
        </Card>
      </div>

      {/* ROW 4: ASSET TELEMETRY (FULL WIDTH) */}
      <Card className="p-8 bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-xl text-slate-900"><Cpu className="h-6 w-6" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 uppercase">Institutional Machine Analytics</h3>
                <p className="text-xs text-slate-400">Live operational load distribution across all asset nodes.</p>
              </div>
           </div>
           <div className="flex gap-6">
              <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase">Active Nodes</p><p className="text-xl font-display font-black text-slate-900">{machines.filter(m=>m.status==='active'||m.status==='Running').length}</p></div>
              <div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase">Avg Availability</p><p className="text-xl font-display font-black text-emerald-600">92.4%</p></div>
           </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           {machineStatuses.map(m => (
             <div key={m.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[8px] font-bold text-slate-400 uppercase font-code">{m.id}</span>
                   <div className={cn("h-1.5 w-1.5 rounded-full", m.status === 'active' || m.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-300')} />
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase truncate mb-3">{m.name}</p>
                <div className="flex items-end justify-between">
                   <span className="text-xl font-display font-black text-slate-900">{m.yield}%</span>
                   <div className="h-8 w-12 opacity-30 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={DAILY_UTILIZATION_DATA.slice(0, 3)}>
                            <Bar dataKey="value" fill="#6366f1" radius={[1, 1, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-700">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <div className="space-y-8">
          {activeTab === 'dashboard' ? <AnalyticsView /> : 
           activeTab === 'product-master' ? <div className="space-y-8">
              <Card className="p-0 border-slate-200 dark:border-border bg-white dark:bg-card shadow-xl rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                    <TableRow className="hover:bg-transparent"><TableHead className="px-8">Identity</TableHead><TableHead>Classification</TableHead><TableHead>HSN/SAC</TableHead><TableHead className="text-right px-8">Rate (₹)</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>{products.map(p => (
                    <TableRow key={p.id} className="h-20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <TableCell className="px-8"><div className="flex flex-col"><span className="text-sm font-bold uppercase">{p.name}</span><span className="text-[9px] text-slate-400 font-code">{p.code}</span></div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[8px] uppercase">{p.type}</Badge></TableCell>
                      <TableCell className="font-code text-xs">{p.hsn}</TableCell>
                      <TableCell className="text-right px-8 font-display font-bold text-primary">₹ {p.saleRate.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </Card>
           </div> : (
            <div className="space-y-8">
              <div className="flex justify-between items-end gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {activeTab}s</p><p className="text-2xl font-display font-black text-[#001F3D] dark:text-white">{filteredRecordsByType.length}</p></Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p><p className="text-2xl font-display font-black text-emerald-600">₹ {filteredRecordsByType.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()}</p></Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Protocol</p><p className="text-2xl font-display font-black text-orange-500">{filteredRecordsByType.filter(r => r.status === 'Pending').length}</p></Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Settled Nodes</p><p className="text-2xl font-display font-black text-blue-500">{filteredRecordsByType.filter(r => r.status === 'Paid' || r.status === 'Authorized').length}</p></Card>
                 </div>
                 <Button className="h-14 bg-[#001F3D] dark:bg-primary hover:bg-black text-white dark:text-card rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex gap-3 px-8" onClick={() => handleOpenForm(activeTab)}>
                    <Plus className="h-4 w-4" /> NEW {activeTab.toUpperCase()}
                 </Button>
              </div>

              <Card className="p-4 bg-white dark:bg-card border-slate-200 dark:border-border rounded-2xl flex gap-4">
                 <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input placeholder="SEARCH NUMBER OR CUSTOMER..." className="h-12 pl-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-[10px] font-black uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                 <Button variant="outline" className="h-12 px-6 rounded-xl font-bold uppercase text-[9px] gap-2"><Download className="h-4 w-4" /> Export Ledger</Button>
              </Card>

              <Card className="overflow-hidden border-none bg-white dark:bg-card shadow-sm rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow className="hover:bg-transparent"><TableHead className="px-8 py-5 font-black text-[9px] uppercase">Document Node</TableHead><TableHead className="font-black text-[9px] uppercase">Identity Account</TableHead><TableHead className="text-right font-black text-[9px] uppercase">Grand Total</TableHead><TableHead className="text-center font-black text-[9px] uppercase">State</TableHead><TableHead className="text-right px-8 font-black text-[9px] uppercase">Action</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>{filteredRecordsByType.map(r => (
                    <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="h-20 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                      <TableCell className="px-8"><div className="flex flex-col"><span className="text-xs font-bold text-primary font-code">{r.number}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{r.date}</span></div></TableCell>
                      <TableCell><span className="text-sm font-black text-[#001F3D] dark:text-white uppercase tracking-tight">{r.customerName}</span></TableCell>
                      <TableCell className="text-right font-display font-black text-sm px-6">₹ {r.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className="text-[8px] font-black uppercase px-4 py-1.5 rounded-full border-slate-100">{r.status}</Badge></TableCell>
                      <TableCell className="text-right px-8"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function FullPageEditor() {
    const totalQuotationVal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0);
    }, []);

    const totalTax = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0);
    }, []);

    const grandTotal = useMemo(() => {
      let total = totalQuotationVal + totalTax;
      total += (formData.additionalCharges || 0);
      total += (formData.tcsAmount || 0);
      total -= (formData.discountTotal || 0);
      if (formData.isRoundOffActive) {
        return Math.round(total);
      }
      return total;
    }, [totalQuotationVal, totalTax, formData.additionalCharges, formData.tcsAmount, formData.discountTotal, formData.isRoundOffActive]);

    return (
      <div className="flex flex-col bg-[#F8FAFC] dark:bg-slate-950 min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Transaction Matrix</span>
              <h2 className="text-lg font-display font-bold uppercase leading-none">{activeTab.replace('_', ' ')} Registry</h2>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-10 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Back</Button>
             <Button className="bg-[#00E5A8] hover:bg-emerald-600 text-[#001F3D] h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-2" onClick={handleSave}>
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Save className="h-4 w-4 mr-2" /> Save
             </Button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto w-full p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Customer Identification</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Account M/S.<span className="text-red-500">*</span></Label></div>
                  <div className="md:col-span-2">
                    <Select value={formData.customerId} onValueChange={(id) => { 
                      const c = customers.find(x => x.id === id); 
                      setFormData({ ...formData, customerId: id, customerName: c?.name || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', gstNumber: c?.gstNumber || '' }); 
                    }}>
                      <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify Account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
