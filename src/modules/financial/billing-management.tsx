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
  BarChart3,
  Check,
  ChevronLeft,
  Upload,
  X
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

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

const PRODUCT_TYPES = [
  "Raw Material", "Purchased Part", "Semi Finished", "Finished Product", "Assembly", "Sub Assembly", "Design Service", "Engineering Service"
];

const BUSINESS_UNITS = [
  { id: 'Manufacturing', label: 'Ferocious Technologies', icon: Factory },
  { id: 'Electricals', label: 'Ferocious Electricals', icon: Zap }
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
  onSaveProduct?: (product: ProductMaster) => void;
  uiSettings: UISettings;
  initialTab?: string;
}

export function BillingManagement({ 
  customers, vendors, records, orders, users, inventory, products, machines, permissions, 
  onSaveRecord, onDeleteRecord, onSaveProduct, uiSettings, initialTab = 'invoice' 
}: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Wizard State
  const [isProductWizardOpen, setIsProductWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<Partial<ProductMaster>>({
    businessUnit: 'Manufacturing',
    type: 'Finished Product',
    status: 'Active',
    machinesRequired: [],
    materialCost: 0, machiningCost: 0, toolingCost: 0, inspectionCost: 0, assemblyCost: 0, packagingCost: 0,
    canManufactureInHouse: true
  });

  const productMetrics = useMemo(() => {
    const total = products.length;
    const raw = products.filter(p => p.type === 'Raw Material').length;
    const assemblies = products.filter(p => p.type === 'Assembly' || p.type === 'Sub Assembly').length;
    const finished = products.filter(p => p.type === 'Finished Product').length;
    
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

    return { total, raw, assemblies, finished, fyRev, monthlyRev, totalInHouse, totalOutsourced, active: products.filter(p=>p.status==='Active').length };
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

  const totalWizardCost = useMemo(() => {
    return (wizardData.materialCost || 0) + (wizardData.machiningCost || 0) + (wizardData.toolingCost || 0) + (wizardData.inspectionCost || 0) + (wizardData.assemblyCost || 0) + (wizardData.packagingCost || 0);
  }, [wizardData]);

  const handleNextWizard = () => setWizardStep(s => Math.min(s + 1, 9));
  const handlePrevWizard = () => setWizardStep(s => Math.max(s - 1, 1));

  const handleCommitProduct = () => {
    if (!wizardData.name || !wizardData.code) {
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Product Code are mandatory." });
      return;
    }

    const finalProduct: ProductMaster = {
      ...wizardData as ProductMaster,
      id: `PROD-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      standardCost: totalWizardCost,
      finalProductScore: 85
    };

    if (onSaveProduct) onSaveProduct(finalProduct);
    else setDocumentNonBlocking(doc(db, 'products', finalProduct.id), finalProduct, { merge: true });

    toast({ title: "Product Synchronized", description: `${finalProduct.name} committed to matrix.` });
    setIsProductWizardOpen(false);
    setWizardStep(1);
    setWizardData({ businessUnit: 'Manufacturing', type: 'Finished Product', status: 'Active', machinesRequired: [], canManufactureInHouse: true });
  };

  const updateWizardField = (field: string, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleWizardMachine = (m: string) => {
    const current = wizardData.machinesRequired || [];
    const updated = current.includes(m) ? current.filter(x => x !== m) : [...current, m];
    updateWizardField('machinesRequired', updated);
  };

  const ProductIntelligenceView = () => (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-1">
        {[
          { label: 'Total', val: productMetrics.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'FY Rev', val: `₹${(productMetrics.fyRev / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In-House', val: productMetrics.totalInHouse, icon: Factory, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Outsourced', val: productMetrics.totalOutsourced, icon: Truck, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Assemblies', val: productMetrics.assemblies, icon: Boxes, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Raw Materials', val: productMetrics.raw, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Finished Goods', val: productMetrics.finished, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Matrix', val: productMetrics.active, icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
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
                 <Input placeholder="Filter matrix..." className="h-10 pl-9 rounded-xl border-slate-200 text-xs font-bold" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
              </div>
              <Button className="h-10 bg-[#001F3D] text-white rounded-xl px-6 font-bold uppercase text-[9px] shadow-lg flex gap-2" onClick={() => { setIsProductWizardOpen(true); setWizardStep(1); }}>
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
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
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
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <Badge className="bg-primary text-[#001F3D] border-none px-3 font-bold text-[8px] uppercase tracking-widest">{selectedProductData.businessUnit}</Badge>
                          <Badge variant="outline" className="border-white/20 text-white/60 text-[8px] uppercase">{selectedProductData.type}</Badge>
                       </div>
                       <SheetTitle className="text-4xl font-display font-black uppercase tracking-tight text-white leading-none">{selectedProductData.name}</SheetTitle>
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-code">PROT_NODE: {selectedProductData.code}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-5xl font-display font-black text-primary tracking-tighter">{selectedProductData.finalProductScore || 85}</div>
                 </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                 <div className="p-10 space-y-12 pb-40">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-[2.5rem] space-y-8">
                          <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><Cpu className="h-5 w-5 text-primary" /><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Engineering Node</h4></div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                             {[
                               { l: 'Drawing No.', v: selectedProductData.drawingNumber },
                               { l: 'Revision', v: selectedProductData.revisionNumber },
                               { l: 'Material', v: selectedProductData.material },
                               { l: 'Grade', v: selectedProductData.materialGrade },
                               { l: 'Tolerance', v: selectedProductData.tolerance },
                               { l: 'Industry', v: selectedProductData.industry },
                             ].map(item => (
                               <div key={item.l} className="space-y-1">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</p>
                                  <p className="text-[11px] font-bold text-slate-700 uppercase">{item.v || '---'}</p>
                               </div>
                             ))}
                          </div>
                       </Card>
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-[2.5rem] space-y-8">
                          <div className="flex items-center gap-3 border-l-4 border-accent pl-4"><Factory className="h-5 w-5 text-accent" /><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Manufacturing Yield</h4></div>
                          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                             <div className="text-center"><p className="text-[7px] font-bold text-slate-400 uppercase">Cycle</p><p className="text-lg font-display font-black text-slate-800">{selectedProductData.cycleTimeSec || 0}s</p></div>
                             <div className="text-center"><p className="text-[7px] font-bold text-slate-400 uppercase">Setup</p><p className="text-lg font-display font-black text-slate-800">{selectedProductData.setupTimeMin || 0}m</p></div>
                             <div className="text-center"><p className="text-[7px] font-bold text-slate-400 uppercase">Inspect</p><p className="text-lg font-display font-black text-slate-800">{selectedProductData.inspectionTimeMin || 0}m</p></div>
                          </div>
                       </Card>
                    </div>

                    <Card className="lg:col-span-4 p-8 bg-slate-900 text-white border-none shadow-2xl rounded-[2.5rem] space-y-8">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Lifecycle Revenue Matrix</p>
                       <div className="space-y-1">
                          <p className="text-4xl font-display font-black tracking-tighter">₹ {(selectedProductData.lifetimeRev / 100000).toFixed(1)}L</p>
                       </div>
                    </Card>
                 </div>
              </ScrollArea>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-end gap-4 z-50 shadow-2xl">
                 <Button variant="ghost" className="h-14 px-10 rounded-2xl font-bold uppercase text-[10px]" onClick={() => setSelectedProductId(null)}>Close</Button>
                 <Button className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl">
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Matrix Node
                 </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* PRODUCT CREATION WIZARD */}
      <Dialog open={isProductWizardOpen} onOpenChange={setIsProductWizardOpen}>
        <DialogContent className="max-w-6xl h-[90vh] bg-white p-0 border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex flex-col font-body">
          <div className="flex h-full">
            {/* Sidebar Steps Indicator */}
            <div className="w-80 bg-[#001F3D] p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
               <div className="space-y-10 relative z-10">
                  <div className="p-4 bg-primary/20 rounded-2xl w-fit shadow-2xl border border-primary/20"><Plus className="h-8 w-8 text-primary" /></div>
                  <div className="space-y-6">
                    {[
                      { s: 1, l: 'Business Unit' },
                      { s: 2, l: 'Product Type' },
                      { s: 3, l: 'Identity Matrix' },
                      { s: 4, l: 'Institutional Media' },
                      { s: 5, l: 'Engineering Node' },
                      { s: 6, l: 'Manufacturing Yield' },
                      { s: 7, l: 'Commercial Matrix' },
                      { s: 8, l: 'Market Intelligence' },
                      { s: 9, l: 'In-House/Outsource' },
                    ].map(step => (
                      <div key={step.s} className="flex items-center gap-4 group">
                         <div className={cn(
                           "h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all",
                           wizardStep === step.s ? "bg-primary border-primary text-white scale-110 shadow-lg" : 
                           wizardStep > step.s ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10 text-white/20"
                         )}>
                           {wizardStep > step.s ? <Check className="h-3.5 w-3.5" /> : step.s}
                         </div>
                         <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", wizardStep === step.s ? "text-white" : "text-white/20")}>{step.l}</span>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] relative z-10">PROD_ONBOARD_v2.4</div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
               <DialogHeader className="p-10 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <DialogTitle className="text-3xl font-display font-black text-[#001F3D] uppercase tracking-tight">Onboarding Matrix Node</DialogTitle>
                  <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sequential yield tracking for industrial assets.</DialogDescription>
               </DialogHeader>

               <ScrollArea className="flex-1 p-10">
                  <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {wizardStep === 1 && (
                       <div className="space-y-12">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">01. Business Unit Assignment</h4>
                          <div className="grid grid-cols-2 gap-8">
                             {BUSINESS_UNITS.map(bu => (
                               <Card 
                                key={bu.id} 
                                onClick={() => updateWizardField('businessUnit', bu.id)}
                                className={cn(
                                  "p-10 cursor-pointer border-2 transition-all flex flex-col items-center gap-6 group hover:shadow-2xl rounded-[2rem]",
                                  wizardData.businessUnit === bu.id ? "border-primary bg-primary/5 ring-8 ring-primary/5" : "border-slate-100 hover:border-primary/20"
                                )}
                               >
                                  <div className={cn("p-6 rounded-3xl transition-transform group-hover:scale-110", wizardData.businessUnit === bu.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                                     <bu.icon className="h-10 w-10" />
                                  </div>
                                  <span className={cn("font-display font-black uppercase tracking-widest text-center leading-tight", wizardData.businessUnit === bu.id ? "text-primary" : "text-slate-400")}>{bu.label}</span>
                               </Card>
                             ))}
                          </div>
                       </div>
                     )}

                     {wizardStep === 2 && (
                       <div className="space-y-8">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">02. Product Type Classification</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {PRODUCT_TYPES.map(type => (
                               <button 
                                key={type} 
                                onClick={() => updateWizardField('type', type)}
                                className={cn(
                                  "h-20 rounded-2xl font-bold uppercase text-[9px] tracking-widest border-2 transition-all",
                                  wizardData.type === type ? "bg-[#001F3D] border-[#001F3D] text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-primary/30"
                                )}
                               >
                                  {type}
                               </button>
                             ))}
                          </div>
                       </div>
                     )}

                     {wizardStep === 3 && (
                       <div className="space-y-10">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">03. Identity Matrix Registry</h4>
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Product Name *</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.name} onChange={(e)=>updateWizardField('name', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Code *</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold text-xs" value={wizardData.code} onChange={(e)=>updateWizardField('code', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Internal Part Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.internalPartNumber} onChange={(e)=>updateWizardField('internalPartNumber', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Customer Part Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.customerPartNumber} onChange={(e)=>updateWizardField('customerPartNumber', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Drawing Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.drawingNumber} onChange={(e)=>updateWizardField('drawingNumber', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Revision Matrix</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.revisionNumber} onChange={(e)=>updateWizardField('revisionNumber', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">HSN/SAC Node</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.hsn} onChange={(e)=>updateWizardField('hsn', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">UOM Classification</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-xs" value={wizardData.uom} onChange={(e)=>updateWizardField('uom', e.target.value)} /></div>
                          </div>
                       </div>
                     )}

                     {wizardStep === 4 && (
                       <div className="space-y-10">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">04. Institutional Media Matrix</h4>
                          <div className="grid grid-cols-2 gap-8">
                             {['Product Image', 'Assembly Image', 'Drawing', '3D Model', 'Datasheet'].map(media => (
                               <Card key={media} className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all group cursor-pointer">
                                  <Upload className="h-10 w-10 text-slate-300 group-hover:text-primary transition-colors" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#001F3D]">{media} Protocol</span>
                               </Card>
                             ))}
                          </div>
                       </div>
                     )}

                     {wizardStep === 5 && (
                       <div className="space-y-8">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">05. Engineering Metadata Node</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Material Selection</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.material} onChange={(e)=>updateWizardField('material', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Material Grade Protocol</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.materialGrade} onChange={(e)=>updateWizardField('materialGrade', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Net Weight (kg)</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.weight} onChange={(e)=>updateWizardField('weight', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Surface Finish (Ra)</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.surfaceFinish} onChange={(e)=>updateWizardField('surfaceFinish', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Tolerance Class</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.tolerance} onChange={(e)=>updateWizardField('tolerance', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Industry Vertical</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.industry} onChange={(e)=>updateWizardField('industry', e.target.value)} /></div>
                          </div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Functional Description</Label><Textarea className="min-h-[150px] bg-slate-50 border-none rounded-3xl" value={wizardData.description} onChange={(e)=>updateWizardField('description', e.target.value)} /></div>
                       </div>
                     )}

                     {wizardStep === 6 && (
                       <div className="space-y-12">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">06. Manufacturing Yield Protocol</h4>
                          <div className="space-y-8">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Resource Node Allocation</Label>
                             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {['VMC Required', 'CNC Turning Required', 'Surface Grinding Required', 'Assembly Required', 'Inspection Required'].map(machine => (
                                  <div key={machine} className={cn("p-5 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all cursor-pointer group", wizardData.machinesRequired?.includes(machine) ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400 hover:border-primary/20")} onClick={()=>handleToggleWizardMachine(machine)}>
                                     <Cpu className="h-6 w-6" />
                                     <span className="text-[9px] font-black uppercase text-center leading-tight">{machine.replace(' Required', '')}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-100">
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Cycle Time (Sec)</Label><Input type="number" className="h-14 bg-slate-50 border-none rounded-xl font-display font-black text-2xl text-center" value={wizardData.cycleTimeSec} onChange={(e)=>updateWizardField('cycleTimeSec', Number(e.target.value))} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Setup Time (Min)</Label><Input type="number" className="h-14 bg-slate-50 border-none rounded-xl font-display font-black text-2xl text-center" value={wizardData.setupTimeMin} onChange={(e)=>updateWizardField('setupTimeMin', Number(e.target.value))} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Inspect Time (Min)</Label><Input type="number" className="h-14 bg-slate-50 border-none rounded-xl font-display font-black text-2xl text-center" value={wizardData.inspectionTimeMin} onChange={(e)=>updateWizardField('inspectionTimeMin', Number(e.target.value))} /></div>
                          </div>
                       </div>
                     )}

                     {wizardStep === 7 && (
                       <div className="space-y-12">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">07. Commercial Cost Center Matrix</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {[
                               { f: 'materialCost', l: 'Material Cost' },
                               { f: 'machiningCost', l: 'Machining Cost' },
                               { f: 'toolingCost', l: 'Tooling Cost' },
                               { f: 'inspectionCost', l: 'Inspection Cost' },
                               { f: 'assemblyCost', l: 'Assembly Cost' },
                               { f: 'packagingCost', l: 'Packaging Cost' },
                             ].map(cost => (
                               <div key={cost.f} className="space-y-2">
                                  <Label className="text-[9px] font-bold uppercase text-slate-500">{cost.l}</Label>
                                  <div className="relative">
                                     <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl pl-10 font-bold" value={(wizardData as any)[cost.f]} onChange={(e)=>updateWizardField(cost.f, Number(e.target.value))} />
                                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">₹</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                          <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] space-y-10 relative overflow-hidden">
                             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />
                             <div className="flex justify-between items-end relative z-10">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Total Matrix Cost</p>
                                   <p className="text-5xl font-display font-black text-primary tracking-tighter">₹ {totalWizardCost.toLocaleString()}</p>
                                </div>
                                <div className="text-right space-y-4">
                                   <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Target Margin %</p><Input type="number" className="bg-white/10 border-none text-white h-10 w-32 text-center text-xl font-display" value={wizardData.marginPercent} onChange={(e)=>updateWizardField('marginPercent', Number(e.target.value))} /></div>
                                   <div className="space-y-1"><p className="text-[8px] font-bold text-white/40 uppercase">Selling Price Node</p><Input type="number" className="bg-primary/20 border-none text-primary h-12 w-48 text-center text-2xl font-display font-black" value={wizardData.saleRate} onChange={(e)=>updateWizardField('saleRate', Number(e.target.value))} /></div>
                                </div>
                             </div>
                          </Card>
                       </div>
                     )}

                     {wizardStep === 8 && (
                       <div className="space-y-10">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">08. Market Intelligence Discovery</h4>
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Annual Requirement (Qty)</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.annualRequirement} onChange={(e)=>updateWizardField('annualRequirement', Number(e.target.value))} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Potential annual demand</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.potentialAnnualRequirement} onChange={(e)=>updateWizardField('potentialAnnualRequirement', Number(e.target.value))} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Competitor Product Hub</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.competitorProducts} onChange={(e)=>updateWizardField('competitorProducts', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Competitor Price Point (₹)</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.competitorPrice} onChange={(e)=>updateWizardField('competitorPrice', Number(e.target.value))} /></div>
                          </div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Forecasting & Growth Projections</Label><Textarea className="h-24 bg-slate-50 border-none rounded-2xl" value={wizardData.forecastGrowth} onChange={(e)=>updateWizardField('forecastGrowth', e.target.value)} /></div>
                       </div>
                     )}

                     {wizardStep === 9 && (
                       <div className="space-y-12">
                          <h4 className="text-sm font-black uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-6">09. Strategic Capacity Matrix</h4>
                          <Card className="p-10 bg-white border border-slate-100 shadow-xl rounded-[3rem] space-y-10">
                             <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                   <h5 className="text-lg font-bold text-[#001F3D] uppercase">In-House Manufacturing Protocol</h5>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Internal Resource Readiness Confirmation</p>
                                </div>
                                <Switch checked={wizardData.canManufactureInHouse} onCheckedChange={(v)=>updateWizardField('canManufactureInHouse', v)} />
                             </div>
                             <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex gap-6 items-start">
                                <ShieldCheck className="h-8 w-8 text-primary shrink-0 mt-1" />
                                <div className="space-y-2">
                                   <p className="text-sm font-bold text-slate-700">Strategic Compliance Confirmation</p>
                                   <p className="text-xs text-slate-500 leading-relaxed">By committing this node, you confirm that all technical blueprints, manufacturing routings, and commercial cost centers have been verified according to institucional standards.</p>
                                </div>
                             </div>
                          </Card>
                       </div>
                     )}
                  </div>
               </ScrollArea>

               <DialogFooter className="p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-4">
                     {wizardStep > 1 && (
                       <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-400" onClick={handlePrevWizard}><ChevronLeft className="h-4 w-4 mr-2" /> Protocol Back</Button>
                     )}
                     <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-400" onClick={() => setIsProductWizardOpen(false)}>Abort Onboarding</Button>
                  </div>
                  <div className="flex items-center gap-4">
                     {wizardStep < 9 ? (
                       <Button className="h-14 px-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3 group" onClick={handleNextWizard}>
                          Execute Next Node <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                       </Button>
                     ) : (
                       <Button className="h-14 px-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3 group" onClick={handleCommitProduct}>
                          <CheckCircle2 className="h-5 w-5" /> Commit Product Matrix
                       </Button>
                     )}
                  </div>
               </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
