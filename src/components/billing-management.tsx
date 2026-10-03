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
  Save,
  Search,
  Filter,
  FileBarChart,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  PlusCircle,
  Calculator,
  Landmark,
  ClipboardList,
  FileBadge,
  PackageSearch,
  Target,
  DollarSign,
  BrainCircuit,
  Printer,
  Copy,
  MoreHorizontal,
  MoreVertical,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck,
  ArrowLeft,
  Upload,
  Download
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem, InventoryItem, ViewType, NumberSeries, ProductMaster } from '@/lib/types';
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
  startOfToday, 
  getDaysInMonth,
  getDate
} from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
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
  { id: 'product-master', label: 'Product Master', icon: PackageSearch },
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
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || <><span className="text-xl font-bold text-primary">{Math.round(achievement)}%</span></>}
      </div>
    </div>
  );
};

const SmartKPICard = ({ title, value, target, achievement, icon: Icon }: any) => {
  const isRed = achievement < 70;
  const isYellow = achievement >= 70 && achievement < 100;
  const isGreen = achievement >= 100;
  const colorClass = isGreen ? 'text-emerald-600' : isYellow ? 'text-amber-600' : 'text-rose-600';
  const progressClass = isGreen ? 'bg-emerald-600' : isYellow ? 'bg-amber-600' : 'bg-rose-600';

  return (
    <Card className="p-4 bg-white border border-slate-200 shadow-sm enterprise-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-lg font-bold text-primary">{typeof value === 'number' ? `₹ ${value.toLocaleString()}` : value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded"><Icon className="h-4 w-4 text-slate-400" /></div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
          <span>Target: {target.toLocaleString()}</span>
          <span className={colorClass}>{Math.round(achievement)}%</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn("h-full transition-all duration-1000", progressClass)} style={{ width: `${Math.min(achievement, 100)}%` }} />
        </div>
      </div>
    </Card>
  );
};

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  inventory: InventoryItem[];
  products: ProductMaster[];
  permissions: Record<string, PermissionLevel>;
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onTabChange?: (tab: ViewType) => void;
  uiSettings: UISettings;
}

export function BillingManagement({ customers, vendors, records, orders, users, inventory, products, permissions, onSaveRecord, onDeleteRecord, uiSettings }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState<'quick' | 'analytics'>('analytics');
  const [selectedAnalyticsDate, setSelectedAnalyticsDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isProductFormOpen, setIsAddProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'invoice', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Pending', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: ''
  });

  const biMetrics = useMemo(() => {
    const targetDate = parseISO(selectedAnalyticsDate);
    const mStart = startOfMonth(targetDate);
    const mEnd = endOfMonth(targetDate);
    const targetKey = format(targetDate, 'yyyy-MM');
    const monthlyBillingTarget = uiSettings.monthlyBillingTargets?.[targetKey] || 0;
    const monthInvoices = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const actualBillingAchieved = monthInvoices.reduce((sum, r) => sum + (r.amount || 0), 0);
    const achievementPercent = monthlyBillingTarget > 0 ? (actualBillingAchieved / monthlyBillingTarget) * 100 : 0;
    const healthScore = Math.round(Math.min(achievementPercent, 100) * 0.7 + 30);
    return { monthlyBillingTarget, actualBillingAchieved, achievementPercent, healthScore };
  }, [records, uiSettings.monthlyBillingTargets, selectedAnalyticsDate]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    setActiveRecordType(type);
    if (record) {
      setEditingRecordId(record.id);
      setFormData(record);
    } else {
      setEditingRecordId(null);
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `QT-0001-2024`, status: 'Pending', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0, roundOff: 0, notes: '', terms: '', quotationId: ''
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) { toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." }); return; }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} committed.` });
    setIsRecordFormOpen(false);
  };

  const FullPageEditor = () => (
    <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-300">
      <div className="sticky top-0 z-50 bg-primary text-white px-6 h-12 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Button>
          <span className="text-[10px] font-black uppercase tracking-widest">Entry Matrix: {activeRecordType.replace('_', ' ')}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] uppercase font-bold" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-2" /> Save & Commit</Button>
          <Button size="sm" className="bg-white text-primary hover:bg-slate-100 h-8 text-[10px] uppercase font-bold" onClick={handleSave}><Printer className="h-3.5 w-3.5 mr-2" /> Print</Button>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 enterprise-card space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 border-b pb-2">Customer Identity</h4>
          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-500">Customer Name</Label>
               <Select value={formData.customerId} onValueChange={(id) => { const c = customers.find(x => x.id === id); setFormData({ ...formData, customerId: id, customerName: c?.name || '' }); }}><SelectTrigger className="h-9 border-slate-300"><SelectValue placeholder="Identify..." /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent></Select>
             </div>
             <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-500">Shipping Address</Label><Input className="h-9 border-slate-300" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>
          </div>
        </Card>
        <Card className="p-6 enterprise-card space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-slate-400 border-b pb-2">Document Nodes</h4>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-500">Document No.</Label><Input className="h-9 font-code" value={formData.number} /></div>
             <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-slate-500">Document Date</Label><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-9" /></div>
          </div>
        </Card>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 border-slate-200 border rounded shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded"><BrainCircuit className="h-6 w-6 text-white" /></div>
          <div><h2 className="text-xl font-bold text-primary uppercase">Business Intelligence</h2><p className="text-[10px] text-slate-400 font-bold uppercase">Matrix Performance Analysis</p></div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" onClick={() => { const d = parseISO(selectedAnalyticsDate); d.setMonth(d.getMonth() - 1); setSelectedAnalyticsDate(d.toISOString().split('T')[0]); }}><ChevronLeft className="h-4 w-4" /></Button>
           <span className="text-[10px] font-bold uppercase min-w-[120px] text-center">{format(parseISO(selectedAnalyticsDate), 'MMMM yyyy')}</span>
           <Button variant="ghost" size="sm" onClick={() => { const d = parseISO(selectedAnalyticsDate); d.setMonth(d.getMonth() + 1); setSelectedAnalyticsDate(d.toISOString().split('T')[0]); }}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SmartKPICard title="Monthly Target" value={biMetrics.monthlyBillingTarget} target={biMetrics.monthlyBillingTarget} achievement={100} icon={Target} />
        <SmartKPICard title="Actual Achieved" value={biMetrics.actualBillingAchieved} target={biMetrics.monthlyBillingTarget} achievement={biMetrics.achievementPercent} icon={TrendingUp} />
        <div className="md:col-span-2 p-6 bg-primary text-white rounded enterprise-card flex items-center justify-between">
           <div><p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Health Score</p><h4 className="text-3xl font-bold">{biMetrics.healthScore}%</h4></div>
           <CircularGauge achievement={biMetrics.healthScore} size={80} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <>
          <div className="flex items-center justify-between bg-white border-b border-slate-200 h-12 px-1 scrollbar-hide overflow-x-auto no-print">
            <div className="flex h-full gap-0.5">{MAIN_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-4 h-full text-[10px] font-bold uppercase flex items-center gap-2 border-b-2 transition-all", activeTab === tab.id ? "border-primary text-primary bg-slate-50" : "border-transparent text-slate-500 hover:bg-slate-50")}>{tab.icon && <tab.icon className="h-3.5 w-3.5" />}{tab.label}</button>
            ))}</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' ? (
              <div className="p-6 space-y-8">
                <div className="flex justify-center"><div className="bg-slate-200 p-1 rounded flex gap-1"><button onClick={() => setDashboardView('analytics')} className={cn("px-8 py-2 rounded text-[10px] font-bold uppercase", dashboardView === 'analytics' ? "bg-white text-primary shadow-sm" : "text-slate-500")}>Analytics</button><button onClick={() => setDashboardView('quick')} className={cn("px-8 py-2 rounded text-[10px] font-bold uppercase", dashboardView === 'quick' ? "bg-primary text-white shadow-sm" : "text-slate-500")}>Quick Links</button></div></div>
                {dashboardView === 'analytics' ? <AnalyticsView /> : <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{MAIN_TABS.slice(1).map(tab => (
                  <Card key={tab.id} className="p-4 enterprise-card hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 aspect-square" onClick={() => setActiveTab(tab.id)}>
                    <div className="p-3 bg-slate-50 rounded"><tab.icon className="h-6 w-6 text-primary" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 text-center">{tab.label}</span>
                  </Card>
                ))}</div>}
              </div>
            ) : (
              <div className="p-6">
                <Card className="enterprise-card">
                  <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center"><h3 className="text-sm font-bold text-primary uppercase">{MAIN_TABS.find(t=>t.id===activeTab)?.label} Registry</h3><Button size="sm" className="h-9 px-6 font-bold uppercase text-[10px]" onClick={() => handleOpenForm(activeTab)}><Plus className="h-3.5 w-3.5 mr-2" /> New Entry</Button></div>
                  <Table><TableHeader><TableRow><TableHead>Identity</TableHead><TableHead>Doc No.</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-center">Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>{records.filter(r=>r.type === activeTab).map(r => (
                      <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="cursor-pointer">
                        <TableCell className="font-bold text-slate-700 uppercase">{r.customerName}</TableCell>
                        <TableCell className="font-code text-primary font-bold">{r.number}</TableCell>
                        <TableCell className="text-right font-bold text-slate-900">₹ {r.amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="text-[8px] font-bold uppercase">{r.status}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={(e)=>{e.stopPropagation(); onDeleteRecord(r.id);}}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
