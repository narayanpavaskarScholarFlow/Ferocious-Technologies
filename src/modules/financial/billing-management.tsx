
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Save, 
  Search, 
  ArrowLeft, 
  Box, 
  Receipt,
  ShoppingCart,
  Building2,
  Landmark,
  User,
  Link2,
  FileText,
  Printer,
  ChevronDown,
  Trash2,
  Calendar,
  Calculator,
  History,
  FileCheck,
  Send,
  Download,
  Zap,
  MoreHorizontal,
  TrendingUp,
  Archive,
  Info,
  Clock,
  RotateCcw,
  Check,
  Maximize2,
  Settings2,
  DollarSign,
  ClipboardList,
  ShieldAlert,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Hammer,
  Share2,
  Filter,
  Users,
  CreditCard,
  X
} from 'lucide-react';
import { Customer, BillingRecord, ProductMaster, BillingLineItem, UISettings } from '@/lib/types';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

/**
 * Utility to convert numerical currency to institutional words (Indian Format).
 */
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
  
  const mainPart = Math.floor(num);
  return (convert(mainPart) + " RUPEES ONLY").trim();
}

interface BillingManagementProps {
  currentUser: string | null;
  customers: Customer[];
  records: BillingRecord[];
  products: ProductMaster[];
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  initialTab?: string;
}

export function BillingManagement({ 
  currentUser,
  customers, 
  records, 
  products, 
  onSaveRecord, 
  onDeleteRecord, 
  initialTab = 'quotation' 
}: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', 
    type: activeTab, 
    customerName: '', 
    customerId: '', 
    date: new Date().toISOString().split('T')[0],
    number: '', 
    status: 'Draft', 
    items: [], 
    subTotal: 0, 
    amount: 0, 
    taxTotal: 0, 
    discountTotal: 0,
    roundOff: 0, 
    notes: '', 
    terms: 'Subject to our home Jurisdiction.\nOur Responsibility Ceases as soon as goods leaves our Premises.', 
    quotationId: '',
    placeOfSupply: '', 
    shipTo: '', 
    contactPerson: '', 
    phoneNo: '', 
    gstNumber: '',
    panNumber: '',
    referenceNumber: '', 
    challanNo: '',
    challanDate: '', 
    lrNo: '',
    deliveryMode: '',
    revCharge: 'No', 
    distanceEWay: '',
    isRoundOffActive: false,
    tcsRate: 0,
    tcsAmount: 0,
    transportationCharges: 0,
    paymentMethod: 'Bank Transfer'
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isType = r.type === activeTab;
      const matchesSearch = (r.number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isType && matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: `REC-${Date.now()}`, 
        type, 
        customerName: '', 
        customerId: '', 
        date: new Date().toISOString().split('T')[0],
        number: `${type.substring(0, 3).toUpperCase()}-${(records.length + 1001)}`, 
        status: 'Draft', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, 
        amount: 0, 
        taxTotal: 0, 
        discountTotal: 0, 
        roundOff: 0,
        revCharge: 'No', 
        placeOfSupply: '', 
        shipTo: '', 
        distanceEWay: '',
        challanNo: '',
        challanDate: '',
        lrNo: '',
        deliveryMode: '',
        isRoundOffActive: false,
        tcsRate: 0,
        tcsAmount: 0,
        transportationCharges: 0,
        terms: 'Subject to our home Jurisdiction.\nOur Responsibility Ceases as soon as goods leaves our Premises.',
      });
    }
    setIsRecordFormOpen(true);
  };

  const FullPageEditor = () => {
    const handleUpdateField = useCallback((field: keyof BillingRecord, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const totals = useMemo(() => {
      const items = formData.items || [];
      const subTotal = items.reduce((acc, i) => acc + (i.total || 0), 0);
      const taxTotal = items.reduce((acc, i) => acc + ((i.total || 0) * (i.gstRate || 0) / 100), 0);
      const discountTotal = Number(formData.discountTotal) || 0;
      const tcsAmount = Number(formData.tcsAmount) || 0;
      const extraCharges = Number(formData.transportationCharges) || 0;

      let grandTotal = subTotal + taxTotal + tcsAmount + extraCharges - discountTotal;
      let roundOff = 0;
      if (formData.isRoundOffActive) {
        const rounded = Math.round(grandTotal);
        roundOff = rounded - grandTotal;
        grandTotal = rounded;
      }

      return { subTotal, taxTotal, grandTotal, discountTotal, tcsAmount, extraCharges, roundOff };
    }, [formData.items, formData.discountTotal, formData.tcsAmount, formData.isRoundOffActive, formData.transportationCharges]);

    const handleUpdateItem = (idx: number, field: keyof BillingLineItem, value: any) => {
      const newItems = [...(formData.items || [])];
      newItems[idx] = { ...newItems[idx], [field]: value };
      const item = newItems[idx];
      const baseTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      let discount = 0;
      if (item.discountType === 'percentage') discount = (baseTotal * (Number(item.discount) || 0) / 100);
      else discount = (Number(item.discount) || 0);
      item.total = baseTotal - discount;
      setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addRow = () => {
      const newItem: BillingLineItem = { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 };
      setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const removeRow = (id: string) => {
      setFormData(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
    };

    const handleSaveLocal = () => {
      if (!formData.customerId || !formData.number) {
        toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Doc Number required." });
        return;
      }
      const finalRecord = {
        ...formData,
        subTotal: totals.subTotal,
        taxTotal: totals.taxTotal,
        amount: totals.grandTotal,
        roundOff: totals.roundOff,
        updatedAt: new Date().toISOString()
      } as BillingRecord;
      onSaveRecord(finalRecord);
      toast({ title: "Ledger Synchronized", description: `${formData.type} committed to master matrix.` });
      setIsRecordFormOpen(false);
    };

    const isProcurement = formData.type === 'purchase_invoice' || formData.type === 'purchase_order' || formData.type === 'outward_payment' || formData.type === 'job_work';

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-500 font-body pb-20 overflow-x-hidden">
        {/* ACTION BAR (Top Sticky) */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 h-20 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-12 w-12 hover:bg-slate-100 transition-all group">
              <X className="h-6 w-6 text-slate-400 group-hover:text-red-500" />
            </Button>
            <div className="flex flex-col">
               <div className="flex items-center gap-3 mb-1">
                 <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-2 py-0.5 tracking-[0.2em]">{formData.status}</Badge>
                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Protocol Node: {formData.number}</span>
               </div>
               <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase leading-none tracking-tight">{formData.type?.replace('_', ' ')} Editor</h2>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest border-slate-200 bg-white text-slate-500 hover:bg-slate-50 gap-2"><Share2 className="h-3.5 w-3.5" /> Share</Button>
             <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest border-slate-200 bg-white text-slate-500 hover:bg-slate-50 gap-2"><Download className="h-3.5 w-3.5" /> PDF Matrix</Button>
             <Button className="bg-[#10b981] hover:bg-emerald-600 text-white h-11 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-lg flex gap-3 transition-all" onClick={handleSaveLocal}>
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
             <Button className="bg-[#001F3D] hover:bg-black text-white h-11 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-lg flex gap-3 transition-all" onClick={handleSaveLocal}>
               <Save className="h-4 w-4" /> Commit Node
             </Button>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto w-full p-8 space-y-12">
          {/* HEADER SECTION: Identity & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-10 bg-white border-slate-200/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] rounded-[3rem] space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Building2 className="h-24 w-24" /></div>
                <div className="flex justify-between items-center px-1 relative z-10">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">{isProcurement ? 'Vendor' : 'Customer'} Matrix</h4>
                   <Badge variant="outline" className="border-slate-100 text-[9px] font-bold uppercase">Identity Node</Badge>
                </div>
                
                <div className="space-y-6 relative z-10">
                   <div className="grid grid-cols-[140px_1fr] items-center gap-8">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Identify M/S.*</Label>
                      <Select value={formData.customerId ?? ''} onValueChange={(id) => {
                         const c = customers.find(x => x.id === id);
                         if (!c) return;
                         setFormData(prev => ({ 
                           ...prev, 
                           customerId: id, 
                           customerName: c.name, 
                           gstNumber: c.gstNumber || '', 
                           panNumber: c.pan || '',
                           contactPerson: c.contactPerson || '', 
                           phoneNo: c.contactNumber || '', 
                           address: c.address || '',
                           shipTo: c.shippingAddress || c.address || '',
                           placeOfSupply: c.city || ''
                         }));
                      }}>
                         <SelectTrigger className="h-14 bg-slate-50/50 border-none rounded-2xl font-black uppercase text-xs shadow-inner focus:ring-primary/20">
                            <SelectValue placeholder={`Select ${isProcurement ? 'Partner' : 'Account'}...`} />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                            {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-4 border-b border-slate-50 last:border-0">{c.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-start gap-8">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pt-3">Billing Base</Label>
                      <Textarea className="min-h-[100px] bg-slate-50/30 border-none rounded-2xl text-xs font-bold leading-relaxed resize-none shadow-inner text-slate-600" value={formData.address ?? ''} readOnly placeholder="Identify node to load location matrix..." />
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tax Identity</Label>
                      <div className="flex gap-4">
                        <Input className="h-12 bg-slate-50/30 border-none rounded-xl font-black font-code text-xs uppercase text-primary text-center" value={formData.gstNumber ?? ''} placeholder="GSTIN" readOnly />
                        <Input className="h-12 bg-slate-50/30 border-none rounded-xl font-black font-code text-xs uppercase text-primary text-center" value={formData.panNumber ?? ''} placeholder="PAN" readOnly />
                      </div>
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 pt-6 border-t border-slate-50">
                      <Label className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Supply Node*</Label>
                      <Input className="h-14 bg-primary/5 border-2 border-primary/20 rounded-2xl font-black uppercase text-xs text-primary shadow-sm text-center tracking-widest" value={formData.placeOfSupply ?? ''} onChange={(e)=>handleUpdateField('placeOfSupply', e.target.value)} placeholder="Identify Supply Origin..." />
                   </div>
                </div>
            </Card>

            <Card className="p-10 bg-white border-slate-200/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] rounded-[3rem] space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Archive className="h-24 w-24" /></div>
                <div className="flex justify-between items-center px-1 relative z-10">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">Metadata Registry</h4>
                   <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-slate-300" /><span className="text-[9px] font-bold text-slate-300 uppercase">Archive Link Active</span></div>
                </div>

                <div className="space-y-8 relative z-10">
                   <div className="grid grid-cols-[140px_1fr_120px_1fr] items-center gap-x-8 gap-y-8">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Doc. Identifier*</Label>
                      <Input className="h-14 bg-slate-900 border-none rounded-2xl font-black font-code text-center text-white shadow-xl text-lg" value={formData.number ?? ''} onChange={(e)=>handleUpdateField('number', e.target.value)} />
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Protocol Date*</Label>
                      <DatePicker value={formData.date ?? ''} onChange={(val)=>setFormData(prev => ({...prev, date: val}))} className="h-14 rounded-2xl shadow-sm border-2 border-slate-100 bg-white" />
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Reference No.</Label>
                      <Input className="h-12 bg-slate-50/50 border-none rounded-xl font-black text-xs px-6 shadow-inner" value={formData.referenceNumber ?? ''} onChange={(e)=>handleUpdateField('referenceNumber', e.target.value)} placeholder="PO/Quotation Reference..." />
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Created By</Label>
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                         <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{currentUser?.charAt(0)}</div>
                         <div className="flex flex-col"><span className="text-xs font-black uppercase text-slate-700">{currentUser}</span><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authenticated Personnel</span></div>
                      </div>
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 pt-8 border-t border-slate-50">
                      <Label className="text-[11px] font-black text-[#001F3D] uppercase tracking-widest">Settlement Path</Label>
                      <Select value={formData.paymentMethod ?? 'Bank Transfer'} onValueChange={(v)=>handleUpdateField('paymentMethod', v)}>
                        <SelectTrigger className="h-14 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-xs shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="Bank Transfer" className="font-bold text-[10px] uppercase py-3">BANK_TRANSFER_PROTOCOL</SelectItem>
                           <SelectItem value="Cash" className="font-bold text-[10px] uppercase py-3">INTERNAL_CASH_SETTLEMENT</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
            </Card>
          </div>

          {/* STEP 02: EXECUTION MATRIX (GRID) */}
          <div className="space-y-6 pt-12">
            <div className="flex items-center justify-between border-l-4 border-[#10b981] pl-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shadow-xl shadow-emerald-500/10"><Box className="h-6 w-6" /></div>
                <div>
                   <h3 className="text-xl font-display font-black text-[#001F3D] uppercase tracking-tight">Step 02: Execution Matrix</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-Fidelity Document Detail Registry</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={addRow} className="h-11 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 bg-white border-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                <Plus className="h-4 w-4" /> Append Matrix Node
              </Button>
            </div>

            <Card className="bg-white border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden">
               <div className="overflow-x-auto">
                 <Table className="min-w-[1700px]">
                   <TableHeader className="bg-slate-50/80 sticky top-0 z-20">
                      <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                        <TableHead className="px-6 py-6 text-[10px] font-black uppercase w-16 text-center border-r border-slate-100 text-[#001F3D]">SR.</TableHead>
                        <TableHead className="text-[10px] font-black uppercase min-w-[500px] border-r border-slate-100 text-[#001F3D]">DOCUMENT CONTENT / TECHNICAL LINE ITEMS</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-36 text-center border-r border-slate-100 text-[#001F3D]">HSN/SAC CODE</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-28 text-center border-r border-slate-100 text-[#001F3D]">QTY.</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-28 text-center border-r border-slate-100 text-[#001F3D]">UOM</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-48 text-center border-r border-slate-100 text-[#001F3D]">UNIT PRICE (₹)</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-48 text-center border-r border-slate-100 text-[#001F3D]">DISCOUNT %</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-32 text-center border-r border-slate-100 text-[#001F3D]">IGST %</TableHead>
                        <TableHead className="text-right px-10 text-[10px] font-black uppercase w-56 text-primary">VALUATION (₹)</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {(formData.items || []).map((item, idx) => (
                        <TableRow key={item.id} className="h-32 border-b border-slate-100 hover:bg-slate-50/30 transition-colors group">
                           <TableCell className="text-center font-display font-black text-slate-300 border-r border-slate-50 group-hover:text-primary transition-colors">{idx + 1}</TableCell>
                           <TableCell className="border-r border-slate-50 p-0 relative">
                              <div className="flex flex-col h-full bg-white group-hover:bg-transparent transition-colors">
                                <Select value={item.productId ?? ''} onValueChange={(pId) => {
                                   const p = products.find(x => x.id === pId);
                                   if (!p) return;
                                   handleUpdateItem(idx, 'description', p.name);
                                   handleUpdateItem(idx, 'productId', pId);
                                   handleUpdateItem(idx, 'hsn', p.hsn);
                                   handleUpdateItem(idx, 'price', p.saleRate);
                                   handleUpdateItem(idx, 'unit', p.uom);
                                   handleUpdateItem(idx, 'gstRate', p.gstRate);
                                }}>
                                   <SelectTrigger className="border-none bg-transparent h-14 font-black uppercase text-[15px] focus:ring-0 shadow-none px-8 text-[#001F3D] tracking-tight group-hover:pl-10 transition-all">
                                      <SelectValue placeholder="Identify Product/Process Node..." />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-2xl shadow-2xl border-slate-100 min-w-[400px]">
                                      {products.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-4 border-b border-slate-50 last:border-0">
                                           <div className="flex flex-col gap-1">
                                              <span className="text-slate-900">{p.name}</span>
                                              <span className="text-[8px] text-slate-400 font-code tracking-widest">{p.code} • HSN: {p.hsn}</span>
                                           </div>
                                        </SelectItem>
                                      ))}
                                   </SelectContent>
                                </Select>
                                <div className="px-8 pb-4">
                                   <Textarea placeholder="Node-specific technical observations..." className="h-16 bg-slate-50/50 border-none text-[10px] rounded-2xl font-medium resize-none shadow-inner focus-visible:ring-primary/20 placeholder:text-slate-300" value={item.note ?? ''} onChange={(e) => handleUpdateItem(idx, 'note', e.target.value)} />
                                </div>
                              </div>
                           </TableCell>
                           <TableCell className="border-r border-slate-50 p-4"><Input className="h-12 bg-slate-50 border-none rounded-xl text-center font-code font-bold text-[11px] text-slate-500 uppercase" value={item.hsn ?? ''} onChange={(e)=>handleUpdateItem(idx, 'hsn', e.target.value)} /></TableCell>
                           <TableCell className="border-r border-slate-50 p-4"><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-center font-black text-base text-[#001F3D]" value={item.qty ?? ''} onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r border-slate-50 p-4"><Input className="h-12 bg-slate-50 border-none rounded-xl text-center font-black text-[11px] uppercase text-slate-400" value={item.unit ?? ''} onChange={(e)=>handleUpdateItem(idx, 'unit', e.target.value)} /></TableCell>
                           <TableCell className="border-r border-slate-50 p-4">
                              <div className="relative">
                                 <Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-center font-display font-black text-base w-full pl-6 text-[#001F3D]" value={item.price ?? ''} onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))} />
                                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">₹</span>
                              </div>
                           </TableCell>
                           <TableCell className="border-r border-slate-50 p-4"><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl text-center font-black text-xs" value={item.discount ?? ''} onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r border-slate-50 p-4">
                              <Select value={(item.gstRate ?? 18).toString()} onValueChange={(v)=>handleUpdateItem(idx, 'gstRate', Number(v))}>
                                 <SelectTrigger className="bg-slate-50 border-none h-12 rounded-xl text-center font-black text-[11px] shadow-none focus:ring-primary/20"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                   {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()} className="font-bold text-[10px] py-2">{r}%</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell className="text-right px-10 font-display font-black text-[#001F3D] text-lg bg-slate-50/30 group-hover:bg-transparent transition-all">₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                           <TableCell className="text-center px-4"><Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" onClick={() => removeRow(item.id)}><Trash2 className="h-5 w-5" /></Button></TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-[#FFF9C4] hover:bg-[#FFF9C4] border-t-4 border-[#001F3D]">
                         <TableCell colSpan={2} className="px-10 py-8 text-right font-black text-[11px] uppercase text-[#001F3D] border-r border-[#001F3D]/10 tracking-widest leading-none">Total Document Yield Matrix</TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="text-center font-display font-black text-xl border-r border-[#001F3D]/10 text-[#001F3D]">{(formData.items || []).reduce((acc, i) => acc + (i.qty || 0), 0)}</TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="text-right px-10 font-display font-black text-3xl text-[#001F3D]">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                         <TableCell></TableCell>
                      </TableRow>
                   </TableBody>
                 </Table>
               </div>
            </Card>

            {/* BOTTOM SECTION: SETTLEMENT & TERMS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-12">
               <div className="lg:col-span-7 space-y-10">
                  <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[3rem] space-y-10 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity"><ClipboardList className="h-24 w-24" /></div>
                     <div className="flex items-center gap-3 border-l-4 border-[#001F3D] pl-6 relative z-10"><h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">Commercial Terms Protocol</h4></div>
                     <div className="space-y-6 relative z-10">
                        <Textarea className="min-h-[160px] bg-slate-50/50 border-none rounded-2xl text-[13px] font-bold leading-relaxed shadow-inner p-8 text-slate-600" value={formData.terms ?? ""} onChange={(e)=>handleUpdateField('terms', e.target.value)} />
                     </div>
                  </Card>

                  <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[3rem] relative overflow-hidden group">
                     <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-6 mb-8 relative z-10"><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Internal Audit Logs</h4></div>
                     <div className="space-y-4 relative z-10">
                        <Textarea className="min-h-[100px] bg-slate-50/50 border-none rounded-2xl text-xs font-medium italic shadow-inner p-6" placeholder="Restricted visibility: Management audit trail node..." value={formData.note ?? ""} onChange={(e)=>handleUpdateField('note', e.target.value)} />
                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2 animate-pulse"><ShieldAlert className="h-3 w-3" /> System Warning: Internal notes are purged from official print output.</p>
                     </div>
                  </Card>
               </div>

               <div className="lg:col-span-5">
                  <Card className="p-10 bg-white border-slate-200/80 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.1)] rounded-[4rem] space-y-8 relative overflow-hidden border-t-8 border-t-[#001F3D]">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Calculator className="h-32 w-32" /></div>
                     <div className="space-y-8 relative z-10">
                        <div className="flex justify-between items-center px-4">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Base Valuation Baseline</span>
                           <span className="text-xl font-display font-black text-[#001F3D]">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 shadow-inner">
                           <div className="flex justify-between items-center group">
                             <Label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2"><Truck className="h-4 w-4" /> Logistics/Addl (₹)</Label>
                             <Input type="number" className="w-44 h-12 text-right font-black border-2 border-transparent bg-white rounded-xl shadow-sm focus:border-emerald-500 transition-all text-lg text-[#001F3D]" value={formData.transportationCharges ?? 0} onChange={(e) => handleUpdateField('transportationCharges', Number(e.target.value))} />
                           </div>
                           
                           <div className="flex justify-between items-center"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Aggregate Tax (IGST)</span><span className="text-base font-display font-black text-slate-900">₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                           
                           <div className="h-[1px] bg-slate-200/50 w-full" />

                           <div className="flex items-center gap-4">
                              <div className="flex-1 h-14 bg-white border-2 border-slate-100 rounded-2xl px-6 flex items-center justify-between shadow-sm hover:border-primary/30 transition-all">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TCS Protocol (%)</span>
                                 <Input type="number" className="w-24 border-none bg-transparent h-10 text-right font-black text-lg text-[#001F3D] focus-visible:ring-0 shadow-none" value={formData.tcsRate ?? 0} onChange={(e)=>handleUpdateField('tcsRate', Number(e.target.value))} />
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="flex-1 h-14 bg-white border-2 border-slate-100 rounded-2xl px-6 flex items-center justify-between shadow-sm hover:border-primary/30 transition-all">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Matrix Discount</span>
                                 <div className="flex items-center gap-2">
                                    <Input type="number" className="w-32 border-none bg-transparent h-10 text-right font-black text-lg text-rose-500 focus-visible:ring-0 shadow-none" value={formData.discountTotal ?? 0} onChange={(e)=>handleUpdateField('discountTotal', Number(e.target.value))} />
                                    <span className="text-[11px] font-black text-slate-200">₹</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-between items-center py-4 px-6 border-y border-slate-100 group">
                           <div className="flex items-center gap-4">
                              <span className="text-[11px] font-black text-[#001F3D] uppercase tracking-widest">Round-Off Protocol</span>
                              <Switch checked={formData.isRoundOffActive} onCheckedChange={(v)=>handleUpdateField('isRoundOffActive', v)} className="data-[state=checked]:bg-emerald-500" />
                           </div>
                           <span className="text-sm font-display font-black text-slate-400 italic">₹ {totals.roundOff.toFixed(2)}</span>
                        </div>
                        
                        <div className="bg-[#FFFDE7] p-10 -mx-10 border-y-2 border-[#001F3D] flex flex-col items-center gap-3 shadow-2xl relative">
                           <span className="text-[11px] font-black uppercase text-[#001F3D]/60 tracking-[0.6em]">Institutional Net Value</span>
                           <span className="text-7xl font-display font-black text-[#001F3D] tracking-tighter drop-shadow-md">₹ {totals.grandTotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="pt-10 space-y-8">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">Formal Transcription Protocol</p>
                           <div className="p-8 bg-slate-900 rounded-[2.5rem] flex flex-col items-center gap-3 border border-white/5 shadow-2xl transition-all transform hover:scale-[1.02]">
                              <p className="text-[12px] font-black text-emerald-400 uppercase leading-relaxed text-center tracking-tight px-4">{numberToWords(totals.grandTotal)}</p>
                              <div className="h-1 w-16 bg-white/10 rounded-full" />
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full space-y-8 animate-in fade-in duration-700 font-body">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <div className="space-y-10 p-2">
          <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
                <Filter className="h-4 w-4" />
                Ledger Navigation Matrix
              </div>
              <h2 className="text-4xl font-display font-black text-[#001F3D] uppercase tracking-tight leading-none">{activeTab?.replace('_', ' ')} Master List</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input placeholder={`Filter ${activeTab}...`} className="pl-12 h-12 bg-white border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm focus-visible:ring-primary/20" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
               </div>
               <Button className="h-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl px-10 font-black uppercase text-[10px] tracking-widest shadow-2xl flex gap-3 transition-all transform hover:scale-[1.02]" onClick={() => handleOpenForm(activeTab)}>
                 <Plus className="h-4 w-4" /> Initialize New {activeTab?.toUpperCase()?.replace('_', ' ')}
               </Button>
            </div>
          </header>

          <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-[3rem]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-10 py-10 font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Node Identifier</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Account Matrix</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Net Value</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">State Node</TableHead>
                    <TableHead className="text-right px-10 w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(r => (
                    <TableRow key={r.id} className="h-28 border-b border-slate-50 hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => handleOpenForm(activeTab, r)}>
                      <TableCell className="px-10">
                         <div className="flex flex-col gap-1.5">
                            <span className="font-black text-[14px] text-primary font-code tracking-tight">{r.number}</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{r.date}</span>
                         </div>
                      </TableCell>
                      <TableCell><span className="text-[17px] font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{r.customerName}</span></TableCell>
                      <TableCell className="text-right">
                         <div className="flex flex-col items-end gap-1.5">
                            <span className="font-display font-black text-2xl text-[#001F3D]">₹ {r.amount?.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Settlement Valuation</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge className={cn(
                           "text-[9px] font-black uppercase px-6 py-2.5 rounded-full border shadow-sm transition-all",
                           r.status === 'Draft' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                         )}>
                           {r.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl opacity-0 group-hover:opacity-100 transition-all bg-white shadow-2xl border border-slate-100 transform group-hover:translate-x-2 flex items-center justify-center"><ChevronRight className="h-6 w-6 text-primary" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-[480px] text-center">
                        <div className="flex flex-col items-center justify-center opacity-10 py-10 scale-150">
                          <Archive className="h-24 w-24 mb-6" />
                          <p className="text-2xl font-display font-black uppercase tracking-tight">Matrix Ledger Null</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Identify protocol to initialize node list</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
