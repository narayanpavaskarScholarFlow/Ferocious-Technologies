
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
  Trash2,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Landmark,
  DollarSign,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck,
  ArrowLeft,
  Download,
  Link2,
  Box,
  Zap,
  Send,
  MoreVertical,
  Copy,
  Users,
  X,
  PlusCircle,
  Info,
  Globe,
  TableProperties,
  Calculator,
  User,
  Layout,
  LayoutGrid,
  Hammer,
  Settings,
  Percent,
  Layers,
  Cpu,
  ShieldCheck,
  Package,
  PackageCheck,
  Wrench,
  Check,
  Mail,
  Phone,
  Contact,
  ClipboardList,
  ChevronDown,
  FileSpreadsheet,
  Target,
  History,
  Briefcase,
  GraduationCap,
  FileBarChart,
  Edit3,
  Search as SearchIcon,
  Palette,
  Ruler,
  Maximize2
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem, InventoryItem, ProductMaster, Machine, ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'Quotation', icon: Package, prefix: 'QT' },
  { id: 'proforma', label: 'Proforma', icon: FileCheck, prefix: 'PFI' },
  { id: 'invoice', label: 'Sales Invoice', icon: FileText, prefix: 'INV' },
  { id: 'purchase_invoice', label: 'Purchase Invoice', icon: ShoppingCart, prefix: 'PI' },
  { id: 'delivery_challan', label: 'Delivery Challan', icon: Truck, prefix: 'DC' },
  { id: 'purchase_order', label: 'Purchase Order', icon: FileCheck, prefix: 'PO' },
  { id: 'sale_order', label: 'Sales Order', icon: FileSpreadsheet, prefix: 'SO' },
];

const ONBOARDING_STEPS = [
  { id: 1, label: 'Business Unit', desc: 'Select Entity', icon: Building2 },
  { id: 2, label: 'Basic Info', desc: 'Product Identity', icon: Box },
  { id: 3, label: 'Engineering', desc: 'Material Specs', icon: Ruler },
  { id: 4, label: 'Manufacturing', desc: 'Process Cycle', icon: Factory },
  { id: 5, label: 'Commercial', desc: 'Cost Matrix', icon: DollarSign },
  { id: 6, label: 'Market', desc: 'Demand Forecast', icon: Target },
  { id: 7, label: 'Outsourcing', desc: 'Procurement Strategy', icon: Truck },
  { id: 8, label: 'Supply Chain', desc: 'Vendor Link', icon: Users },
  { id: 9, label: 'BOM', desc: 'Assembly Structure', icon: Layers },
  { id: 10, label: 'Review', desc: 'Final Verification', icon: ShieldCheck },
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isProductWizardOpen, setIsProductWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'quotation', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Draft', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0, fy: format(new Date(), 'yyyy-yy'), salesExecutive: '', deliveryTerms: '',
    taxableValue: 0, estimatedProfit: 0, marginPercent: 0
  });

  const [newProduct, setNewProduct] = useState<Partial<ProductMaster>>({
    id: '', code: '', name: '', businessUnit: 'Manufacturing', type: 'Finished Product', status: 'Active',
    hsn: '', gstRate: 18, uom: 'Nos', saleRate: 0, purchaseRate: 0, machinesRequired: [], cycleTimeSec: 0,
    setupTimeMin: 0, inspectionTimeMin: 0, assemblyTimeMin: 0, material: '', materialGrade: '', weight: '',
    surfaceFinish: '', tolerance: '', application: '', industry: '', processRoute: '', drawingNumber: '',
    revisionNumber: '', customerPartNumber: '', internalPartNumber: '', standardCost: 0, currentCost: 0,
    sellingPrice: 0, marketPrice: 0, marginPercent: 0, annualRequirement: 0, potentialAnnualRequirement: 0,
    inHousePercent: 100, outsourcedPercent: 0, bom: [], category: 'General', businessUnit_Electrical: {} as any
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const productMetrics = useMemo(() => {
    const total = products.length;
    const assemblies = products.filter(p => p.type === 'Assembly' || p.type === 'Sub Assembly').length;
    const raw = products.filter(p => p.type === 'Raw Material').length;
    const finished = products.filter(p => p.type === 'Finished Product').length;
    const active = products.filter(p => p.status === 'Active').length;
    return { total, assemblies, raw, finished, active };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    if (record) {
      setFormData(record);
    } else {
      const docType = DOCUMENT_TYPES.find(t=>t.id===type);
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `${docType?.prefix || 'DOC'}-${Math.floor(1000 + Math.random() * 9000)}`, status: 'Draft', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0, roundOff: 0, notes: '', terms: '', quotationId: '',
        placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
        revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0, fy: format(new Date(), 'yyyy-yy'), salesExecutive: '', deliveryTerms: '',
        taxableValue: 0, estimatedProfit: 0, marginPercent: 0
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSaveProduct = () => {
    const id = newProduct.id || `PROD-${Date.now()}`;
    const productData = { ...newProduct, id, updatedAt: new Date().toISOString() } as ProductMaster;
    // Mock save logic - in real app, call setDocumentNonBlocking
    toast({ title: "Product Synchronized", description: `${productData.name} has been committed to the registry.` });
    setIsProductWizardOpen(false);
  };

  const ProductIntelligenceView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-1">
        {[
          { label: 'Total Products', val: productMetrics.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Raw Materials', val: productMetrics.raw, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Assemblies', val: productMetrics.assemblies, icon: Boxes, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Finished Goods', val: productMetrics.finished, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Matrix', val: productMetrics.active, icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
               <div className={cn("p-1.5 rounded-lg", kpi.bg, kpi.color)}><kpi.icon className="h-3.5 w-3.5" /></div>
            </div>
            <p className={cn("text-xl font-display font-black", kpi.color)}>{kpi.val}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 px-2">
         <div className="relative flex-1 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary" />
            <Input placeholder="Search Product Intelligence..." className="h-12 pl-12 rounded-2xl bg-white border-none shadow-sm text-xs font-bold uppercase" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
         </div>
         <Button className="h-12 bg-[#001F3D] text-white rounded-2xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-lg flex gap-3" onClick={() => { setWizardStep(1); setIsProductWizardOpen(true); }}>
            <Plus className="h-4 w-4" /> Create Product Node
         </Button>
      </div>

      <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
         <Table>
            <TableHeader className="bg-slate-50/80">
               <TableRow>
                  <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Product Identity</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400">Type</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400">Drawing #</TableHead>
                  <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Selling Rate</TableHead>
                  <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">Status</TableHead>
                  <TableHead className="text-right px-10 font-bold text-[9px] uppercase text-slate-400">Action</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredProducts.map(p => (
                 <TableRow key={p.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => setSelectedProductId(p.id)}>
                    <TableCell className="px-10">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight group-hover:text-primary">{p.name}</span>
                          <span className="text-[9px] text-slate-400 font-code font-bold uppercase mt-1">{p.code}</span>
                       </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase">{p.type}</Badge></TableCell>
                    <TableCell><span className="text-[10px] font-code font-bold text-slate-500">{p.drawingNumber || '---'}</span></TableCell>
                    <TableCell className="text-right font-display font-bold text-sm">₹ {p.saleRate.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                       <Badge className={cn("text-[8px] font-bold uppercase px-3 py-1 rounded-full", p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" />
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </Card>

      {/* PRODUCT PROFILE SHEET */}
      <Sheet open={!!selectedProductId} onOpenChange={(v) => !v && setSelectedProductId(null)}>
         <SheetContent className="sm:max-w-[800px] p-0 border-none bg-[#f8fafc] font-body overflow-hidden flex flex-col">
            {selectedProduct && (
              <>
                <SheetHeader className="p-10 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0">
                   <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md">
                         <Box className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                         <SheetTitle className="text-3xl font-display font-black uppercase tracking-tight text-white leading-none mb-2">{selectedProduct.name}</SheetTitle>
                         <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Product ID: {selectedProduct.code}</SheetDescription>
                      </div>
                   </div>
                </SheetHeader>
                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                   <div className="px-10 bg-white border-b border-slate-100 shrink-0">
                      <TabsList className="h-14 bg-transparent p-0 gap-8">
                         {['overview', 'engineering', 'manufacturing', 'commercial', 'market', 'analytics'].map(tab => (
                           <TabsTrigger key={tab} value={tab} className="h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 font-bold text-[10px] uppercase tracking-widest">{tab}</TabsTrigger>
                         ))}
                      </TabsList>
                   </div>
                   <ScrollArea className="flex-1 p-10">
                      <TabsContent value="overview" className="m-0 space-y-8">
                         <div className="grid grid-cols-2 gap-6">
                            <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl">
                               <Label className="text-[9px] font-bold uppercase text-slate-400">Business Unit</Label>
                               <p className="text-sm font-bold text-slate-800 uppercase mt-1">{selectedProduct.businessUnit}</p>
                            </Card>
                            <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl">
                               <Label className="text-[9px] font-bold uppercase text-slate-400">Product Type</Label>
                               <p className="text-sm font-bold text-slate-800 uppercase mt-1">{selectedProduct.type}</p>
                            </Card>
                         </div>
                         <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-l-4 border-primary pl-4">Description Matrix</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedProduct.description}</p>
                         </Card>
                      </TabsContent>
                      <TabsContent value="engineering" className="m-0 space-y-8">
                         <div className="grid grid-cols-2 gap-6">
                            {[
                               { l: 'Drawing Number', v: selectedProduct.drawingNumber },
                               { l: 'Revision', v: selectedProduct.revisionNumber },
                               { l: 'Material', v: selectedProduct.material },
                               { l: 'Tolerance', v: selectedProduct.tolerance },
                            ].map(item => (
                              <div key={item.l} className="p-4 bg-white border border-slate-100 rounded-xl">
                                 <Label className="text-[8px] font-bold uppercase text-slate-400">{item.l}</Label>
                                 <p className="text-xs font-bold text-slate-800 mt-1 uppercase">{item.v || '---'}</p>
                              </div>
                            ))}
                         </div>
                      </TabsContent>
                   </ScrollArea>
                </Tabs>
              </>
            )}
         </SheetContent>
      </Sheet>

      {/* PRODUCT WIZARD DIALOG */}
      <Dialog open={isProductWizardOpen} onOpenChange={setIsProductWizardOpen}>
         <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col font-body">
            <div className="p-8 bg-[#001F3D] text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                  {(() => {
                    const CurrentIcon = ONBOARDING_STEPS[wizardStep - 1].icon;
                    return (
                      <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
                        <CurrentIcon className="h-7 w-7 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                     <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{ONBOARDING_STEPS[wizardStep - 1].label}</h3>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Product Onboarding Protocol Step {wizardStep}/10</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  {ONBOARDING_STEPS.map(s => (
                    <div key={s.id} className={cn("h-1.5 w-6 rounded-full transition-all duration-500", wizardStep === s.id ? "bg-primary w-12" : wizardStep > s.id ? "bg-emerald-500" : "bg-white/10")} />
                  ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
               <div className="max-w-3xl mx-auto">
                  {wizardStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-l-4 border-primary pl-4">Institutional Node</h4>
                       <RadioGroup value={newProduct.businessUnit} onValueChange={(v: any) => setNewProduct({...newProduct, businessUnit: v})} className="grid grid-cols-2 gap-6">
                          <Label className={cn("p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4", newProduct.businessUnit === 'Manufacturing' ? "bg-white border-primary shadow-xl" : "bg-white/50 border-slate-100 opacity-60")}>
                             <RadioGroupItem value="Manufacturing" className="sr-only" />
                             <Factory className="h-10 w-10 text-primary" />
                             <span className="text-xs font-bold uppercase">Ferocious Technologies</span>
                          </Label>
                          <Label className={cn("p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4", newProduct.businessUnit === 'Electricals' ? "bg-white border-primary shadow-xl" : "bg-white/50 border-slate-100 opacity-60")}>
                             <RadioGroupItem value="Electricals" className="sr-only" />
                             <Zap className="h-10 w-10 text-amber-500" />
                             <span className="text-xs font-bold uppercase">Ferocious Electricals</span>
                          </Label>
                       </RadioGroup>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-l-4 border-primary pl-4">Product Identity</h4>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Product Name *</Label><Input className="h-12 bg-white" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} /></div>
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Product Code *</Label><Input className="h-12 bg-white font-code" value={newProduct.code} onChange={(e)=>setNewProduct({...newProduct, code: e.target.value})} /></div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-bold uppercase">Classification</Label>
                             <Select value={newProduct.type} onValueChange={(v: any) => setNewProduct({...newProduct, type: v})}>
                                <SelectTrigger className="h-12 bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                   {["Raw Material", "Semi Finished", "Finished Product", "Assembly", "Service"].map(t => <SelectItem key={t} value={t} className="text-xs font-bold uppercase">{t}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">HSN/SAC</Label><Input className="h-12 bg-white" value={newProduct.hsn} onChange={(e)=>setNewProduct({...newProduct, hsn: e.target.value})} /></div>
                       </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-l-4 border-primary pl-4">Engineering Blueprint</h4>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Material Node</Label><Input className="h-12 bg-white" value={newProduct.material} onChange={(e)=>setNewProduct({...newProduct, material: e.target.value})} /></div>
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Material Grade</Label><Input className="h-12 bg-white" value={newProduct.materialGrade} onChange={(e)=>setNewProduct({...newProduct, materialGrade: e.target.value})} /></div>
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Drawing Number</Label><Input className="h-12 bg-white font-code" value={newProduct.drawingNumber} onChange={(e)=>setNewProduct({...newProduct, drawingNumber: e.target.value})} /></div>
                          <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Tolerance Matrix</Label><Input className="h-12 bg-white" value={newProduct.tolerance} onChange={(e)=>setNewProduct({...newProduct, tolerance: e.target.value})} /></div>
                       </div>
                       {newProduct.businessUnit === 'Electricals' && (
                         <div className="p-8 bg-amber-50/50 border border-amber-100 rounded-3xl space-y-6 mt-10">
                            <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Electrical Protocol Parameters</h5>
                            <div className="grid grid-cols-3 gap-4">
                               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase">Voltage (V)</Label><Input className="h-10 bg-white" /></div>
                               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase">Current (A)</Label><Input className="h-10 bg-white" /></div>
                               <div className="space-y-2"><Label className="text-[8px] font-bold uppercase">Power (W)</Label><Input className="h-10 bg-white" /></div>
                            </div>
                         </div>
                       )}
                    </div>
                  )}

                  {/* ADDITIONAL STEPS PLACEHOLDERS */}
                  {wizardStep > 3 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                       <ONBOARDING_STEPS[wizardStep-1].icon className="h-16 w-16 mb-4" />
                       <p className="text-sm font-bold uppercase tracking-widest">{ONBOARDING_STEPS[wizardStep-1].label} Matrix Construction...</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-8 border-t bg-white flex justify-between items-center shrink-0">
               <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400" onClick={() => wizardStep === 1 ? setIsProductWizardOpen(false) : setWizardStep(s => s - 1)}>
                  {wizardStep === 1 ? 'Abort' : 'Previous Step'}
               </Button>
               <div className="flex gap-4">
                  {wizardStep === 10 ? (
                    <Button className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-16 font-bold uppercase tracking-widest text-[11px] shadow-xl" onClick={handleSaveProduct}>Commit to Registry</Button>
                  ) : (
                    <Button className="h-14 bg-[#001F3D] hover:bg-black text-white rounded-2xl px-16 font-bold uppercase tracking-widest text-[11px] shadow-xl flex gap-3 group" onClick={() => setWizardStep(s => s + 1)}>
                      Next Step <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-700">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <div className="space-y-8">
          {activeTab === 'intelligence' ? <ProductIntelligenceView /> : 
           activeTab === 'product-master' ? <ProductIntelligenceView /> : 
           (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 px-2">
                 <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary" />
                    <Input placeholder="Search Document Ledger..." className="h-12 pl-12 rounded-2xl bg-white border-none shadow-sm text-xs font-bold uppercase" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                 </div>
                 <Button className="h-12 bg-[#001F3D] text-white rounded-2xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-lg flex gap-3" onClick={() => handleOpenForm(activeTab)}>
                    <Plus className="h-4 w-4" /> NEW {activeTab.toUpperCase()}
                 </Button>
              </div>

              <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Document Node</TableHead>
                      <TableHead className="font-bold text-[9px] uppercase text-slate-400">Identity Account</TableHead>
                      <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Grand Total</TableHead>
                      <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">State</TableHead>
                      <TableHead className="text-right px-10 font-bold text-[9px] uppercase text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{filteredRecords.map(r => (
                    <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="h-20 hover:bg-slate-50 transition-all cursor-pointer group">
                      <TableCell className="px-10"><div className="flex flex-col"><span className="text-xs font-bold text-primary font-code">{r.number}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{r.date}</span></div></TableCell>
                      <TableCell><span className="text-sm font-bold text-[#001F3D] uppercase tracking-tight">{r.customerName}</span></TableCell>
                      <TableCell className="text-right font-display font-black text-sm px-6">₹ {r.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className="text-[8px] font-bold uppercase px-3 py-1 rounded-full border-slate-100">{r.status}</Badge></TableCell>
                      <TableCell className="text-right px-10"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
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
