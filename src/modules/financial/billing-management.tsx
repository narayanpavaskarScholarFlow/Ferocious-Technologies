
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
  X,
  PlusCircle,
  Eye,
  Info,
  Globe
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const WIZARD_STEPS = [
  { s: 1, l: 'Business Information', icon: Building2 },
  { s: 2, l: 'Basic Product Information', icon: Box },
  { s: 3, l: 'Engineering Details', icon: Cpu },
  { s: 4, l: 'Manufacturing & Process', icon: Factory },
  { s: 5, l: 'Commercial Information', icon: DollarSign },
  { s: 6, l: 'Market Intelligence', icon: Globe },
  { s: 7, l: 'In-House vs Outsourcing', icon: RefreshCw },
  { s: 8, l: 'Vendor & Supply Chain', icon: Truck },
  { s: 9, l: 'BOM & Assembly', icon: Layers },
  { s: 10, l: 'Review & Save', icon: CheckCircle2 },
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
    canManufactureInHouse: true,
    bom: []
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
      
    return { total, raw, assemblies, finished, fyRev, monthlyRev, active: products.filter(p=>p.status==='Active').length };
  }, [products, records]);

  const selectedProductData = useMemo(() => {
    if (!selectedProductId) return null;
    const p = products.find(x => x.id === selectedProductId);
    if (!p) return null;

    const pRecords = records.filter(r => r.items?.some(i => i.productId === p.id));
    const currentRev = pRecords.filter(r => r.type === 'invoice' && new Date(r.date).getMonth() === new Date().getMonth()).reduce((acc, r) => acc + (r.amount || 0), 0);
    const annualRev = pRecords.filter(r => r.type === 'invoice' && new Date(r.date).getFullYear() === new Date().getFullYear()).reduce((acc, r) => acc + (r.amount || 0), 0);
    const lifetimeRev = pRecords.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    
    const openQuotes = pRecords.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    const poVal = pRecords.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const activeWOs = orders.filter(o => o.items?.some(i => i.productId === p.id) && !['Delivered', 'Completed'].includes(o.status)).length;
    
    const dispatchQty = orders.filter(o => o.items?.some(i => i.productId === p.id) && o.status === 'Delivered').reduce((acc, o) => acc + (o.items?.find(i => i.productId === p.id)?.qty || 0), 0);
    const rejectedQty = p.rejectedQty || 0;

    return { ...p, currentRev, annualRev, lifetimeRev, openQuotes, poVal, activeWOs, dispatchQty, rejectedQty };
  }, [selectedProductId, products, records, orders]);

  const totalWizardCost = useMemo(() => {
    return (wizardData.materialCost || 0) + (wizardData.machiningCost || 0) + (wizardData.toolingCost || 0) + (wizardData.inspectionCost || 0) + (wizardData.assemblyCost || 0) + (wizardData.packagingCost || 0);
  }, [wizardData]);

  const handleNextWizard = () => {
    if (wizardStep === 8 && wizardData.type !== 'Assembly') {
      setWizardStep(10);
      return;
    }
    setWizardStep(s => Math.min(s + 1, 10));
  };
  const handlePrevWizard = () => {
    if (wizardStep === 10 && wizardData.type !== 'Assembly') {
      setWizardStep(8);
      return;
    }
    setWizardStep(s => Math.max(s - 1, 1));
  };

  const handleCommitProduct = () => {
    if (!wizardData.name || !wizardData.code) {
      toast({ variant: "destructive", title: "Form Incomplete", description: "Identity and Product Code are mandatory for synchronization." });
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
    
    toast({ title: "Success", description: "Product has been successfully registered in the ERP ledger." });
    setIsProductWizardOpen(false);
    setWizardStep(1);
    setWizardData({ businessUnit: 'Manufacturing', type: 'Finished Product', status: 'Active', machinesRequired: [], materialCost: 0, machiningCost: 0, toolingCost: 0, inspectionCost: 0, assemblyCost: 0, packagingCost: 0, canManufactureInHouse: true, bom: [] });
  };

  const updateWizardField = (field: string, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateWizardField('imageUrls', [reader.result as string]);
      reader.readAsDataURL(file);
    }
  };

  const WizardStepIcon = WIZARD_STEPS[wizardStep - 1]?.icon || Box;

  const ProductIntelligenceView = () => (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-1">
        {[
          { label: 'Total Products', val: productMetrics.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'FY Revenue', val: `₹${(productMetrics.fyRev / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Goods', val: productMetrics.active, icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Assemblies', val: productMetrics.assemblies, icon: Boxes, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Raw Materials', val: productMetrics.raw, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Finished Goods', val: productMetrics.finished, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-5 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">{kpi.label}</p>
               <div className={cn("p-1.5 rounded-lg shadow-sm", kpi.bg, kpi.color)}><kpi.icon className="h-3.5 w-3.5" /></div>
            </div>
            <p className={cn("text-2xl font-display font-black leading-none", kpi.color)}>{kpi.val}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><BrainCircuit className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Technical Registry</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional SKU Governance & Intelligence Hub</p>
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
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6 px-8 w-64">Identification</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Business Unit</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Classification</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-right">Selling Price</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-center w-32">State</TableHead>
                <TableHead className="text-right px-8 w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <TableRow key={p.id} className="h-24 border-b border-slate-50 hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => setSelectedProductId(p.id)}>
                  <TableCell className="px-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</span>
                      <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">ID: {p.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className={cn("text-[8px] font-bold uppercase px-3 py-1", p.businessUnit === 'Electricals' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100')}>
                       {p.businessUnit}
                     </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold text-slate-700 uppercase">{p.type}</span>
                  </TableCell>
                  <TableCell className="text-right font-display font-black text-sm text-slate-900">₹ {p.saleRate.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("text-[8px] font-bold uppercase px-4 py-1.5 rounded-full", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400')}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* PRODUCT PROFILE SHEET */}
      <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <SheetContent className="sm:max-w-[1000px] p-0 border-none shadow-2xl bg-white flex flex-col h-screen font-body overflow-hidden">
          {selectedProductData && (
            <>
              <SheetHeader className="p-10 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0">
                 <div className="flex items-center gap-8">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                       {selectedProductData.imageUrls?.[0] ? <img src={selectedProductData.imageUrls[0]} className="h-full w-full object-cover" /> : <Box className="h-10 w-10 text-primary" />}
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <Badge className="bg-primary text-[#001F3D] border-none px-3 font-bold text-[8px] uppercase tracking-widest">{selectedProductData.businessUnit}</Badge>
                          <Badge variant="outline" className="border-white/20 text-white/60 text-[8px] uppercase">{selectedProductData.type}</Badge>
                       </div>
                       <SheetTitle className="text-4xl font-display font-black uppercase tracking-tight text-white leading-none">{selectedProductData.name}</SheetTitle>
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 font-code">PROD_REF: {selectedProductData.code}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-5xl font-display font-black text-primary tracking-tighter">{selectedProductData.finalProductScore || 85}</div>
                    <p className="text-[8px] font-bold uppercase text-white/20 tracking-widest mt-1">Institutional Yield Score</p>
                 </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-10 bg-slate-50 border-b border-slate-200 shrink-0">
                  <TabsList className="h-14 bg-transparent p-0 gap-8">
                    {['Overview', 'Engineering', 'Manufacturing', 'Commercial', 'Market', 'Analytics'].map(tab => (
                      <TabsTrigger key={tab} value={tab.toLowerCase()} className="h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 font-bold text-[10px] uppercase tracking-widest">{tab}</TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-10 space-y-12 pb-40">
                    <TabsContent value="overview" className="m-0 space-y-10">
                       <div className="grid grid-cols-3 gap-6">
                          <Card className="p-6 bg-slate-50 border-none shadow-inner rounded-3xl space-y-2">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Revenue</p>
                             <p className="text-2xl font-display font-black text-[#001F3D]">₹ {(selectedProductData.lifetimeRev / 100000).toFixed(1)}L</p>
                          </Card>
                          <Card className="p-6 bg-slate-50 border-none shadow-inner rounded-3xl space-y-2">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active WOs</p>
                             <p className="text-2xl font-display font-black text-primary">{selectedProductData.activeWOs}</p>
                          </Card>
                          <Card className="p-6 bg-slate-50 border-none shadow-inner rounded-3xl space-y-2">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Invoiced Value</p>
                             <p className="text-2xl font-display font-black text-emerald-600">₹ {(selectedProductData.annualRev / 100000).toFixed(1)}L</p>
                          </Card>
                       </div>
                       <div className="space-y-6">
                          <h4 className="text-[11px] font-black uppercase text-slate-900 border-l-4 border-primary pl-4">Company Metadata</h4>
                          <div className="grid grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2.5rem]">
                             {[
                               { l: 'Brand Identity', v: selectedProductData.brand },
                               { l: 'Launch Date', v: selectedProductData.launchDate },
                               { l: 'Category', v: selectedProductData.category },
                               { l: 'Sub Category', v: selectedProductData.subCategory },
                             ].map(i => (
                               <div key={i.l} className="space-y-1">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{i.l}</p>
                                  <p className="text-xs font-bold text-slate-700 uppercase">{i.v || '---'}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="engineering" className="m-0 space-y-10">
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-[2.5rem] space-y-8">
                          <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><Cpu className="h-5 w-5 text-primary" /><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Engineering Details</h4></div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                             {[
                               { l: 'Drawing Number', v: selectedProductData.drawingNumber },
                               { l: 'Revision', v: selectedProductData.revisionNumber },
                               { l: 'Material', v: selectedProductData.material },
                               { l: 'Material Grade', v: selectedProductData.materialGrade },
                               { l: 'Tolerance', v: selectedProductData.tolerance },
                               { l: 'Surface Finish', v: selectedProductData.surfaceFinish },
                             ].map(item => (
                               <div key={item.l} className="space-y-1">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</p>
                                  <p className="text-[11px] font-bold text-slate-700 uppercase">{item.v || '---'}</p>
                               </div>
                             ))}
                          </div>
                       </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-end gap-4 z-50">
                 <Button variant="ghost" className="h-14 px-10 rounded-2xl font-bold uppercase text-[10px]" onClick={() => setSelectedProductId(null)}>Close Profile</Button>
                 <Button className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl"><Edit3 className="h-4 w-4 mr-2" /> Modify Record</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* PRODUCT CREATION WIZARD (PROFESSIONAL ERP STYLE) */}
      <Dialog open={isProductWizardOpen} onOpenChange={setIsProductWizardOpen}>
        <DialogContent className="max-w-6xl h-[90vh] bg-white p-0 border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex flex-col font-body">
          <div className="flex h-full">
            {/* Steps Sidebar */}
            <div className="w-80 bg-[#F8FAFC] p-10 flex flex-col justify-between shrink-0 border-r border-slate-200">
               <div className="space-y-10">
                  <div className="p-4 bg-[#001F3D] rounded-2xl w-fit shadow-xl">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4">
                    {WIZARD_STEPS.map(step => (
                      <div key={step.s} className="flex items-center gap-4 group">
                         <div className={cn(
                           "h-8 w-8 rounded-xl border-2 flex items-center justify-center text-[10px] font-bold transition-all",
                           wizardStep === step.s ? "bg-[#001F3D] border-[#001F3D] text-white scale-110 shadow-lg" : 
                           wizardStep > step.s ? "bg-emerald-50 border-emerald-500 text-white" : "border-slate-200 text-slate-300"
                         )}>
                           {wizardStep > step.s ? <Check className="h-4 w-4" /> : step.s}
                         </div>
                         <div className="flex flex-col">
                            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", wizardStep === step.s ? "text-[#001F3D]" : "text-slate-400")}>{step.l}</span>
                            {wizardStep === step.s && <span className="text-[7px] font-bold text-blue-600 uppercase tracking-tighter">Active Protocol</span>}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-none">Security: Certified Node</span>
                 </div>
                 <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">PROD_ONBOARD_v2.5</div>
               </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white">
               <DialogHeader className="p-10 border-b border-slate-100 bg-white shrink-0 flex flex-row justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-[0.3em] mb-2">
                      <WizardStepIcon className="h-3 w-3" />
                      Protocol Step {wizardStep.toString().padStart(2, '0')}
                    </div>
                    <DialogTitle className="text-3xl font-display font-black text-[#001F3D] uppercase tracking-tight">{WIZARD_STEPS[wizardStep-1].l}</DialogTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsProductWizardOpen(false)} className="rounded-full text-slate-300"><X className="h-6 w-6" /></Button>
               </DialogHeader>

               <ScrollArea className="flex-1 p-12">
                  <div className="max-w-3xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     
                     {wizardStep === 1 && (
                       <div className="space-y-12">
                          <div className="grid grid-cols-2 gap-8">
                             {BUSINESS_UNITS.map(bu => (
                               <Card key={bu.id} onClick={() => updateWizardField('businessUnit', bu.id)} className={cn("p-10 cursor-pointer border-2 transition-all flex flex-col items-center gap-6 group hover:shadow-2xl rounded-[2.5rem]", wizardData.businessUnit === bu.id ? "border-[#001F3D] bg-slate-50" : "border-slate-100")}>
                                  <div className={cn("p-6 rounded-3xl transition-transform group-hover:scale-110", wizardData.businessUnit === bu.id ? "bg-[#001F3D] text-white" : "bg-slate-50 text-slate-400")}>
                                     <bu.icon className="h-10 w-10" />
                                  </div>
                                  <span className={cn("font-display font-black uppercase tracking-widest text-center leading-tight", wizardData.businessUnit === bu.id ? "text-[#001F3D]" : "text-slate-400")}>{bu.label}</span>
                               </Card>
                             ))}
                          </div>
                       </div>
                     )}

                     {wizardStep === 2 && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Product Identity (Name)</Label>
                             <Input placeholder="Enter commercial name" className="h-14 bg-slate-50 border-none rounded-xl font-bold text-sm" value={wizardData.name} onChange={(e)=>updateWizardField('name', e.target.value)} />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Universal Sku Code</Label>
                             <Input placeholder="Enter unique ID" className="h-14 bg-slate-50 border-none rounded-xl font-code font-bold text-sm" value={wizardData.code} onChange={(e)=>updateWizardField('code', e.target.value)} />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Product Type</Label>
                             <Select value={wizardData.type} onValueChange={(val) => updateWizardField('type', val)}>
                                <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                                <SelectContent>{PRODUCT_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Product Image</Label>
                             <div className="flex gap-4">
                                <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                                   {wizardData.imageUrls?.[0] ? <img src={wizardData.imageUrls[0]} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
                                </div>
                                <Input type="file" className="h-14 bg-slate-50 border-none rounded-xl" onChange={handleProfileImageUpload} />
                             </div>
                          </div>
                       </div>
                     )}

                     {wizardStep === 3 && (
                       <div className="space-y-10">
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Material Composition</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.material} onChange={(e)=>updateWizardField('material', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Material Grade</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.materialGrade} onChange={(e)=>updateWizardField('materialGrade', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Drawing Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-code" value={wizardData.drawingNumber} onChange={(e)=>updateWizardField('drawingNumber', e.target.value)} /></div>
                             <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Tolerance Class</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.tolerance} onChange={(e)=>updateWizardField('tolerance', e.target.value)} /></div>
                          </div>
                          {wizardData.businessUnit === 'Electricals' && (
                            <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-3xl grid grid-cols-2 gap-8">
                               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-blue-600">Voltage Matrix</Label><Input className="bg-white" value={wizardData.voltage} onChange={(e)=>updateWizardField('voltage', e.target.value)} /></div>
                               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-blue-600">Current Rating</Label><Input className="bg-white" value={wizardData.current} onChange={(e)=>updateWizardField('current', e.target.value)} /></div>
                               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-blue-600">Phase Configuration</Label><Input className="bg-white" value={wizardData.phase} onChange={(e)=>updateWizardField('phase', e.target.value)} /></div>
                               <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-blue-600">Frequency (Hz)</Label><Input className="bg-white" value={wizardData.frequency} onChange={(e)=>updateWizardField('frequency', e.target.value)} /></div>
                            </div>
                          )}
                       </div>
                     )}

                     {wizardStep === 4 && (
                       <div className="space-y-10">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Resource Nodes Required</Label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['VMC', 'CNC Turning', 'Surface Grinding', 'VMM', 'Assembly', 'Quality'].map(m => (
                                  <div key={m} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                     <Checkbox id={`wiz-m-${m}`} checked={wizardData.machinesRequired?.includes(m)} onCheckedChange={(v) => {
                                        const curr = wizardData.machinesRequired || [];
                                        updateWizardField('machinesRequired', v ? [...curr, m] : curr.filter(x => x !== m));
                                     }} />
                                     <Label htmlFor={`wiz-m-${m}`} className="text-[10px] font-bold uppercase text-slate-700 cursor-pointer">{m}</Label>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                             <div className="space-y-2 text-center"><Label className="text-[10px] font-bold uppercase text-slate-400">Setup (Min)</Label><Input type="number" className="h-14 text-center font-display font-black text-2xl" value={wizardData.setupTimeMin} onChange={(e)=>updateWizardField('setupTimeMin', Number(e.target.value))} /></div>
                             <div className="space-y-2 text-center"><Label className="text-[10px] font-bold uppercase text-slate-400">Cycle (Sec)</Label><Input type="number" className="h-14 text-center font-display font-black text-2xl" value={wizardData.cycleTimeSec} onChange={(e)=>updateWizardField('cycleTimeSec', Number(e.target.value))} /></div>
                             <div className="space-y-2 text-center"><Label className="text-[10px] font-bold uppercase text-slate-400">Inspection (Min)</Label><Input type="number" className="h-14 text-center font-display font-black text-2xl" value={wizardData.inspectionTimeMin} onChange={(e)=>updateWizardField('inspectionTimeMin', Number(e.target.value))} /></div>
                          </div>
                       </div>
                     )}

                     {wizardStep === 5 && (
                       <div className="space-y-10">
                          <div className="grid grid-cols-2 gap-10">
                             <div className="space-y-6">
                                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Material Cost Center</Label><Input type="number" className="h-12 bg-slate-50" value={wizardData.materialCost} onChange={(e)=>updateWizardField('materialCost', Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Machining Cost Center</Label><Input type="number" className="h-12 bg-slate-50" value={wizardData.machiningCost} onChange={(e)=>updateWizardField('machiningCost', Number(e.target.value))} /></div>
                                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Tooling Cost Center</Label><Input type="number" className="h-12 bg-slate-50" value={wizardData.toolingCost} onChange={(e)=>updateWizardField('toolingCost', Number(e.target.value))} /></div>
                             </div>
                             <div className="space-y-6">
                                <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl rounded-3xl space-y-6">
                                   <div className="space-y-1"><p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Commercial Cost</p><p className="text-4xl font-display font-black text-primary">₹ {totalWizardCost.toLocaleString()}</p></div>
                                   <div className="space-y-2 pt-6 border-t border-white/10">
                                      <Label className="text-[9px] font-bold uppercase text-white/40">Selling Price Node</Label>
                                      <Input type="number" className="bg-white/5 border-white/10 h-14 font-display font-black text-2xl text-emerald-400" value={wizardData.saleRate} onChange={(e)=>updateWizardField('saleRate', Number(e.target.value))} />
                                   </div>
                                </Card>
                             </div>
                          </div>
                       </div>
                     )}

                     {wizardStep === 6 && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500">Annual Requirement (Qty)</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.annualRequirement} onChange={(e)=>updateWizardField('annualRequirement', Number(e.target.value))} /></div>
                          <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500">Competitor Reference Price</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl" value={wizardData.competitorPrice} onChange={(e)=>updateWizardField('competitorPrice', Number(e.target.value))} /></div>
                          <div className="space-y-3 col-span-full"><Label className="text-[10px] font-bold uppercase text-slate-500">Market Potential Summary</Label><Textarea className="bg-slate-50 border-none rounded-2xl min-h-[100px]" value={wizardData.description} onChange={(e)=>updateWizardField('description', e.target.value)} /></div>
                       </div>
                     )}

                     {wizardStep === 7 && (
                       <div className="space-y-12">
                          <Card className="p-10 border-2 border-slate-100 rounded-[2.5rem] flex flex-col items-center gap-8">
                             <div className="p-6 bg-slate-50 rounded-3xl"><RefreshCw className="h-10 w-10 text-slate-300" /></div>
                             <div className="text-center space-y-2">
                                <h4 className="text-xl font-bold text-slate-800 uppercase">Production Strategy</h4>
                                <p className="text-xs text-slate-400 max-w-sm uppercase font-bold tracking-widest">Can this identity node be manufactured in-house?</p>
                             </div>
                             <div className="flex items-center gap-10">
                                <button onClick={()=>updateWizardField('canManufactureInHouse', true)} className={cn("h-14 w-40 rounded-2xl font-black uppercase text-[11px] transition-all", wizardData.canManufactureInHouse ? "bg-emerald-600 text-white shadow-xl scale-110" : "bg-slate-50 text-slate-300 hover:bg-slate-100")}>In-House</button>
                                <button onClick={()=>updateWizardField('canManufactureInHouse', false)} className={cn("h-14 w-40 rounded-2xl font-black uppercase text-[11px] transition-all", !wizardData.canManufactureInHouse ? "bg-orange-600 text-white shadow-xl scale-110" : "bg-slate-50 text-slate-300 hover:bg-slate-100")}>Outsource</button>
                             </div>
                          </Card>
                       </div>
                     )}

                     {wizardStep === 8 && (
                       <div className="space-y-10">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Associate Vendor Node</Label>
                             <Select onValueChange={(v)=>updateWizardField('mostOutsourcedProcess', v)}>
                                <SelectTrigger className="h-16 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase shadow-inner"><SelectValue placeholder="Identify Supply Chain Partner..." /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                   {vendors.map(v => <SelectItem key={v.id} value={v.name} className="text-xs font-bold uppercase py-3">{v.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                       </div>
                     )}

                     {wizardStep === 9 && (
                       <div className="space-y-8">
                          <div className="flex justify-between items-center">
                             <h4 className="text-sm font-black text-[#001F3D] uppercase border-l-4 border-primary pl-4">Bill of Materials (BOM)</h4>
                             <Button variant="outline" size="sm" className="h-9 px-6 rounded-xl font-bold uppercase text-[9px] gap-2" onClick={() => {
                                const curr = wizardData.bom || [];
                                updateWizardField('bom', [...curr, { id: Date.now().toString(), componentId: '', name: '', qty: 1, cost: 0 }]);
                             }}>
                                <PlusCircle className="h-3.5 w-3.5" /> Append Child Component
                             </Button>
                          </div>
                          <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                             <Table>
                                <TableHeader className="bg-slate-50">
                                   <TableRow><TableHead className="text-[9px] font-bold uppercase">Component</TableHead><TableHead className="text-[9px] font-bold uppercase text-center">Qty</TableHead><TableHead className="text-[9px] font-bold uppercase text-right">Est. Cost</TableHead><TableHead className="w-16"></TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                   {(wizardData.bom || []).map((item, idx) => (
                                     <TableRow key={item.id}>
                                        <TableCell>
                                           <Select value={item.componentId} onValueChange={(v) => {
                                              const prod = products.find(p=>p.id === v);
                                              const newBom = [...(wizardData.bom || [])];
                                              newBom[idx] = { ...newBom[idx], componentId: v, name: prod?.name || '', cost: prod?.saleRate || 0 };
                                              updateWizardField('bom', newBom);
                                           }}>
                                              <SelectTrigger className="border-none h-10 bg-transparent text-[10px] font-bold uppercase focus:ring-0"><SelectValue placeholder="Identify..." /></SelectTrigger>
                                              <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                           </Select>
                                        </TableCell>
                                        <TableCell className="text-center"><Input type="number" className="w-20 mx-auto text-center border-none font-bold" value={item.qty} onChange={(e)=>{
                                           const newBom = [...(wizardData.bom || [])];
                                           newBom[idx].qty = Number(e.target.value);
                                           updateWizardField('bom', newBom);
                                        }} /></TableCell>
                                        <TableCell className="text-right font-display font-bold">₹ {item.cost.toLocaleString()}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => updateWizardField('bom', wizardData.bom?.filter(x => x.id !== item.id))}><Trash2 className="h-3 w-3 text-slate-300" /></Button></TableCell>
                                     </TableRow>
                                   ))}
                                </TableBody>
                             </Table>
                          </div>
                       </div>
                     )}

                     {wizardStep === 10 && (
                       <div className="space-y-10">
                          <Card className="p-10 border-2 border-primary bg-primary/5 rounded-[2.5rem] space-y-10">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary rounded-xl text-white"><ShieldCheck className="h-6 w-6" /></div>
                                <div><h4 className="text-2xl font-display font-black uppercase text-[#001F3D]">Confirm Registry Entry</h4><p className="text-[10px] font-bold uppercase text-slate-400">Review institutional metadata before commit.</p></div>
                             </div>
                             <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-2"><p className="text-[8px] font-bold text-slate-400 uppercase">Product Identity</p><p className="text-lg font-bold text-slate-700 uppercase">{wizardData.name}</p></div>
                                <div className="space-y-2"><p className="text-[8px] font-bold text-slate-400 uppercase">Business Unit</p><p className="text-lg font-bold text-slate-700 uppercase">{wizardData.businessUnit}</p></div>
                                <div className="space-y-2"><p className="text-[8px] font-bold text-slate-400 uppercase">Selling Price Node</p><p className="text-2xl font-display font-black text-primary">₹ {wizardData.saleRate?.toLocaleString()}</p></div>
                                <div className="space-y-2"><p className="text-[8px] font-bold text-slate-400 uppercase">Strategy</p><Badge className="bg-[#001F3D] text-white uppercase text-[8px] font-bold">{wizardData.canManufactureInHouse ? 'IN-HOUSE' : 'OUTSOURCE'}</Badge></div>
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
                     {wizardStep < 10 ? (
                       <Button className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3 group" onClick={handleNextWizard}>
                          Continue to Next Node <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                       </Button>
                     ) : (
                       <Button className="h-14 px-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl flex gap-3 group" onClick={handleCommitProduct}>
                          <CheckCircle2 className="h-5 w-5" /> Commit to Master Registry
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

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-700">
      {activeTab === 'product-master' ? <ProductIntelligenceView /> : (
        <div className="space-y-8">
           <div className="flex justify-between items-end gap-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <Card className="p-6 bg-white border-none shadow-sm rounded-2xl group hover:border-primary transition-all">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Revenue Sync</p>
                  <p className="text-2xl font-display font-black text-[#001F3D]">₹ {(productMetrics.fyRev / 100000).toFixed(1)}L</p>
                </Card>
                <Card className="p-6 bg-white border-none shadow-sm rounded-2xl group hover:border-primary transition-all">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional SKU Count</p>
                  <p className="text-2xl font-display font-black text-emerald-600">{productMetrics.total} SKUs</p>
                </Card>
             </div>
             <Button className="h-14 bg-[#001F3D] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex gap-3 px-10" onClick={() => { setIsProductWizardOpen(true); setWizardStep(1); }}>
                <Plus className="h-4 w-4" /> Initialize SKU Node
             </Button>
          </div>

          <Card className="p-4 bg-white border-slate-200 rounded-2xl flex gap-4">
             <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input placeholder="Search technical identity..." className="h-12 pl-12 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
             <Button variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase text-[9px] gap-2 border-slate-200 shadow-sm"><Download className="h-4 w-4" /> Export Ledger</Button>
          </Card>

          <Card className="overflow-hidden border-none bg-white shadow-sm rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent"><TableHead className="px-8 py-5 font-black text-[9px] uppercase tracking-widest text-slate-400">Identity Protocol</TableHead><TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400">BU Node</TableHead><TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400">Class</TableHead><TableHead className="text-right font-black text-[9px] uppercase tracking-widest text-slate-400">Price</TableHead><TableHead className="text-center font-black text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead><TableHead className="text-right px-8"></TableHead></TableRow>
              </TableHeader>
              <TableBody>{products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <TableRow key={p.id} onClick={() => setSelectedProductId(p.id)} className="h-20 hover:bg-slate-50 transition-all cursor-pointer group border-b border-slate-50 last:border-0">
                  <TableCell className="px-8"><div className="flex flex-col"><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</span><span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">{p.code}</span></div></TableCell>
                  <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase px-3 py-1">{p.businessUnit}</Badge></TableCell>
                  <TableCell><span className="text-[10px] font-bold text-slate-600 uppercase">{p.type}</span></TableCell>
                  <TableCell className="text-right font-display font-black text-sm text-slate-900">₹ {p.saleRate.toLocaleString()}</TableCell>
                  <TableCell className="text-center"><Badge className={cn("text-[8px] font-bold uppercase px-4", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right px-8"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}

