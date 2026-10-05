
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
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, ProductMaster, Machine, InventoryItem, BillingLineItem } from '@/lib/types';
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

const WIZARD_STEPS = [
  { id: 1, l: 'Business Unit', d: 'Identify Entity', icon: Building2 },
  { id: 2, l: 'Product Type', d: 'Classify Output', icon: Box },
  { id: 3, l: 'Basic Info', d: 'Name & Identity', icon: Info },
  { id: 4, l: 'Engineering', d: 'Technical Specs', icon: Ruler },
  { id: 5, l: 'Manufacturing', d: 'Process Timing', icon: Factory },
  { id: 6, l: 'Commercial', d: 'Cost & Price', icon: DollarSign },
  { id: 7, l: 'Strategy', d: 'In-House/Outsource', icon: Target },
  { id: 8, l: 'Partners', d: 'Vendor Linkage', icon: Truck },
  { id: 9, l: 'BOM', d: 'Bill of Materials', icon: Layers },
  { id: 10, l: 'Final Review', d: 'Commit to Matrix', icon: ShieldCheck },
];

const ONBOARDING_STEPS = [
  { id: 1, label: 'Business Unit', icon: Building2 },
  { id: 2, label: 'Product Info', icon: Box },
  { id: 3, label: 'Engineering', icon: Ruler },
  { id: 4, label: 'Manufacturing', icon: Factory },
  { id: 5, label: 'Commercial', icon: DollarSign },
  { id: 6, label: 'Market', icon: TrendingUp },
  { id: 7, label: 'Outsourcing', icon: Target },
  { id: 8, label: 'Partners', icon: Truck },
  { id: 9, label: 'BOM', icon: Layers },
  { id: 10, label: 'Review', icon: ShieldCheck },
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
  currentUser: string | null;
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
  currentUser,
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
      const generatedNo = `QT-${(records.length + 1001).toString()}`;
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: generatedNo, status: 'Draft', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, roundOff: 0, notes: '', terms: '', quotationId: '',
        placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
        revCharge: 'No', isRoundOffActive: false, fy: format(new Date(), 'yyyy-yy')
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSaveProduct = () => {
    toast({ title: "Product Node Committed", description: `${newProduct.name} identity matrix synchronized.` });
    setIsProductWizardOpen(false);
  };

  const FullPageEditor = () => {
    const handleUpdateItem = (idx: number, field: keyof BillingLineItem, value: any) => {
      const newItems = [...(formData.items || [])];
      newItems[idx] = { ...newItems[idx], [field]: value };
      const item = newItems[idx];
      const baseTotal = item.qty * item.price;
      const discount = item.discountType === 'percentage' ? (baseTotal * item.discount / 100) : item.discount;
      item.total = baseTotal - discount;
      const subTotal = newItems.reduce((acc, i) => acc + i.total, 0);
      setFormData({ ...formData, items: newItems, subTotal, amount: subTotal });
    };

    const addRow = (type: 'product' | 'service' | 'assembly' | 'raw_material') => {
      const nextId = (formData.items?.length || 0) + 1;
      const newItem: BillingLineItem = { id: nextId.toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 };
      setFormData({ ...formData, items: [...(formData.items || []), newItem] });
    };

    const totals = useMemo(() => {
      const items = formData.items || [];
      const subTotal = items.reduce((acc, i) => acc + i.total, 0);
      const taxTotal = items.reduce((acc, i) => acc + (i.total * i.gstRate / 100), 0);
      const grandTotal = subTotal + taxTotal;
      return { subTotal, taxTotal, grandTotal };
    }, [formData.items]);

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="text-slate-400 hover:text-slate-900 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
               <h2 className="text-xl font-display font-bold text-slate-900 uppercase leading-none">Quotation Entry</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Professional GST Billing Matrix</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Back</Button>
             <Button className="bg-[#001F3D] hover:bg-black text-white h-10 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-2">
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto w-full p-6 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-7 p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-8">
                 <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">Customer Information</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-slate-500">Customer Name *</Label>
                       <Select value={formData.customerId} onValueChange={(id) => {
                          const c = customers.find(x => x.id === id);
                          setFormData({ ...formData, customerId: id, customerName: c?.name || '', gstNumber: c?.gstNumber || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', shipTo: c?.address || '', placeOfSupply: c?.city || '' });
                       }}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs shadow-inner"><SelectValue placeholder="Select Customer..." /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                             {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase py-3">{c.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">GSTIN</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.gstNumber} readOnly /></div>
                    <div className="space-y-2 md:col-span-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Billing Address</Label><Textarea className="min-h-[80px] bg-slate-50 border-none rounded-xl text-xs font-medium" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Contact Person</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.contactPerson} readOnly /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Phone Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-code" value={formData.phoneNo} readOnly /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Place of Supply</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.placeOfSupply} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} /></div>
                 </div>
              </Card>

              <Card className="lg:col-span-5 p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-8">
                 <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">Quotation Details</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Quotation Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Quotation Date</Label><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-12" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Reference Number</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.referenceNumber} onChange={(e)=>setFormData({...formData, referenceNumber: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Valid Until</Label><DatePicker value={formData.challanDate} onChange={(val)=>setFormData({...formData, challanDate: val})} className="h-12" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Sales Executive</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={currentUser || ''} disabled /></div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-slate-500">Status</Label>
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
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">Product Items</h3>
                 <div className="flex items-center gap-3">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button className="h-10 px-6 gap-2 bg-[#001F3D] text-white rounded-xl font-bold uppercase text-[9px] shadow-xl">
                             <PlusCircle className="h-3.5 w-3.5" /> Action Center <ChevronDown className="h-3 w-3" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-64 rounded-xl p-1 shadow-2xl">
                          <DropdownMenuLabel className="text-[8px] font-black uppercase text-slate-400 px-4 py-2">Line Item Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => addRow('product')} className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><PlusCircle className="h-4 w-4 text-blue-600" /> Add Single Product</DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><LayoutGrid className="h-4 w-4 text-blue-600" /> Add Multiple Products</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addRow('service')} className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><Settings className="h-4 w-4 text-primary" /> Add Service Node</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addRow('assembly')} className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><Box className="h-4 w-4 text-indigo-600" /> Add Assembly</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addRow('raw_material')} className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><Layers className="h-4 w-4 text-amber-600" /> Add Raw Material</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[8px] font-black uppercase text-slate-400 px-4 py-2">Commercial Charges</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><Truck className="h-4 w-4 text-slate-400" /> Add Freight</DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><Package className="h-4 w-4 text-slate-400" /> Add Packing</DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
              <Table>
                 <TableHeader className="bg-slate-50/80">
                    <TableRow>
                       <TableHead className="px-6 py-5 text-[9px] font-black uppercase w-16">Sr No</TableHead>
                       <TableHead className="text-[9px] font-black uppercase">Product / Service</TableHead>
                       <TableHead className="text-[9px] font-black uppercase w-32">HSN/SAC</TableHead>
                       <TableHead className="text-[9px] font-black uppercase text-center w-24">Qty</TableHead>
                       <TableHead className="text-[9px] font-black uppercase text-center w-24">UOM</TableHead>
                       <TableHead className="text-right text-[9px] font-black uppercase w-32">Rate (₹)</TableHead>
                       <TableHead className="text-right text-[9px] font-black uppercase w-24">Discount</TableHead>
                       <TableHead className="text-right text-[9px] font-black uppercase w-24">GST %</TableHead>
                       <TableHead className="text-right px-10 text-[9px] font-black uppercase w-40">Total</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {(formData.items || []).map((item, idx) => (
                      <TableRow key={item.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                         <TableCell className="px-6 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</TableCell>
                         <TableCell>
                            <Select value={item.productId} onValueChange={(pId) => {
                               const p = products.find(x => x.id === pId);
                               const newItems = [...(formData.items || [])];
                               newItems[idx] = { 
                                  ...newItems[idx], 
                                  productId: pId, 
                                  description: p?.name || '', 
                                  hsn: p?.hsn || '', 
                                  price: p?.saleRate || 0, 
                                  unit: p?.uom || 'Nos',
                                  gstRate: p?.gstRate || 18,
                                  total: (newItems[idx].qty || 1) * (p?.saleRate || 0) 
                               };
                               setFormData({ ...formData, items: newItems });
                            }}>
                               <SelectTrigger className="border-none bg-transparent h-10 font-bold uppercase text-xs focus:ring-0 shadow-none"><SelectValue placeholder="Identify Item..." /></SelectTrigger>
                               <SelectContent className="rounded-xl shadow-2xl">
                                  {products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-3">{p.name}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </TableCell>
                         <TableCell><Input className="border-none bg-transparent font-code text-xs" value={item.hsn} readOnly /></TableCell>
                         <TableCell><Input type="number" className="border-none bg-transparent text-center font-bold text-xs" value={item.qty} onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))} /></TableCell>
                         <TableCell><Input className="border-none bg-transparent text-center text-xs font-bold text-slate-500" value={item.unit} readOnly /></TableCell>
                         <TableCell><Input type="number" className="border-none bg-transparent text-right font-display font-bold text-xs" value={item.price} onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))} /></TableCell>
                         <TableCell><Input type="number" className="border-none bg-transparent text-right font-bold text-xs" value={item.discount} onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))} /></TableCell>
                         <TableCell><Input type="number" className="border-none bg-transparent text-right font-bold text-xs" value={item.gstRate} onChange={(e) => handleUpdateItem(idx, 'gstRate', Number(e.target.value))} /></TableCell>
                         <TableCell className="text-right px-10 font-display font-black text-slate-900 text-sm">₹ {item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </Card>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                 <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-l-4 border-blue-600 pl-4">Terms & Conditions</h4>
                    <Textarea className="min-h-[100px] bg-slate-50 border-none rounded-xl text-[10px] font-medium leading-relaxed" defaultValue="1. Validity: 30 Days. 2. Payment: Immediate. 3. Delivery: Ex-Works." />
                 </Card>
              </div>

              <Card className="lg:col-span-4 p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-3xl space-y-8 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
                 <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] relative z-10">Quotation Summary</h4>
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase"><span>Taxable Amount</span><span>₹ {totals.subTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase"><span>IGST Matrix</span><span>₹ {totals.taxTotal.toLocaleString()}</span></div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-black uppercase tracking-widest text-primary leading-none mb-1">Grand Total</span>
                       <span className="text-5xl font-display font-black tracking-tighter">₹ {totals.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="pt-8 space-y-2">
                       <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Amount In Words</p>
                       <p className="text-[10px] font-black uppercase text-primary leading-tight">{numberToWords(totals.grandTotal)}</p>
                    </div>
                 </div>
                 <div className="pt-10 relative z-10">
                    <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-600/20">
                       <Send className="h-4 w-4 mr-3" /> Finalize Quotation
                    </Button>
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
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-slate-100 p-1.5 rounded-full h-14 inline-flex border border-slate-200 shadow-sm gap-2">
                <TabsTrigger value="quotation" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Quotation Ledger</TabsTrigger>
                <TabsTrigger value="product-master" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white">Product Intelligence</TabsTrigger>
              </TabsList>
              <div className="flex gap-4">
                {activeTab === 'quotation' ? (
                  <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => handleOpenForm('quotation')}>
                    <Plus className="h-4 w-4" /> Create Quotation
                  </Button>
                ) : (
                  <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => { setWizardStep(1); setIsProductWizardOpen(true); }}>
                    <Plus className="h-4 w-4" /> Initialize Product Node
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="quotation" className="m-0 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                 {[
                   { label: 'Total Quotes', val: records.filter(r => r.type === 'quotation').length, color: 'text-blue-600' },
                   { label: 'Pending', val: records.filter(r => r.type === 'quotation' && r.status === 'Draft').length, color: 'text-amber-500' },
                   { label: 'Approved', val: records.filter(r => r.type === 'quotation' && r.status === 'Approved').length, color: 'text-emerald-500' },
                   { label: 'Value', val: `₹ ${(records.filter(r => r.type === 'quotation').reduce((acc, r) => acc + (r.amount || 0), 0) / 100000).toFixed(1)}L`, color: 'text-slate-900' },
                   { label: 'Conversion', val: '68%', color: 'text-primary' },
                   { label: 'Expired', val: '0', color: 'text-slate-400' },
                 ].map(k => (
                   <Card key={k.label} className="p-4 bg-white border-slate-100 flex flex-col justify-center gap-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
                      <p className={cn("text-xl font-display font-black", k.color)}>{k.val}</p>
                   </Card>
                 ))}
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search Quotation Number, Customer Name or GSTIN..." className="pl-12 h-14 bg-white border-slate-200 rounded-2xl font-bold uppercase text-[10px]" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
              </div>

              <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Quotation No.</TableHead>
                      <TableHead className="font-bold text-[9px] uppercase text-slate-400">Customer</TableHead>
                      <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Value (₹)</TableHead>
                      <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">State</TableHead>
                      <TableHead className="text-right px-10 font-bold text-[9px] uppercase text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{records.filter(r => r.type === 'quotation').map(r => (
                    <TableRow key={r.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => handleOpenForm('quotation', r)}>
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
               <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow><TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Identity</TableHead><TableHead className="font-bold text-[9px] uppercase text-slate-400">Classification</TableHead><TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Sale Rate</TableHead><TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">State</TableHead><TableHead className="text-right px-10"></TableHead></TableRow>
                    </TableHeader>
                    <TableBody>{products.map(p => (
                      <TableRow key={p.id} className="h-20 border-b border-slate-50">
                        <TableCell className="px-10"><div className="flex flex-col"><span className="text-sm font-bold text-[#001F3D] uppercase">{p.name}</span><span className="text-[9px] text-slate-400 font-code mt-1">{p.code}</span></div></TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] font-bold uppercase">{p.type}</Badge></TableCell>
                        <TableCell className="text-right font-display font-bold text-sm">₹ {p.saleRate.toLocaleString()}</TableCell>
                        <TableCell className="text-center"><Badge className="bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase px-3 py-1 rounded-full">{p.status}</Badge></TableCell>
                        <TableCell className="text-right px-10"><ChevronRight className="h-4 w-4 text-slate-200" /></TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* PRODUCT ONBOARDING WIZARD */}
      <Dialog open={isProductWizardOpen} onOpenChange={setIsProductWizardOpen}>
        <DialogContent className="max-w-5xl h-[90vh] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-slate-900 p-10 border-r border-slate-800 flex flex-col justify-between shrink-0">
              <div className="space-y-12">
                <div className="p-4 bg-primary rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-8">
                  {ONBOARDING_STEPS.map((stepNode) => {
                    const StepIcon = stepNode.icon;
                    return (
                      <div key={stepNode.id} className="flex items-center gap-6 group cursor-pointer" onClick={() => setWizardStep(stepNode.id)}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500",
                          wizardStep === stepNode.id ? "bg-white border-white text-slate-900 scale-125" : 
                          wizardStep > stepNode.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                        )}>
                          {wizardStep > stepNode.id ? <Check className="h-4 w-4" /> : stepNode.id}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", wizardStep === stepNode.id ? "text-white" : "text-slate-500")}>
                            {stepNode.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.4em]">PROD_WIZARD_v2.4</p>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <header className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  {(() => {
                    const currentStepConfig = ONBOARDING_STEPS[wizardStep - 1];
                    const StepIcon = currentStepConfig.icon;
                    return (
                      <div className="p-4 bg-slate-50 rounded-2xl text-[#001F3D]">
                        <StepIcon className="h-8 w-8" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{ONBOARDING_STEPS[wizardStep - 1].label}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Step {wizardStep} of 10 • Identity Matrix Initialization</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsProductWizardOpen(false)} className="rounded-full text-slate-300 hover:text-red-500"><X className="h-6 w-6" /></Button>
              </header>

              <ScrollArea className="flex-1 p-12">
                <div className="max-w-3xl mx-auto space-y-12">
                   {/* DYNAMIC FORM RENDERING BASED ON STEP */}
                   {wizardStep === 1 && (
                     <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                           <h4 className="text-xs font-black uppercase text-[#001F3D] tracking-widest">Business Unit Identification</h4>
                        </div>
                        <RadioGroup value={newProduct.businessUnit} onValueChange={(v: any) => setNewProduct({...newProduct, businessUnit: v})} className="grid grid-cols-2 gap-6">
                           {['Ferocious Technologies', 'Ferocious Electricals'].map(bu => (
                             <Label key={bu} className={cn("p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col items-center gap-4 text-center", newProduct.businessUnit === bu ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-white")}>
                                <RadioGroupItem value={bu} className="sr-only" />
                                <Building2 className="h-8 w-8 mb-2" />
                                <span className="text-xs font-black uppercase">{bu}</span>
                             </Label>
                           ))}
                        </RadioGroup>
                     </div>
                   )}
                   
                   {wizardStep > 1 && (
                     <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center animate-in zoom-in-95 duration-500">
                        {(() => {
                          const currentStepConfig = ONBOARDING_STEPS[wizardStep - 1];
                          const StepIcon = currentStepConfig.icon;
                          return <StepIcon className="h-16 w-16 mb-4" />;
                        })()}
                        <p className="text-sm font-bold uppercase tracking-widest">{ONBOARDING_STEPS[wizardStep - 1].label} Matrix Construction...</p>
                     </div>
                   )}
                </div>
              </ScrollArea>

              <footer className="p-8 border-t border-slate-100 flex justify-between bg-white shrink-0">
                 <Button variant="ghost" disabled={wizardStep === 1} className="rounded-xl h-12 px-8 font-bold uppercase text-[10px]" onClick={() => setWizardStep(s => Math.max(1, s-1))}>Back</Button>
                 <div className="flex gap-4">
                    <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] text-slate-400" onClick={() => setIsProductWizardOpen(false)}>Abort</Button>
                    <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-xl px-12 font-bold uppercase text-[10px] shadow-xl flex gap-3 group" onClick={() => wizardStep === 10 ? handleSaveProduct() : setWizardStep(s => s+1)}>
                       {wizardStep === 10 ? 'Commit to Registry' : 'Next Step'} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                 </div>
              </footer>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
