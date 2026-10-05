
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Save, 
  Search, 
  Printer, 
  ArrowLeft, 
  Box, 
  Receipt,
  ShoppingCart,
  PackageCheck,
  Building2,
  Landmark,
  User,
  PlusCircle,
  Link2,
  TableProperties,
  Calculator,
  Settings,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { Customer, BillingRecord, Order, SystemUser, ProductMaster, BillingLineItem } from '@/lib/types';
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
    placeOfSupply: '', shipTo: '', contactPerson: '', phoneNo: '', gstNumber: ''
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
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, roundOff: 0
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
      const subTotal = items.reduce((acc, i) => acc + i.total, 0);
      const taxTotal = items.reduce((acc, i) => acc + (i.total * i.gstRate / 100), 0);
      const grandTotal = subTotal + taxTotal;
      return { subTotal, taxTotal, grandTotal };
    }, [formData.items]);

    const handleUpdateItem = (idx: number, field: keyof BillingLineItem, value: any) => {
      const newItems = [...(formData.items || [])];
      newItems[idx] = { ...newItems[idx], [field]: value };
      const item = newItems[idx];
      const baseTotal = item.qty * item.price;
      const discount = item.discountType === 'percentage' ? (baseTotal * item.discount / 100) : item.discount;
      item.total = baseTotal - discount;
      setFormData({ ...formData, items: newItems });
    };

    const addRow = () => {
      const newItem: BillingLineItem = { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 };
      setFormData({ ...formData, items: [...(formData.items || []), newItem] });
    };

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-300 font-body">
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
            <div className="flex flex-col">
               <h2 className="text-xl font-display font-bold text-slate-900 uppercase leading-none">{formData.type} Entry</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Professional GST Management</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Cancel</Button>
             <Button className="bg-[#001F3D] hover:bg-black text-white h-10 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-2" onClick={handleSave}>
               <Save className="h-4 w-4" /> Save Record
             </Button>
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto w-full p-6 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-7 p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-slate-500">Customer Name *</Label>
                       <Select value={formData.customerId} onValueChange={(id) => {
                          const c = customers.find(x => x.id === id);
                          setFormData({ ...formData, customerId: id, customerName: c?.name || '', gstNumber: c?.gstNumber || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', shipTo: c?.address || '' });
                       }}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase text-xs shadow-inner"><SelectValue placeholder="Select Customer..." /></SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                             {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-3">{c.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">GSTIN</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.gstNumber} readOnly /></div>
                    <div className="space-y-2 md:col-span-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Address</Label><Textarea className="min-h-[80px] bg-slate-50 border-none rounded-xl text-xs font-medium" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>
                 </div>
              </Card>

              <Card className="lg:col-span-5 p-8 bg-white border-slate-200 shadow-sm rounded-2xl space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Document No.</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Document Date</Label><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-12" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Sales Executive</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={currentUser || ''} disabled /></div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-slate-500">Status</Label>
                       <Select value={formData.status} onValueChange={(v)=>setFormData({...formData, status: v})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                             {['Draft', 'Sent', 'Approved', 'Rejected'].map(s => <SelectItem key={s} value={s} className="text-xs font-bold uppercase">{s}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </Card>
           </div>

           <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest">Product Items</h3>
                 <Button onClick={addRow} variant="ghost" size="sm" className="text-primary gap-2 font-bold text-[10px] uppercase"><Plus className="h-3 w-3" /> Add Row</Button>
              </div>
              <Table>
                 <TableHeader className="bg-slate-50/80">
                    <TableRow>
                       <TableHead className="px-6 py-5 text-[9px] font-black uppercase w-16">Sr</TableHead>
                       <TableHead className="text-[9px] font-black uppercase">Product / Service</TableHead>
                       <TableHead className="text-[9px] font-black uppercase w-32">HSN/SAC</TableHead>
                       <TableHead className="text-[9px] font-black uppercase text-center w-24">Qty</TableHead>
                       <TableHead className="text-right text-[9px] font-black uppercase w-32">Rate (₹)</TableHead>
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
                         <TableCell><Input type="number" className="border-none bg-transparent text-right font-display font-bold text-xs" value={item.price} onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))} /></TableCell>
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
                    <Textarea className="min-h-[100px] bg-slate-50 border-none rounded-xl text-[10px] font-medium leading-relaxed" defaultValue="Standard terms apply. 30 days validity." />
                 </Card>
              </div>

              <Card className="lg:col-span-4 p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-3xl space-y-4 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase"><span>Sub Total</span><span>₹ {totals.subTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase"><span>Tax (GST)</span><span>₹ {totals.taxTotal.toLocaleString()}</span></div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-black uppercase text-primary mb-1">Grand Total</span>
                       <span className="text-4xl font-display font-black tracking-tighter">₹ {totals.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="pt-8">
                       <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Amount In Words</p>
                       <p className="text-[10px] font-black uppercase text-primary leading-tight">{numberToWords(totals.grandTotal)}</p>
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
          <header className="flex justify-between items-end gap-4 px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{activeTab === 'quotation' ? 'Quotation Ledger' : activeTab.replace('_', ' ')}</h2>
              <p className="text-xs text-muted-foreground font-medium">Professional Document Management Hub</p>
            </div>
            <Button className="h-12 bg-[#001F3D] text-white rounded-xl px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl flex gap-3" onClick={() => handleOpenForm(activeTab)}>
              <Plus className="h-4 w-4" /> Create New {activeTab}
            </Button>
          </header>

          <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2rem]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Filter ledger..." className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
               </div>
            </div>
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="px-10 py-6 font-bold text-[9px] uppercase text-slate-400">Doc No.</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400">Customer Account</TableHead>
                  <TableHead className="text-right font-bold text-[9px] uppercase text-slate-400">Total (₹)</TableHead>
                  <TableHead className="text-center font-bold text-[9px] uppercase text-slate-400">Status</TableHead>
                  <TableHead className="text-right px-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(r => (
                  <TableRow key={r.id} className="h-20 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => handleOpenForm(activeTab, r)}>
                    <TableCell className="px-10 font-bold text-xs text-primary font-code">{r.number}</TableCell>
                    <TableCell><span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{r.customerName}</span></TableCell>
                    <TableCell className="text-right font-display font-bold text-sm">₹ {r.amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline" className="text-[8px] font-bold uppercase px-3 py-1 rounded-full">{r.status}</Badge></TableCell>
                    <TableCell className="text-right px-10"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
