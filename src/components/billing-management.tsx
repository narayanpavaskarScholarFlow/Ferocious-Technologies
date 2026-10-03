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
  Boxes,
  Zap,
  RotateCcw
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
  subMonths
} from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const DOCUMENT_TYPES = [
  { id: 'quotation', label: 'Quotation', icon: FileBox, prefix: 'QT' },
  { id: 'purchase_order', label: 'Customer PO', icon: FileBadge, prefix: 'PO' },
  { id: 'sale_order', label: 'Sales Order', icon: FileText, prefix: 'SO' },
  { id: 'proforma', label: 'Proforma', icon: FileCheck, prefix: 'PFI' },
  { id: 'invoice', label: 'Sales Invoice', icon: FileText, prefix: 'INV' },
  { id: 'purchase_invoice', label: 'Purchase Invoice', icon: ShoppingCart, prefix: 'PI' },
  { id: 'delivery_challan', label: 'Delivery Challan', icon: Truck, prefix: 'DC' },
  { id: 'credit_note', label: 'Credit Note', icon: ArrowDownLeft, prefix: 'CN' },
  { id: 'debit_note', label: 'Debit Note', icon: ArrowUpRight, prefix: 'DN' },
  { id: 'inward_payment', label: 'Inward Payment', icon: ArrowDownLeft, prefix: 'REC' },
  { id: 'outward_payment', label: 'Outward Payment', icon: ArrowUpRight, prefix: 'PAY' },
];

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'product-master', label: 'Product Master', icon: PackageSearch },
  ...DOCUMENT_TYPES.map(t => ({ id: t.id, label: t.label, icon: t.icon })),
  { id: 'report', label: 'BI Analytics', icon: FileBarChart },
];

const PRODUCT_TYPES = [
  'Manufacturing Product',
  'Design Service',
  'Engineering Service',
  'Consulting Service'
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
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [activeRecordType, setActiveRecordType] = useState('invoice');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'invoice', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Pending', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: ''
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
    
    // STRICT DATA PROTOCOL: Use ONLY actual Sales Invoices for target achievement
    const monthInvoices = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const actualBillingAchieved = monthInvoices.reduce((sum, r) => sum + (r.amount || 0), 0);
    const achievementPercent = monthlyBillingTarget > 0 ? (actualBillingAchieved / monthlyBillingTarget) * 100 : 0;
    
    const monthInward = records.filter(r => r.type === 'inward_payment' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const totalCollected = monthInward.reduce((acc, r) => acc + (r.amount || 0), 0);
    const collectionAchievement = actualBillingAchieved > 0 ? (totalCollected / actualBillingAchieved) * 100 : 100;

    // Smart Health Score (weighted achievement)
    const healthScore = Math.round((achievementPercent * 0.4) + (collectionAchievement * 0.4) + (90 * 0.2));

    const daysInMonth = getDaysInMonth(targetDate);
    const today = new Date();
    const daysRemaining = isWithinInterval(today, { start: mStart, end: mEnd }) 
      ? daysInMonth - getDate(today) 
      : (isAfter(today, mEnd) ? 0 : daysInMonth);

    const remainingToTarget = Math.max(0, monthlyBillingTarget - actualBillingAchieved);
    const dailyVelocity = daysRemaining > 0 ? remainingToTarget / daysRemaining : 0;

    // PO Specific Metrics
    const poReceived = records.filter(r => r.type === 'purchase_order' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const poValue = poReceived.reduce((acc, r) => acc + r.amount, 0);

    return { 
      monthlyBillingTarget, 
      actualBillingAchieved, 
      achievementPercent, 
      healthScore, 
      remaining: remainingToTarget,
      collected: totalCollected,
      dailyVelocity,
      daysRemaining,
      poReceived: poReceived.length,
      poValue
    };
  }, [records, uiSettings.monthlyBillingTargets, selectedAnalyticsDate]);

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
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0, roundOff: 0, notes: '', terms: '', quotationId: ''
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleOpenProductForm = (product?: ProductMaster) => {
    if (product) {
      setProductFormData(product);
    } else {
      setProductFormData({
        id: `PROD-${Date.now()}`, code: `P-${Date.now().toString().slice(-4)}`, name: '', description: '', 
        hsn: '', gstRate: 18, uom: 'Nos', saleRate: 0, purchaseRate: 0, category: 'General', 
        type: 'Manufacturing Product', status: 'Active'
      });
    }
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productFormData.name || !productFormData.code) {
      toast({ variant: "destructive", title: "Validation Error", description: "Identity and Product Code are required." });
      return;
    }
    setDocumentNonBlocking(doc(db, 'products', productFormData.id!), { ...productFormData, updatedAt: new Date().toISOString() }, { merge: true });
    toast({ title: "Catalogue Updated", description: `${productFormData.name} synchronized with Master Registry.` });
    setIsProductFormOpen(false);
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) { 
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." }); 
      return; 
    }
    
    // Status Propagation for Quotation -> PO flow
    if (formData.type === 'purchase_order' && formData.quotationId) {
      updateDocumentNonBlocking(doc(db, 'billing', formData.quotationId), { status: 'Converted To PO' });
    }

    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} committed to master matrix.` });
    setIsRecordFormOpen(false);
  };

  const FullPageEditor = () => (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen animate-in fade-in duration-300 pb-20">
      <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Institutional Transaction Entry</span>
            <h2 className="text-lg font-display font-bold uppercase leading-none">{activeRecordType.replace('_', ' ')} Matrix</h2>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-10 px-6 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Discard</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-emerald-900/20" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Commit Node
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Customer PO Selection Node (Conditional) */}
          {activeRecordType === 'purchase_order' && (
            <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-6">
              <h4 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-4 tracking-widest">Link Customer Quotation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-slate-400">Select Source Quotation</Label>
                  <Select value={formData.quotationId} onValueChange={(qId) => {
                    const q = records.find(r => r.id === qId);
                    if (q) {
                      setFormData({ 
                        ...formData, 
                        quotationId: qId,
                        customerId: q.customerId,
                        customerName: q.customerName,
                        items: q.items,
                        terms: q.terms,
                        notes: q.notes,
                        amount: q.amount
                      });
                    }
                  }}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase">
                      <SelectValue placeholder="Identify source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {records.filter(r => r.type === 'quotation' && r.status !== 'Converted To PO').map(q => (
                        <SelectItem key={q.id} value={q.id} className="text-[10px] font-bold uppercase">{q.number} — {q.customerName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                   <div className="p-3 bg-primary/5 rounded-xl"><Info className="h-5 w-5 text-primary" /></div>
                   <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">Linking a quotation auto-populates all industrial item nodes and technical terms.</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-8 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02]"><Building2 className="h-16 w-16" /></div>
            <div className="relative z-10 space-y-8">
              <h4 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-4 tracking-widest">Customer Identity Node</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Account Identity</Label>
                  <Select value={formData.customerId} onValueChange={(id) => { 
                    const c = customers.find(x => x.id === id); 
                    setFormData({ ...formData, customerId: id, customerName: c?.name || '' }); 
                  }}>
                    <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold uppercase shadow-inner">
                      <SelectValue placeholder="Identify..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Place of Supply</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold shadow-inner uppercase" value={formData.placeOfSupply} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02]"><FileText className="h-16 w-16" /></div>
            <div className="relative z-10 space-y-8">
              <h4 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-4 tracking-widest">Procedural Item Registry</h4>
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-12 text-center text-[8px]">SR</TableHead>
                      <TableHead className="text-[8px]">Product/Service Registry</TableHead>
                      <TableHead className="text-[8px] text-center w-20">Qty</TableHead>
                      <TableHead className="text-[8px] text-center w-24">Rate (₹)</TableHead>
                      <TableHead className="text-[8px] text-center w-20">GST %</TableHead>
                      <TableHead className="text-[8px] text-right px-4">Amount</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(formData.items || []).map((item, idx) => (
                      <TableRow key={idx} className="h-16 border-b border-slate-50 dark:border-border hover:bg-slate-50/30 transition-colors">
                        <TableCell className="text-center font-bold text-[10px] text-slate-300">{(idx+1).toString().padStart(2, '0')}</TableCell>
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
                               gstRate: p?.gstRate || 18, 
                               unit: p?.uom || 'Nos',
                               total: (newItems[idx].qty || 1) * (p?.saleRate || 0) 
                             };
                             setFormData({...formData, items: newItems});
                           }}>
                             <SelectTrigger className="h-10 border-none bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase">
                               <SelectValue placeholder="Identify Registry Node..." />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl">
                               {products.map(p => (
                                 <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase">
                                   {p.name} <span className="ml-2 text-slate-400 text-[8px]">({p.type})</span>
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                        </TableCell>
                        <TableCell><Input type="number" className="h-9 text-center border-none bg-slate-50 dark:bg-slate-900 rounded-lg font-bold text-[10px]" value={item.qty} onChange={(e) => {
                          const newItems = [...(formData.items || [])];
                          newItems[idx] = { ...newItems[idx], qty: Number(e.target.value), total: Number(e.target.value) * newItems[idx].price };
                          setFormData({...formData, items: newItems});
                        }} /></TableCell>
                        <TableCell><Input type="number" className="h-9 text-center border-none bg-slate-50 dark:bg-slate-900 rounded-lg font-bold text-[10px]" value={item.price} onChange={(e) => {
                          const newItems = [...(formData.items || [])];
                          newItems[idx] = { ...newItems[idx], price: Number(e.target.value), total: Number(e.target.value) * newItems[idx].qty };
                          setFormData({...formData, items: newItems});
                        }} /></TableCell>
                        <TableCell><Input type="number" className="h-9 text-center border-none bg-slate-50 dark:bg-slate-900 rounded-lg font-bold text-[10px]" value={item.gstRate} onChange={(e) => {
                          const newItems = [...(formData.items || [])];
                          newItems[idx] = { ...newItems[idx], gstRate: Number(e.target.value) };
                          setFormData({...formData, items: newItems});
                        }} /></TableCell>
                        <TableCell className="text-right font-display font-bold text-xs">₹ {item.total?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500" onClick={() => {
                            const newItems = (formData.items || []).filter((_, i) => i !== idx);
                            setFormData({...formData, items: newItems});
                          }}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="ghost" className="w-full mt-4 h-10 rounded-xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[9px] tracking-widest gap-2 hover:bg-slate-50" onClick={() => {
                  const newItems = [...(formData.items || []), { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }];
                  setFormData({...formData, items: newItems as BillingLineItem[]});
                }}><Plus className="h-3.5 w-3.5" /> Append Sequential Node</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <Card className="p-8 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-3xl space-y-8">
             <h4 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-4 tracking-widest">Document Registry Node</h4>
             <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Document No.</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-code font-bold shadow-inner" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Registry Date</Label>
                  <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Reference No.</Label>
                  <Input className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold shadow-inner uppercase" value={formData.referenceNumber} onChange={(e)=>setFormData({...formData, referenceNumber: e.target.value})} />
                </div>
             </div>
          </Card>

          <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-3xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
             <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Final Valuation Matrix</h4>
                   <Badge className="bg-primary/20 text-primary border-none px-3 font-bold text-[8px] uppercase">Fidelity_Verified</Badge>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase">
                      <span>Taxable Yield</span>
                      <span className="text-white">₹ {(formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase">
                      <span>Total Matrix Tax</span>
                      <span className="text-white">₹ {((formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0)).toLocaleString()}</span>
                   </div>
                   <div className="h-px bg-white/10 my-4" />
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Grand Total Amount</p>
                        <p className="text-4xl font-display font-black tracking-tighter">₹ {(
                          (formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0) + 
                          (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0)
                        ).toLocaleString()}</p>
                      </div>
                      <Calculator className="h-10 w-10 text-white/5" />
                   </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-2">Institutional Transcription</p>
                   <p className="text-[10px] font-bold leading-relaxed">{numberToWords((formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0) + (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0))}</p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const ProductMasterView = () => (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
       <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-10 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-[#001F3D] rounded-2xl text-white shadow-xl">
                  <PackageSearch className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Product & Service Master</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Single Source of Truth Catalogue</p>
                </div>
             </div>
             <Button className="h-14 px-12 bg-primary text-white dark:text-card rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl flex gap-3 group" onClick={() => handleOpenProductForm()}>
                <Plus className="h-5 w-5" /> Register New Item <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
             </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white dark:bg-card border-b border-slate-100 dark:border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase text-slate-400 py-6 px-10">Item Identification</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Classification</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Standard Rate (₹)</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">HSN/SAC</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-center w-32">Status</TableHead>
                  <TableHead className="text-right px-10 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-card">
                {products.map(p => (
                  <TableRow key={p.id} className="h-24 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 border-b border-slate-50 dark:border-border transition-all cursor-pointer group" onClick={() => handleOpenProductForm(p)}>
                    <TableCell className="px-10">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#001F3D] dark:text-white uppercase tracking-tight">{p.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Code: {p.code} | Drawing: {p.drawingNumber || 'NA'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1 rounded-full border-slate-200 dark:border-border">{p.type}</Badge>
                    </TableCell>
                    <TableCell className="font-display font-black text-sm dark:text-white">₹ {p.saleRate?.toLocaleString()}</TableCell>
                    <TableCell className="font-code text-xs font-bold text-slate-500">{p.hsn}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-[9px] font-black uppercase px-4 py-1.5 rounded-full", p.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400")}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                       <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="h-5 w-5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
       </Card>

       <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
          <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
             <div className="p-8 bg-[#001F3D] text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-xl text-card shadow-xl"><PackageSearch className="h-6 w-6" /></div>
                  <div>
                    <DialogTitle className="text-xl font-display font-bold uppercase tracking-tight">Catalogue Registry Protocol</DialogTitle>
                    <DialogDescription className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Master Product Identity Matrix</DialogDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsProductFormOpen(false)} className="text-white/40 hover:text-white rounded-full"><X className="h-6 w-6" /></Button>
             </div>
             <ScrollArea className="max-h-[70vh]">
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Item Name</Label><Input className="h-12 bg-slate-50 font-bold" value={productFormData.name} onChange={(e)=>setProductFormData({...productFormData, name: e.target.value})} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Product Code</Label><Input className="h-12 bg-slate-50 font-code font-bold uppercase" value={productFormData.code} onChange={(e)=>setProductFormData({...productFormData, code: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Product Type</Label>
                        <Select value={productFormData.type} onValueChange={(val: any)=>setProductFormData({...productFormData, type: val})}>
                           <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                           <SelectContent className="rounded-xl">
                              {PRODUCT_TYPES.map(t => <SelectItem key={t} value={t} className="text-[10px] font-bold uppercase">{t}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">HSN / SAC Node</Label><Input className="h-12 bg-slate-50 font-code uppercase" value={productFormData.hsn} onChange={(e)=>setProductFormData({...productFormData, hsn: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Drawing Number</Label><Input className="h-12 bg-slate-50 font-code uppercase" value={productFormData.drawingNumber} onChange={(e)=>setProductFormData({...productFormData, drawingNumber: e.target.value})} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Revision Number</Label><Input className="h-12 bg-slate-50 font-code uppercase" value={productFormData.revisionNumber} onChange={(e)=>setProductFormData({...productFormData, revisionNumber: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Standard Rate (₹)</Label><Input type="number" className="h-12 bg-slate-50 font-bold" value={productFormData.saleRate} onChange={(e)=>setProductFormData({...productFormData, saleRate: Number(e.target.value)})} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">GST Matrix (%)</Label><Input type="number" className="h-12 bg-slate-50 font-bold" value={productFormData.gstRate} onChange={(e)=>setProductFormData({...productFormData, gstRate: Number(e.target.value)})} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">UOM Unit</Label><Input className="h-12 bg-slate-50 uppercase font-bold" value={productFormData.uom} onChange={(e)=>setProductFormData({...productFormData, uom: e.target.value})} /></div>
                  </div>
               </div>
             </ScrollArea>
             <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-4">
                <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold uppercase text-[9px]" onClick={()=>setIsProductFormOpen(false)}>Abort Protocol</Button>
                <Button className="h-12 px-12 bg-[#001F3D] text-white rounded-xl font-bold uppercase text-[10px] shadow-xl" onClick={handleSaveProduct}>Commit to Catalogue</Button>
             </div>
          </DialogContent>
       </Dialog>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight leading-none">Intelligence Dashboard</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Business Analytics & Yield Performance</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-card p-1 rounded-xl shadow-inner">
           <button onClick={() => setDashboardView('analytics')} className={cn("px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all", dashboardView === 'analytics' ? "bg-white dark:bg-primary text-primary dark:text-card shadow-sm" : "text-slate-400")}>Performance Matrix</button>
           <button onClick={() => setDashboardView('quick')} className={cn("px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all", dashboardView === 'quick' ? "bg-white dark:bg-primary text-primary dark:text-card shadow-sm" : "text-slate-400")}>Functional Quick-Links</button>
        </div>
      </div>

      {dashboardView === 'analytics' ? (
        <div className="space-y-8">
           <div className="flex items-center justify-between bg-white dark:bg-card p-8 border border-slate-200 dark:border-border rounded-3xl shadow-sm">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20"><BrainCircuit className="h-8 w-8 text-white" /></div>
                <div>
                   <h3 className="text-xl font-bold dark:text-white uppercase">Institutional Health Index</h3>
                   <div className="flex items-center gap-4 mt-1">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-3">Protocol_Synced</Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(parseISO(selectedAnalyticsDate), 'MMMM yyyy')} Window</span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => {
                   const d = parseISO(selectedAnalyticsDate);
                   d.setMonth(d.getMonth() - 1);
                   setSelectedAnalyticsDate(d.toISOString().split('T')[0]);
                }} className="rounded-full h-10 w-10 text-slate-400 hover:text-primary"><ChevronLeft className="h-6 w-6" /></Button>
                <span className="text-sm font-display font-black uppercase tracking-widest min-w-[150px] text-center dark:text-white">{format(parseISO(selectedAnalyticsDate), 'MMM yyyy')}</span>
                <Button variant="ghost" size="icon" onClick={() => {
                   const d = parseISO(selectedAnalyticsDate);
                   d.setMonth(d.getMonth() + 1);
                   setSelectedAnalyticsDate(d.toISOString().split('T')[0]);
                }} className="rounded-full h-10 w-10 text-slate-400 hover:text-primary"><ChevronRight className="h-6 w-6" /></Button>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Monthly Target', val: `₹ ${biMetrics.monthlyBillingTarget.toLocaleString()}`, icon: Target, color: 'text-blue-500' },
                { label: 'Actual Billed', val: `₹ ${biMetrics.actualBillingAchieved.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Yield Deficiency', val: `₹ ${biMetrics.remaining.toLocaleString()}`, icon: Clock, color: 'text-amber-500' },
                { label: 'Matrix Health', val: `${biMetrics.healthScore}%`, icon: Zap, color: 'text-primary' },
                { label: 'POs Received', val: biMetrics.poReceived, icon: FileBadge, color: 'text-purple-500' },
                { label: 'Daily Velocity', val: `₹ ${Math.round(biMetrics.dailyVelocity).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-500' },
              ].map(kpi => (
                <Card key={kpi.label} className="p-8 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl shadow-sm space-y-4 hover:border-primary/50 transition-all group">
                   <div className="flex justify-between items-start">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{kpi.label}</p>
                      <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                   </div>
                   <h4 className="text-2xl font-display font-bold dark:text-white">{kpi.val}</h4>
                </Card>
              ))}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {MAIN_TABS.slice(1, -1).map(module => (
            <Card key={module.id} className="p-8 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl shadow-sm hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center gap-6 group" onClick={() => setActiveTab(module.id)}>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all text-slate-400">
                 <module.icon className="h-8 w-8" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 text-center tracking-widest">{module.label}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-0 bg-slate-50/30 dark:bg-slate-950/20 font-body">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <>
          <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-border h-14 px-4 flex items-center scrollbar-hide overflow-x-auto no-print sticky top-0 z-40">
            <div className="flex h-full gap-1">
              {MAIN_TABS.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={cn(
                    "px-6 h-full text-[10px] font-black uppercase flex items-center gap-3 border-b-4 transition-all tracking-widest", 
                    activeTab === tab.id 
                      ? "border-primary text-primary bg-primary/5 shadow-inner" 
                      : "border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-600"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-slate-300")} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            {activeTab === 'dashboard' ? <DashboardView /> : 
             activeTab === 'product-master' ? <ProductMasterView /> : (
              <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <Card className="bg-white dark:bg-card border border-slate-200 dark:border-border shadow-2xl rounded-3xl overflow-hidden">
                    <div className="p-10 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="flex items-center gap-6">
                          <div className="p-4 bg-[#001F3D] rounded-2xl text-white shadow-xl shadow-blue-900/20">
                            {MAIN_TABS.find(t=>t.id===activeTab)?.icon && (() => {
                              const Icon = MAIN_TABS.find(t=>t.id===activeTab)!.icon;
                              return <Icon className="h-8 w-8" />;
                            })()}
                          </div>
                          <div>
                            <h3 className="text-2xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">{MAIN_TABS.find(t=>t.id===activeTab)?.label} Hub</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Institutional Ledger Matrix</p>
                          </div>
                       </div>
                       <Button className="h-14 px-12 bg-primary dark:bg-primary hover:bg-black text-white dark:text-card rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20 flex gap-3 group" onClick={() => handleOpenForm(activeTab)}>
                          <Plus className="h-5 w-5" /> Initialize Entry <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                       </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white dark:bg-card border-b border-slate-100 dark:border-border">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-black text-[10px] uppercase text-slate-400 py-6 px-10">Account Identity</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-slate-400">Registry ID</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-right px-6">Valuation (₹)</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-center w-32">Status Node</TableHead>
                            <TableHead className="text-right px-10 w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white dark:bg-card">
                          {records.filter(r=>r.type === activeTab).map(r => (
                            <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="h-24 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 border-b border-slate-50 dark:border-border transition-all cursor-pointer group">
                              <TableCell className="px-10">
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-[#001F3D] dark:text-white uppercase tracking-tight">{r.customerName}</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {r.customerId}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-code text-xs font-bold text-primary">{r.number}</TableCell>
                              <TableCell className="text-right font-display font-black text-sm dark:text-white">₹ {r.amount?.toLocaleString()}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full border-slate-200 dark:border-border dark:text-slate-400">{r.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right px-10">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                   <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500" onClick={(e)=>{e.stopPropagation(); onDeleteRecord(r.id);}}><Trash2 className="h-5 w-5" /></Button>
                                   <ChevronRight className="h-5 w-5 text-slate-200" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {records.filter(r=>r.type===activeTab).length === 0 && (
                            <TableRow><TableCell colSpan={5} className="py-40 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Ledger Registry Node Empty</TableCell></TableRow>
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
    </div>
  );
}

