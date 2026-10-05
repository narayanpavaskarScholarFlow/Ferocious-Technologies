
"use client";

import { useState, useMemo, useCallback } from 'react';
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
  Palette,
  Ruler,
  Maximize2,
  Factory,
  MoreHorizontal
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, ProductMaster, Machine, InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ONBOARDING_STEPS = [
  { id: 1, label: 'Business Information', desc: 'Ferocious Entity Selection', icon: Building2 },
  { id: 2, label: 'Basic Product Information', desc: 'Identity & Classification', icon: Box },
  { id: 3, label: 'Engineering Details', desc: 'Metallurgy & Blueprints', icon: Ruler },
  { id: 4, label: 'Manufacturing & Process', desc: 'Resource Node Allocation', icon: Factory },
  { id: 5, label: 'Commercial Information', desc: 'Cost Centers & Margins', icon: DollarSign },
  { id: 6, label: 'Market Intelligence', desc: 'Demand & Competition', icon: Target },
  { id: 7, label: 'In-House vs Outsourcing', desc: 'Production Strategy', icon: TrendingUp },
  { id: 8, label: 'Vendor & Supply Chain', desc: 'Partner Matrix Registry', icon: Truck },
  { id: 9, label: 'BOM & Assembly', desc: 'Structural Composition', icon: Layers },
  { id: 10, label: 'Review & Save', desc: 'Final Verification', icon: ShieldCheck },
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
  onSaveRecord, onDeleteRecord, uiSettings, initialTab = 'quotation' 
}: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isProductWizardOpen, setIsProductWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'quotation', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Draft', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, fy: format(new Date(), 'yyyy-yy')
  });

  const [newProduct, setNewProduct] = useState<Partial<ProductMaster>>({
    id: '', code: '', name: '', businessUnit: 'Manufacturing', type: 'Finished Product', status: 'Active',
    hsn: '', gstRate: 18, uom: 'Nos', saleRate: 0, purchaseRate: 0, machinesRequired: [], cycleTimeSec: 0,
    setupTimeMin: 0, inspectionTimeMin: 0, assemblyTimeMin: 0, material: '', materialGrade: '', weight: '',
    surfaceFinish: '', tolerance: '', application: '', industry: '', processRoute: '', drawingNumber: '',
    revisionNumber: '', customerPartNumber: '', internalPartNumber: '', standardCost: 0, currentCost: 0,
    sellingPrice: 0, marketPrice: 0, marginPercent: 0, annualRequirement: 0, potentialAnnualRequirement: 0,
    inHousePercent: 100, outsourcedPercent: 0, bom: [], category: 'General'
  });

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `QT-${Math.floor(1000 + Math.random() * 9000)}`, status: 'Draft', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, roundOff: 0, notes: '', terms: '', quotationId: '',
        placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
        revCharge: 'No', isRoundOffActive: false, fy: format(new Date(), 'yyyy-yy')
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSaveProduct = () => {
    toast({ title: "Product Synchronized", description: `${newProduct.name} identity committed to ledger.` });
    setIsProductWizardOpen(false);
  };

  const FullPageEditor = () => {
    const activeCustomer = customers.find(c => c.id === formData.customerId);
    
    return (
      <div className="flex flex-col bg-[#F8FAFC] min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-display font-bold uppercase">Quotation Entry Hub</h2>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-10 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Back</Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl">
               <Save className="h-4 w-4 mr-2" /> Save & Print Matrix
             </Button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto w-full p-6 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-8">
                 <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                    <h3 className="text-xs font-black uppercase text-slate-400">Customer Identity</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-slate-400">Identify Account</Label>
                       <Select value={formData.customerId} onValueChange={(id) => {
                          const c = customers.find(x => x.id === id);
                          setFormData({ ...formData, customerId: id, customerName: c?.name || '', gstNumber: c?.gstNumber || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', shipTo: c?.address || '' });
                       }}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs shadow-inner"><SelectValue placeholder="Identify Customer..." /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                             {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase py-3">{c.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    {activeCustomer && (
                       <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                          <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">GSTIN Protocol</p><p className="text-xs font-bold font-code">{activeCustomer.gstNumber}</p></div>
                          <div className="space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Contact Node</p><p className="text-xs font-bold">{activeCustomer.contactPerson}</p></div>
                          <div className="col-span-2 space-y-1"><p className="text-[8px] font-bold text-slate-400 uppercase">Address Matrix</p><p className="text-xs font-medium text-slate-600 leading-relaxed">{activeCustomer.address}</p></div>
                       </div>
                    )}
                 </div>
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-8">
                 <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                    <h3 className="text-xs font-black uppercase text-slate-400">Document Metadata</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Quotation Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Fiscal Period</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.fy} disabled /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Quotation Date</Label><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-12" /></div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase">Status Node</Label>
                       <Select value={formData.status} onValueChange={(v)=>setFormData({...formData, status: v})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                             {['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'].map(s => <SelectItem key={s} value={s} className="text-xs font-bold uppercase">{s}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </Card>
           </div>

           <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="text-xs font-black uppercase text-slate-400">Line Item Matrix</h3>
                 <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase gap-2 text-primary">
                    <TableProperties className="h-3.5 w-3.5" /> Matrix Options
                 </Button>
              </div>
              <Table>
                 <TableHeader className="bg-slate-50/50">
                    <TableRow>
                       <TableHead className="px-6 py-5 text-[9px] font-black uppercase">Product / Service</TableHead>
                       <TableHead className="text-[9px] font-black uppercase w-32">HSN/SAC</TableHead>
                       <TableHead className="text-[9px] font-black uppercase text-center w-24">Qty</TableHead>
                       <TableHead className="text-right text-[9px] font-black uppercase w-32">Rate (₹)</TableHead>
                       <TableHead className="text-right text-[9px] font-black uppercase w-32">GST (%)</TableHead>
                       <TableHead className="text-right px-10 text-[9px] font-black uppercase w-40">Total Matrix Value</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {(formData.items || []).map((item, idx) => (
                      <TableRow key={item.id} className="h-20 hover:bg-slate-50 transition-colors">
                         <TableCell className="px-6">
                            <Select value={item.productId} onValueChange={(pId) => {
                               const p = products.find(x => x.id === pId);
                               const newItems = [...(formData.items || [])];
                               newItems[idx] = { ...newItems[idx], productId: pId, description: p?.name || '', hsn: p?.hsn || '', price: p?.saleRate || 0, total: (newItems[idx].qty || 1) * (p?.saleRate || 0) };
                               setFormData({ ...formData, items: newItems, amount: newItems.reduce((acc, i) => acc + i.total, 0) });
                            }}>
                               <SelectTrigger className="border-none bg-transparent h-10 font-bold uppercase text-xs focus:ring-0 shadow-none"><SelectValue placeholder="Identify Item..." /></SelectTrigger>
                               <SelectContent className="rounded-xl shadow-2xl">
                                  {products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-3">{p.name}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </TableCell>
                         <TableCell><Input className="border-none bg-transparent font-code text-xs" value={item.hsn} readOnly /></TableCell>
                         <TableCell><Input type="number" className="border-none bg-transparent text-center font-bold" value={item.qty} onChange={(e) => {
                            const newItems = [...(formData.items || [])];
                            newItems[idx].qty = Number(e.target.value);
                            newItems[idx].total = Number(e.target.value) * newItems[idx].price;
                            setFormData({ ...formData, items: newItems, amount: newItems.reduce((acc, i) => acc + i.total, 0) });
                         }} /></TableCell>
                         <TableCell className="text-right font-display font-bold">₹ {item.price.toLocaleString()}</TableCell>
                         <TableCell className="text-right font-bold text-slate-500">{item.gstRate}%</TableCell>
                         <TableCell className="text-right px-10 font-display font-black text-primary text-sm">₹ {item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-6">
                 <h4 className="text-[10px] font-black uppercase text-slate-400">Institutional Remarks</h4>
                 <Textarea className="min-h-[120px] bg-slate-50 border-none rounded-2xl text-[11px] font-medium" defaultValue="1. Prices valid for 30 cycles. 2. Subject to Pune jurisdiction nodes. 3. Standard taxes applicable." />
              </Card>
              <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-3xl space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase"><span>Sub Total Matrix</span><span>₹ {formData.amount?.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase"><span>Taxable Value</span><span>₹ {formData.amount?.toLocaleString()}</span></div>
                    <div className="h-px bg-white/10" />
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-black uppercase tracking-widest text-primary">Grand Total</span>
                       <span className="text-4xl font-display font-black">₹ {formData.amount?.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 space-y-1">
                       <p className="text-[8px] font-black uppercase text-white/20">Amount In Words</p>
                       <p className="text-[10px] font-black uppercase text-primary">{numberToWords(formData.amount || 0)}</p>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full space-y-8 animate-in fade-in duration-700">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
              <TabsTrigger value="quotation" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Quotation Ledger</TabsTrigger>
              <TabsTrigger value="product-master" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Product Intelligence</TabsTrigger>
            </TabsList>

            <TabsContent value="quotation" className="m-0 space-y-8">
              <div className="flex justify-between items-center px-2">
                 <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search Quotations..." className="pl-10 h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-[10px]" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                 </div>
                 <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => handleOpenForm('quotation')}>
                    <Plus className="h-4 w-4" /> Create Quotation Protocol
                 </Button>
              </div>
              <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Quotation No.</TableHead>
                      <TableHead className="font-bold text-[9px] uppercase text-slate-400">Customer Account</TableHead>
                      <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Quoted Value</TableHead>
                      <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">Status Node</TableHead>
                      <TableHead className="text-right px-10 font-bold text-[9px] uppercase text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{records.filter(r => r.type === 'quotation').map(r => (
                    <TableRow key={r.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group">
                      <TableCell className="px-10 font-bold text-xs text-primary font-code">{r.number}</TableCell>
                      <TableCell><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{r.customerName}</span></TableCell>
                      <TableCell className="text-right font-display font-black text-sm px-6">₹ {r.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className="text-[8px] font-bold uppercase px-3 py-1 rounded-full border-slate-100">{r.status}</Badge></TableCell>
                      <TableCell className="text-right px-10"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="product-master" className="m-0 space-y-8">
               <div className="flex justify-between items-center px-2">
                  <div className="relative w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search Products..." className="pl-10 h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-[10px]" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /></div>
                  <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => { setWizardStep(1); setIsProductWizardOpen(true); }}><Plus className="h-4 w-4" /> New Product Node</Button>
               </div>
               <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow><TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Identity</TableHead><TableHead className="font-bold text-[9px] uppercase text-slate-400">Type Node</TableHead><TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Selling Rate</TableHead><TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">State</TableHead><TableHead className="text-right px-10"></TableHead></TableRow>
                    </TableHeader>
                    <TableBody>{products.map(p => (
                      <TableRow key={p.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group">
                        <TableCell className="px-10"><div className="flex flex-col"><span className="text-sm font-bold text-[#001F3D] uppercase">{p.name}</span><span className="text-[9px] text-slate-400 font-code font-bold uppercase mt-1">{p.code}</span></div></TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase">{p.type}</Badge></TableCell>
                        <TableCell className="text-right font-display font-bold text-sm">₹ {p.saleRate.toLocaleString()}</TableCell>
                        <TableCell className="text-center"><Badge className="bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase px-3 py-1 rounded-full">{p.status}</Badge></TableCell>
                        <TableCell className="text-right px-10"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* PRODUCT WIZARD */}
      <Dialog open={isProductWizardOpen} onOpenChange={setIsProductWizardOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden flex flex-col">
           <div className="p-8 bg-[#001F3D] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 {(() => {
                    const stepConfig = ONBOARDING_STEPS[wizardStep - 1];
                    const StepIcon = stepConfig?.icon || Box;
                    return (
                      <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
                         <StepIcon className="h-7 w-7 text-white" />
                      </div>
                    );
                 })()}
                 <div>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{ONBOARDING_STEPS[wizardStep - 1]?.label}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Step {wizardStep.toString().padStart(2, '0')}/10</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 {ONBOARDING_STEPS.map(s => <div key={s.id} className={cn("h-1.5 w-6 rounded-full transition-all", wizardStep === s.id ? "bg-primary w-12" : wizardStep > s.id ? "bg-emerald-500" : "bg-white/10")} />)}
              </div>
           </div>
           <ScrollArea className="flex-1 p-10 bg-slate-50/50">
              {wizardStep > 2 ? (
                 <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                    {(() => {
                      const stepConfig = ONBOARDING_STEPS[wizardStep - 1];
                      const StepIcon = stepConfig?.icon || Info;
                      return <StepIcon className="h-16 w-16 mb-4" />;
                    })()}
                    <p className="text-sm font-bold uppercase tracking-widest">{ONBOARDING_STEPS[wizardStep-1]?.label} Node implementation ongoing...</p>
                 </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-10">
                   {wizardStep === 1 && (
                     <div className="space-y-8 animate-in slide-in-from-right-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-l-4 border-primary pl-4">Business Information Protocol</h4>
                        <RadioGroup value={newProduct.businessUnit} onValueChange={(v: any) => setNewProduct({...newProduct, businessUnit: v})} className="grid grid-cols-2 gap-6">
                           <Label className={cn("p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4", newProduct.businessUnit === 'Manufacturing' ? "bg-white border-primary shadow-xl" : "bg-white/50 border-slate-100 opacity-60")}>
                              <RadioGroupItem value="Manufacturing" className="sr-only" />
                              <Factory className="h-10 w-10 text-primary" />
                              <span className="text-xs font-bold uppercase">Technologies Node</span>
                           </Label>
                           <Label className={cn("p-8 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4", newProduct.businessUnit === 'Electricals' ? "bg-white border-primary shadow-xl" : "bg-white/50 border-slate-100 opacity-60")}>
                              <RadioGroupItem value="Electricals" className="sr-only" />
                              <Zap className="h-10 w-10 text-amber-500" />
                              <span className="text-xs font-bold uppercase">Electricals Node</span>
                           </Label>
                        </RadioGroup>
                     </div>
                   )}
                   {wizardStep === 2 && (
                     <div className="space-y-8 animate-in slide-in-from-right-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-l-4 border-primary pl-4">Basic Product Information</h4>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Product Name Identity</Label><Input className="h-12 bg-white" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} /></div>
                           <div className="space-y-2"><Label className="text-[9px] font-bold uppercase">Product Code ID</Label><Input className="h-12 bg-white font-code" value={newProduct.code} onChange={(e)=>setNewProduct({...newProduct, code: e.target.value})} /></div>
                        </div>
                     </div>
                   )}
                </div>
              )}
           </ScrollArea>
           <div className="p-8 border-t bg-white flex justify-between shrink-0">
              <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px]" onClick={() => setWizardStep(s => Math.max(1, s-1))}>Protocol Back</Button>
              <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-12 font-bold uppercase text-[10px]" onClick={() => wizardStep === 10 ? handleSaveProduct() : setWizardStep(s => s+1)}>
                {wizardStep === 10 ? 'Commit Protocol' : 'Execute Next Step'} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

