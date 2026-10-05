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
  Archive
} from 'lucide-react';
import { Customer, BillingRecord, ProductMaster, BillingLineItem } from '@/lib/types';
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
    id: '', type: activeTab, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Draft', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '',
    placeOfSupply: '', shipTo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    referenceNumber: '', challanDate: '', revCharge: 'No', distanceEWay: ''
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
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `${type === 'quotation' ? 'QT' : 'INV'}-${(records.length + 1001)}`, status: 'Draft', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, roundOff: 0,
        revCharge: 'No', placeOfSupply: '', shipTo: '', distanceEWay: ''
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
    const totals = useMemo(() => {
      const items = formData.items || [];
      const subTotal = items.reduce((acc, i) => acc + (i.total || 0), 0);
      const taxTotal = items.reduce((acc, i) => acc + ((i.total || 0) * (i.gstRate || 0) / 100), 0);
      const grandTotal = subTotal + taxTotal;
      return { subTotal, taxTotal, grandTotal };
    }, [formData.items]);

    const handleUpdateItem = (idx: number, field: keyof BillingLineItem, value: any) => {
      const newItems = [...(formData.items || [])];
      newItems[idx] = { ...newItems[idx], [field]: value };
      const item = newItems[idx];
      const baseTotal = (item.qty || 0) * (item.price || 0);
      const discount = item.discountType === 'percentage' ? (baseTotal * (item.discount || 0) / 100) : (item.discount || 0);
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
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-300 font-body">
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
            <div className="flex flex-col">
               <h2 className="text-xl font-display font-bold text-slate-900 uppercase leading-none">Create {formData.type}</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Billing Matrix</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Back</Button>
             <Button className="bg-[#001F3D] hover:bg-black text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Save className="h-4 w-4 mr-2" /> Save Protocol
             </Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Printer className="h-4 w-4 mr-2" /> Save & Print
             </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-[1500px] mx-auto w-full p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl relative">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em]">Customer Information</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4 text-slate-300" /></Button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">M/S.<span className="text-red-500 ml-1">*</span></Label>
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
                         shipTo: '--',
                         placeOfSupply: (c as any)?.city || ''
                       });
                    }}>
                       <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs">
                          <SelectValue placeholder="Identify Account..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl shadow-2xl">
                          {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-2">{c.name}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-start gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500 pt-3">Address</Label>
                    <Textarea className="min-h-[100px] bg-slate-50 border-none rounded-xl text-xs font-medium resize-none shadow-inner" value={formData.address ?? ''} readOnly />
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Contact Person</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.contactPerson ?? ''} onChange={(e)=>setFormData({...formData, contactPerson: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Phone No</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold shadow-inner" value={formData.phoneNo ?? ''} onChange={(e)=>setFormData({...formData, phoneNo: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">GSTIN / PAN</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase font-code shadow-inner" value={formData.gstNumber ?? ''} onChange={(e)=>setFormData({...formData, gstNumber: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Rev. Charge</Label>
                    <Select value={formData.revCharge ?? 'No'} onValueChange={(v: any) => setFormData({...formData, revCharge: v})}>
                       <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs shadow-inner"><SelectValue /></SelectTrigger>
                       <SelectContent className="rounded-xl"><SelectItem value="No">No</SelectItem><SelectItem value="Yes">Yes</SelectItem></SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Ship To</Label>
                    <Select value={formData.shipTo ?? '--'} onValueChange={(v)=>setFormData({...formData, shipTo: v})}>
                       <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs shadow-inner"><SelectValue /></SelectTrigger>
                       <SelectContent className="rounded-xl"><SelectItem value="--">--</SelectItem></SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500 leading-tight">Distance for e-way<br/>bill (in km)</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold text-center shadow-inner" value={formData.distanceEWay ?? ''} onChange={(e)=>setFormData({...formData, distanceEWay: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Place of Supply<span className="text-red-500 ml-1">*</span></Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner" value={formData.placeOfSupply ?? ''} onChange={(e)=>setFormData({...formData, placeOfSupply: e.target.value})} />
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-10">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em]">Document Details</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Doc Number<span className="text-red-500 ml-1">*</span></Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code text-primary shadow-inner" value={formData.number ?? ''} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Doc Date</Label>
                    <DatePicker value={formData.date ?? ''} onChange={(val)=>setFormData({...formData, date: val})} className="h-12" />
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Reference Number</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs shadow-inner" value={formData.referenceNumber ?? ''} onChange={(e)=>setFormData({...formData, referenceNumber: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Valid Until</Label>
                    <DatePicker value={formData.challanDate ?? ''} onChange={(val)=>setFormData({...formData, challanDate: val})} className="h-12" />
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Sales Executive</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold opacity-60 shadow-inner" value={currentUser || ''} disabled />
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-black uppercase text-slate-500">Operational State</Label>
                    <Select value={formData.status ?? 'Draft'} onValueChange={(v)=>setFormData({...formData, status: v})}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-[10px] shadow-inner"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl">
                        {['Draft', 'Authorized', 'Paid', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-sm"><Box className="h-5 w-5" /></div>
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em]">Product Execution Matrix</h3>
                  </div>
                  <Button onClick={addRow} variant="ghost" size="sm" className="text-primary gap-2 font-black text-[10px] uppercase hover:bg-primary/5 rounded-xl px-6 h-10">
                    <PlusCircle className="h-4 w-4" /> Append Row
                  </Button>
               </div>
               <div className="overflow-x-auto">
                 <Table className="min-w-[1400px]">
                   <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="px-6 py-6 text-[9px] font-black uppercase w-16 text-center border-r">SR</TableHead>
                        <TableHead className="text-[9px] font-black uppercase min-w-[300px] border-r">PRODUCT / SERVICE IDENTITY</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-32 text-center border-r">HSN/SAC</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-24 text-center border-r">QTY</TableHead>
                        <TableHead className="text-[9px] font-black uppercase w-24 text-center border-r">UOM</TableHead>
                        <TableHead className="text-right text-[9px] font-black uppercase w-40 border-r">RATE (₹)</TableHead>
                        <TableHead className="text-center text-[9px] font-black uppercase w-28 border-r">DISC %</TableHead>
                        <TableHead className="text-center text-[9px] font-black uppercase w-28 border-r">GST %</TableHead>
                        <TableHead className="text-right px-10 text-[9px] font-black uppercase w-48">TOTAL (₹)</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {(formData.items || []).map((item, idx) => (
                        <TableRow key={item.id} className="h-20 border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                           <TableCell className="px-6 text-center text-[11px] font-black text-slate-300 border-r">{(idx + 1).toString().padStart(2, '0')}</TableCell>
                           <TableCell className="border-r">
                              <Select value={item.productId ?? ''} onValueChange={(pId) => {
                                 const p = products.find(x => x.id === pId);
                                 handleUpdateItem(idx, 'productId', pId);
                                 handleUpdateItem(idx, 'description', p?.name || '');
                                 handleUpdateItem(idx, 'hsn', p?.hsn || '');
                                 handleUpdateItem(idx, 'price', p?.saleRate || 0);
                                 handleUpdateItem(idx, 'unit', p?.uom || 'Nos');
                                 handleUpdateItem(idx, 'gstRate', p?.gstRate || 18);
                              }}>
                                 <SelectTrigger className="border-none bg-transparent h-12 font-bold uppercase text-[11px] focus:ring-0 shadow-none p-0 text-slate-900"><SelectValue placeholder="Select Item Node..." /></SelectTrigger>
                                 <SelectContent className="rounded-xl shadow-2xl">
                                    {products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-3">{p.name}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell className="border-r"><Input className="border-none bg-transparent font-code text-[11px] text-center h-12 p-0" value={item.hsn ?? ''} onChange={(e)=>handleUpdateItem(idx, 'hsn', e.target.value)} /></TableCell>
                           <TableCell className="border-r"><Input type="number" className="border-none bg-transparent text-center font-black text-[12px] h-12 p-0" value={item.qty ?? ''} onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r"><Input className="border-none bg-transparent font-bold text-[11px] text-center h-12 p-0" value={item.unit ?? ''} onChange={(e)=>handleUpdateItem(idx, 'unit', e.target.value)} /></TableCell>
                           <TableCell className="border-r"><Input type="number" className="border-none bg-transparent text-right font-display font-black text-[12px] h-12 p-0 pr-4" value={item.price ?? ''} onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r"><Input type="number" className="border-none bg-transparent text-center font-bold text-[11px] h-12 p-0" value={item.discount ?? ''} onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))} /></TableCell>
                           <TableCell className="border-r">
                              <Select value={(item.gstRate ?? 18).toString()} onValueChange={(v)=>handleUpdateItem(idx, 'gstRate', Number(v))}>
                                 <SelectTrigger className="border-none bg-transparent h-12 text-center font-bold text-[11px] shadow-none focus:ring-0 p-0"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                   {[0, 5, 12, 18, 28].map(r => (
                                     <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>
                                   ))}
                                 </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell className="text-right px-10 font-display font-black text-slate-900 text-sm">₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                           <TableCell className="text-center"><Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 rounded-xl" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                 </Table>
               </div>
               <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                  <Button variant="ghost" onClick={addRow} className="text-primary font-black text-[10px] uppercase gap-2 hover:bg-primary/5 px-6 rounded-xl h-12"><Plus className="h-4 w-4" /> Append Product Row</Button>
                  <div className="flex items-center gap-10">
                     <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Item Count</p><span className="text-lg font-display font-black text-slate-900">{formData.items?.length || 0}</span></div>
                     <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Total Yield</p><span className="text-lg font-display font-black text-primary">₹ {totals.subTotal.toLocaleString()}</span></div>
                  </div>
               </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                 <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3"><Landmark className="h-4 w-4 text-emerald-600" /><h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Bank Settlement Matrix</h4></div>
                    <div className="grid grid-cols-2 gap-10 bg-slate-50 p-6 rounded-2xl text-[11px] text-slate-600 shadow-inner">
                       <div className="space-y-1.5"><p className="font-black text-slate-900 uppercase">HDFC BANK</p><p className="font-code">A/C: 50100012345678</p></div>
                       <div className="space-y-1.5"><p className="font-black text-slate-900 uppercase">IFSC: HDFC0001234</p><p className="uppercase">IND. ESTATE BRANCH</p></div>
                    </div>
                 </Card>

                 <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-[2rem] space-y-6">
                    <div className="flex justify-between items-center">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-l-4 border-blue-600 pl-4">Terms & Conditions</h4>
                       <Button variant="ghost" size="sm" className="text-[8px] font-bold uppercase h-8 px-4 border rounded-lg">Reset Template</Button>
                    </div>
                    <Textarea className="min-h-[140px] bg-slate-50 border-none rounded-2xl text-[11px] font-medium leading-relaxed shadow-inner" value={formData.terms ?? "1. Standard terms of trade apply.\n2. Subject to institutional jurisdiction.\n3. Validity: 30 Days."} onChange={(e) => setFormData({...formData, terms: e.target.value})} />
                 </Card>
              </div>

              <Card className="lg:col-span-5 p-12 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden h-fit">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '50px 50px' }} />
                 <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6"><h4 className="text-xs font-black uppercase text-primary tracking-[0.3em]">Protocol Summary</h4><Badge className="bg-primary/20 text-primary border-none text-[8px] font-black px-3 py-1">CERTIFIED_CALC</Badge></div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase"><span>Taxable Matrix Yield</span><span>₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                       <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase"><span>Aggregate GST Node</span><span>₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                       
                       <div className="h-px bg-white/10 my-8" />
                       
                       <div className="flex justify-between items-end">
                          <div className="space-y-1.5">
                             <span className="text-[10px] font-black uppercase text-primary tracking-widest">Grand Valuation</span>
                             <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] italic">Institutional Final Node</p>
                          </div>
                          <span className="text-6xl font-display font-black tracking-tighter">₹ {Math.round(totals.grandTotal).toLocaleString()}</span>
                       </div>

                       <div className="pt-10 space-y-4">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Linguistic Transcription</p>
                          <p className="text-[11px] font-black text-primary uppercase leading-tight bg-white/5 p-4 rounded-2xl border border-white/5">{numberToWords(Math.round(totals.grandTotal))}</p>
                       </div>
                    </div>
                 </div>
              </Card>
           </div>
          </div>
        </ScrollArea>
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
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
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
