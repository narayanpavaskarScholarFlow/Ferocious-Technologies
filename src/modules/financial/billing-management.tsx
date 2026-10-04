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
  Factory,
  Layers,
  Boxes,
  Hammer,
  Settings2,
  ImageIcon,
  Maximize2,
  PackageCheck,
  ExternalLink,
  ShieldAlert,
  CalendarDays,
  Menu,
  MoreVertical,
  BarChart3
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
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, BarChart, Bar, Cell, PieChart as ReChartsPieChart, Pie } from 'recharts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

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
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const productMetrics = useMemo(() => {
    const total = products.length;
    const raw = products.filter(p => p.type === 'Raw Material').length;
    const assemblies = products.filter(p => p.type === 'Assembly' || p.type === 'Sub Assembly').length;
    const finished = products.filter(p => p.type === 'Finished Product').length;
    
    // Revenue calculations
    const now = new Date();
    const currentFY = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const fyRev = records
      .filter(r => r.type === 'invoice' && new Date(r.date).getFullYear() === currentFY)
      .reduce((acc, r) => acc + (r.amount || 0), 0);
    
    const monthlyRev = records
      .filter(r => r.type === 'invoice' && new Date(r.date).getMonth() === currentMonth)
      .reduce((acc, r) => acc + (r.amount || 0), 0);
      
    const totalInHouse = products.filter(p => (p.inHousePercent || 0) >= 80).length;
    const totalOutsourced = products.filter(p => (p.outsourcedPercent || 0) > 20).length;

    return { total, raw, assemblies, finished, fyRev, monthlyRev, totalInHouse, totalOutsourced };
  }, [products, records]);

  const filteredRecordsByType = useMemo(() => {
    return records.filter(r => {
      const isTab = r.type === activeTab;
      if (!isTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  const selectedProductData = useMemo(() => {
    if (!selectedProductId) return null;
    const p = products.find(x => x.id === selectedProductId);
    if (!p) return null;

    const lifetimeRev = records.filter(r => r.items?.some(i => i.productId === p.id)).reduce((acc, r) => acc + (r.amount || 0), 0);
    const activeWOs = orders.filter(o => o.items?.some(i => i.productId === p.id) && o.status !== 'Delivered').length;
    const openQuotes = records.filter(r => r.type === 'quotation' && r.status === 'Pending' && r.items?.some(i => i.productId === p.id)).length;
    const poVal = records.filter(r => r.type === 'purchase_order' && r.items?.some(i => i.productId === p.id)).reduce((acc, r) => acc + (r.amount || 0), 0);

    return { ...p, lifetimeRev, activeWOs, openQuotes, poVal };
  }, [selectedProductId, products, records, orders]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const ProductIntelligenceView = () => (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 px-1">
        {[
          { label: 'Total Products', val: productMetrics.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'FY Revenue', val: `₹${(productMetrics.fyRev / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In-House Yield', val: productMetrics.totalInHouse, icon: Factory, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Outsourced', val: productMetrics.totalOutsourced, icon: Truck, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Assemblies', val: productMetrics.assemblies, icon: Boxes, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Raw Matrix', val: productMetrics.raw, icon: Layers, color: 'text-primary', bg: 'bg-primary/5' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none">{kpi.label}</p>
               <div className={cn("p-1.5 rounded-lg shadow-sm", kpi.bg, kpi.color)}><kpi.icon className="h-3 w-3" /></div>
            </div>
            <p className={cn("text-xl font-display font-black leading-none", kpi.color)}>{kpi.val}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><BrainCircuit className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Product Intelligence Center</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Technical & Market Registry</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                 <Input placeholder="Filter matrix..." className="h-10 pl-9 rounded-xl border-slate-200 text-xs font-bold" />
              </div>
              <Button className="h-10 bg-[#001F3D] text-white rounded-xl px-6 font-bold uppercase text-[9px] shadow-lg flex gap-2">
                <Plus className="h-3.5 w-3.5" /> New Product Node
              </Button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white border-b border-slate-100">
              <TableRow>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6 px-8 w-48">Identification</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Business Unit</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Classification</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-center w-24">Yield Score</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-right">Standard Cost</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-right">Selling Price</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-center w-20">Status</TableHead>
                <TableHead className="text-right px-8 w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => {
                const score = p.finalProductScore || 85;
                return (
                  <TableRow key={p.id} className="h-24 border-b border-slate-50 hover:bg-slate-50 transition-all group">
                    <TableCell className="px-8 cursor-pointer" onClick={() => setSelectedProductId(p.id)}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</span>
                        <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">ID: {p.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={cn("text-[8px] font-bold uppercase px-3 py-1", p.businessUnit === 'Electricals' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100')}>
                         {p.businessUnit || 'Manufacturing'}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-bold text-slate-700 uppercase">{p.type}</span>
                         <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{p.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-slate-100 font-display font-black text-xs text-primary shadow-sm bg-white">
                         {score}
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-code text-xs font-bold text-slate-400">₹ {(p.standardCost || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-display font-black text-sm text-slate-900">₹ {p.saleRate.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-[8px] font-bold uppercase px-3", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400')}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => setSelectedProductId(p.id)}>
                         <ChevronRight className="h-4 w-4 text-slate-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* INTELLIGENCE SHEET OVERHAUL */}
      <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <SheetContent className="sm:max-w-[1000px] p-0 border-none shadow-2xl bg-white flex flex-col h-screen font-body overflow-hidden">
          {selectedProductData && (
            <>
              <SheetHeader className="p-10 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0">
                 <div className="flex items-center gap-8">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md relative group overflow-hidden">
                       {selectedProductData.imageUrls?.[0] ? (
                         <img src={selectedProductData.imageUrls[0]} className="h-full w-full object-cover" alt="" />
                       ) : (
                         <Box className="h-10 w-10 text-primary" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <ImageIcon className="h-5 w-5 text-white" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <Badge className="bg-primary text-[#001F3D] border-none px-3 font-bold text-[8px] uppercase tracking-widest">{selectedProductData.businessUnit}</Badge>
                          <Badge variant="outline" className="border-white/20 text-white/60 text-[8px] uppercase">{selectedProductData.type}</Badge>
                       </div>
                       <SheetTitle className="text-4xl font-display font-black uppercase tracking-tight text-white leading-none">{selectedProductData.name}</SheetTitle>
                       <div className="flex items-center gap-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-code">PROT_NODE: {selectedProductData.code}</p>
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Quality Verified</p>
                       </div>
                    </div>
                 </div>
                 <div className="text-right space-y-4">
                    <div className="space-y-1">
                       <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">Institutional Score</p>
                       <div className="text-5xl font-display font-black text-primary tracking-tighter">{selectedProductData.finalProductScore || 85}</div>
                    </div>
                 </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                 <div className="p-10 space-y-12 pb-40">
                    
                    {/* SECTION 1: ENGINEERING & MANUFACTURING MATRIX */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-[2.5rem] space-y-8">
                          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                             <Cpu className="h-5 w-5 text-primary" />
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Engineering Protocol</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                             {[
                               { l: 'Drawing No.', v: selectedProductData.drawingNumber },
                               { l: 'Revision', v: selectedProductData.revisionNumber },
                               { l: 'Material', v: selectedProductData.material },
                               { l: 'Grade', v: selectedProductData.materialGrade },
                               { l: 'Tolerance', v: selectedProductData.tolerance },
                               { l: 'Industry', v: selectedProductData.industry },
                               { l: 'Surface Finish', v: selectedProductData.surfaceFinish },
                               { l: 'Weight', v: selectedProductData.weight },
                             ].map(item => (
                               <div key={item.l} className="space-y-1">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</p>
                                  <p className="text-[11px] font-bold text-slate-700 uppercase">{item.v || '---'}</p>
                               </div>
                             ))}
                          </div>
                       </Card>

                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-[2.5rem] space-y-8">
                          <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                             <Factory className="h-5 w-5 text-accent" />
                             <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Manufacturing Analytics</h4>
                          </div>
                          <div className="space-y-6">
                             <div className="flex flex-wrap gap-2">
                                {['VMC', 'CNC', 'Grinding', 'Assembly', 'QC'].map(m => (
                                  <Badge key={m} className={cn("text-[8px] font-bold uppercase px-3 py-1", selectedProductData.machinesRequired?.includes(m) ? 'bg-accent text-white' : 'bg-white text-slate-300 border-slate-100')}>
                                    {m}
                                  </Badge>
                                ))}
                             </div>
                             <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                                <div className="text-center space-y-1">
                                   <p className="text-[7px] font-bold text-slate-400 uppercase">Cycle Time</p>
                                   <p className="text-lg font-display font-black text-slate-800">{selectedProductData.cycleTimeSec || 0}s</p>
                                </div>
                                <div className="text-center space-y-1">
                                   <p className="text-[7px] font-bold text-slate-400 uppercase">Setup</p>
                                   <p className="text-lg font-display font-black text-slate-800">{selectedProductData.setupTimeMin || 0}m</p>
                                </div>
                                <div className="text-center space-y-1">
                                   <p className="text-[7px] font-bold text-slate-400 uppercase">Inspection</p>
                                   <p className="text-lg font-display font-black text-slate-800">{selectedProductData.inspectionTimeMin || 0}m</p>
                                </div>
                             </div>
                          </div>
                       </Card>
                    </div>

                    {/* SECTION 2: ELECTRICAL MODE (CONDITIONAL) */}
                    {selectedProductData.businessUnit === 'Electricals' && (
                       <Card className="p-10 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] space-y-10 animate-in slide-in-from-top-4 duration-500">
                          <div className="flex items-center gap-3 text-blue-600">
                             <Zap className="h-6 w-6" />
                             <h4 className="text-sm font-black uppercase tracking-widest">Electrical Power Node Details</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                             {[
                               { l: 'Voltage', v: selectedProductData.voltage, i: Zap },
                               { l: 'Current', v: selectedProductData.current, i: Activity },
                               { l: 'Power', v: selectedProductData.power, i: TrendingUp },
                               { l: 'Phase', v: selectedProductData.phase, i: RefreshCw },
                               { l: 'Frequency', v: selectedProductData.frequency, i: Gauge },
                             ].map(spec => (
                               <div key={spec.l} className="space-y-1">
                                  <div className="flex items-center gap-2 text-blue-400"><spec.i className="h-3 w-3" /><span className="text-[8px] font-bold uppercase">{spec.l}</span></div>
                                  <p className="text-sm font-bold text-blue-900">{spec.v || '---'}</p>
                               </div>
                             ))}
                          </div>
                          <div className="flex gap-8 pt-6 border-t border-blue-100">
                             {['BIS', 'CE', 'RoHS'].map(cert => (
                               <div key={cert} className="flex items-center gap-2">
                                  <div className={cn("h-4 w-4 rounded-full flex items-center justify-center", (selectedProductData as any)[cert.toLowerCase()] ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400')}>
                                     <Check className="h-2.5 w-2.5" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{cert} Certified</span>
                               </div>
                             ))}
                          </div>
                       </Card>
                    )}

                    {/* SECTION 3: COMMERCIAL & MARKET INTELLIGENCE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <Card className="lg:col-span-8 p-10 bg-white border border-slate-100 shadow-xl rounded-[2.5rem] space-y-10">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Wallet className="h-5 w-5" /></div>
                                <h4 className="text-sm font-black uppercase text-slate-900 tracking-widest">Commercial Ledger</h4>
                             </div>
                             <Badge className="bg-emerald-500 text-white border-none px-4">Margin: {selectedProductData.marginPercent || 0}%</Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-8">
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Standard Cost</p><p className="text-xl font-display font-black text-slate-900">₹ {(selectedProductData.standardCost || 0).toLocaleString()}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Current Cost</p><p className="text-xl font-display font-black text-slate-900">₹ {(selectedProductData.currentCost || 0).toLocaleString()}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Selling Price</p><p className="text-xl font-display font-black text-primary">₹ {selectedProductData.saleRate.toLocaleString()}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Profit Contribution</p><p className="text-xl font-display font-black text-emerald-600">{selectedProductData.profitPercent || 0}%</p></div>
                          </div>

                          <div className="pt-10 border-t border-slate-50 space-y-6">
                             <div className="flex items-center gap-3"><BarChart3 className="h-4 w-4 text-slate-400" /><h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Market Positioning</h5></div>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Annual Demand</p><p className="text-xs font-bold text-slate-700">{selectedProductData.annualRequirement?.toLocaleString() || '---'} Units</p></div>
                                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Target Industry</p><p className="text-xs font-bold text-slate-700 uppercase">{selectedProductData.targetIndustry || '---'}</p></div>
                                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Demand Forecast</p><Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[8px]">+15% CAGR</Badge></div>
                                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Market Price</p><p className="text-xs font-bold text-slate-700">₹ {selectedProductData.marketPrice?.toLocaleString() || '---'}</p></div>
                             </div>
                          </div>
                       </Card>

                       <Card className="lg:col-span-4 p-8 bg-slate-900 text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col justify-between overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity"><TrendingUp className="h-40 w-40" /></div>
                          <div className="relative z-10 space-y-8">
                             <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Lifecycle Revenue</p>
                             <div className="space-y-1">
                                <p className="text-4xl font-display font-black tracking-tighter">₹ {(selectedProductData.lifetimeRev / 100000).toFixed(1)}L</p>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Aggregate Sales Yield</p>
                             </div>
                             <div className="pt-8 space-y-6">
                                <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">Open WO Nodes</span><span className="text-sm font-display font-bold text-white">{selectedProductData.activeWOs}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">Awaiting PO</span><span className="text-sm font-display font-bold text-primary">₹ {(selectedProductData.poVal / 100000).toFixed(1)}L</span></div>
                             </div>
                          </div>
                          <Button className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold uppercase text-[9px] tracking-widest shadow-xl relative z-10">Download Business Audit</Button>
                       </Card>
                    </div>

                    {/* SECTION 4: OUTSOURCING & FACILITY GAP ANALYSIS */}
                    <Card className="p-10 bg-white border border-slate-200 shadow-xl rounded-[2.5rem] space-y-10 overflow-hidden">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><History className="h-6 w-6" /></div>
                             <div>
                                <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Outsourcing & Gap Analysis</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Value Lost vs In-House Capacity</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Outsource Dependency</p>
                             <div className="text-4xl font-display font-black text-rose-600">{selectedProductData.outsourcedPercent || 0}%</div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-6">
                             <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Matrix Distribution</h5>
                             <div className="space-y-8">
                                <div className="space-y-3">
                                   <div className="flex justify-between text-[9px] font-bold uppercase"><span className="text-slate-500">In-House Production</span><span className="text-emerald-600">{selectedProductData.inHousePercent || 100}%</span></div>
                                   <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${selectedProductData.inHousePercent || 100}%` }} /></div>
                                </div>
                                <div className="space-y-3">
                                   <div className="flex justify-between text-[9px] font-bold uppercase"><span className="text-slate-500">Outsourced Process</span><span className="text-rose-600">{selectedProductData.outsourcedPercent || 0}%</span></div>
                                   <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${selectedProductData.outsourcedPercent || 0}%` }} /></div>
                                </div>
                             </div>
                          </div>
                          
                          <Card className="p-6 bg-rose-50/50 border border-rose-100 rounded-3xl space-y-6 shadow-inner">
                             <div className="flex items-center gap-3 text-rose-600"><ShieldAlert className="h-4 w-4" /><h5 className="text-[9px] font-black uppercase tracking-widest">Protocol Deviation</h5></div>
                             <div className="space-y-4">
                                <div className="space-y-1">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Reason for Outsourcing</p>
                                   <div className="flex flex-wrap gap-1.5">
                                      {selectedProductData.outsourcingReason?.map(r => <Badge key={r} variant="outline" className="text-[7px] font-bold uppercase bg-white">{r}</Badge>) || <span className="text-[10px] font-bold text-slate-400 uppercase italic">NONE_LOGGED</span>}
                                   </div>
                                </div>
                                <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Annual Outsource Value</p><p className="text-lg font-display font-black text-rose-700">₹ {(selectedProductData.annualOutsourcingValue || 0).toLocaleString()}</p></div>
                             </div>
                          </Card>

                          <Card className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-6 shadow-inner">
                             <div className="flex items-center gap-3 text-emerald-600"><TrendingUp className="h-4 w-4" /><h5 className="text-[9px] font-black uppercase tracking-widest">Investment ROI Node</h5></div>
                             <div className="space-y-4">
                                <p className="text-[10px] text-slate-600 font-medium leading-relaxed">High spend on <b>{selectedProductData.mostOutsourcedProcess || '---'}</b> outsourcing detected. Machine investment recommended to recover ₹ 1.2M+ annual margin.</p>
                                <Button variant="outline" className="w-full h-10 border-emerald-200 text-emerald-700 font-bold uppercase text-[9px] rounded-xl hover:bg-emerald-50">Launch Project Hub</Button>
                             </div>
                          </Card>
                       </div>
                    </Card>

                    {/* SECTION 5: BOM MANAGEMENT (FOR ASSEMBLIES) */}
                    {selectedProductData.type === 'Assembly' && (
                       <Card className="p-10 bg-white border border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Layers className="h-6 w-6" /></div>
                                <h4 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Bill of Materials (BOM)</h4>
                             </div>
                             <div className="flex gap-4">
                                <div className="text-center px-6 border-r border-slate-100"><p className="text-[8px] font-bold text-slate-400 uppercase">Child Nodes</p><p className="text-lg font-display font-black text-indigo-600">{selectedProductData.bom?.length || 0}</p></div>
                                <div className="text-center px-6"><p className="text-[8px] font-bold text-slate-400 uppercase">Assembly Cost</p><p className="text-lg font-display font-black text-[#001F3D]">₹ {selectedProductData.bom?.reduce((a,b)=>a+(b.cost*b.qty), 0).toLocaleString() || 0}</p></div>
                             </div>
                          </div>
                          <Table>
                             <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                   <TableHead className="text-[8px] font-bold uppercase py-4 px-6">Component Identity</TableHead>
                                   <TableHead className="text-[8px] font-bold uppercase text-center w-24">Qty</TableHead>
                                   <TableHead className="text-[8px] font-bold uppercase text-center w-24">Type</TableHead>
                                   <TableHead className="text-[8px] font-bold uppercase text-right px-6">Unit Cost (₹)</TableHead>
                                </TableRow>
                             </TableHeader>
                             <TableBody>
                                {selectedProductData.bom?.map(item => (
                                  <TableRow key={item.id} className="h-16 border-b border-slate-50">
                                     <TableCell className="px-6 font-bold text-[10px] uppercase text-slate-700">{item.name}</TableCell>
                                     <TableCell className="text-center font-code text-xs font-bold text-slate-500">{item.qty}</TableCell>
                                     <TableCell className="text-center"><Badge variant="outline" className="text-[7px] font-bold uppercase">{item.type}</Badge></TableCell>
                                     <TableCell className="text-right px-6 font-display font-bold text-xs">₹ {item.cost.toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                             </TableBody>
                          </Table>
                       </Card>
                    )}

                    {/* SECTION 6: DOCUMENT MATRIX */}
                    <div className="space-y-6">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Institutional Media Matrix</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                          {[
                            { l: 'Engineering Dwg', i: FileText, c: 'text-blue-600' },
                            { l: '3D CAD Model', i: Box, c: 'text-indigo-600' },
                            { l: 'Datasheet', i: FileCheck, c: 'text-emerald-600' },
                            { l: 'Catalog', i: Archive, c: 'text-amber-600' },
                            { l: 'Certificates', i: ShieldCheck, c: 'text-slate-900' },
                            { l: 'QC Photo', i: ImageIcon, c: 'text-primary' },
                            { l: 'Assembly Drg', i: Layers, c: 'text-indigo-600' },
                          ].map(media => (
                            <Card key={media.l} className="p-6 border-slate-100 shadow-sm hover:border-primary/30 transition-all flex flex-col items-center gap-3 group cursor-pointer text-center">
                               <div className={cn("p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform", media.c)}><media.i className="h-6 w-6" /></div>
                               <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter leading-tight">{media.l}</span>
                            </Card>
                          ))}
                       </div>
                    </div>
                 </div>
              </ScrollArea>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center z-50 shadow-2xl">
                 <div className="flex gap-10">
                    <div className="flex flex-col"><span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime Revenue Matrix</span><span className="text-xl font-display font-black text-emerald-600">₹ {(selectedProductData.lifetimeRev / 100000).toFixed(2)}L</span></div>
                    <div className="flex flex-col"><span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">FY Performance</span><span className="text-xl font-display font-black text-[#001F3D]">₹ {(selectedProductData.currentFYOutsourcing / 100000).toFixed(2) || '0.00'}L</span></div>
                 </div>
                 <div className="flex gap-4">
                    <Button variant="ghost" className="h-14 px-10 rounded-2xl font-bold uppercase text-[10px] text-slate-400" onClick={() => setSelectedProductId(null)}>Close Hub</Button>
                    <Button className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3 group">
                       <Edit3 className="h-4 w-4" /> Edit Technical Matrix <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                 </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    setIsRecordFormOpen(true);
  };

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-700">
      {isRecordFormOpen ? <div /> : (
        <div className="space-y-8">
          {activeTab === 'product-master' ? <ProductIntelligenceView /> : (
            <div className="space-y-8">
               <div className="flex justify-between items-end gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <Card className="p-6 bg-white border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {activeTab}s</p><p className="text-2xl font-display font-black text-[#001F3D]">{filteredRecordsByType.length}</p></Card>
                    <Card className="p-6 bg-white border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p><p className="text-2xl font-display font-black text-emerald-600">₹ {filteredRecordsByType.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()}</p></Card>
                 </div>
                 <Button className="h-14 bg-[#001F3D] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex gap-3 px-8" onClick={() => handleOpenForm(activeTab)}>
                    <Plus className="h-4 w-4" /> NEW {activeTab.toUpperCase()}
                 </Button>
              </div>

              <Card className="p-4 bg-white border-slate-200 rounded-2xl flex gap-4">
                 <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input placeholder="SEARCH NUMBER OR CUSTOMER..." className="h-12 pl-12 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                 <Button variant="outline" className="h-12 px-6 rounded-xl font-bold uppercase text-[9px] gap-2"><Download className="h-4 w-4" /> Export Ledger</Button>
              </Card>

              <Card className="overflow-hidden border-none bg-white shadow-sm rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent"><TableHead className="px-8 py-5 font-black text-[9px] uppercase">Document Node</TableHead><TableHead className="font-black text-[9px] uppercase">Identity Account</TableHead><TableHead className="text-right font-black text-[9px] uppercase">Grand Total</TableHead><TableHead className="text-center font-black text-[9px] uppercase">State</TableHead><TableHead className="text-right px-8 font-black text-[9px] uppercase">Action</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>{filteredRecordsByType.map(r => (
                    <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="h-20 hover:bg-slate-50 transition-all cursor-pointer group">
                      <TableCell className="px-8"><div className="flex flex-col"><span className="text-xs font-bold text-primary font-code">{r.number}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{r.date}</span></div></TableCell>
                      <TableCell><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{r.customerName}</span></TableCell>
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
}
