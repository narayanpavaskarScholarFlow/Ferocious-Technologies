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
  Download,
  Link2,
  Info,
  Package,
  Box,
  Zap,
  RotateCcw,
  Settings2,
  RefreshCw,
  MoreHorizontal as Dots,
  Maximize2,
  Send,
  User,
  History,
  Contact,
  CreditCard,
  FileSpreadsheet,
  Users
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
  getDate,
  isValid,
  subMonths,
  isAfter
} from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

const MAIN_TABS = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutGrid },
  { id: 'product-master', label: 'IDENTITY', icon: Users },
  ...DOCUMENT_TYPES,
  { id: 'report', label: 'REPORT', icon: FileBarChart },
];

const SALES_CHART_DATA = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 180 },
  { name: 'Wed', value: 150 },
  { name: 'Thu', value: 240 },
  { name: 'Fri', value: 210 },
  { name: 'Sat', value: 110 },
  { name: 'Sun', value: 90 },
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
  permissions: Record<string, PermissionLevel>;
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onTabChange?: (tab: ViewType) => void;
  uiSettings: UISettings;
}

export function BillingManagement({ 
  customers, vendors, records, orders, users, inventory, products, permissions, 
  onSaveRecord, onDeleteRecord, uiSettings 
}: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState<'quick' | 'analytics'>('analytics');
  const [selectedAnalyticsDate, setSelectedAnalyticsDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [targetValueInput, setTargetValueInput] = useState('');

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'invoice', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Pending', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0
  });

  const [productFormData, setProductFormData] = useState<Partial<ProductMaster>>({
    id: '', code: '', name: '', description: '', hsn: '', gstRate: 18, uom: 'Nos', 
    saleRate: 0, purchaseRate: 0, category: 'General', type: 'Manufacturing Product', status: 'Active'
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
    
    const monthInward = records.filter(r => r.type === 'inward_payment' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const totalCollected = monthInward.reduce((acc, r) => acc + (r.amount || 0), 0);
    const collectionAchievement = actualBillingAchieved > 0 ? (totalCollected / actualBillingAchieved) * 100 : 100;

    const healthScore = Math.min(100, Math.round((achievementPercent * 0.4) + (collectionAchievement * 0.4) + (90 * 0.2)));

    const remainingToTarget = Math.max(0, monthlyBillingTarget - actualBillingAchieved);

    const monthPurchases = records.filter(r => r.type === 'purchase_invoice' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const totalPurchase = monthPurchases.reduce((sum, r) => sum + (r.amount || 0), 0);

    return { 
      monthlyBillingTarget, 
      actualBillingAchieved, 
      achievementPercent, 
      healthScore, 
      remaining: remainingToTarget,
      collected: totalCollected,
      collectionAchievement,
      totalPurchase
    };
  }, [records, uiSettings.monthlyBillingTargets, selectedAnalyticsDate]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isTab = r.type === activeTab;
      if (!isTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    setActiveRecordType(type);
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
    
    if (formData.type === 'purchase_order' && formData.quotationId) {
      updateDocumentNonBlocking(doc(db, 'billing', formData.quotationId), { status: 'Converted To PO' });
    }

    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} committed to master matrix.` });
    setIsRecordFormOpen(false);
  };

  const handleSyncTargets = () => {
    const val = parseFloat(targetValueInput) || 0;
    const targetKey = format(parseISO(selectedAnalyticsDate), 'yyyy-MM');
    const updatedTargets = { ...(uiSettings.monthlyBillingTargets || {}), [targetKey]: val };
    
    const masterAdmin = users.find(u => u.role === 'Master Admin' || u.name?.toLowerCase() === 'master admin' || u.username === 'admin');
    if (masterAdmin) {
      setDocumentNonBlocking(doc(db, 'users', masterAdmin.id), {
        uiSettings: { ...uiSettings, monthlyBillingTargets: updatedTargets }
      }, { merge: true });
      toast({ title: "Calibration Synchronized", description: `Target for ${format(parseISO(selectedAnalyticsDate), 'MMMM yyyy')} updated to ₹${val.toLocaleString()}.` });
      setIsCalibrationOpen(false);
    }
  };

  const KPIGauge = ({ percent, color }: { percent: number, color: string }) => (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
        <circle 
          cx="24" cy="24" r="20" 
          stroke={color} 
          strokeWidth="4" 
          fill="transparent" 
          strokeDasharray="125.6" 
          strokeDashoffset={125.6 - (125.6 * Math.min(percent, 100) / 100)} 
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[8px] font-black text-slate-400">{Math.round(percent)}%</span>
    </div>
  );

  const FullPageEditor = () => {
    const totalQuotationVal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0);
    }, [formData.items]);

    const totalTax = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0);
    }, [formData.items]);

    const grandTotal = useMemo(() => {
      let total = totalQuotationVal + totalTax;
      total += (formData.additionalCharges || 0);
      total += (formData.tcsAmount || 0);
      total -= (formData.discountTotal || 0);
      if (formData.isRoundOffActive) {
        const rounded = Math.round(total);
        return rounded;
      }
      return total;
    }, [totalQuotationVal, totalTax, formData.additionalCharges, formData.tcsAmount, formData.discountTotal, formData.isRoundOffActive]);

    return (
      <div className="flex flex-col bg-[#F8FAFC] dark:bg-slate-950 min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        {/* Institutional Toolbar */}
        <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Transaction Protocol</span>
              <h2 className="text-lg font-display font-bold uppercase leading-none">{activeRecordType.replace('_', ' ')} Registry</h2>
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
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Customer Information</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">M/S.<span className="text-red-500">*</span></Label></div>
                  <div className="md:col-span-2">
                    <Select value={formData.customerId} onValueChange={(id) => { 
                      const c = customers.find(x => x.id === id); 
                      setFormData({ ...formData, customerId: id, customerName: c?.name || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', gstNumber: c?.gstNumber || '' }); 
                    }}>
                      <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify Account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1 flex items-start pt-2"><Label className="text-[10px] font-black uppercase text-slate-400">Address</Label></div>
                  <div className="md:col-span-2"><Textarea className="bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs min-h-[60px]" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Contact Person</Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold" value={formData.contactPerson} onChange={(e)=>setFormData({...formData, contactPerson: e.target.value})} /></div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Phone No</Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold" value={formData.phoneNo} onChange={(e)=>setFormData({...formData, phoneNo: e.target.value})} /></div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">GSTIN / PAN</Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold uppercase" value={formData.gstNumber} onChange={(e)=>setFormData({...formData, gstNumber: e.target.value})} /></div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Rev. Charge</Label></div>
                  <div className="md:col-span-2">
                    <Select value={formData.revCharge} onValueChange={(val:any)=>setFormData({...formData, revCharge: val})}>
                      <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Place of Supply<span className="text-red-500">*</span></Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold uppercase" value={formData.placeOfSupply} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} /></div>
               </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">{activeRecordType.replace('_', ' ')} Detail</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Type</Label></div>
                  <div className="md:col-span-3">
                    <Select value="Default"><SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Default">Default</SelectItem></SelectContent></Select>
                  </div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">{activeRecordType.replace('_', ' ')} No.<span className="text-red-500">*</span></Label></div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold text-center flex-1" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                  </div>
                  <div className="md:col-span-1">
                    <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-10" />
                  </div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Challan No.</Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold" value={formData.challanNo} onChange={(e)=>setFormData({...formData, challanNo: e.target.value})} /></div>
                  <div className="md:col-span-1"><DatePicker value={formData.challanDate} onChange={(val)=>setFormData({...formData, challanDate: val})} className="h-10" placeholder="dd/mm/yy" /></div>

                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">L.R. No.</Label></div>
                  <div className="md:col-span-3"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold" value={formData.lrNo} onChange={(e)=>setFormData({...formData, lrNo: e.target.value})} /></div>

                  <div className="md:col-span-1 flex items-center pt-6"><Label className="text-[10px] font-black uppercase text-slate-400">Delivery</Label></div>
                  <div className="md:col-span-3 pt-6">
                    <Select value={formData.deliveryMode} onValueChange={(val)=>setFormData({...formData, deliveryMode: val})}>
                      <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border rounded-lg text-xs font-bold uppercase"><SelectValue placeholder="Select Delivery Mode" /></SelectTrigger>
                      <SelectContent><SelectItem value="Truck">Truck</SelectItem><SelectItem value="Air">Air</SelectItem><SelectItem value="Hand">Hand Delivery</SelectItem></SelectContent>
                    </Select>
                  </div>
               </div>
            </Card>
          </div>

          <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-50 dark:border-border flex justify-between items-center bg-white dark:bg-card">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Product Items</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300"><Dots className="h-4 w-4" /></Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-border text-[8px] font-black uppercase text-slate-400">
                    <th className="py-3 px-4 w-12 text-center border-r dark:border-border">SR.</th>
                    <th className="py-3 px-4 border-r dark:border-border">PRODUCT / OTHER CHARGES</th>
                    <th className="py-3 px-4 w-32 border-r dark:border-border">HSN/SAC CODE</th>
                    <th className="py-3 px-4 w-24 text-center border-r dark:border-border">QTY.</th>
                    <th className="py-3 px-4 w-24 text-center border-r dark:border-border">UOM</th>
                    <th className="py-3 px-4 w-32 text-center border-r dark:border-border">PRICE</th>
                    <th className="py-3 px-4 w-24 text-center border-r dark:border-border">DISCOUNT</th>
                    <th className="py-3 px-4 w-40 text-center border-r dark:border-border">IGST</th>
                    <th className="py-3 px-4 w-32 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || []).map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="text-center py-4 border-r dark:border-border text-[10px] font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-0 border-r dark:border-border">
                         <div className="flex flex-col">
                            <Select value={item.productId} onValueChange={(pId) => {
                              const p = products.find(x => x.id === pId);
                              const newItems = [...(formData.items || [])];
                              newItems[idx] = { ...newItems[idx], productId: pId, description: p?.name || '', hsn: p?.hsn || '', price: p?.saleRate || 0, gstRate: p?.gstRate || 18, unit: p?.uom || 'Nos', total: (newItems[idx].qty || 1) * (p?.saleRate || 0) };
                              setFormData({...formData, items: newItems});
                            }}>
                              <SelectTrigger className="border-none bg-transparent h-10 text-[10px] font-bold uppercase rounded-none focus:ring-0">
                                <SelectValue placeholder="Enter Product name" />
                              </SelectTrigger>
                              <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase">{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Textarea className="border-none bg-[#FFFDE7]/40 dark:bg-slate-800/40 min-h-[40px] text-[9px] italic rounded-none focus-visible:ring-0 px-4" placeholder="Item Note..." value={item.note} onChange={(e)=>{
                               const newItems = [...(formData.items || [])];
                               newItems[idx].note = e.target.value;
                               setFormData({...formData, items: newItems});
                            }} />
                         </div>
                      </td>
                      <td className="border-r dark:border-border"><Input className="border-none bg-transparent h-10 text-center text-[10px] font-code" placeholder="HSN/SAC" value={item.hsn} readOnly /></td>
                      <td className="border-r dark:border-border"><Input type="number" className="border-none bg-transparent h-10 text-center text-[10px] font-bold" placeholder="Qty." value={item.qty} onChange={(e)=>{
                         const newItems = [...(formData.items || [])];
                         newItems[idx].qty = Number(e.target.value);
                         newItems[idx].total = Number(e.target.value) * newItems[idx].price;
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="border-r dark:border-border"><Input className="border-none bg-transparent h-10 text-center text-[10px] uppercase font-bold" placeholder="UOM" value={item.unit} readOnly /></td>
                      <td className="border-r dark:border-border"><Input type="number" className="border-none bg-transparent h-10 text-center text-[10px] font-bold" placeholder="Price" value={item.price} onChange={(e)=>{
                         const newItems = [...(formData.items || [])];
                         newItems[idx].price = Number(e.target.value);
                         newItems[idx].total = Number(e.target.value) * newItems[idx].qty;
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="border-r dark:border-border"><Input type="number" className="border-none bg-transparent h-10 text-center text-[10px]" value={item.discount} onChange={(e)=>{
                         const newItems = [...(formData.items || [])];
                         newItems[idx].discount = Number(e.target.value);
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="border-r dark:border-border">
                         <Select value={item.gstRate.toString()} onValueChange={(val)=> {
                            const newItems = [...(formData.items || [])];
                            newItems[idx].gstRate = Number(val);
                            setFormData({...formData, items: newItems});
                         }}>
                            <SelectTrigger className="border-none bg-transparent h-10 text-[10px] font-bold text-center"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                         </Select>
                      </td>
                      <td className="text-right px-6 text-[10px] font-black">₹ {item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#FFFDE7] dark:bg-slate-800/80 border-t-2 border-[#001F3D] dark:border-primary font-black text-[10px] uppercase text-[#001F3D] dark:text-primary">
                    <td colSpan={2} className="py-4 px-6 text-right border-r dark:border-border">Total Quotation. Val</td>
                    <td className="border-r dark:border-border"></td>
                    <td className="text-center border-r dark:border-border">{(formData.items || []).reduce((acc, i) => acc + i.qty, 0)}</td>
                    <td className="border-r dark:border-border"></td>
                    <td className="text-center border-r dark:border-border">{(formData.items || []).reduce((acc, i) => acc + i.price, 0).toLocaleString()}</td>
                    <td className="text-center border-r dark:border-border">{(formData.items || []).reduce((acc, i) => acc + i.discount, 0)}</td>
                    <td className="text-center border-r dark:border-border">0</td>
                    <td className="text-right px-6">{totalQuotationVal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
               <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Terms & Condition / Additional Note</h3>
                  <div className="space-y-4">
                     <Textarea className="col-span-2 min-h-[80px] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-border text-[10px] font-medium leading-relaxed" defaultValue="Subject to our home Jurisdiction. Our Responsibility Ceases as soon as goods leaves our Premises." />
                     <Button variant="outline" className="h-10 rounded-lg font-black uppercase text-[9px] tracking-widest border-slate-200 dark:border-border text-slate-600 gap-2"><Plus className="h-3 w-3" /> Add Notes</Button>
                  </div>
               </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
               <Card className="p-8 bg-white dark:bg-card border-slate-200 dark:border-border shadow-xl rounded-2xl relative overflow-hidden">
                  <div className="space-y-5">
                     <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                        <span>Taxable</span>
                        <span>{totalQuotationVal.toLocaleString()}</span>
                     </div>
                     <div className="bg-[#FFFDE7] dark:bg-slate-800/80 p-4 -mx-8 flex justify-between items-center border-y-2 border-[#001F3D] dark:border-primary">
                        <span className="text-sm font-black uppercase text-[#001F3D] dark:text-primary ml-4">Grand Total</span>
                        <span className="text-xl font-display font-black text-[#001F3D] dark:text-primary mr-4">{grandTotal.toLocaleString()}</span>
                     </div>

                     <div className="space-y-2 pt-4">
                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Total in Words</p>
                        <div className="flex items-center gap-4 text-[#001F3D] dark:text-primary">
                           <div className="p-1.5 bg-[#001F3D] dark:bg-primary rounded-full text-white dark:text-card"><DollarSign className="h-2.5 w-2.5" /></div>
                           <span className="text-[10px] font-black uppercase tracking-tight">{numberToWords(grandTotal)}</span>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AnalyticsView = () => (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Existing high-fidelity analytics view remains intact */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><BrainCircuit className="h-6 w-6" /></div>
          <div>
            <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase tracking-tight">Business Intelligence Matrix</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Institutional Yield & Strategy Hub v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest gap-2" onClick={() => { setTargetValueInput(biMetrics.monthlyBillingTarget.toString()); setIsCalibrationOpen(true); }}>
            <Settings2 className="h-4 w-4" /> Strategic Calibration
          </Button>
          <Button className="h-12 bg-[#001F3D] hover:bg-black text-white px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex gap-2">
            <Download className="h-4 w-4" /> Export BI Matrix
          </Button>
        </div>
      </div>

      <Card className="p-0 border-none bg-[#001F3D] text-white shadow-2xl rounded-[3rem] overflow-hidden relative min-h-[300px] flex">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="flex-1 p-12 flex flex-col justify-between relative z-10">
           <div className="space-y-6">
              <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-4 tracking-widest">Global Matrix Health</Badge>
              <h3 className="text-3xl font-display font-black uppercase tracking-tight">Business Health Score</h3>
              <p className="text-xs text-white/40 leading-relaxed max-w-md font-medium">Aggregate system performance derived from Sales, Collections, Inventory health, and Production yield.</p>
           </div>
           <div className="flex gap-12 pt-10">
              <div className="space-y-1">
                 <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Performance</p>
                 <div className="text-xl font-display font-black text-primary">{biMetrics.achievementPercent.toFixed(1)}%</div>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Reliability</p>
                 <div className="text-xl font-display font-black text-blue-400">92%</div>
              </div>
           </div>
        </div>
        <div className="w-[300px] flex flex-col items-center justify-center border-x border-white/10 relative z-10">
           <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                 <circle cx="96" cy="96" r="80" stroke="#00E5A8" strokeWidth="12" fill="transparent" strokeDasharray="502.4" strokeDashoffset={502.4 - (502.4 * biMetrics.healthScore / 100)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-6xl font-display font-black">{biMetrics.healthScore}</span>
              </div>
           </div>
        </div>
        <div className="flex-1 p-12 flex flex-col justify-center gap-8 relative z-10 bg-black/10">
           {[
             { label: 'Inventory Health', val: 96, color: 'bg-emerald-400' },
             { label: 'Collection Matrix', val: biMetrics.collectionAchievement, color: 'bg-blue-400' },
             { label: 'Production Yield', val: 88, color: 'bg-primary' },
           ].map(bar => (
             <div key={bar.label} className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40">
                   <span>{bar.label}</span>
                   <span className="text-white">{Math.round(bar.val)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className={cn("h-full", bar.color)} style={{ width: `${Math.min(bar.val, 100)}%` }} />
                </div>
             </div>
           ))}
        </div>
      </Card>
    </div>
  );

  const ProductMasterView = () => (
    <div className="p-8 animate-in fade-in duration-500">
       <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-border flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl text-white"><PackageSearch className="h-6 w-6" /></div>
                <div>
                   <h3 className="text-xl font-display font-bold uppercase tracking-tight">Identity Matrix</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Product Registry</p>
                </div>
             </div>
             <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-10 font-bold uppercase text-[10px]" onClick={() => setIsProductFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Initialize Node
             </Button>
          </div>
          <div className="overflow-x-auto">
             <Table>
                <TableHeader>
                   <TableRow className="bg-slate-50 dark:bg-slate-900">
                      <TableHead className="px-8 py-5">Product Identity</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>HSN/SAC</TableHead>
                      <TableHead className="text-right px-8">Rate (₹)</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {products.map(p => (
                     <TableRow key={p.id} className="h-20 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 cursor-pointer">
                        <TableCell className="px-8">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold uppercase">{p.name}</span>
                              <span className="text-[9px] text-slate-400 font-code">{p.code}</span>
                           </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] uppercase">{p.type}</Badge></TableCell>
                        <TableCell className="font-code text-xs">{p.hsn}</TableCell>
                        <TableCell className="text-right px-8 font-display font-bold text-primary">₹ {p.saleRate.toLocaleString()}</TableCell>
                     </TableRow>
                   ))}
                </TableBody>
             </Table>
          </div>
       </Card>
    </div>
  );

  const activeTabData = MAIN_TABS.find(t => t.id === activeTab);
  const ledgerTitle = `${activeTabData?.label} LEDGER`;

  return (
    <div className="h-full flex flex-col gap-0 bg-[#F8FAFC] dark:bg-slate-950 font-body">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <>
          {/* 01. COMMAND HEADER */}
          <div className="px-8 pt-8 pb-4 space-y-1">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span>COMMERCIAL OPERATIONS</span>
              <ChevronRight className="h-2.5 w-2.5" />
              <span className="text-primary">FINANCIAL HUB</span>
            </div>
            <h1 className="text-3xl font-display font-black text-[#001F3D] dark:text-white uppercase tracking-tight">FINANCIAL HUB</h1>
          </div>

          {/* 02. HORIZONTAL TAB NAVIGATION */}
          <div className="px-8 no-print">
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-border scrollbar-hide overflow-x-auto h-12">
              {MAIN_TABS.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={cn(
                    "px-5 h-full text-[9px] font-black uppercase flex items-center gap-3 border-b-2 transition-all tracking-[0.1em] whitespace-nowrap", 
                    activeTab === tab.id 
                      ? "border-primary text-primary bg-primary/5" 
                      : "border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-600"
                  )}
                >
                  <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "text-primary" : "text-slate-300")} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            {activeTab === 'dashboard' ? <AnalyticsView /> : 
             activeTab === 'product-master' ? <ProductMasterView /> : (
              <div className="p-8 space-y-8 animate-in fade-in duration-500">
                 {/* BREADCRUMB & LEDGER TITLE */}
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>COMMERCIAL OPERATIONS</span>
                        <ChevronRight className="h-2 w-2" />
                        <span>FINANCIAL HUB</span>
                        <ChevronRight className="h-2 w-2" />
                        <span className="text-primary">{ledgerTitle}</span>
                      </div>
                      <h2 className="text-2xl font-display font-black text-[#001F3D] dark:text-white uppercase tracking-tight">{ledgerTitle}</h2>
                    </div>
                    <div className="flex gap-3">
                       <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 dark:border-border text-[9px] font-black uppercase tracking-widest gap-2">
                          <Download className="h-3.5 w-3.5" /> EXPORT PDF
                       </Button>
                       <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 dark:border-border text-[9px] font-black uppercase tracking-widest gap-2">
                          <FileSpreadsheet className="h-3.5 w-3.5" /> EXPORT EXCEL
                       </Button>
                       <Button className="h-10 px-8 bg-[#001F3D] dark:bg-primary hover:bg-black dark:hover:bg-primary/90 text-white dark:text-card rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl flex gap-3" onClick={() => handleOpenForm(activeTab)}>
                          <Plus className="h-4 w-4" /> NEW {activeTabData?.label}
                       </Button>
                    </div>
                 </div>

                 {/* SUMMARY MATRIX CARDS */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">TOTAL {activeTabData?.label}S</p>
                       <p className="text-3xl font-display font-black text-[#001F3D] dark:text-white">{filteredRecords.length}</p>
                    </Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">TOTAL VALUATION</p>
                       <p className="text-3xl font-display font-black text-emerald-600">₹ {filteredRecords.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()}</p>
                    </Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">PENDING PROTOCOL</p>
                       <p className="text-3xl font-display font-black text-orange-500">{filteredRecords.filter(r => r.status === 'Pending').length}</p>
                    </Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">AUTHORIZED NODES</p>
                       <p className="text-3xl font-display font-black text-blue-500">{filteredRecords.filter(r => r.status === 'Paid' || r.status === 'Released').length}</p>
                    </Card>
                 </div>

                 {/* SEARCH & FILTERS */}
                 <div className="flex gap-4">
                    <div className="relative flex-1 group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                       <Input 
                         placeholder="SEARCH NUMBER OR CUSTOMER..." 
                         className="h-12 pl-12 bg-white dark:bg-card border-slate-200 dark:border-border rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                    <Select defaultValue="all">
                       <SelectTrigger className="w-48 h-12 bg-white dark:bg-card border-slate-200 dark:border-border rounded-xl text-[10px] font-black uppercase">
                          <SelectValue placeholder="ALL STATUS" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="all">ALL STATUS</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 {/* LEDGER TABLE */}
                 <Card className="overflow-hidden border-none bg-white dark:bg-card shadow-sm rounded-2xl">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-border">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-16 px-8"></TableHead>
                            <TableHead className="font-black text-[9px] uppercase text-slate-400 py-5">DOCUMENT NO</TableHead>
                            <TableHead className="font-black text-[9px] uppercase text-slate-400">DATE</TableHead>
                            <TableHead className="font-black text-[9px] uppercase text-slate-400">CUSTOMER IDENTITY</TableHead>
                            <TableHead className="font-black text-[9px] uppercase text-slate-400 text-right">GRAND TOTAL</TableHead>
                            <TableHead className="font-black text-[9px] uppercase text-slate-400 text-center w-32">STATUS</TableHead>
                            <TableHead className="text-right px-10 w-24 font-black text-[9px] uppercase text-slate-400">ACTIONS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.map(r => (
                            <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="h-20 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 border-b border-slate-50 dark:border-border transition-all cursor-pointer group">
                              <TableCell className="px-8">
                                <div className="h-5 w-5 rounded-full border-2 border-slate-200 group-hover:border-primary transition-colors" />
                              </TableCell>
                              <TableCell className="font-code text-xs font-bold text-primary">{r.number}</TableCell>
                              <TableCell className="text-[10px] font-bold text-slate-500 uppercase">{r.date}</TableCell>
                              <TableCell>
                                <span className="text-xs font-black text-[#001F3D] dark:text-white uppercase tracking-tight">{r.customerName}</span>
                              </TableCell>
                              <TableCell className="text-right font-display font-black text-sm dark:text-white px-6">₹ {r.amount?.toLocaleString()}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="text-[8px] font-black uppercase px-4 py-1.5 rounded-full border-slate-100 dark:border-border dark:text-slate-400">{r.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right px-10">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500" onClick={(e)=>{e.stopPropagation(); onDeleteRecord(r.id);}}><Trash2 className="h-4 w-4" /></Button>
                                   <ChevronRight className="h-4 w-4 text-slate-200" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredRecords.length === 0 && (
                            <TableRow><TableCell colSpan={7} className="py-40 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Ledger Registry Node Empty</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                 </Card>
              </div>
            )}
          </div>
        </>
      )}

      {/* Strategic Calibration Dialog */}
      <Dialog open={isCalibrationOpen} onOpenChange={setIsCalibrationOpen}>
        <DialogContent className="max-w-xl bg-white dark:bg-card border-none shadow-2xl rounded-[2rem] p-10">
          <DialogHeader className="mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mb-4"><Settings2 className="h-8 w-8 text-primary" /></div>
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Strategic Calibration</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium uppercase tracking-widest">Recalibrate Monthly Billing Targets for BI Alignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Monthly Billing Target (₹)</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="h-16 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl font-display font-bold text-2xl text-[#001F3D] dark:text-white pl-12 shadow-inner"
                  value={targetValueInput}
                  onChange={(e) => setTargetValueInput(e.target.value)}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display font-bold text-2xl text-slate-300">₹</span>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] text-slate-400" onClick={() => setIsCalibrationOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={handleSyncTargets}>
                <RefreshCw className="h-4 w-4" /> Synchronize Targets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
