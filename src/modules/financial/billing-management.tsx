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
  TableProperties,
  Calculator,
  User,
  Layout,
  LayoutGrid,
  Type,
  Maximize2,
  Hammer,
  Settings,
  Scale,
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
  ClipboardList
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
  format, 
  isValid
} from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
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
    id: '', type: 'quotation', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Draft', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0, fy: format(new Date(), 'yyyy-yy'), salesExecutive: '', deliveryTerms: '',
    taxableValue: 0, estimatedProfit: 0, marginPercent: 0
  });

  const biMetrics = useMemo(() => {
    const relevantRecords = records.filter(r => r.type === activeTab);
    const totalCount = relevantRecords.length;
    const totalValue = relevantRecords.reduce((acc, r) => acc + (r.amount || 0), 0);
    const pending = relevantRecords.filter(r => ['Draft', 'Sent', 'Pending'].includes(r.status)).length;
    const approved = relevantRecords.filter(r => r.status === 'Approved' || r.status === 'Paid').length;
    const expired = relevantRecords.filter(r => r.status === 'Expired').length;
    const converted = relevantRecords.filter(r => r.status.startsWith('Converted')).length;
    const conversionRate = totalCount > 0 ? Math.round((converted / totalCount) * 100) : 0;

    return { totalCount, totalValue, pending, approved, expired, conversionRate };
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
        revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0, fy: format(new Date(), 'yyyy-yy'), salesExecutive: '', deliveryTerms: '',
        taxableValue: 0, estimatedProfit: 0, marginPercent: 0
      });
    }
    setIsRecordFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId || !formData.number) { 
      toast({ variant: "destructive", title: "Missing Information", description: "Customer and Document Number are required." }); 
      return; 
    }
    onSaveRecord(formData as BillingRecord);
    toast({ title: "Quotation Synchronized", description: `Quotation ${formData.number} committed to ledger.` });
    setIsRecordFormOpen(false);
  };

  const handleDuplicate = (record: BillingRecord) => {
    const newRecord = { 
      ...record, 
      id: `REC-${Date.now()}`, 
      number: `${DOCUMENT_TYPES.find(t=>t.id===record.type)?.prefix || 'DOC'}-CLONE-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    onSaveRecord(newRecord);
    toast({ title: "Quotation Duplicated" });
  };

  const FullPageEditor = () => {
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(['hsn', 'qty', 'unit', 'price', 'discount', 'gst', 'total', 'drawing', 'rev']));
    
    const subTotal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0);
    }, [formData.items]);

    const taxTotal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0);
    }, [formData.items]);

    const grandTotal = useMemo(() => {
      let total = subTotal + taxTotal;
      total += (formData.additionalCharges || 0);
      total -= (formData.discountTotal || 0);
      return formData.isRoundOffActive ? Math.round(total) : total;
    }, [subTotal, taxTotal, formData.additionalCharges, formData.discountTotal, formData.isRoundOffActive]);

    const customerIntel = useMemo(() => {
      if (!formData.customerId) return null;
      const cRecords = records.filter(r => r.customerId === formData.customerId);
      const cOrders = orders.filter(o => o.customer === formData.customerName);
      
      const totalInvoiced = cRecords.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
      const totalPayments = cRecords.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
      const outstanding = totalInvoiced - totalPayments;
      const openQuotes = cRecords.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
      const openWOs = cOrders.filter(o => !['Completed', 'Delivered'].includes(o.status)).length;
      const poValue = cRecords.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);

      return { outstanding, openQuotes, openWOs, poValue };
    }, [formData.customerId, formData.customerName]);

    const toggleColumn = (colId: string) => {
      const next = new Set(visibleColumns);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      setVisibleColumns(next);
    };

    const addRow = (type: string = 'product') => {
      const newItems = [...(formData.items || []), { 
        id: Date.now().toString(), 
        description: '', 
        hsn: '', 
        qty: 1, 
        unit: 'Nos', 
        price: 0, 
        discount: 0, 
        discountType: 'percentage', 
        gstRate: 18, 
        total: 0,
        type: type 
      }];
      setFormData({...formData, items: newItems as any});
    };

    const handleCommercialAction = (action: string) => {
      if (action === 'apply-gst-all') {
        const newItems = (formData.items || []).map(i => ({ ...i, gstRate: 18 }));
        setFormData({...formData, items: newItems});
        toast({ title: "Tax Sync", description: "Applied 18% GST to all rows." });
      } else if (action === 'round-off') {
        setFormData({...formData, isRoundOffActive: !formData.isRoundOffActive});
      }
    };

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Document Registry</span>
               <h2 className="text-sm font-display font-bold uppercase">{editingRecordId ? 'Edit' : 'Initialize'} {activeTab.replace('_', ' ')} Matrix</h2>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-10 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Discard</Button>
             <Button className="bg-[#00E5A8] hover:bg-emerald-600 text-[#001F3D] h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-2" onClick={handleSave}>
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Save className="h-4 w-4 mr-2" /> Commit Matrix
             </Button>
          </div>
        </div>

        <div className="max-w-full mx-auto w-full p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6">
              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Building2 className="h-24 w-24" /></div>
                <div className="flex items-center gap-3 border-l-4 border-primary pl-4 relative z-10">
                   <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Customer Intelligence Panel</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Identify Customer Node</Label>
                        <Select value={formData.customerId} onValueChange={(id) => { 
                          const c = customers.find(x => x.id === id); 
                          setFormData({ ...formData, customerId: id, customerName: c?.name || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', gstNumber: c?.gstNumber || '', shipTo: c?.address || '', panNumber: c?.pan || '' }); 
                        }}>
                          <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl text-sm font-bold uppercase shadow-inner">
                            <SelectValue placeholder="Identify Account..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                             <div className="px-2 py-1.5 text-[8px] font-black text-slate-400 border-b mb-1 uppercase tracking-widest">Master Identity Ledger</div>
                             {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[11px] font-bold uppercase py-3">{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Billing Matrix Address</Label>
                        <Textarea className="bg-slate-50 border-none rounded-xl text-xs min-h-[100px] shadow-inner" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} placeholder="Master billing address protocol..." />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">GSTIN Protocol</Label>
                           <Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold uppercase shadow-inner" value={formData.gstNumber} readOnly />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">PAN Identity</Label>
                           <Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold uppercase shadow-inner" value={formData.panNumber} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Primary Contact</Label>
                           <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold shadow-inner" value={formData.contactPerson} readOnly />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Network Identifier (Mobile)</Label>
                           <Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold shadow-inner" value={formData.phoneNo} readOnly />
                        </div>
                      </div>
                      {customerIntel && (
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                           <div className="text-center p-3 bg-red-50 rounded-2xl">
                              <p className="text-[7px] font-black text-red-400 uppercase mb-1">Outstanding</p>
                              <p className="text-xs font-display font-black text-red-600">₹ {customerIntel.outstanding.toLocaleString()}</p>
                           </div>
                           <div className="text-center p-3 bg-blue-50 rounded-2xl">
                              <p className="text-[7px] font-black text-blue-400 uppercase mb-1">PO Value</p>
                              <p className="text-xs font-display font-black text-blue-600">₹ {customerIntel.poValue.toLocaleString()}</p>
                           </div>
                           <div className="text-center p-3 bg-indigo-50 rounded-2xl">
                              <p className="text-[7px] font-black text-indigo-400 uppercase mb-1">Active WO</p>
                              <p className="text-xs font-display font-black text-indigo-600">{customerIntel.openWOs}</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              </Card>
            </div>

            <div className="xl:col-span-4">
              <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-3xl space-y-6 h-full relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5"><FileBox className="h-24 w-24" /></div>
                 <div className="flex items-center gap-3 border-l-4 border-primary pl-4 relative z-10">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Quotation Metadata</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Doc. Number</Label>
                      <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold font-code shadow-inner" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Financial Year</Label>
                      <Input className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center shadow-inner" value={formData.fy} onChange={(e)=>setFormData({...formData, fy: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Protocol Date</Label>
                      <DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-12 border-none bg-slate-50 shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Valid Until</Label>
                      <DatePicker value={formData.dueDate} onChange={(val)=>setFormData({...formData, dueDate: val})} className="h-12 border-none bg-slate-50 shadow-inner" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Sales Executive Node</Label>
                      <Select value={formData.salesExecutive} onValueChange={(v)=>setFormData({...formData, salesExecutive: v})}>
                         <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner"><SelectValue placeholder="Identify Personnel..." /></SelectTrigger>
                         <SelectContent className="rounded-xl shadow-2xl">
                            {users.map(u => <SelectItem key={u.id} value={u.name} className="text-[10px] font-bold uppercase">{u.name}</SelectItem>)}
                         </SelectContent>
                      </Select>
                    </div>
                 </div>
              </Card>
            </div>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#001F3D] rounded-lg text-white shadow-lg"><TableProperties className="h-4 w-4" /></div>
                 <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Product / Service Intelligence Grid</h3>
              </div>
              
              <div className="flex gap-3">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="outline" className="rounded-xl h-10 px-6 font-black uppercase text-[9px] tracking-widest gap-2 bg-white border-slate-200 shadow-sm">
                          <Settings2 className="h-3.5 w-3.5" /> Action Center
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-2xl p-1 border-slate-100">
                       <DropdownMenuLabel className="text-[8px] font-black uppercase text-slate-400 px-4 py-2">Line Item Protocols</DropdownMenuLabel>
                       <DropdownMenuItem onClick={() => addRow('product')} className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><PlusCircle className="h-4 w-4 text-blue-600" /> Add Product</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => addRow('service')} className="gap-3 py-3 px-4 rounded-xl cursor-pointer text-[10px] font-bold uppercase"><Settings className="h-4 w-4 text-primary" /> Add Service Node</DropdownMenuItem>
                       
                       <DropdownMenuSeparator />
                       <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-3 py-3 px-4 rounded-xl text-[10px] font-bold uppercase"><DollarSign className="h-4 w-4 text-emerald-600" /> Add Charges</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-56 rounded-xl shadow-2xl p-1">
                             <DropdownMenuItem onClick={() => addRow('freight')} className="text-[9px] font-bold uppercase py-2.5">Freight Charges</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => addRow('packing')} className="text-[9px] font-bold uppercase py-2.5">Packing Charges</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => addRow('installation')} className="text-[9px] font-bold uppercase py-2.5">Installation Charges</DropdownMenuItem>
                          </DropdownMenuSubContent>
                       </DropdownMenuSub>

                       <DropdownMenuSeparator />
                       <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-3 py-3 px-4 rounded-xl text-[10px] font-bold uppercase"><TableProperties className="h-4 w-4 text-slate-400" /> Column Protocol</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-56 rounded-xl p-1">
                             {[
                               { id: 'hsn', l: 'HSN/SAC Node' },
                               { id: 'drawing', l: 'Drawing Number' },
                               { id: 'rev', l: 'Revision ID' },
                               { id: 'discount', l: 'Discount Matrix' },
                               { id: 'gst', l: 'Tax Node (GST)' },
                               { id: 'uom', l: 'UOM Unit' },
                               { id: 'material', l: 'Material Grade' },
                             ].map(col => (
                               <DropdownMenuCheckboxItem 
                                 key={col.id} 
                                 checked={visibleColumns.has(col.id)} 
                                 onCheckedChange={() => toggleColumn(col.id)}
                                 className="text-[9px] font-bold uppercase py-2.5"
                               >
                                  {col.l}
                               </DropdownMenuCheckboxItem>
                             ))}
                          </DropdownMenuSubContent>
                       </DropdownMenuSub>

                       <DropdownMenuSeparator />
                       <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-3 py-3 px-4 rounded-xl text-[10px] font-bold uppercase"><Calculator className="h-4 w-4 text-emerald-600" /> Commercial Logic</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-64 rounded-xl p-1">
                             <DropdownMenuItem onClick={() => handleCommercialAction('apply-gst-all')} className="text-[9px] font-bold uppercase py-2.5">Apply 18% GST to All</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleCommercialAction('round-off')} className="text-[9px] font-bold uppercase py-2.5">Round Off Grand Total</DropdownMenuItem>
                          </DropdownMenuSubContent>
                       </DropdownMenuSub>
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b text-[8px] font-black uppercase text-slate-400">
                    <th className="py-4 px-6 w-12 text-center border-r">Sr.</th>
                    <th className="py-4 px-4 min-w-[350px] border-r">Product Identity Node / Description</th>
                    {visibleColumns.has('drawing') && <th className="py-4 px-4 w-32 text-center border-r">Drawing #</th>}
                    {visibleColumns.has('rev') && <th className="py-4 px-4 w-20 text-center border-r">Rev</th>}
                    {visibleColumns.has('hsn') && <th className="py-4 px-4 w-32 text-center border-r">HSN/SAC</th>}
                    {visibleColumns.has('material') && <th className="py-4 px-4 w-32 text-center border-r">Material</th>}
                    <th className="py-4 px-4 w-24 text-center border-r">Qty</th>
                    {visibleColumns.has('uom') && <th className="py-4 px-4 w-20 text-center border-r">UOM</th>}
                    <th className="py-4 px-4 w-36 text-center border-r">Rate (₹)</th>
                    {visibleColumns.has('discount') && <th className="py-4 px-4 w-24 text-center border-r">Disc. %</th>}
                    {visibleColumns.has('gst') && <th className="py-4 px-4 w-24 text-center border-r">GST %</th>}
                    <th className="py-4 px-6 text-right w-48">Line Valuation</th>
                    <th className="py-4 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || []).map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                      <td className="text-center py-4 font-bold text-[10px] text-slate-300 border-r">{idx + 1}</td>
                      <td className="px-4 border-r">
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
                            total: (newItems[idx].qty || 1) * (p?.saleRate || 0),
                            drawingNumber: p?.drawingNumber || '',
                            revisionNumber: p?.revisionNumber || '',
                            material: p?.material || '',
                            standardCost: p?.standardCost || 0
                          };
                          setFormData({...formData, items: newItems});
                        }}>
                          <SelectTrigger className="border-none bg-transparent h-12 text-[11px] font-black uppercase focus:ring-0">
                            <SelectValue placeholder="Identify Product Matrix..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-2xl max-h-[400px]">
                             <div className="px-2 py-1.5 text-[8px] font-black text-slate-400 border-b mb-1 uppercase tracking-widest">Technical Master Registry</div>
                             {products.map(p => (
                               <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-3 flex flex-col items-start gap-1">
                                  <div className="flex items-center gap-2">
                                     <span className="text-primary font-black">{p.code}</span>
                                     <span className="text-slate-900">{p.name}</span>
                                  </div>
                                  <div className="flex gap-3 mt-1 opacity-40 text-[7px] font-black">
                                     <span>HSN: {p.hsn}</span>
                                     <span>DWG: {p.drawingNumber || 'N/A'}</span>
                                  </div>
                               </SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                        <Textarea 
                          className="border-none bg-transparent h-10 min-h-0 text-[10px] font-medium text-slate-500 py-0 px-3 resize-none shadow-none focus-visible:ring-0" 
                          value={item.description}
                          onChange={(e) => {
                             const newItems = [...(formData.items || [])];
                             newItems[idx].description = e.target.value;
                             setFormData({...formData, items: newItems});
                          }}
                          placeholder="Technical description protocol..."
                        />
                      </td>
                      {visibleColumns.has('drawing') && (
                        <td className="px-4 border-r">
                           <Input className="h-10 border-none bg-transparent text-center text-[10px] font-bold text-slate-600" value={item.drawingNumber} readOnly />
                        </td>
                      )}
                      {visibleColumns.has('rev') && (
                        <td className="px-4 border-r">
                           <Input className="h-10 border-none bg-transparent text-center text-[10px] font-bold text-slate-400" value={item.revisionNumber} readOnly />
                        </td>
                      )}
                      {visibleColumns.has('hsn') && (
                        <td className="px-4 border-r">
                           <Input className="h-10 border-none bg-transparent text-center text-[10px] font-code text-slate-400" value={item.hsn} readOnly />
                        </td>
                      )}
                      {visibleColumns.has('material') && (
                        <td className="px-4 border-r">
                           <Input className="h-10 border-none bg-transparent text-center text-[10px] font-bold text-slate-500 uppercase" value={item.material} readOnly />
                        </td>
                      )}
                      <td className="px-4 border-r">
                        <Input type="number" className="h-10 border-none bg-slate-50 rounded-lg text-center font-bold text-xs shadow-inner" value={item.qty} onChange={(e) => {
                           const newItems = [...(formData.items || [])];
                           newItems[idx].qty = Number(e.target.value);
                           newItems[idx].total = newItems[idx].qty * newItems[idx].price;
                           setFormData({...formData, items: newItems});
                        }} />
                      </td>
                      {visibleColumns.has('uom') && (
                        <td className="px-4 border-r">
                           <Input className="h-10 border-none bg-transparent text-center text-[10px] font-bold text-slate-400 uppercase" value={item.unit} readOnly />
                        </td>
                      )}
                      <td className="px-4 border-r">
                        <Input type="number" className="h-10 border-none bg-slate-50 rounded-lg text-center font-display font-bold text-sm shadow-inner" value={item.price} onChange={(e) => {
                           const newItems = [...(formData.items || [])];
                           newItems[idx].price = Number(e.target.value);
                           newItems[idx].total = newItems[idx].qty * newItems[idx].price;
                           setFormData({...formData, items: newItems});
                        }} />
                      </td>
                      {visibleColumns.has('discount') && (
                        <td className="px-4 border-r">
                           <Input type="number" className="h-10 border-none bg-slate-50 rounded-lg text-center text-[10px] font-bold text-rose-500 shadow-inner" value={item.discount} onChange={(e) => {
                             const newItems = [...(formData.items || [])];
                             newItems[idx].discount = Number(e.target.value);
                             setFormData({...formData, items: newItems});
                          }} />
                        </td>
                      )}
                      {visibleColumns.has('gst') && (
                        <td className="px-4 border-r">
                           <Select value={item.gstRate.toString()} onValueChange={(v) => {
                             const newItems = [...(formData.items || [])];
                             newItems[idx].gstRate = Number(v);
                             setFormData({...formData, items: newItems});
                           }}>
                              <SelectTrigger className="border-none bg-transparent h-10 text-[10px] font-bold"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl"><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                           </Select>
                        </td>
                      )}
                      <td className="text-right px-6 font-display font-black text-sm text-[#001F3D]">₹ {item.total.toLocaleString()}</td>
                      <td className="px-4">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => setFormData({...formData, items: (formData.items || []).filter((_, i) => i !== idx)})}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#FFFDE7] border-t-2 border-[#001F3D] font-black text-[10px] uppercase text-[#001F3D]">
                    <td colSpan={2} className="py-4 px-6 text-right border-r">Net Matrix Valuation</td>
                    {visibleColumns.has('drawing') && <td className="border-r"></td>}
                    {visibleColumns.has('rev') && <td className="border-r"></td>}
                    {visibleColumns.has('hsn') && <td className="border-r"></td>}
                    {visibleColumns.has('material') && <td className="border-r"></td>}
                    <td className="text-center border-r">{(formData.items || []).reduce((acc, i) => acc + (Number(i.qty) || 0), 0)}</td>
                    {visibleColumns.has('uom') && <td className="border-r"></td>}
                    <td className="border-r"></td>
                    {visibleColumns.has('discount') && <td className="border-r"></td>}
                    {visibleColumns.has('gst') && <td className="border-r"></td>}
                    <td className="text-right px-6 font-display font-black text-lg">₹ {subTotal.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
               <Card className="p-10 bg-white border-slate-200 rounded-[2.5rem] shadow-sm space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Landmark className="h-24 w-24" /></div>
                  <div className="grid grid-cols-2 gap-10 relative z-10">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4"><h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Settlement Hub</h4></div>
                        <div className="space-y-6">
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                              <p className="text-[8px] font-bold text-slate-400 uppercase">Bank Node</p>
                              <p className="text-xs font-black text-[#001F3D] uppercase">HDFC Bank — 50100012345678</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">IFSC: HDFC0001234</p>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Terms Template</Label>
                              <Select defaultValue="standard">
                                 <SelectTrigger className="h-10 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-xl"><SelectItem value="standard" className="text-[10px] font-bold uppercase">Standard Industrial Terms</SelectItem><SelectItem value="advance" className="text-[10px] font-bold uppercase">50% Advance Protocol</SelectItem></SelectContent>
                              </Select>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Protocol Remarks</h4></div>
                        <Textarea className="min-h-[160px] bg-slate-50 border-none rounded-2xl text-[11px] font-medium p-6 shadow-inner" value={formData.notes} onChange={(e)=>setFormData({...formData, notes: e.target.value})} placeholder="Internal observation matrix node..." />
                     </div>
                  </div>
               </Card>
            </div>
            
            <div className="lg:col-span-5">
               <Card className="p-10 bg-white border-slate-200 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Calculator className="h-32 w-32" /></div>
                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Taxable Matrix Value</span><span>₹ {subTotal.toLocaleString()}</span></div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest"><span>GST Protocol (Agg)</span><span className="text-primary">₹ {taxTotal.toLocaleString()}</span></div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Additional Logistics</span><Input type="number" className="h-9 w-32 bg-slate-50 border-none text-right font-display font-bold rounded-lg shadow-inner" value={formData.additionalCharges} onChange={(e)=>setFormData({...formData, additionalCharges: Number(e.target.value)})} /></div>
                     
                     <div className="pt-8 border-t-2 border-slate-900/5 flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Aggregated Settlement</span>
                        <p className="text-6xl font-display font-black text-[#001F3D] tracking-tighter leading-none">₹ {grandTotal.toLocaleString()}</p>
                        {formData.isRoundOffActive && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] font-black uppercase tracking-widest px-4 h-6">PROTOCOL_ROUNDED</Badge>}
                     </div>
                     
                     <div className="pt-8 border-t border-slate-50 space-y-2">
                        <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">Financial Transcription</p>
                        <p className="text-[11px] font-black uppercase text-primary leading-tight">{numberToWords(grandTotal)}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                        <div className="p-4 bg-emerald-50 rounded-2xl text-center">
                           <p className="text-[8px] font-bold text-emerald-600 uppercase mb-1">Margin Protocol</p>
                           <p className="text-xl font-display font-black text-emerald-700">24.2%</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl text-center">
                           <p className="text-[8px] font-bold text-blue-600 uppercase mb-1">Est. Profit</p>
                           <p className="text-xl font-display font-black text-blue-700">₹ {(grandTotal * 0.24).toFixed(0).toLocaleString()}</p>
                        </div>
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
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-1">
              {[
                { label: 'Total Matrix', val: biMetrics.totalCount, icon: FileBox, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Ledger Value', val: `₹${(biMetrics.totalValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending Node', val: biMetrics.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Authorized', val: biMetrics.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Temporal Expire', val: biMetrics.expired, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Yield Ratio', val: `${biMetrics.conversionRate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
              ].map(kpi => (
                <Card key={kpi.label} className="p-4 md:p-5 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none">{kpi.label}</p>
                     <div className={cn("p-1.5 rounded-lg", kpi.bg, kpi.color)}><kpi.icon className="h-3 w-3" /></div>
                  </div>
                  <p className={cn("text-xl md:text-2xl font-display font-black leading-none", kpi.color)}>{kpi.val}</p>
                </Card>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row gap-4 px-2">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary" />
                 <Input placeholder="Filter Quotations, Customers, GSTIN Matrix..." className="h-12 pl-12 rounded-2xl bg-white border-none shadow-xl shadow-blue-900/5 text-xs font-bold uppercase" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
              </div>
              <Button className="h-12 bg-[#001F3D] text-white rounded-2xl px-10 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex gap-3 group" onClick={() => handleOpenForm('quotation')}>
                 <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> Create Quotation Protocol
              </Button>
           </div>

           <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-[2rem]">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="px-10 py-6 font-black text-[9px] uppercase text-slate-400">Quote Node</TableHead>
                    <TableHead className="font-black text-[9px] uppercase text-slate-400">Temporal Date</TableHead>
                    <TableHead className="font-black text-[9px] uppercase text-slate-400">Customer Identity</TableHead>
                    <TableHead className="text-right font-black text-[9px] uppercase text-slate-400">Matrix Value</TableHead>
                    <TableHead className="text-center font-black text-[9px] uppercase text-slate-400">State Node</TableHead>
                    <TableHead className="text-right px-10 font-black text-[9px] uppercase text-slate-400">Authorization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(r => (
                    <TableRow key={r.id} className="h-24 border-b border-slate-50 hover:bg-slate-50 transition-all group">
                      <TableCell className="px-10">
                         <span className="text-xs font-bold text-primary font-code group-hover:underline cursor-pointer" onClick={() => handleOpenForm(r.type, r)}>{r.number}</span>
                      </TableCell>
                      <TableCell>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">{r.date}</span>
                      </TableCell>
                      <TableCell>
                         <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{r.customerName}</span>
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
                      <TableCell className="text-right px-10">
                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl" onClick={() => handleOpenForm(r.type, r)}><Edit3 className="h-4 w-4" /></Button>
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-2xl p-1">
                                  <DropdownMenuItem onClick={() => handleDuplicate(r)} className="text-[10px] font-bold uppercase py-3 gap-3 rounded-xl"><Copy className="h-4 w-4" /> Duplicate Node</DropdownMenuItem>
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 rounded-xl"><Printer className="h-4 w-4" /> Export PDF</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 text-primary rounded-xl"><ShoppingCart className="h-4 w-4" /> Commit Customer PO</DropdownMenuItem>
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 text-primary rounded-xl"><Target className="h-4 w-4" /> Initialize WO Thread</DropdownMenuItem>
                                  <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 gap-3 text-primary rounded-xl"><Receipt className="h-4 w-4" /> Transmit Sales Invoice</DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </TableCell>
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
