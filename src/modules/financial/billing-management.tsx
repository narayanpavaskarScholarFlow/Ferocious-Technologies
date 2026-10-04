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
  Box,
  Zap,
  RotateCcw,
  Settings2,
  RefreshCw,
  MoreHorizontal as Dots,
  Maximize2,
  Send,
  User,
  History,
  Contact,
  CreditCard,
  FileSpreadsheet,
  Users
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
  subMonths,
  isAfter
} from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, BarChart, Bar, Cell } from 'recharts';

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
  const double = ["", "", "TWENTY", "THIRTY", "FORTY", "FIVE", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  function convert(n: number): string {
    if (n < 20) return single[n];
    if (n < 100) return double[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + single[n % 10] : "");
    if (n < 1000) return single[Math.floor(n / 100)] + " HUNDRED" + (n % 100 !== 0 ? " AND " + convert(n % 100) : "");
    if (n < 100000) convert(Math.floor(n / 1000)) + " THOUSAND" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) convert(Math.floor(n / 100000)) + " LAKH" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
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
  uiSettings: UISettings;
  initialTab?: string;
}

export function BillingManagement({ 
  customers, vendors, records, orders, users, inventory, products, permissions, 
  onSaveRecord, onDeleteRecord, uiSettings, initialTab = 'invoice' 
}: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [targetValueInput, setTargetValueInput] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    id: '', type: 'invoice', customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
    number: '', status: 'Pending', items: [], subTotal: 0, amount: 0, taxTotal: 0, discountTotal: 0, additionalCharges: 0,
    roundOff: 0, notes: '', terms: '', quotationId: '', poId: '', poNumber: '', referenceNumber: '', deliveryMode: '',
    placeOfSupply: '', shipTo: '', distanceEWay: '', challanNo: '', challanDate: '', lrNo: '', contactPerson: '', phoneNo: '', gstNumber: '',
    revCharge: 'No', isRoundOffActive: false, tcsRate: 0, tcsAmount: 0
  });

  const biMetrics = useMemo(() => {
    const targetDate = new Date();
    const mStart = startOfMonth(targetDate);
    const mEnd = endOfMonth(targetDate);
    const targetKey = format(targetDate, 'yyyy-MM');
    const monthlyBillingTarget = uiSettings.monthlyBillingTargets?.[targetKey] || 0;
    
    const monthInvoices = records.filter(r => r.type === 'invoice' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const actualBillingAchieved = monthInvoices.reduce((sum, r) => sum + (r.amount || 0), 0);
    const achievementPercent = monthlyBillingTarget > 0 ? (actualBillingAchieved / monthlyBillingTarget) * 100 : 0;
    
    const monthInward = records.filter(r => r.type === 'inward_payment' && isWithinInterval(parseISO(r.date), { start: mStart, end: mEnd }));
    const totalCollected = monthInward.reduce((acc, r) => acc + (r.amount || 0), 0);
    const collectionAchievement = actualBillingAchieved > 0 ? (totalCollected / actualBillingAchieved) * 100 : 100;

    const healthScore = Math.min(100, Math.round((achievementPercent * 0.4) + (collectionAchievement * 0.4) + (90 * 0.2)));

    return { 
      monthlyBillingTarget, 
      actualBillingAchieved, 
      achievementPercent, 
      healthScore, 
      collected: totalCollected,
      collectionAchievement
    };
  }, [records, uiSettings.monthlyBillingTargets]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isTab = r.type === activeTab;
      if (!isTab) return false;
      const matchesSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.customerName.toLowerCase().includes(searchTerm.toLowerCase());
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
      const prefix = DOCUMENT_TYPES.find(t=>t.id===type)?.prefix || 'DOC';
      setFormData({
        id: `REC-${Date.now()}`, type, customerName: '', customerId: '', date: new Date().toISOString().split('T')[0],
        number: `${prefix}-${Date.now().toString().slice(-4)}`, status: 'Pending', 
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

  const handleSyncTargets = () => {
    const val = parseFloat(targetValueInput) || 0;
    const targetKey = format(new Date(), 'yyyy-MM');
    const updatedTargets = { ...(uiSettings.monthlyBillingTargets || {}), [targetKey]: val };
    
    const masterAdmin = users.find(u => u.role === 'Master Admin' || u.name?.toLowerCase() === 'master admin' || u.username === 'admin');
    if (masterAdmin) {
      setDocumentNonBlocking(doc(db, 'users', masterAdmin.id), {
        uiSettings: { ...uiSettings, monthlyBillingTargets: updatedTargets }
      }, { merge: true });
      toast({ title: "Calibration Synchronized", description: "Monthly targets updated." });
      setIsCalibrationOpen(false);
    }
  };

  const FullPageEditor = () => {
    const totalQuotationVal = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total || 0), 0);
    }, [formData.items]);

    const totalTax = useMemo(() => {
      return (formData.items || []).reduce((acc, i) => acc + (i.total * (i.gstRate/100)), 0);
    }, [formData.items]);

    const grandTotal = useMemo(() => {
      let total = totalQuotationVal + totalTax;
      total += (formData.additionalCharges || 0);
      total += (formData.tcsAmount || 0);
      total -= (formData.discountTotal || 0);
      if (formData.isRoundOffActive) {
        return Math.round(total);
      }
      return total;
    }, [totalQuotationVal, totalTax, formData.additionalCharges, formData.tcsAmount, formData.discountTotal, formData.isRoundOffActive]);

    return (
      <div className="flex flex-col bg-[#F8FAFC] dark:bg-slate-950 min-h-screen animate-in fade-in duration-300 pb-20 font-body">
        <div className="sticky top-0 z-50 bg-[#001F3D] text-white px-6 h-14 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsRecordFormOpen(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Transaction Matrix</span>
              <h2 className="text-lg font-display font-bold uppercase leading-none">{activeTab.replace('_', ' ')} Registry</h2>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-10 font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsRecordFormOpen(false)}>Back</Button>
             <Button className="bg-[#00E5A8] hover:bg-emerald-600 text-[#001F3D] h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl flex gap-2" onClick={handleSave}>
               <Printer className="h-4 w-4" /> Save & Print
             </Button>
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-8 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl" onClick={handleSave}>
               <Save className="h-4 w-4 mr-2" /> Save
             </Button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto w-full p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Customer Identification</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Account M/S.<span className="text-red-500">*</span></Label></div>
                  <div className="md:col-span-2">
                    <Select value={formData.customerId} onValueChange={(id) => { 
                      const c = customers.find(x => x.id === id); 
                      setFormData({ ...formData, customerId: id, customerName: c?.name || '', contactPerson: c?.contactPerson || '', phoneNo: c?.contactNumber || '', gstNumber: c?.gstNumber || '' }); 
                    }}>
                      <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold uppercase">
                        <SelectValue placeholder="Identify Account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase">{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 flex items-start pt-2"><Label className="text-[10px] font-black uppercase text-slate-400">Dispatch Address</Label></div>
                  <div className="md:col-span-2"><Textarea className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs min-h-[60px]" value={formData.shipTo} onChange={(e)=>setFormData({...formData, shipTo: e.target.value})} /></div>
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">GSTIN / PAN</Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold uppercase" value={formData.gstNumber} onChange={(e)=>setFormData({...formData, gstNumber: e.target.value})} /></div>
               </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Document Metadata</h3>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Doc. Number<span className="text-red-500">*</span></Label></div>
                  <div className="md:col-span-2"><Input className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold text-center" value={formData.number} onChange={(e)=>setFormData({...formData, number: e.target.value})} /></div>
                  <div className="md:col-span-1"><DatePicker value={formData.date} onChange={(val)=>setFormData({...formData, date: val})} className="h-10" /></div>
                  <div className="md:col-span-1 flex items-center"><Label className="text-[10px] font-black uppercase text-slate-400">Status Node</Label></div>
                  <div className="md:col-span-3">
                    <Select value={formData.status} onValueChange={(val)=>setFormData({...formData, status: val})}>
                      <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Authorized">Authorized</SelectItem>
                        <SelectItem value="Paid">Settled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </Card>
          </div>

          <Card className="bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-50 dark:border-border bg-slate-50/50">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Product / Service Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-border text-[8px] font-black uppercase text-slate-400">
                    <th className="py-3 px-4 w-12 text-center border-r dark:border-border">SR.</th>
                    <th className="py-3 px-4 border-r dark:border-border">IDENTITY</th>
                    <th className="py-3 px-4 w-32 border-r dark:border-border">HSN/SAC</th>
                    <th className="py-3 px-4 w-24 text-center border-r dark:border-border">QTY.</th>
                    <th className="py-3 px-4 w-32 text-center border-r dark:border-border">RATE</th>
                    <th className="py-3 px-4 w-40 text-center border-r dark:border-border">TAX (IGST)</th>
                    <th className="py-3 px-4 w-32 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || []).map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-border hover:bg-slate-50/50">
                      <td className="text-center py-4 border-r dark:border-border text-[10px] font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-0 border-r dark:border-border">
                        <Select value={item.productId} onValueChange={(pId) => {
                          const p = products.find(x => x.id === pId);
                          const newItems = [...(formData.items || [])];
                          newItems[idx] = { ...newItems[idx], productId: pId, description: p?.name || '', hsn: p?.hsn || '', price: p?.saleRate || 0, gstRate: p?.gstRate || 18, total: (newItems[idx].qty || 1) * (p?.saleRate || 0) };
                          setFormData({...formData, items: newItems});
                        }}>
                          <SelectTrigger className="border-none bg-transparent h-10 text-[10px] font-bold uppercase rounded-none focus:ring-0">
                            <SelectValue placeholder="Select Product/Service..." />
                          </SelectTrigger>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase">{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="border-r dark:border-border"><Input className="border-none bg-transparent h-10 text-center text-[10px] font-code" value={item.hsn} readOnly /></td>
                      <td className="border-r dark:border-border"><Input type="number" className="border-none bg-transparent h-10 text-center text-[10px] font-bold" value={item.qty} onChange={(e)=>{
                         const newItems = [...(formData.items || [])];
                         newItems[idx].qty = Number(e.target.value);
                         newItems[idx].total = Number(e.target.value) * newItems[idx].price;
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="border-r dark:border-border"><Input type="number" className="border-none bg-transparent h-10 text-center text-[10px] font-bold" value={item.price} onChange={(e)=>{
                         const newItems = [...(formData.items || [])];
                         newItems[idx].price = Number(e.target.value);
                         newItems[idx].total = Number(e.target.value) * newItems[idx].qty;
                         setFormData({...formData, items: newItems});
                      }} /></td>
                      <td className="border-r dark:border-border">
                        <Select value={item.gstRate.toString()} onValueChange={(val)=> {
                            const newItems = [...(formData.items || [])];
                            newItems[idx].gstRate = Number(val);
                            setFormData({...formData, items: newItems});
                         }}>
                            <SelectTrigger className="border-none bg-transparent h-10 text-[10px] font-bold text-center"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                         </Select>
                      </td>
                      <td className="text-right px-6 text-[10px] font-black">₹ {item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#FFFDE7] dark:bg-slate-800/80 border-t-2 border-[#001F3D] dark:border-primary font-black text-[10px] uppercase text-[#001F3D] dark:text-primary">
                    <td colSpan={2} className="py-4 px-6 text-right border-r dark:border-border">Total Matrix Yield</td>
                    <td className="border-r dark:border-border"></td>
                    <td className="text-center border-r dark:border-border">{(formData.items || []).reduce((acc, i) => acc + i.qty, 0)}</td>
                    <td className="border-r dark:border-border"></td>
                    <td className="text-center border-r dark:border-border">---</td>
                    <td className="text-right px-6">{totalQuotationVal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
               <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-xl space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Commercial Terms</h3>
                  <Textarea className="min-h-[80px] bg-slate-50 dark:bg-slate-900 border-none text-[10px] font-medium" defaultValue="Subject to our home Jurisdiction. All deliverables released upon settlement matrix synchronization." />
               </Card>
            </div>
            <div className="lg:col-span-5">
               <Card className="p-8 bg-white dark:bg-card border-slate-200 dark:border-border shadow-xl rounded-2xl">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase"><span>Sub Total</span><span>₹ {totalQuotationVal.toLocaleString()}</span></div>
                     <div className="bg-[#FFFDE7] dark:bg-slate-800/80 p-4 -mx-8 flex justify-between items-center border-y-2 border-[#001F3D] dark:border-primary">
                        <span className="text-sm font-black uppercase text-[#001F3D] dark:text-primary ml-4">Grand Total</span>
                        <span className="text-xl font-display font-black text-[#001F3D] dark:text-primary mr-4">₹ {grandTotal.toLocaleString()}</span>
                     </div>
                     <div className="pt-4 space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Transcription</p>
                        <p className="text-[10px] font-black uppercase text-[#001F3D] dark:text-primary">{numberToWords(grandTotal)}</p>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AnalyticsView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Global Health Node</p>
            <h3 className="text-3xl font-display font-black uppercase tracking-tight">Institutional Yield</h3>
          </div>
          <div className="flex items-center gap-6 mt-10">
            <div className="relative h-24 w-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="#00E5A8" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * biMetrics.healthScore / 100)} strokeLinecap="round" />
              </svg>
              <span className="absolute text-2xl font-display font-black">{biMetrics.healthScore}%</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#00E5A8]" /><span className="text-[10px] font-bold text-white/60">Performance</span></div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-400" /><span className="text-[10px] font-bold text-white/60">Reliability</span></div>
            </div>
          </div>
        </Card>
        
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'MTD Billing', val: `₹ ${(biMetrics.actualBillingAchieved / 100000).toFixed(1)}L`, percent: biMetrics.achievementPercent, color: 'text-emerald-500' },
             { label: 'Collection Rate', val: `₹ ${(biMetrics.collected / 100000).toFixed(1)}L`, percent: biMetrics.collectionAchievement, color: 'text-blue-500' },
             { label: 'Target Deficit', val: `₹ ${((biMetrics.monthlyBillingTarget - biMetrics.actualBillingAchieved) / 100000).toFixed(1)}L`, percent: 100 - biMetrics.achievementPercent, color: 'text-orange-500' },
           ].map(item => (
             <Card key={item.label} className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-2xl flex flex-col justify-between group hover:border-primary/20 transition-all">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className={cn("text-2xl font-display font-black mt-1", item.color)}>{item.val}</p>
                <div className="mt-4 space-y-1.5">
                   <div className="flex justify-between items-center text-[7px] font-black uppercase"><span className="text-slate-400">Achievement</span><span className="text-slate-600">{Math.round(item.percent)}%</span></div>
                   <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden"><div className={cn("h-full", item.color.replace('text-', 'bg-'))} style={{ width: `${Math.min(item.percent, 100)}%` }} /></div>
                </div>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-700">
      {isRecordFormOpen ? <FullPageEditor /> : (
        <div className="space-y-8">
          {activeTab === 'dashboard' ? <AnalyticsView /> : 
           activeTab === 'product-master' ? <div className="space-y-8">
              <Card className="p-0 border-slate-200 dark:border-border bg-white dark:bg-card shadow-xl rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                    <TableRow className="hover:bg-transparent"><TableHead className="px-8">Identity</TableHead><TableHead>Classification</TableHead><TableHead>HSN/SAC</TableHead><TableHead className="text-right px-8">Rate (₹)</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>{products.map(p => (
                    <TableRow key={p.id} className="h-20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <TableCell className="px-8"><div className="flex flex-col"><span className="text-sm font-bold uppercase">{p.name}</span><span className="text-[9px] text-slate-400 font-code">{p.code}</span></div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[8px] uppercase">{p.type}</Badge></TableCell>
                      <TableCell className="font-code text-xs">{p.hsn}</TableCell>
                      <TableCell className="text-right px-8 font-display font-bold text-primary">₹ {p.saleRate.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </Card>
           </div> : (
            <div className="space-y-8">
              <div className="flex justify-between items-end gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {activeTab}s</p><p className="text-2xl font-display font-black text-[#001F3D] dark:text-white">{filteredRecords.length}</p></Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p><p className="text-2xl font-display font-black text-emerald-600">₹ {filteredRecords.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()}</p></Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Protocol</p><p className="text-2xl font-display font-black text-orange-500">{filteredRecords.filter(r => r.status === 'Pending').length}</p></Card>
                    <Card className="p-6 bg-white dark:bg-card border-none shadow-sm rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Settled Nodes</p><p className="text-2xl font-display font-black text-blue-500">{filteredRecords.filter(r => r.status === 'Paid' || r.status === 'Authorized').length}</p></Card>
                 </div>
                 <Button className="h-14 bg-[#001F3D] dark:bg-primary hover:bg-black text-white dark:text-card rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex gap-3 px-8" onClick={() => handleOpenForm(activeTab)}>
                    <Plus className="h-4 w-4" /> NEW {activeTab.toUpperCase()}
                 </Button>
              </div>

              <Card className="p-4 bg-white dark:bg-card border-slate-200 dark:border-border rounded-2xl flex gap-4">
                 <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input placeholder="SEARCH NUMBER OR CUSTOMER..." className="h-12 pl-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-[10px] font-black uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                 <Button variant="outline" className="h-12 px-6 rounded-xl font-bold uppercase text-[9px] gap-2"><Download className="h-4 w-4" /> Export Ledger</Button>
              </Card>

              <Card className="overflow-hidden border-none bg-white dark:bg-card shadow-sm rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow className="hover:bg-transparent"><TableHead className="px-8 py-5 font-black text-[9px] uppercase">Document Node</TableHead><TableHead className="font-black text-[9px] uppercase">Identity Account</TableHead><TableHead className="text-right font-black text-[9px] uppercase">Grand Total</TableHead><TableHead className="text-center font-black text-[9px] uppercase">State</TableHead><TableHead className="text-right px-8 font-black text-[9px] uppercase">Action</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>{filteredRecords.map(r => (
                    <TableRow key={r.id} onClick={() => handleOpenForm(r.type, r)} className="h-20 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                      <TableCell className="px-8"><div className="flex flex-col"><span className="text-xs font-bold text-primary font-code">{r.number}</span><span className="text-[9px] text-slate-400 font-bold uppercase">{r.date}</span></div></TableCell>
                      <TableCell><span className="text-sm font-black text-[#001F3D] dark:text-white uppercase tracking-tight">{r.customerName}</span></TableCell>
                      <TableCell className="text-right font-display font-black text-sm px-6">₹ {r.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className="text-[8px] font-black uppercase px-4 py-1.5 rounded-full border-slate-100">{r.status}</Badge></TableCell>
                      <TableCell className="text-right px-8"><ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary ml-auto" /></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
