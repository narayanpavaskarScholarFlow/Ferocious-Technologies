"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ChevronRight, 
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
  TableProperties,
  Settings,
  Layers,
  LayoutGrid,
  FileText,
  Printer,
  ChevronDown,
  MoreVertical,
  Trash2,
  Calendar,
  Calculator,
  PlusCircle,
  History,
  FileBarChart,
  FileCheck,
  Send,
  Download,
  Copy,
  Zap,
  MoreHorizontal,
  TrendingUp,
  Archive,
  Info,
  Clock,
  RotateCcw,
  Check,
  Maximize2
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
 * Utility to convert numerical currency to institutional words.
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
  return (convert(Math.floor(num)) + " RUPEES ONLY").trim();
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
  const [activeTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);

  // High-fidelity state for institutional billing documents
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
    referenceNumber: '', 
    challanDate: '', 
    revCharge: 'No', 
    distanceEWay: '',
    isRoundOffActive: false,
    tcsRate: 0,
    tcsAmount: 0,
    transportationCharges: 0
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isType = r.type === activeTab;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return isType && matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    if (record) setFormData(record);
    else {
      setFormData({
        id: `REC-${Date.now()}`, 
        type, 
        customerName: '', 
        customerId: '', 
        date: new Date().toISOString().split('T')[0],
        number: `${type === 'quotation' ? 'QT' : 'INV'}-${(records.length + 1001)}`, 
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
        isRoundOffActive: false,
        tcsRate: 0,
        tcsAmount: 0,
        terms: 'Subject to our home Jurisdiction.\nOur Responsibility Ceases as soon as goods leaves our Premises.',
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) {
      toast({ variant: "destructive", title: "Information Required", description: "Customer and Document Number are mandatory." });
      return;
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Document Saved", description: `${formData.type} committed to ledger.` });
    setIsRecordFormOpen(false);
  };

  const FullPageEditor = () => {
    // Advanced Real-time Calculation Logic
    const totals = useMemo(() => {
      const items = formData.items || [];
      const subTotal = items.reduce((acc, i) => acc + (i.total || 0), 0);
      const taxTotal = items.reduce((acc, i) => acc + ((i.total || 0) * (i.gstRate || 0) / 100), 0);
      const discountTotal = Number(formData.discountTotal) || 0;
      const tcsAmount = Number(formData.tcsAmount) || 0;
      const extraCharges = Number(formData.transportationCharges) || 0;

      let grandTotal = subTotal + taxTotal + tcsAmount + extraCharges - discountTotal;
      
      if (formData.isRoundOffActive) {
        grandTotal = Math.round(grandTotal);
      }

      return { subTotal, taxTotal, grandTotal, discountTotal, tcsAmount };
    }, [formData.items, formData.discountTotal, formData.tcsAmount, formData.isRoundOffActive, formData.transportationCharges]);

    const handleUpdateItem = (idx: number, field: keyof BillingLineItem, value: any) => {
      const newItems = [...(formData.items || [])];
      newItems[idx] = { ...newItems[idx], [field]: value };
      const item = newItems[idx];
      
      const baseTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      let discount = 0;
      if (item.discountType === 'percentage') {
        discount = (baseTotal * (Number(item.discount) || 0) / 100);
      } else {
        discount = (Number(item.discount) || 0);
      }
      
      item.total = baseTotal - discount;
      setFormData({ ...formData, items: newItems });
    };

    const addRow = () => {
      const newItem: BillingLineItem = { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 };
      setFormData({ ...formData, items: [...(formData.items || []), newItem] });
    };

    const removeRow = (id: string) => {
      setFormData({ ...formData, items: (formData.items || []).filter(i => i.id !== id) });
    };

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-500 font-body pb-20">
        {/* Step-by-Step Sticky Header Node */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-12 w-12 hover:bg-slate-100">
              <ArrowLeft className="h-6 w-6 text-slate-500" />
            </Button>
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-1">
                 <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5">MATRIX_ONBOARDING</Badge>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Step-by-Step Entry Protocol</span>
               </div>
               <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase leading-none">{formData.type} Matrix</h2>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-slate-200" onClick={() => setIsRecordFormOpen(false)}>Abort</Button>
             <Button variant="outline" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] tracking-widest gap-2 bg-white border-slate-200" onClick={handleSave}>
               <History className="h-4 w-4" /> Save Draft
             </Button>
             <Button className="bg-[#10b981] hover:bg-emerald-600 text-white h-12 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-3" onClick={handleSave}>
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
             <Button className="bg-[#001F3D] hover:bg-black text-white h-12 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Check className="h-4 w-4 mr-2" /> Commit to Ledger
             </Button>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto w-full p-8 space-y-12">
          
          {/* STEP 1: IDENTIFICATION PROTOCOL */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-sm"><User className="h-6 w-6" /></div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 01: Identification & Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-7 p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-x-8 gap-y-6">
                  <Label className="text-[11px] font-black uppercase text-slate-400">Account Identity *</Label>
                  <Select value={formData.customerId ?? ''} onValueChange={(id) => {
                     const c = customers.find(x => x.id === id);
                     setFormData({ 
                       ...formData, 
                       customerId: id, 
                       customerName: c?.name || '', 
                       gstNumber: c?.gstNumber || '', 
                       contactPerson: c?.contactPerson || '', 
                       phoneNo: c?.contactNumber || '', 
                       address: c?.address || '',
                       placeOfSupply: (c as any)?.city || ''
                     });
                  }}>
                     <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase text-xs shadow-inner">
                        <SelectValue placeholder="Identify Institutional Account..." />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl shadow-2xl">
                        {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-3">{c.name}</SelectItem>)}
                     </SelectContent>
                  </Select>

                  <Label className="text-[11px] font-black uppercase text-slate-400 pt-2">Registered Address</Label>
                  <Textarea className="min-h-[100px] bg-slate-50 border-none rounded-2xl text-xs font-medium resize-none shadow-inner opacity-70" value={formData.address ?? ''} readOnly />

                  <Label className="text-[11px] font-black uppercase text-slate-400">GSTIN Node</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase font-code shadow-inner opacity-70" value={formData.gstNumber ?? ''} readOnly />

                  <Label className="text-[11px] font-black uppercase text-slate-400">Place of Supply *</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase shadow-inner" value={formData.placeOfSupply ?? ''} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} />
                </div>
              </Card>

              <Card className="lg:col-span-5 p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-x-8 gap-y-6">
                  <Label className="text-[11px] font-black uppercase text-slate-400">Document ID *</Label>
                  <Input className="h-14 bg-slate-50 border-none rounded-2xl font-black font-code text-primary shadow-inner text-xl" value={formData.number ?? ''} onChange={(e)=>setFormData({...formData, number: e.target.value})} />

                  <Label className="text-[11px] font-black uppercase text-slate-400">Ledger Date</Label>
                  <DatePicker value={formData.date ?? ''} onChange={(val)=>setFormData({...formData, date: val})} className="h-12 rounded-xl" />

                  <Label className="text-[11px] font-black uppercase text-slate-400">Ref Protocol No.</Label>
                  <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs shadow-inner" value={formData.referenceNumber ?? ''} onChange={(e)=>setFormData({...formData, referenceNumber: e.target.value})} />

                  <Label className="text-[11px] font-black uppercase text-slate-400">Temporal Validity</Label>
                  <DatePicker value={formData.challanDate ?? ''} onChange={(val)=>setFormData({...formData, challanDate: val})} className="h-12 rounded-xl" />
                </div>
              </Card>
            </div>
          </div>

          {/* STEP 2: EXECUTION MATRIX (THE TABLE) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-accent pl-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent shadow-sm"><Box className="h-6 w-6" /></div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 02: Execution Matrix</h3>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border">
                    <span className="text-[10px] font-black uppercase text-slate-400 ml-2">Global Discount Logic:</span>
                    <button className="h-8 px-4 bg-white shadow-sm rounded-lg font-bold text-[9px] uppercase">Rs</button>
                    <button className="h-8 px-4 bg-primary text-white shadow-lg rounded-lg font-bold text-[9px] uppercase">%</button>
                 </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white border shadow-sm"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1 shadow-2xl">
                       <DropdownMenuItem onClick={addRow} className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><PlusCircle className="h-4 w-4" /> Add Product Node</DropdownMenuItem>
                       <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><Layers className="h-4 w-4" /> Add Other Charges</DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><Settings className="h-4 w-4" /> Custom Matrix Nodes</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden">
               <div className="overflow-x-auto">
                 <Table className="min-w-[1600px] border-collapse">
                   <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="px-6 py-8 text-[9px] font-black uppercase w-20 text-center border-r">SR.</TableHead>
                        <TableHead className="text-[9px] font-black uppercase min-w-[500px] border-r">PRODUCT / OTHER CHARGES</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-36 text-center border-r">HSN/SAC CODE</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-28 text-center border-r">QTY.</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-28 text-center border-r">UOM</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-48 text-center border-r">PRICE (₹)</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-32 text-center border-r">DISCOUNT</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-32 text-center border-r">IGST (%)</TableHead>
                        <TableHead className="text-right px-10 text-[9px] font-black uppercase w-56">TOTAL (₹)</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {(formData.items || []).map((item, idx) => (
                        <TableRow key={item.id} className="h-28 border-b border-slate-100 hover:bg-slate-50/30 transition-colors group">
                           <TableCell className="px-6 text-center text-lg font-display font-black text-slate-200 border-r">{(idx + 1)}</TableCell>
                           <TableCell className="border-r p-0">
                              <div className="flex flex-col h-full min-h-[110px]">
                                <Select value={item.productId ?? ''} onValueChange={(pId) => {
                                   const p = products.find(x => x.id === pId);
                                   handleUpdateItem(idx, 'productId', pId);
                                   handleUpdateItem(idx, 'description', p?.name || '');
                                   handleUpdateItem(idx, 'hsn', p?.hsn || '');
                                   handleUpdateItem(idx, 'price', p?.saleRate || 0);
                                   handleUpdateItem(idx, 'unit', p?.uom || 'Nos');
                                   handleUpdateItem(idx, 'gstRate', p?.gstRate || 18);
                                }}>
                                   <SelectTrigger className="border-none bg-transparent h-12 font-black uppercase text-sm focus:ring-0 shadow-none px-6 text-[#001F3D] rounded-none">
                                      <SelectValue placeholder="Enter Product Identity..." />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-2xl shadow-2xl">
                                      {products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-3">{p.name}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                                <div className="px-6 pb-4 flex-1">
                                   <Textarea 
                                     placeholder="Item Note..." 
                                     className="min-h-[60px] bg-slate-50/50 border-none text-[10px] font-medium leading-relaxed resize-none rounded-xl p-3 focus-visible:ring-primary/20"
                                     value={item.note ?? ''}
                                     onChange={(e) => handleUpdateItem(idx, 'note', e.target.value)}
                                   />
                                </div>
                              </div>
                           </TableCell>
                           <TableCell className="border-r"><Input placeholder="HSN/SAC" className="border-none bg-transparent font-code text-sm text-center h-14" value={item.hsn ?? ''} onChange={(e)=>handleUpdateItem(idx, 'hsn', e.target.value)} /></TableCell>
                           <TableCell className="border-r"><Input placeholder="Qty." type="number" className="border-none bg-transparent text-center font-black text-lg h-14" value={item.qty ?? ''} onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r"><Input placeholder="UOM" className="border-none bg-transparent font-bold text-xs text-center h-14" value={item.unit ?? ''} onChange={(e)=>handleUpdateItem(idx, 'unit', e.target.value)} /></TableCell>
                           <TableCell className="border-r"><Input placeholder="Price" type="number" className="border-none bg-transparent text-center font-display font-black text-lg h-14" value={item.price ?? ''} onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r"><Input placeholder="0" type="number" className="border-none bg-transparent text-center font-bold text-sm h-14" value={item.discount ?? ''} onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r">
                              <Select value={(item.gstRate ?? 18).toString()} onValueChange={(v)=>handleUpdateItem(idx, 'gstRate', Number(v))}>
                                 <SelectTrigger className="border-none bg-transparent h-14 text-center font-bold text-sm shadow-none focus:ring-0 p-0"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                   {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell className="text-right px-10 font-display font-black text-[#001F3D] text-lg">{(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                           <TableCell className="text-center"><Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 rounded-xl" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                      
                      {/* YELLOW SUMMARY FOOTER PROTOCOL */}
                      <TableRow className="bg-[#FFFDE7] hover:bg-[#FFFDE7] border-t-2 border-[#001F3D]">
                         <TableCell colSpan={2} className="px-10 py-6 text-right font-black text-[12px] uppercase text-[#001F3D] border-r border-[#001F3D]/10">Total Quotation. Val</TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="text-center font-display font-black text-lg border-r border-[#001F3D]/10">{(formData.items || []).reduce((acc, i) => acc + (i.qty || 0), 0)}</TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="text-center font-display font-black text-lg border-r border-[#001F3D]/10">{(formData.items || []).reduce((acc, i) => acc + (i.price || 0), 0).toLocaleString()}</TableCell>
                         <TableCell className="text-center font-display font-black text-lg border-r border-[#001F3D]/10">{(formData.items || []).reduce((acc, i) => {
                            const base = (i.qty || 0) * (i.price || 0);
                            return acc + (i.discountType === 'percentage' ? (base * (i.discount || 0) / 100) : (i.discount || 0));
                         }, 0).toLocaleString()}</TableCell>
                         <TableCell className="text-center font-display font-black text-lg border-r border-[#001F3D]/10">---</TableCell>
                         <TableCell className="text-right px-10 font-display font-black text-2xl text-[#001F3D]">{totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                         <TableCell></TableCell>
                      </TableRow>
                   </TableBody>
                 </Table>
               </div>
            </Card>
          </div>

          {/* STEP 3: COMMERCIAL SETTLEMENT & REQUISITION */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-6">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm"><Calculator className="h-6 w-6" /></div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 03: Settlement Matrix & Totals</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Financial Node Selection</Label>
                    <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-6">
                      <div className="flex items-center gap-3"><Landmark className="h-4 w-4 text-emerald-600" /><h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Bank Details Matrix</h4></div>
                      <Select defaultValue="show">
                         <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold uppercase text-xs shadow-inner">
                            <SelectValue placeholder="Protocol: Bank Details Visibility" />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl shadow-2xl">
                            <SelectItem value="show" className="text-[10px] font-bold uppercase py-3">SHOW BANK DETAILS (HDFC PRIMARY)</SelectItem>
                            <SelectItem value="hide" className="text-[10px] font-bold uppercase py-3">HIDE BANK DETAILS FROM PRINT</SelectItem>
                         </SelectContent>
                      </Select>
                    </Card>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Terms & Condition / Additional Note</Label>
                    <Card className="p-10 bg-white border-slate-200 shadow-sm rounded-[2.5rem] space-y-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Protocol Title</Label>
                          <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase shadow-inner" placeholder="Enter Note Heading..." />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Detail Matrix</Label>
                          <Textarea 
                            className="min-h-[160px] bg-slate-50 border-none rounded-2xl text-[11px] font-medium leading-relaxed shadow-inner focus-visible:ring-primary/20" 
                            value={formData.terms ?? ""} 
                            onChange={(e) => setFormData({...formData, terms: e.target.value})} 
                          />
                       </div>
                       <Button variant="ghost" className="text-primary font-black text-[9px] uppercase tracking-widest gap-3 h-10 px-6 rounded-xl hover:bg-primary/5">
                          <Plus className="h-3 w-3" /> Append Additional Note Protocol
                       </Button>
                    </Card>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Document Note / Remarks (Internal)</Label>
                    <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-6">
                       <Textarea 
                         placeholder="Enter internal management remarks here..." 
                         className="min-h-[100px] bg-slate-50 border-none rounded-2xl text-xs font-medium resize-none shadow-inner" 
                         value={formData.note ?? ""} 
                         onChange={(e)=>setFormData({...formData, note: e.target.value})}
                       />
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">* Note: This matrix is suppressed on final print protocol.</p>
                    </Card>
                 </div>
              </div>

              {/* CONSOLIDATED SUMMARY NODE */}
              <div className="lg:col-span-5">
                 <Card className="p-12 bg-white border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] relative overflow-hidden flex flex-col gap-10">
                    <div className="space-y-8">
                       <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Taxable Matrix Yield</span>
                          <span className="text-xl font-display font-black text-slate-900">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>

                       <div className="space-y-4">
                          <button className="text-primary font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:opacity-80">
                             <Plus className="h-3 w-3" /> Add Additional Charge Protocol
                          </button>
                          <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                             <span className="text-[10px] font-black uppercase text-slate-500">Total Taxable Value</span>
                             <span className="text-lg font-display font-black text-slate-900">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase text-slate-500">Aggregate GST Node</span>
                             <span className="text-lg font-display font-black text-slate-900">₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-[1fr_120px_140px] items-center gap-4 py-4 border-y border-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400">TCS Protocol</span>
                          <Select defaultValue="+">
                             <SelectTrigger className="h-10 bg-slate-50 border-none rounded-lg font-black text-xs text-center"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-xl"><SelectItem value="+">+</SelectItem><SelectItem value="-">-</SelectItem></SelectContent>
                          </Select>
                          <div className="relative group">
                            <Input type="number" className="h-10 bg-slate-50 border-none rounded-lg text-right pr-10 font-bold" value={formData.tcsRate ?? 0} onChange={(e)=>setFormData({...formData, tcsRate: Number(e.target.value), tcsAmount: (totals.subTotal * Number(e.target.value) / 100)})} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">%</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-[1fr_120px_140px] items-center gap-4 py-4 border-b border-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400">Extra Discount</span>
                          <Select defaultValue="-">
                             <SelectTrigger className="h-10 bg-slate-50 border-none rounded-lg font-black text-xs text-center"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-xl"><SelectItem value="-">-</SelectItem><SelectItem value="+">+</SelectItem></SelectContent>
                          </Select>
                          <div className="relative group">
                            <Input type="number" className="h-10 bg-slate-50 border-none rounded-lg text-right pr-10 font-bold" value={formData.discountTotal ?? 0} onChange={(e)=>setFormData({...formData, discountTotal: Number(e.target.value)})} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">Rs</span>
                          </div>
                       </div>

                       <div className="flex justify-between items-center bg-[#FFFDE7] p-8 -mx-12 border-y-2 border-[#001F3D] shadow-inner">
                          <div className="flex items-center gap-6 ml-12">
                             <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-[#001F3D] tracking-[0.3em]">Grand Valuation</span>
                                <div className="flex items-center gap-3"><Switch checked={formData.isRoundOffActive} onCheckedChange={(v)=>setFormData({...formData, isRoundOffActive: v})} /><span className="text-[8px] font-bold uppercase text-slate-400">Round Off Protocol</span></div>
                             </div>
                          </div>
                          <span className="text-5xl font-display font-black text-[#001F3D] tracking-tighter mr-12">₹ {Math.round(totals.grandTotal).toLocaleString()}</span>
                       </div>

                       <div className="pt-6 space-y-4">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">Linguistic Transcription</p>
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                             <p className="text-[11px] font-black text-[#001F3D] uppercase leading-tight text-center">{numberToWords(Math.round(totals.grandTotal))}</p>
                          </div>
                       </div>
                       
                       <div className="space-y-3 pt-6">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Smart Suggestion</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20"><Plus className="h-3 w-3" /></Button>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-[9px] font-bold text-primary uppercase text-center tracking-[0.1em]">
                             Institutional Intelligence: Analysis Complete
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-4 pt-10 border-t border-slate-50">
                       <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] text-slate-400" onClick={() => setIsRecordFormOpen(false)}>Back to Ledger</Button>
                       <Button className="flex-[2] h-14 bg-[#10b981] hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 flex gap-3" onClick={handleSave}>
                          <Save className="h-4 w-4" /> Commit Protocol
                       </Button>
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
        <div className="space-y-8">
          <header className="flex justify-between items-end gap-4 px-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
                <Calculator className="h-4 w-4" />
                Financial Management Hub
              </div>
              <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Quotation Ledger</h2>
            </div>
            <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 group" onClick={() => handleOpenForm(activeTab)}>
              <Plus className="h-4 w-4" /> Initialize Quotation <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
             <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Conversion Rate</p>
                <div className="flex items-center justify-between"><p className="text-4xl font-display font-black text-blue-600">68%</p><TrendingUp className="h-6 w-6 text-blue-100" /></div>
             </Card>
             <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-emerald-500 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">MTD Quote Value</p>
                <div className="flex items-center justify-between"><p className="text-3xl font-display font-black text-slate-900">₹ {(filteredRecords.reduce((acc, r) => acc + (r.amount || 0), 0) / 100000).toFixed(1)}L</p><Calculator className="h-6 w-6 text-emerald-100" /></div>
             </Card>
             <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-amber-500 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Average Aging</p>
                <div className="flex items-center justify-between"><p className="text-3xl font-display font-black text-amber-500">12 Days</p><History className="h-6 w-6 text-amber-100" /></div>
             </Card>
          </div>

          <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2.5rem]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Filter matrix..." className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase shadow-sm" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
               </div>
               <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-10 px-6 uppercase tracking-widest rounded-xl shadow-sm">{filteredRecords.length} Active Records</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-10 py-6 font-bold text-[10px] uppercase text-slate-400">Doc Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer Account</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase text-slate-400">Net Valuation (₹)</TableHead>
                    <TableHead className="text-center font-bold text-[10px] uppercase text-slate-400">Lifecycle State</TableHead>
                    <TableHead className="text-right px-10 w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(r => (
                    <TableRow key={r.id} className="h-24 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => handleOpenForm(activeTab, r)}>
                      <TableCell className="px-10 font-bold text-xs text-primary font-code">{r.number}</TableCell>
                      <TableCell><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{r.customerName}</span></TableCell>
                      <TableCell className="text-right font-display font-black text-lg">₹ {r.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className="text-[9px] font-black uppercase px-5 py-1.5 rounded-full border-slate-100 bg-slate-50 shadow-sm">{r.status}</Badge></TableCell>
                      <TableCell className="text-right px-10">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-slate-100"><ChevronRight className="h-5 w-5 text-slate-400" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-20 py-10">
                          <Archive className="h-16 w-16 mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest">No Quotation Records Discovered</p>
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
