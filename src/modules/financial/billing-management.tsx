
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
  Maximize2
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

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
  "Raw Material", "Semi Finished", "Finished Product", "Assembly", 
  "Sub Assembly", "Service", "Design Service", "Engineering Service"
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { toast } = useToast();

  const productMetrics = useMemo(() => {
    const total = products.length;
    const raw = products.filter(p => p.type === 'Raw Material').length;
    const assemblies = products.filter(p => p.type === 'Assembly' || p.type === 'Sub Assembly').length;
    const finished = products.filter(p => p.type === 'Finished Product').length;
    const active = products.filter(p => p.status === 'Active').length;
    
    return { total, raw, assemblies, finished, active };
  }, [products]);

  const selectedProductData = useMemo(() => {
    if (!selectedProductId) return null;
    const p = products.find(x => x.id === selectedProductId);
    if (!p) return null;

    // Simulated Intelligence Data
    const lifetimeRev = records.filter(r => r.items?.some(i => i.productId === p.id)).reduce((acc, r) => acc + (r.amount || 0), 0);
    const activeWOs = orders.filter(o => o.items?.some(i => i.productId === p.id) && o.status !== 'Delivered').length;

    return { ...p, lifetimeRev, activeWOs };
  }, [selectedProductId, products, records, orders]);

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
    // Logic for new billing record
  };

  const handleSave = () => {
    // Logic for save
  };

  const ProductIntelligenceView = () => (
    <div className="space-y-8 animate-in fade-in duration-500 font-body">
      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-1">
        {[
          { label: 'Total Products', val: productMetrics.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Raw Materials', val: productMetrics.raw, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Assemblies', val: productMetrics.assemblies, icon: Boxes, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><FileSpreadsheet className="h-6 w-6" /></div>
              <div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Product Engineering Ledger</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Technical Registry</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                 <Input placeholder="Filter registry..." className="h-10 pl-9 rounded-xl border-slate-200 text-xs font-bold" />
              </div>
              <Button className="h-10 bg-[#001F3D] text-white rounded-xl px-6 font-bold uppercase text-[9px] shadow-lg flex gap-2">
                <Plus className="h-3.5 w-3.5" /> New Engineering Node
              </Button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white border-b border-slate-100">
              <TableRow>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6 px-8 w-40">Identification</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Classification</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">HSN/SAC</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Engineering Node</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-right">Standard Rate (₹)</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-center w-20">Status</TableHead>
                <TableHead className="text-right px-8 w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all group">
                  <TableCell className="px-8 cursor-pointer" onClick={() => setSelectedProductId(p.id)}>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{p.name}</span>
                      <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">CODE: {p.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <Badge variant="outline" className="text-[8px] font-bold uppercase w-fit bg-slate-50 border-slate-100">{p.businessUnit || 'MANUFACTURING'}</Badge>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{p.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-code text-xs font-bold text-slate-500">{p.hsn}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-700 uppercase">DRG: {p.drawingNumber || '---'}</span>
                       <span className="text-[9px] text-slate-400 font-bold uppercase">REV: {p.revisionNumber || '00'}</span>
                    </div>
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* PRODUCT INTELLIGENCE SHEET */}
      <Sheet open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <SheetContent className="sm:max-w-[900px] p-0 border-none shadow-2xl bg-white flex flex-col h-screen font-body overflow-hidden">
          {selectedProductData && (
            <>
              <SheetHeader className="p-10 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md">
                       <Box className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                       <SheetTitle className="text-3xl font-display font-black uppercase tracking-tight text-white leading-none mb-2">{selectedProductData.name}</SheetTitle>
                       <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Technical Identity Node: {selectedProductData.code}</SheetDescription>
                    </div>
                 </div>
                 <div className="text-right">
                    <Badge className="bg-white/10 text-white border-none px-4 h-8 uppercase font-bold text-[10px] tracking-widest">{selectedProductData.type}</Badge>
                 </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                 <div className="p-10 space-y-12 pb-32">
                    {/* ENGINEERING & COSTING NODES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-6">
                          <div className="flex items-center gap-3 text-primary"><Cpu className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Engineering Specs</h4></div>
                          <div className="grid grid-cols-2 gap-y-6">
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Material</p><p className="text-xs font-bold text-slate-700 uppercase">{selectedProductData.material || '---'}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Grade</p><p className="text-xs font-bold text-slate-700 uppercase">{selectedProductData.materialGrade || '---'}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Process</p><p className="text-xs font-bold text-slate-700 uppercase">{selectedProductData.process || '---'}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Tolerance</p><p className="text-xs font-bold text-slate-700 uppercase">{selectedProductData.tolerance || '---'}</p></div>
                          </div>
                       </Card>
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-6">
                          <div className="flex items-center gap-3 text-emerald-600"><DollarSign className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Commercial Node</h4></div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-slate-400 uppercase">Selling Price</span><span className="text-2xl font-display font-black text-slate-900">₹ {selectedProductData.saleRate.toLocaleString()}</span></div>
                             <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Annual Requirement</span><span className="text-sm font-display font-black text-[#001F3D]">{selectedProductData.annualRequirement?.toLocaleString() || '---'} Units</span></div>
                          </div>
                       </Card>
                    </div>

                    {/* ELECTRICAL PROTOCOL NODE - CONDITIONAL */}
                    {selectedProductData.businessUnit === 'Electricals' && (
                       <Card className="p-8 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-8">
                          <div className="flex items-center gap-3 text-blue-600"><Zap className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Electrical Parameters Matrix</h4></div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Voltage</p><p className="text-sm font-bold text-blue-900">{selectedProductData.voltage || '---'}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Current</p><p className="text-sm font-bold text-blue-900">{selectedProductData.current || '---'}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Power</p><p className="text-sm font-bold text-blue-900">{selectedProductData.power || '---'}</p></div>
                             <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Warranty</p><p className="text-sm font-bold text-blue-900">{selectedProductData.warranty || '---'}</p></div>
                          </div>
                          <div className="flex gap-4 pt-4 border-t border-blue-100">
                             {['BIS', 'CE', 'RoHS'].map(cert => (
                               <Badge key={cert} variant="outline" className="bg-white border-blue-200 text-blue-600 font-bold text-[8px] px-3">{cert}_CERTIFIED</Badge>
                             ))}
                          </div>
                       </Card>
                    )}

                    {/* MANUFACTURING ANALYTICS */}
                    <div className="space-y-8">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Institutional Manufacturing Analytics</h3>
                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: 'VMC Hours', val: selectedProductData.vmcHours, icon: Cpu },
                            { label: 'CNC Hours', val: selectedProductData.cncHours, icon: Layers },
                            { label: 'Grinding', val: selectedProductData.grindingHours, icon: Hammer },
                            { label: 'Assembly', val: selectedProductData.assemblyHours, icon: Factory },
                            { label: 'Inspection', val: selectedProductData.inspectionHours, icon: ShieldCheck },
                          ].map(hours => (
                            <div key={hours.label} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-2">
                               <p className="text-[7px] font-bold text-slate-400 uppercase">{hours.label}</p>
                               <p className="text-lg font-display font-bold text-slate-800">{hours.val || '0.0'}h</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* OUTSOURCING ANALYSIS */}
                    <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-3xl flex flex-col md:flex-row items-center gap-10 overflow-hidden">
                       <div className="space-y-6 flex-1">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">In-House vs Outsourcing Yield</h4>
                          <div className="space-y-8">
                             <div className="space-y-3">
                                <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-white/60">In-House Production</span><span className="text-lg font-display font-bold text-emerald-400">{selectedProductData.inHousePercent || 100}%</span></div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${selectedProductData.inHousePercent || 100}%` }} /></div>
                             </div>
                             <div className="space-y-3">
                                <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-white/60">Outsourced Process</span><span className="text-lg font-display font-bold text-primary">{selectedProductData.outsourcedPercent || 0}%</span></div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${selectedProductData.outsourcedPercent || 0}%` }} /></div>
                             </div>
                          </div>
                       </div>
                       <div className="w-full md:w-56 space-y-4">
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                             <p className="text-[7px] font-bold text-white/30 uppercase">Primary Vendor</p>
                             <p className="text-[11px] font-bold text-white uppercase mt-1">{selectedProductData.vendorUsed || 'IN-HOUSE_ONLY'}</p>
                          </div>
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                             <p className="text-[7px] font-bold text-white/30 uppercase">Primary Asset</p>
                             <p className="text-[11px] font-bold text-white uppercase mt-1">{selectedProductData.machineUsed || 'VMC_HASS_VF2'}</p>
                          </div>
                       </div>
                    </Card>

                    {/* BOM STRUCTURE - FOR ASSEMBLIES */}
                    {(selectedProductData.type === 'Assembly' || selectedProductData.type === 'Sub Assembly') && (
                      <div className="space-y-6">
                         <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-indigo-600 pl-4">Bill of Materials (BOM) Matrix</h3>
                         <div className="overflow-hidden border border-slate-100 rounded-3xl bg-slate-50/50">
                            <Table>
                               <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                     <TableHead className="text-[8px] uppercase font-bold py-4">Component</TableHead>
                                     <TableHead className="text-[8px] uppercase font-bold text-center">Qty</TableHead>
                                     <TableHead className="text-[8px] uppercase font-bold text-right">Unit Cost (₹)</TableHead>
                                     <TableHead className="text-[8px] uppercase font-bold text-right pr-6">Total</TableHead>
                                  </TableRow>
                               </TableHeader>
                               <TableBody>
                                  {selectedProductData.bom?.map(item => (
                                    <TableRow key={item.id} className="h-14 border-b border-white hover:bg-white transition-all">
                                       <TableCell className="font-bold text-[10px] text-slate-700 uppercase">{item.name}</TableCell>
                                       <TableCell className="text-center font-bold text-[10px] text-slate-500">{item.qty}</TableCell>
                                       <TableCell className="text-right font-display font-bold text-[10px]">₹ {item.cost.toLocaleString()}</TableCell>
                                       <TableCell className="text-right font-display font-black text-[11px] pr-6">₹ {(item.qty * item.cost).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                  {(!selectedProductData.bom || selectedProductData.bom.length === 0) && (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center opacity-30 text-[9px] font-bold uppercase italic">BOM Structure Not Defined</TableCell></TableRow>
                                  )}
                               </TableBody>
                            </Table>
                         </div>
                      </div>
                    )}

                    {/* MEDIA MATRIX */}
                    <div className="space-y-8">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Engineering Document Matrix</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            { label: 'Drawing', icon: FileText, color: 'text-blue-600' },
                            { label: '3D Model', icon: Box, color: 'text-indigo-600' },
                            { label: 'Datasheet', icon: FileCheck, color: 'text-emerald-600' },
                            { label: 'Catalog', icon: Archive, color: 'text-amber-600' },
                          ].map(media => (
                            <Card key={media.label} className="p-6 border-slate-100 shadow-sm hover:border-primary/30 transition-all flex flex-col items-center gap-4 group cursor-pointer">
                               <div className={cn("p-3 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform", media.color)}><media.icon className="h-6 w-6" /></div>
                               <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{media.label}</span>
                            </Card>
                          ))}
                       </div>
                    </div>
                 </div>
              </ScrollArea>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-between items-center z-50">
                 <div className="flex gap-10">
                    <div className="flex flex-col"><span className="text-[7px] font-bold text-slate-400 uppercase">Lifetime Revenue</span><span className="text-sm font-display font-black text-emerald-600">₹ {selectedProductData.lifetimeRev.toLocaleString()}</span></div>
                    <div className="flex flex-col"><span className="text-[7px] font-bold text-slate-400 uppercase">Active WO Threads</span><span className="text-sm font-display font-black text-[#001F3D]">{selectedProductData.activeWOs}</span></div>
                 </div>
                 <div className="flex gap-3">
                    <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold uppercase text-[9px] text-slate-400" onClick={() => setSelectedProductId(null)}>Close Hub</Button>
                    <Button className="h-12 px-12 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[9px] shadow-xl flex gap-3"><Edit3 className="h-4 w-4" /> Edit Technical Matrix</Button>
                 </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-700">
      {isRecordFormOpen ? <div /> : (
        <div className="space-y-8">
          {activeTab === 'dashboard' ? <AnalyticsView /> : 
           activeTab === 'product-master' ? <ProductIntelligenceView /> : (
            <div className="space-y-8">
              {/* Other tabs logic (invoice, quotation, etc.) */}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function AnalyticsView() {
    return <div />; // Existing Analytics Logic
  }
}
