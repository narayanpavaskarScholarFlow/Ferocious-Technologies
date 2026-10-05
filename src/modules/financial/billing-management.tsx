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
    challanNo: '',
    challanDate: '', 
    lrNo: '',
    deliveryMode: '',
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
        challanNo: '',
        challanDate: '',
        lrNo: '',
        deliveryMode: '',
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
    const handleUpdateField = (field: keyof BillingRecord, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const totals = useMemo(() => {
      const items = formData.items || [];
      const subTotal = items.reduce((acc, i) => acc + (i.total || 0), 0);
      const taxTotal = items.reduce((acc, i) => acc + ((i.total || 0) * (i.gstRate || 0) / 100), 0);
      const discountTotal = Number(formData.discountTotal) || 0;
      const tcsAmount = Number(formData.tcsAmount) || 0;
      const extraCharges = Number(formData.transportationCharges) || 0;

      let grandTotal = subTotal + taxTotal + tcsAmount + extraCharges - discountTotal;
      if (formData.isRoundOffActive) grandTotal = Math.round(grandTotal);

      return { subTotal, taxTotal, grandTotal, discountTotal, tcsAmount };
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
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-12 w-12 hover:bg-slate-100">
              <ArrowLeft className="h-6 w-6 text-slate-500" />
            </Button>
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-1">
                 <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5">QUOTATION_LEDGER</Badge>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entry Node</span>
               </div>
               <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase leading-none">{formData.type} Editor</h2>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-12 px-8 font-bold uppercase text-[10px] tracking-widest border-slate-200" onClick={() => setIsRecordFormOpen(false)}>Back</Button>
             <Button className="bg-[#10b981] hover:bg-emerald-600 text-white h-12 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-3" onClick={handleSave}>
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
             <Button className="bg-[#001F3D] hover:bg-black text-white h-12 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Check className="h-4 w-4 mr-2" /> Save Protocol
             </Button>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto w-full p-8 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-sm"><FileCheck className="h-6 w-6" /></div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 01: Identification & Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                <div className="flex justify-between items-center px-1">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Customer Information</h4>
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-slate-50"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
                
                <div className="space-y-4">
                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">M/S.*</Label>
                      <Select value={formData.customerId ?? ''} onValueChange={(id) => {
                         const c = customers.find(x => x.id === id);
                         setFormData(prev => ({ 
                           ...prev, 
                           customerId: id, 
                           customerName: c?.name || '', 
                           gstNumber: c?.gstNumber || '', 
                           contactPerson: c?.contactPerson || '', 
                           phoneNo: c?.contactNumber || '', 
                           address: c?.address || '',
                           placeOfSupply: c?.city || ''
                         }));
                      }}>
                         <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs">
                            <SelectValue placeholder="Identify Institutional Account..." />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl shadow-2xl">
                            {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-2">{c.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-start gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase pt-2">Address</Label>
                      <Textarea className="min-h-[80px] bg-slate-50 border-none rounded-xl text-xs font-medium resize-none shadow-inner" value={formData.address ?? ''} readOnly />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Contact Person</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs" value={formData.contactPerson ?? ''} readOnly />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Phone No</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs" value={formData.phoneNo ?? ''} readOnly />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">GSTIN / PAN</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold font-code text-xs uppercase" value={formData.gstNumber ?? ''} readOnly />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Rev. Charge</Label>
                      <Select value={formData.revCharge ?? 'No'} onValueChange={(v)=>handleUpdateField('revCharge', v)}>
                        <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl"><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Ship To</Label>
                      <Select defaultValue="--">
                        <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl"><SelectItem value="--">--</SelectItem></SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase text-xs">Distance for e-way bill (in km)</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs" value={formData.distanceEWay ?? ''} onChange={(e)=>handleUpdateField('distanceEWay', e.target.value)} />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Place of Supply*</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs" value={formData.placeOfSupply ?? ''} onChange={(e)=>handleUpdateField('placeOfSupply', e.target.value)} />
                   </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                <div className="flex justify-between items-center px-1">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Quotation Detail</h4>
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-slate-50"><RotateCcw className="h-4 w-4 text-slate-400" /></Button>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Type</Label>
                      <Select defaultValue="Standard">
                        <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs"><SelectValue placeholder="Standard" /></SelectTrigger>
                        <SelectContent className="rounded-xl"><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Export">Export</SelectItem></SelectContent>
                      </Select>
                   </div>

                   <div className="grid grid-cols-[120px_1fr_120px_200px] items-center gap-x-6 gap-y-4">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Quotation No.*</Label>
                      <div className="col-span-1 flex items-center gap-2">
                        <div className="bg-slate-100 text-[10px] font-bold text-slate-400 px-3 py-2 rounded-lg">Prefix</div>
                        <Input readOnly className="h-10 bg-slate-50 border-none rounded-xl font-bold font-code text-center flex-1" value={formData.number?.split('-')[1] || '1'} />
                        <div className="bg-slate-100 text-[10px] font-bold text-slate-400 px-3 py-2 rounded-lg">Postfix</div>
                      </div>
                      <Label className="text-[11px] font-bold text-slate-500 uppercase text-right">Quotation Date*</Label>
                      <DatePicker value={formData.date ?? ''} onChange={(val)=>setFormData(prev => ({...prev, date: val}))} className="h-10 rounded-xl" />
                   </div>

                   <div className="grid grid-cols-[120px_1fr_120px_200px] items-center gap-x-6 gap-y-4">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Challan No.</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs" value={formData.challanNo ?? ''} onChange={(e)=>handleUpdateField('challanNo', e.target.value)} />
                      <Label className="text-[11px] font-bold text-slate-500 uppercase text-right">Challan Date</Label>
                      <Input placeholder="dd/mm/yy" className="h-10 bg-slate-50 border-none rounded-xl text-center text-xs" value={formData.challanDate ?? ''} onChange={(e)=>handleUpdateField('challanDate', e.target.value)} />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">L.R. No.</Label>
                      <Input className="h-10 bg-slate-50 border-none rounded-xl font-bold text-xs" value={formData.lrNo ?? ''} onChange={(e)=>handleUpdateField('lrNo', e.target.value)} />
                   </div>

                   <div className="grid grid-cols-[120px_1fr] items-center gap-6 pt-6 border-t border-slate-50">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase">Delivery</Label>
                      <Select value={formData.deliveryMode ?? ''} onValueChange={(v)=>handleUpdateField('deliveryMode', v)}>
                        <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs"><SelectValue placeholder="Select Delivery Mode" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {['Direct', 'Courier', 'Hand Delivery', 'Self Pickup'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                   </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-l-4 border-accent pl-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent shadow-sm"><Box className="h-6 w-6" /></div>
                <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 02: Execution Matrix</h3>
              </div>
              <div className="flex items-center gap-6">
                 <Button variant="ghost" onClick={addRow} className="text-primary font-black text-[10px] uppercase tracking-widest gap-2 bg-white border shadow-sm h-11 px-6 rounded-xl">
                    <Plus className="h-4 w-4" /> Add Product Node
                 </Button>
              </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden">
               <div className="overflow-x-auto">
                 <Table className="min-w-[1600px]">
                   <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="px-6 py-6 text-[9px] font-black uppercase w-16 text-center border-r">SR.</TableHead>
                        <TableHead className="text-[9px] font-black uppercase min-w-[400px] border-r">PRODUCT IDENTITY & NOTES</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-32 text-center border-r">HSN CODE</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-24 text-center border-r">QTY.</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-24 text-center border-r">UOM</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-40 text-center border-r">RATE (₹)</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-28 text-center border-r">DISC.</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-28 text-center border-r">IGST %</TableHead>
                        <TableHead className="text-right px-10 text-[9px] font-black uppercase w-48">TOTAL (₹)</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {(formData.items || []).map((item, idx) => (
                        <TableRow key={item.id} className="h-24 border-b border-slate-100 hover:bg-slate-50/30">
                           <TableCell className="text-center font-display font-black text-slate-300 border-r">{idx + 1}</TableCell>
                           <TableCell className="border-r p-0">
                              <div className="flex flex-col h-full">
                                <Select value={item.productId ?? ''} onValueChange={(pId) => {
                                   const p = products.find(x => x.id === pId);
                                   handleUpdateItem(idx, 'productId', pId);
                                   handleUpdateItem(idx, 'description', p?.name || '');
                                   handleUpdateItem(idx, 'hsn', p?.hsn || '');
                                   handleUpdateItem(idx, 'price', p?.saleRate || 0);
                                   handleUpdateItem(idx, 'unit', p?.uom || 'Nos');
                                   handleUpdateItem(idx, 'gstRate', p?.gstRate || 18);
                                }}>
                                   <SelectTrigger className="border-none bg-transparent h-12 font-black uppercase text-xs focus:ring-0 shadow-none px-6 text-[#001F3D]">
                                      <SelectValue placeholder="Select Product Node..." />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-xl shadow-2xl">
                                      {products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-2">{p.name}</SelectItem>)}
                                   </SelectContent>
                                </Select>
                                <div className="px-6 pb-2">
                                   <Input placeholder="Technical Notes..." className="h-8 bg-slate-50/50 border-none text-[10px] rounded-lg" value={item.note ?? ''} onChange={(e) => handleUpdateItem(idx, 'note', e.target.value)} />
                                </div>
                              </div>
                           </TableCell>
                           <TableCell className="border-r"><Input className="border-none bg-transparent text-center font-code text-[11px]" value={item.hsn ?? ''} onChange={(e)=>handleUpdateItem(idx, 'hsn', e.target.value)} /></TableCell>
                           <TableCell className="border-r"><Input type="number" className="border-none bg-transparent text-center font-black text-sm" value={item.qty ?? ''} onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r"><Input className="border-none bg-transparent text-center font-bold text-[10px]" value={item.unit ?? ''} onChange={(e)=>handleUpdateItem(idx, 'unit', e.target.value)} /></TableCell>
                           <TableCell className="border-r"><Input type="number" className="border-none bg-transparent text-center font-display font-black text-sm" value={item.price ?? ''} onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r"><Input type="number" className="border-none bg-transparent text-center font-bold text-xs" value={item.discount ?? ''} onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r">
                              <Select value={(item.gstRate ?? 18).toString()} onValueChange={(v)=>handleUpdateItem(idx, 'gstRate', Number(v))}>
                                 <SelectTrigger className="border-none bg-transparent h-10 text-center font-bold text-[11px] shadow-none focus:ring-0 p-0"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                   {[0, 5, 12, 18, 28].map(r => <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell className="text-right px-10 font-display font-black text-slate-900 text-sm">₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                           <TableCell className="text-center"><Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 rounded-xl" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-[#FFFDE7] hover:bg-[#FFFDE7] border-t-2 border-[#001F3D]">
                         <TableCell colSpan={2} className="px-10 py-5 text-right font-black text-[11px] uppercase text-[#001F3D] border-r">Total Quotation. Val</TableCell>
                         <TableCell className="border-r"></TableCell>
                         <TableCell className="text-center font-display font-black text-sm border-r">{(formData.items || []).reduce((acc, i) => acc + (i.qty || 0), 0)}</TableCell>
                         <TableCell className="border-r"></TableCell>
                         <TableCell className="border-r"></TableCell>
                         <TableCell className="border-r"></TableCell>
                         <TableCell className="border-r"></TableCell>
                         <TableCell className="text-right px-10 font-display font-black text-xl text-[#001F3D]">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                         <TableCell></TableCell>
                      </TableRow>
                   </TableBody>
                 </Table>
               </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             <div className="lg:col-span-7 space-y-8">
                <Card className="p-10 bg-white border-slate-200 shadow-xl rounded-[2.5rem] space-y-8">
                   <h4 className="text-xs font-black uppercase text-[#001F3D] tracking-widest border-l-4 border-primary pl-4">Terms & Requisition</h4>
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Standard Terms Matrix</Label>
                      <Textarea className="min-h-[140px] bg-slate-50 border-none rounded-2xl text-xs font-medium leading-relaxed shadow-inner" value={formData.terms ?? ""} onChange={(e)=>handleUpdateField('terms', e.target.value)} />
                   </div>
                </Card>
             </div>
             <div className="lg:col-span-5">
                <Card className="p-12 bg-white border-slate-200 shadow-2xl rounded-[3rem] space-y-8 relative overflow-hidden">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-slate-400">Taxable Value</span><span className="text-sm font-display font-black text-slate-900">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-slate-400">Aggregate GST Node</span><span className="text-sm font-display font-black text-slate-900">₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                         <div className="flex items-center gap-3"><Switch checked={formData.isRoundOffActive} onCheckedChange={(v)=>handleUpdateField('isRoundOffActive', v)} /><span className="text-[9px] font-black uppercase text-slate-500">Round Off Protocol</span></div>
                         <span className="text-3xl font-display font-black text-[#001F3D]">₹ {Math.round(totals.grandTotal).toLocaleString()}</span>
                      </div>
                      
                      <div className="pt-6 space-y-2">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Transcription</p>
                         <p className="text-[10px] font-black text-[#001F3D] uppercase text-center bg-slate-50 p-4 rounded-xl">{numberToWords(Math.round(totals.grandTotal))}</p>
                      </div>
                   </div>
                   <Button className="w-full h-16 bg-[#10b981] hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-500/20" onClick={handleSave}>
                      Finalize & Commit Ledger
                   </Button>
                </Card>
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
            <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3 group" onClick={() => handleOpenForm('quotation')}>
              <Plus className="h-4 w-4" /> Initialize Quotation <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
             <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-primary transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Conversion Rate</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-display font-black text-blue-600">68%</p>
                  <TrendingUp className="h-6 w-6 text-blue-100" />
                </div>
             </Card>
             <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-emerald-500 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">MTD Quote Value</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-display font-black text-slate-900">₹ {(filteredRecords.reduce((acc, r) => acc + (r.amount || 0), 0) / 100000).toFixed(1)}L</p>
                  <Calculator className="h-6 w-6 text-emerald-100" />
                </div>
             </Card>
             <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-amber-500 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Average Aging</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-display font-black text-amber-500">12 Days</p>
                  <History className="h-6 w-6 text-amber-100" />
                </div>
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
                  <TableRow>
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
