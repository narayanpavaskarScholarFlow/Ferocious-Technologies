
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
  RefreshCw,
  Send,
  MoreVertical,
  Copy,
  RotateCcw,
  Target,
  FileSpreadsheet,
  Users,
  X,
  PlusCircle,
  Eye,
  Info,
  Globe,
  Settings2,
  TableProperties
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser, PermissionLevel, UISettings, BillingLineItem, InventoryItem, ProductMaster, Machine } from '@/lib/types';
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
  isValid
} from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

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
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'invoice', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Draft', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0
  });

  const biMetrics = useMemo(() => {
    const relevantRecords = records.filter(r => r.type === activeTab);
    const totalCount = relevantRecords.length;
    const totalValue = relevantRecords.reduce((acc, r) => acc + (r.amount || 0), 0);
    const pending = relevantRecords.filter(r => ['Draft', 'Sent', 'Pending'].includes(r.status)).length;
    const approved = relevantRecords.filter(r => r.status === 'Approved' || r.status === 'Paid').length;
    const rejectedOrExpired = relevantRecords.filter(r => r.status === 'Rejected' || r.status === 'Expired').length;
    const converted = relevantRecords.filter(r => r.status.startsWith('Converted')).length;
    const conversionRate = totalCount > 0 ? Math.round((converted / totalCount) * 100) : 0;

    return { totalCount, totalValue, pending, approved, rejectedOrExpired, conversionRate };
  }, [records, activeTab]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isTab = r.type === activeTab;
      if (!isTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleOpenForm = (type: string, record?: BillingRecord) => {
    if (record) {
      setEditingRecordId(record.id);
      setFormData(record);
    } else {
      setEditingRecordId(null);
      const docType = DOCUMENT_TYPES.find(t=>t.id===type);
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `${docType?.prefix || 'DOC'}-${Math.floor(1000 + Math.random() * 9000)}`, status: 'Draft', 
        items: [{ id: '1', description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }],
        subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0, roundOff: 0, notes: '', terms: '', quotationId: '',
        placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
        revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) { 
      toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Document Number are mandatory." }); 
      return; 
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Ledger Synchronized", description: `${formData.type} committed to master matrix.` });
    setIsRecordFormOpen(false);
  };

  const handleDuplicate = (record: BillingRecord) => {
    const newRecord = { 
      ...record, 
      id: `REC-${Date.now()}`, 
      number: `${DOCUMENT_TYPES.find(t=>t.id===record.type)?.prefix || 'DOC'}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    onSaveRecord(newRecord);
    toast({ title: "Document Duplicated" });
  };

  const FullPageEditor = () => {
    const subTotal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0);
    }, [formData.items]);

    const taxTotal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0);
    }, [formData.items]);

    const grandTotal = useMemo(() => {
      let total = subTotal + taxTotal;
      total += (formData.additionalCharges || 0);
      total += (formData.tcsAmount || 0);
      total -= (formData.discountTotal || 0);
      return formData.isRoundOffActive ? Math.round(total) : total;
    }, [subTotal, taxTotal, formData.additionalCharges, formData.tcsAmount, formData.discountTotal, formData.isRoundOffActive]);

    return (
      <div className="flex flex-col bg-[#F8FAFC] min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-display font-bold uppercase">{editingRecordId ? 'Edit' : 'Create'} {activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-10 font-bold uppercase text-[9px]" onClick={() => setIsRecordFormOpen(false)}>Discard</Button>
             <Button className="bg-[#00E5A8] hover:bg-emerald-600 text-[#001F3D] h-10 px-8 rounded-xl text-[10px] uppercase font-black" onClick={handleSave}>
               <Printer className="h-4 w-4 mr-2" /> Save & Print
             </Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black" onClick={handleSave}>
               <Save className="h-4 w-4 mr-2" /> Save
             </Button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto w-full p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-8">
               <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest border-l-4 border-primary pl-4">Customer Details</h3>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Search Customer</Label>
                    <Select value={formData.customerId} onValueChange={(id) => { 
                      const c = customers.find(x => x.id === id); 
                      setFormData({ ...formData, customerId: id, customerName: c?.name || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', gstNumber: c?.gstNumber || '' }); 
                    }}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify Customer Account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Billing Address</Label>
                    <Textarea className="bg-slate-50 border-none rounded-xl text-xs min-h-[80px]" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} placeholder="Enter customer address..." />
                  </div>
               </div>
            </Card>

            <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-8">
               <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest border-l-4 border-primary pl-4">Quotation Details</h3>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Document No.</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Date</Label>
                    <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Status</Label>
                    <Select value={formData.status} onValueChange={(val)=>setFormData({...formData, status: val})}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">GSTIN / Tax ID</Label>
                    <Input className="h-12 bg-slate-50 border-none rounded-xl font-code uppercase" value={formData.gstNumber} onChange={(e)=>setFormData({...formData, gstNumber: e.target.value})} />
                  </div>
               </div>
            </Card>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Product / Service Grid</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                const newItems = [...(formData.items || []), { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 }];
                setFormData({...formData, items: newItems as any});
              }} className="text-primary text-[10px] font-bold uppercase"><Plus className="h-3 w-3 mr-2" /> Add Item</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b text-[8px] font-black uppercase text-slate-400">
                    <th className="py-4 px-6 w-12 text-center">Sr.</th>
                    <th className="py-4 px-4 min-w-[300px]">Product / Description</th>
                    <th className="py-4 px-4 w-32 text-center">HSN</th>
                    <th className="py-4 px-4 w-24 text-center">Qty</th>
                    <th className="py-4 px-4 w-32 text-center">Rate</th>
                    <th className="py-4 px-4 w-24 text-center">GST%</th>
                    <th className="py-4 px-6 text-right w-32">Total</th>
                    <th className="py-4 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || []).map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                      <td className="text-center py-4 font-bold text-[10px] text-slate-300">{idx + 1}</td>
                      <td className="px-4">
                        <Select value={item.productId} onValueChange={(pId) => {
                          const p = products.find(x => x.id === pId);
                          const newItems = [...(formData.items || [])];
                          newItems[idx] = { ...newItems[idx], productId: pId, description: p?.name || '', hsn: p?.hsn || '', price: p?.saleRate || 0, gstRate: p?.gstRate || 18, total: (newItems[idx].qty || 1) * (p?.saleRate || 0) };
                          setFormData({...formData, items: newItems});
                        }}>
                          <SelectTrigger className="border-none bg-transparent h-10 text-[11px] font-bold uppercase focus:ring-0">
                            <SelectValue placeholder="Select Product..." />
                          </SelectTrigger>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase">{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-4"><Input className="h-10 border-none bg-transparent text-center text-[10px] font-code" value={item.hsn} readOnly /></td>
                      <td className="px-4"><Input type="number" className="h-10 border-none bg-slate-50/50 rounded-lg text-center font-bold" value={item.qty} onChange={(e) => {
                         const newItems = [...(formData.items || [])];
                         newItems[idx].qty = Number(e.target.value);
                         newItems[idx].total = newItems[idx].qty * newItems[idx].price;
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="px-4"><Input type="number" className="h-10 border-none bg-slate-50/50 rounded-lg text-center font-bold" value={item.price} onChange={(e) => {
                         const newItems = [...(formData.items || [])];
                         newItems[idx].price = Number(e.target.value);
                         newItems[idx].total = newItems[idx].qty * newItems[idx].price;
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="px-4">
                         <Select value={item.gstRate.toString()} onValueChange={(v) => {
                           const newItems = [...(formData.items || [])];
                           newItems[idx].gstRate = Number(v);
                           setFormData({...formData, items: newItems});
                         }}>
                            <SelectTrigger className="border-none bg-transparent h-10 text-[10px] font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                         </Select>
                      </td>
                      <td className="text-right px-6 font-display font-bold">₹ {item.total.toLocaleString()}</td>
                      <td className="px-4"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500" onClick={() => setFormData({...formData, items: (formData.items || []).filter((_, i) => i !== idx)})}><Trash2 className="h-4 w-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
               <Card className="p-8 bg-white border-slate-200 rounded-3xl space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bank Details & Terms</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Bank Name</Label><Input className="bg-slate-50" defaultValue="HDFC Bank" /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">IFSC Code</Label><Input className="bg-slate-50 uppercase" defaultValue="HDFC0001234" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-[9px] font-bold uppercase text-slate-400">Terms & Conditions</Label><Textarea className="min-h-[80px] bg-slate-50" defaultValue="1. Subject to Pune jurisdiction. 2. 50% advance with PO." /></div>
               </Card>
            </div>
            <div className="lg:col-span-5">
               <Card className="p-10 bg-white border-slate-200 rounded-3xl shadow-xl space-y-6">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase"><span>Sub Total</span><span>₹ {subTotal.toLocaleString()}</span></div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase"><span>Tax Summary (GST)</span><span>₹ {taxTotal.toLocaleString()}</span></div>
                     <div className="pt-6 border-t flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-slate-300">Grand Total</p>
                          <p className="text-4xl font-display font-black text-[#001F3D]">₹ {grandTotal.toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="pt-6 border-t space-y-1">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Amount In Words</p>
                        <p className="text-[10px] font-black uppercase text-primary leading-tight">{numberToWords(grandTotal)}</p>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700 font-body">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <div className="space-y-8">
           {/* KPI DASHBOARD */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-1">
              {[
                { label: 'Total Quotes', val: biMetrics.totalCount, icon: FileBox, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Ledger Value', val: `₹${(biMetrics.totalValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending', val: biMetrics.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Approved', val: biMetrics.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Expired', val: biMetrics.rejectedOrExpired, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Conversion', val: `${biMetrics.conversionRate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
              ].map(kpi => (
                <Card key={kpi.label} className="p-4 md:p-5 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
                     <div className={cn("p-1.5 rounded-lg", kpi.bg, kpi.color)}><kpi.icon className="h-3.5 w-3.5" /></div>
                  </div>
                  <p className={cn("text-xl md:text-2xl font-display font-black leading-none", kpi.color)}>{kpi.val}</p>
                </Card>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row gap-4 px-2">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary" />
                 <Input placeholder="Search Quotation Number, Customer Name or GSTIN..." className="h-12 pl-12 rounded-2xl bg-white border-none shadow-xl shadow-blue-900/5 text-xs font-bold" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
              </div>
              <Button className="h-12 bg-[#001F3D] text-white rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl flex gap-3" onClick={() => handleOpenForm('quotation')}>
                 <Plus className="h-4 w-4" /> Create Quotation
              </Button>
           </div>

           <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-[2rem]">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="px-8 py-6 font-black text-[9px] uppercase text-slate-400">Quotation Node</TableHead>
                    <TableHead className="font-black text-[9px] uppercase text-slate-400">Customer Identity</TableHead>
                    <TableHead className="text-right font-black text-[9px] uppercase text-slate-400">Quotation Value</TableHead>
                    <TableHead className="text-center font-black text-[9px] uppercase text-slate-400">Lifecycle State</TableHead>
                    <TableHead className="text-right px-8 font-black text-[9px] uppercase text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(r => (
                    <TableRow key={r.id} className="h-24 border-b border-slate-50 hover:bg-slate-50 transition-all group">
                      <TableCell className="px-8" onClick={() => handleOpenForm(r.type, r)}>
                         <div className="flex flex-col cursor-pointer">
                            <span className="text-xs font-bold text-primary font-code group-hover:underline">{r.number}</span>
                            <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{r.date}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{r.customerName}</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">ID: {r.customerId || '---'}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right font-display font-black text-sm px-6">₹ {r.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                         <Badge className={cn(
                           "text-[8px] font-bold uppercase px-4 py-1.5 rounded-full border shadow-sm",
                           r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                           r.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                           r.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                           'bg-slate-50 text-slate-500 border-slate-100'
                         )}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary" onClick={() => handleOpenForm(r.type, r)}><Edit3 className="h-4 w-4" /></Button>
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary"><MoreVertical className="h-4 w-4" /></Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl p-1">
                                  <DropdownMenuItem onClick={() => handleDuplicate(r)} className="text-[10px] font-bold uppercase py-3 gap-3"><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 text-primary"><ShoppingCart className="h-4 w-4" /> Create Customer PO</DropdownMenuItem>
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 text-primary"><Target className="h-4 w-4" /> Convert to Work Order</DropdownMenuItem>
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 text-primary"><Receipt className="h-4 w-4" /> Generate Invoice</DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRecords.length === 0 && (
                    <TableRow>
                       <TableCell colSpan={5} className="h-96 text-center opacity-30">
                          <FileBox className="h-20 w-20 mx-auto mb-6 text-slate-300" />
                          <h4 className="text-2xl font-display font-bold uppercase tracking-tight text-[#001F3D]">Quotation Matrix Null</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Initialize a new quotation protocol to populate the ledger.</p>
                       </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
           </Card>
        </div>
      )}
    </div>
  );
}
