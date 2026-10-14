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
  X,
  MoreVertical,
  Eye,
  Edit2,
  Fingerprint,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { Customer, BillingRecord, ProductMaster, BillingLineItem, UISettings, SystemUser } from '@/lib/types';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format, parseISO, isValid } from 'date-fns';

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
  users: SystemUser[];
  onSaveRecord: (record: BillingRecord) => void;
  onDeleteRecord: (id: string) => void;
  initialTab?: string;
}

export function BillingManagement({ 
  currentUser,
  customers, 
  records, 
  products, 
  users,
  onSaveRecord, 
  onDeleteRecord, 
  initialTab = 'quotation' 
}: BillingManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  // Secure Delete Protocol States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<BillingRecord | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // FINANCIAL YEAR HELPERS
  const getFinancialYear = useCallback((dateStr: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    // FY starts April 1st
    const startYear = month < 3 ? year - 1 : year;
    const endYear = startYear + 1;
    const startYearStr = startYear.toString().slice(-2);
    const endYearStr = endYear.toString().slice(-2);
    return `FY${startYearStr}-${endYearStr}`;
  }, []);

  const calculateNextQuotationNumber = useCallback((dateStr: string) => {
    const fy = getFinancialYear(dateStr);
    const prefix = `QUO/${fy}/`;
    const sameFY = records.filter(r => r.type === 'quotation' && r.number?.startsWith(prefix));
    
    if (sameFY.length === 0) return `${prefix}0001`;
    
    const sequences = sameFY.map(r => {
      const parts = r.number.split('/');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart) || 0;
    });
    const max = Math.max(...sequences);
    return `${prefix}${(max + 1).toString().padStart(4, '0')}`;
  }, [records, getFinancialYear]);

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

  // Re-calculate quotation number if date changes on a new record
  useEffect(() => {
    if (isRecordFormOpen && !formData.id?.startsWith('EXIST-') && formData.type === 'quotation' && formData.date) {
      const nextNum = calculateNextQuotationNumber(formData.date);
      if (nextNum !== formData.number) {
        setFormData(prev => ({ ...prev, number: nextNum }));
      }
    }
  }, [formData.date, formData.type, isRecordFormOpen, formData.id, formData.number, calculateNextQuotationNumber]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isType = r.type === activeTab;
      const matchesSearch = (r.number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return isType && matchesSearch;
    });
  }, [records, activeTab, searchTerm]);

  const handleOpenForm = (type: string, record?: BillingRecord, readOnly = false) => {
    setViewOnly(readOnly);
    if (record) {
      setFormData({ ...record, id: `EXIST-${record.id}` }); // Prefix to identify existing records
    } else {
      const initialDate = new Date().toISOString().split('T')[0];
      const initialNumber = type === 'quotation' 
        ? calculateNextQuotationNumber(initialDate)
        : `${type.substring(0, 3).toUpperCase()}-${(records.length + 1001)}`;

      setFormData({
        id: `NEW-${Date.now()}`, 
        type, 
        customerName: '', 
        customerId: '', 
        date: initialDate,
        number: initialNumber, 
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

  const handleOpenDelete = (record: BillingRecord) => {
    setRecordToDelete(record);
    setDeleteStep(1);
    setPasswordAttempt('');
    setShowDeletePassword(false);
    setIsDeleteDialogOpen(true);
  };

  const handleVerifyPassword = () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Session Protocol Error", description: "Identity not found in matrix." });
      return;
    }

    const isMasterAdmin = currentUser.toLowerCase() === 'master admin';
    let isMatch = false;

    if (isMasterAdmin) {
      isMatch = passwordAttempt === 'admin123';
    } else {
      const activeUser = users.find(u => u.name === currentUser || u.email === currentUser || u.username === currentUser);
      if (activeUser) {
        isMatch = passwordAttempt === activeUser.password || (!activeUser.password && passwordAttempt === 'user123');
      }
    }

    if (isMatch) setDeleteStep(3);
    else toast({ variant: "destructive", title: "Authentication Failed", description: "Incorrect Password" });
  };

  const handleFinalDelete = () => {
    if (!recordToDelete) return;
    onDeleteRecord(recordToDelete.id);
    toast({ title: "Purge Complete", description: "Record removed from master ledger." });
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
    setDeleteStep(1);
  };

  const FullPageEditor = () => {
    const handleUpdateField = useCallback((field: keyof BillingRecord, value: any) => {
      if (viewOnly) return;
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
      if (viewOnly) return;
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
      if (viewOnly) return;
      const newItem: BillingLineItem = { id: Date.now().toString(), description: '', hsn: '', qty: 1, unit: 'Nos', price: 0, discount: 0, discountType: 'percentage', gstRate: 18, total: 0 };
      setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const removeRow = (id: string) => {
      if (viewOnly) return;
      setFormData(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
    };

    const handleSaveLocal = (shouldPrint: boolean = false) => {
      if (viewOnly && !shouldPrint) {
        setIsRecordFormOpen(false);
        return;
      }
      
      if (!viewOnly) {
        if (!formData.customerId || !formData.number) {
          toast({ variant: "destructive", title: "Protocol Refused", description: "Identity and Doc Number required." });
          return;
        }
        const finalRecord = {
          ...formData,
          id: formData.id?.startsWith('NEW-') ? formData.id.replace('NEW-', '') : formData.id?.replace('EXIST-', ''),
          subTotal: totals.subTotal,
          taxTotal: totals.taxTotal,
          amount: totals.grandTotal,
          roundOff: totals.roundOff,
          updatedAt: new Date().toISOString()
        } as BillingRecord;
        onSaveRecord(finalRecord);
      }

      if (shouldPrint) {
        toast({ title: "Synchronizing Print Matrix..." });
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        setIsRecordFormOpen(false);
      }
    };

    const isProcurement = formData.type === 'purchase_invoice' || formData.type === 'purchase_order' || formData.type === 'outward_payment' || formData.type === 'job_work';

    return (
      <div className="flex flex-col bg-slate-50 min-h-screen animate-in fade-in duration-500 font-body pb-20 overflow-x-hidden print:bg-white print:p-0">
        {/* ACTION BAR (Top Sticky) */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 h-20 flex items-center justify-between shadow-md no-print">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsRecordFormOpen(false)} className="rounded-full h-12 w-12 hover:bg-slate-100 transition-all group">
              <X className="h-6 w-6 text-slate-400 group-hover:text-red-500" />
            </Button>
            <div className="flex flex-col">
               <div className="flex items-center gap-3 mb-1">
                 <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-2 py-0.5 tracking-[0.2em]">{formData.status}</Badge>
                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Protocol Node: {formData.number}</span>
               </div>
               <h2 className="text-2xl font-display font-black text-[#001F3D] uppercase leading-none tracking-tight">{formData.type?.replace('_', ' ')} {viewOnly ? 'Viewer' : 'Editor'}</h2>
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest border-slate-200 bg-white text-slate-500 hover:bg-slate-50 gap-2"><Share2 className="h-3.5 w-3.5" /> Share</Button>
             <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest border-slate-200 bg-white text-slate-500 hover:bg-slate-50 gap-2"><Download className="h-3.5 w-3.5" /> PDF Matrix</Button>
             <Button className="bg-[#10b981] hover:bg-emerald-600 text-white h-11 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-lg flex gap-3 transition-all" onClick={() => handleSaveLocal(true)}>
               <Printer className="h-4 w-4" /> {viewOnly ? 'Print Matrix' : 'Save & Print'}
             </Button>
             {!viewOnly && (
               <Button className="bg-[#001F3D] hover:bg-black text-white h-11 px-10 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-lg flex gap-3 transition-all" onClick={() => handleSaveLocal(false)}>
                 <Save className="h-4 w-4" /> Commit Node
               </Button>
             )}
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto w-full p-8 space-y-12 print:p-0 print:max-w-none">
          {/* PRINT-ONLY COMPANY HEADER */}
          <div className="hidden print:flex justify-between items-start border-b-2 border-[#001F3D] pb-10 mb-10">
             <div className="space-y-2">
                <h1 className="text-4xl font-display font-black text-[#001F3D] uppercase tracking-tighter">FEROCIOUS TECH</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Precision Engineering & Tool Room Hub</p>
                <div className="text-[10px] font-medium text-slate-500 max-w-sm">
                   Plot No. 45, Phase II, Industrial Estate, Pune, MH 411026
                </div>
             </div>
             <div className="text-right">
                <h2 className="text-5xl font-display font-black text-[#001F3D] uppercase tracking-tight mb-4">{formData.type?.replace('_', ' ')}</h2>
                <div className="space-y-1">
                   <p className="text-xs font-bold uppercase text-slate-400">Node Identifier: <span className="text-[#001F3D]">{formData.number}</span></p>
                   <p className="text-xs font-bold uppercase text-slate-400">Temporal Node: <span className="text-[#001F3D]">{formData.date}</span></p>
                </div>
             </div>
          </div>

          {/* HEADER SECTION: Identity & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2 print:gap-10">
            <Card className="p-10 bg-white border-slate-200/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] rounded-[3rem] space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all print:border-none print:shadow-none print:p-0">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity no-print"><Building2 className="h-24 w-24" /></div>
                <div className="flex justify-between items-center px-1 relative z-10 no-print">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">{isProcurement ? 'Vendor' : 'Customer'} Matrix</h4>
                   <Badge variant="outline" className="border-slate-100 text-[9px] font-bold uppercase">Identity Node</Badge>
                </div>
                
                <div className="space-y-6 relative z-10">
                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 print:block print:space-y-1">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Identify M/S.*</Label>
                      <div className="print:hidden">
                        <Select disabled={viewOnly} value={formData.customerId ?? ''} onValueChange={(id) => {
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
                      <div className="hidden print:block text-sm font-black uppercase text-[#001F3D]">{formData.customerName || 'N/A'}</div>
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-start gap-8 print:block print:space-y-1">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pt-3 print:text-[8px]">Billing Base</Label>
                      <div className="min-h-[100px] bg-slate-50/30 border-none rounded-2xl text-xs font-bold leading-relaxed shadow-inner text-slate-600 print:bg-white print:text-slate-700 print:text-[10px] print:min-h-0 print:rounded-none print:shadow-none">
                         {formData.address || 'Address information not initialized.'}
                      </div>
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 print:flex print:gap-10">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest print:hidden">Tax Identity</Label>
                      <div className="flex gap-4">
                        <div className="space-y-1">
                          <span className="hidden print:block text-[8px] font-bold text-slate-400 uppercase">GSTIN</span>
                          <Input className="h-12 bg-slate-50/30 border-none rounded-xl font-black font-code text-xs uppercase text-primary text-center print:bg-white print:text-left print:p-0 print:h-auto" value={formData.gstNumber ?? ''} placeholder="GSTIN" readOnly />
                        </div>
                        <div className="space-y-1">
                           <span className="hidden print:block text-[8px] font-bold text-slate-400 uppercase">PAN</span>
                           <Input className="h-12 bg-slate-50/30 border-none rounded-xl font-black font-code text-xs uppercase text-primary text-center print:bg-white print:text-left print:p-0 print:h-auto" value={formData.panNumber ?? ''} placeholder="PAN" readOnly />
                        </div>
                      </div>
                   </div>
                </div>
            </Card>

            <Card className="p-10 bg-white border-slate-200/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] rounded-[3rem] space-y-10 relative overflow-hidden group hover:border-primary/20 transition-all print:border-none print:shadow-none print:p-0">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity no-print"><Archive className="h-24 w-24" /></div>
                <div className="flex justify-between items-center px-1 relative z-10 no-print">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">Metadata Registry</h4>
                   <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-slate-300" /><span className="text-[9px] font-bold text-slate-300 uppercase">Archive Link Active</span></div>
                </div>

                <div className="space-y-8 relative z-10">
                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 print:block print:space-y-1">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Doc. Identifier*</Label>
                      <Input 
                        readOnly={viewOnly || formData.type === 'quotation'} 
                        className={cn(
                          "h-14 bg-slate-900 border-none rounded-2xl font-black font-code text-center text-white shadow-xl text-lg print:bg-white print:text-[#001F3D] print:text-left print:h-auto print:p-0 print:rounded-none print:shadow-none",
                          formData.type === 'quotation' && "bg-slate-800 opacity-80"
                        )} 
                        value={formData.number ?? ''} 
                        onChange={(e)=>handleUpdateField('number', e.target.value)} 
                      />
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 print:block print:space-y-1">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Protocol Date*</Label>
                      <div className="print:hidden">
                        <DatePicker disabled={viewOnly} value={formData.date ?? ''} onChange={(val)=>setFormData(prev => ({...prev, date: val}))} className="h-14 rounded-2xl shadow-sm border-2 border-slate-100 bg-white" />
                      </div>
                      <div className="hidden print:block text-sm font-black text-[#001F3D]">{formData.date}</div>
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 print:hidden">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Reference No.</Label>
                      <Input readOnly={viewOnly} className="h-12 bg-slate-50/50 border-none rounded-xl font-black text-xs px-6 shadow-inner" value={formData.referenceNumber ?? ''} onChange={(e)=>handleUpdateField('referenceNumber', e.target.value)} placeholder="PO/Quotation Reference..." />
                   </div>

                   <div className="grid grid-cols-[140px_1fr] items-center gap-8 print:block print:space-y-1">
                      <Label className="text-[11px] font-black text-[#001F3D] uppercase tracking-widest print:text-[8px]">Settlement Path</Label>
                      <div className="print:hidden">
                        <Select disabled={viewOnly} value={formData.paymentMethod ?? 'Bank Transfer'} onValueChange={(v)=>handleUpdateField('paymentMethod', v)}>
                          <SelectTrigger className="h-14 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-xs shadow-sm"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Bank Transfer" className="font-bold text-[10px] uppercase py-3">BANK_TRANSFER_PROTOCOL</SelectItem>
                            <SelectItem value="Cash" className="font-bold text-[10px] uppercase py-3">INTERNAL_CASH_SETTLEMENT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="hidden print:block text-xs font-bold text-slate-700">{formData.paymentMethod || 'Bank Transfer'}</div>
                   </div>
                </div>
            </Card>
          </div>

          {/* STEP 02: EXECUTION MATRIX (GRID) */}
          <div className="space-y-6 pt-12 print:pt-6">
            <div className="flex items-center justify-between border-l-4 border-[#10b981] pl-6 print:border-none print:pl-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shadow-xl shadow-emerald-500/10 no-print"><Box className="h-6 w-6" /></div>
                <div>
                   <h3 className="text-xl font-display font-black text-[#001F3D] uppercase tracking-tight print:text-xs">Execution Matrix</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 print:hidden">Document Line Items & Technical Specs</p>
                </div>
              </div>
              {!viewOnly && (
                <Button variant="outline" size="sm" onClick={addRow} className="h-11 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 bg-white border-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm no-print">
                  <Plus className="h-4 w-4" /> Append Matrix Node
                </Button>
              )}
            </div>

            <Card className="bg-white border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden print:border-none print:shadow-none print:rounded-none">
               <div className="overflow-x-auto">
                 <Table className="min-w-[1700px] print:min-w-full">
                   <TableHeader className="bg-slate-50/80 sticky top-0 z-20 print:bg-slate-100">
                      <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                        <TableHead className="px-6 py-6 text-[10px] font-black uppercase w-16 text-center border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">SR.</TableHead>
                        <TableHead className="text-[10px] font-black uppercase min-w-[500px] border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">DOCUMENT CONTENT / TECHNICAL LINE ITEMS</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-36 text-center border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">HSN CODE</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-28 text-center border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">QTY.</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-28 text-center border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">UOM</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-48 text-center border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">UNIT PRICE (₹)</TableHead>
                        <TableHead className="text-[10px] font-black uppercase w-32 text-center border-r border-slate-100 text-[#001F3D] print:py-3 print:text-[8px]">IGST %</TableHead>
                        <TableHead className="text-right px-10 text-[10px] font-black uppercase w-56 text-primary print:py-3 print:text-[8px] print:px-4">VALUATION (₹)</TableHead>
                        <TableHead className="w-16 no-print"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {(formData.items || []).map((item, idx) => (
                        <TableRow key={item.id} className="h-32 border-b border-slate-100 hover:bg-slate-50/30 transition-colors group print:h-auto">
                           <TableCell className="text-center font-display font-black text-slate-300 border-r border-slate-50 group-hover:text-primary transition-colors print:text-[#001F3D] print:text-xs print:py-4">{idx + 1}</TableCell>
                           <TableCell className="border-r border-slate-50 p-0 relative print:p-4">
                              <div className="flex flex-col h-full bg-white group-hover:bg-transparent transition-colors print:space-y-1">
                                <div className="print:hidden">
                                  <Select disabled={viewOnly} value={item.productId ?? ''} onValueChange={(pId) => {
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
                                </div>
                                <div className="hidden print:block text-sm font-black uppercase text-[#001F3D]">{item.description}</div>
                                <div className="px-8 pb-4 print:p-0">
                                   <Textarea readOnly={viewOnly} placeholder="Node-specific notes..." className="h-16 bg-slate-50/50 border-none text-[10px] rounded-2xl font-medium resize-none shadow-inner focus-visible:ring-primary/20 print:bg-white print:h-auto print:p-0 print:text-[8px]" value={item.note ?? ''} onChange={(e) => handleUpdateItem(idx, 'note', e.target.value)} />
                                </div>
                              </div>
                           </TableCell>
                           <TableCell className="border-r border-slate-50 p-4 print:text-center print:text-xs font-code">{item.hsn || '---'}</TableCell>
                           <TableCell className="border-r border-slate-50 p-4 text-center font-black print:text-xs">{item.qty}</TableCell>
                           <TableCell className="border-r border-slate-50 p-4 text-center font-black uppercase text-slate-400 print:text-xs">{item.unit}</TableCell>
                           <TableCell className="border-r border-slate-50 p-4 text-center font-display font-black print:text-xs">₹ {item.price?.toLocaleString()}</TableCell>
                           <TableCell className="border-r border-slate-50 p-4 text-center font-black print:text-xs">{item.gstRate}%</TableCell>
                           <TableCell className="text-right px-10 font-display font-black text-[#001F3D] text-lg bg-slate-50/30 group-hover:bg-transparent transition-all print:bg-white print:text-xs print:px-4">₹ {(item.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                           <TableCell className="text-center px-4 no-print"><Button disabled={viewOnly} variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" onClick={() => removeRow(item.id)}><Trash2 className="h-5 w-5" /></Button></TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-[#FFF9C4] hover:bg-[#FFF9C4] border-t-4 border-[#001F3D] print:bg-slate-50 print:border-t-2">
                         <TableCell colSpan={2} className="px-10 py-8 text-right font-black text-[11px] uppercase text-[#001F3D] border-r border-[#001F3D]/10 tracking-widest leading-none print:py-4 print:text-[9px]">Aggregate Matrix Yield</TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="text-center font-display font-black text-xl border-r border-[#001F3D]/10 text-[#001F3D] print:text-sm">{(formData.items || []).reduce((acc, i) => acc + (i.qty || 0), 0)}</TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="border-r border-[#001F3D]/10"></TableCell>
                         <TableCell className="text-right px-10 font-display font-black text-3xl text-[#001F3D] print:text-lg print:px-4">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                         <TableCell className="no-print"></TableCell>
                      </TableRow>
                   </TableBody>
                 </Table>
               </div>
            </Card>

            {/* BOTTOM SECTION: SETTLEMENT & TERMS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-12 print:grid-cols-2 print:gap-10">
               <div className="lg:col-span-7 space-y-10 print:col-span-1 print:space-y-6">
                  <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[3rem] space-y-10 relative overflow-hidden group print:p-0 print:border-none print:shadow-none">
                     <div className="flex items-center gap-3 border-l-4 border-[#001F3D] pl-6 relative z-10 print:pl-2"><h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] print:text-[8px]">Terms & Conditions</h4></div>
                     <div className="space-y-6 relative z-10">
                        <Textarea readOnly={viewOnly} className="min-h-[160px] bg-slate-50/50 border-none rounded-2xl text-[13px] font-bold leading-relaxed shadow-inner p-8 text-slate-600 print:bg-white print:p-0 print:text-[10px] print:min-h-0" value={formData.terms ?? ""} onChange={(e)=>handleUpdateField('terms', e.target.value)} />
                     </div>
                  </Card>

                  <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[3rem] relative overflow-hidden group no-print">
                     <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-6 mb-8 relative z-10"><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Internal Audit Logs</h4></div>
                     <div className="space-y-4 relative z-10">
                        <Textarea readOnly={viewOnly} className="min-h-[100px] bg-slate-50/50 border-none rounded-2xl text-xs font-medium italic shadow-inner p-6" placeholder="Restricted visibility node..." value={formData.note ?? ""} onChange={(e)=>handleUpdateField('note', e.target.value)} />
                     </div>
                  </Card>
               </div>

               <div className="lg:col-span-5 print:col-span-1">
                  <Card className="p-10 bg-white border-slate-200/80 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.1)] rounded-[4rem] space-y-8 relative overflow-hidden border-t-8 border-t-[#001F3D] print:p-0 print:border-none print:shadow-none">
                     <div className="space-y-8 relative z-10">
                        <div className="flex justify-between items-center px-4 print:px-0">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest print:text-[8px]">Base Valuation</span>
                           <span className="text-xl font-display font-black text-[#001F3D] print:text-sm">₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 shadow-inner print:p-4 print:bg-white print:rounded-none print:border-y-2 print:space-y-3">
                           <div className="flex justify-between items-center group">
                             <Label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2 print:text-[8px]"><Truck className="h-4 w-4 no-print" /> Addl Charges (₹)</Label>
                             <div className="print:hidden">
                                <Input readOnly={viewOnly} type="number" className="w-44 h-12 text-right font-black border-2 border-transparent bg-white rounded-xl shadow-sm focus:border-emerald-500 transition-all text-lg text-[#001F3D]" value={formData.transportationCharges ?? 0} onChange={(e) => handleUpdateField('transportationCharges', Number(e.target.value))} />
                             </div>
                             <span className="hidden print:block text-xs font-black text-[#001F3D]">₹ {totals.extraCharges.toLocaleString()}</span>
                           </div>
                           
                           <div className="flex justify-between items-center"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest print:text-[8px]">Aggregate Tax</span><span className="text-base font-display font-black text-slate-900 print:text-xs">₹ {totals.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                           
                           <div className="flex items-center justify-between no-print">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Discount (₹)</span>
                              <Input readOnly={viewOnly} type="number" className="w-32 border-none bg-white h-10 text-right font-black text-lg text-rose-500 rounded-xl" value={formData.discountTotal ?? 0} onChange={(e)=>handleUpdateField('discountTotal', Number(e.target.value))} />
                           </div>
                        </div>

                        <div className="flex justify-between items-center py-4 px-6 border-y border-slate-100 print:py-2 print:px-0">
                           <span className="text-[11px] font-black text-[#001F3D] uppercase tracking-widest print:text-[9px]">Institutional Net Value</span>
                           <span className="text-4xl font-display font-black text-[#001F3D] print:text-xl">₹ {totals.grandTotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="pt-10 space-y-6 print:pt-4">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] text-center print:text-left print:text-[7px]">Transcription Protocol</p>
                           <div className="p-8 bg-slate-900 rounded-[2.5rem] text-center print:p-0 print:bg-white">
                              <p className="text-[12px] font-black text-emerald-400 uppercase leading-relaxed print:text-[#001F3D] print:text-left print:text-[10px]">{numberToWords(totals.grandTotal)}</p>
                           </div>
                        </div>
                     </div>
                  </Card>

                  {/* SIGNATURE SECTION (PRINT ONLY) */}
                  <div className="hidden print:block mt-20 pt-10 border-t-2 border-slate-100">
                     <div className="flex justify-between items-end">
                        <div className="space-y-8">
                           <div className="h-16 w-32 border-2 border-dashed border-slate-100 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">STAMP_NODE</span>
                           </div>
                           <p className="text-[10px] font-black uppercase text-[#001F3D]">Authorized Signatory</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4">Verification Matrix Sync v2.4</p>
                           <div className="h-1 w-40 bg-slate-100 rounded-full ml-auto" />
                        </div>
                     </div>
                  </div>
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
                    <TableRow key={r.id} className="h-28 border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
                      <TableCell className="px-10" onClick={() => handleOpenForm(activeTab, r, true)}>
                         <div className="flex flex-col gap-1.5 cursor-pointer">
                            <span className="font-black text-[14px] text-primary font-code tracking-tight">{r.number}</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{r.date}</span>
                         </div>
                      </TableCell>
                      <TableCell onClick={() => handleOpenForm(activeTab, r, true)}><span className="text-[17px] font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors leading-tight cursor-pointer">{r.customerName}</span></TableCell>
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
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] border-slate-100 shadow-2xl p-2 font-body">
                              <DropdownMenuItem onClick={() => handleOpenForm(activeTab, r, true)} className="text-[10px] font-black uppercase py-3 px-4 gap-3 cursor-pointer"><Eye className="h-4 w-4 text-slate-400" /> View {activeTab.replace('_', ' ')}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenForm(activeTab, r)} className="text-[10px] font-black uppercase py-3 px-4 gap-3 cursor-pointer"><Edit2 className="h-4 w-4 text-primary" /> Edit {activeTab.replace('_', ' ')}</DropdownMenuItem>
                              
                              <DropdownMenuSeparator className="bg-slate-50 my-2" />
                              
                              <DropdownMenuItem onClick={() => handleOpenForm('invoice', r)} className="text-[10px] font-black uppercase py-3 px-4 gap-3 cursor-pointer text-indigo-600"><Receipt className="h-4 w-4" /> Create Invoice</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenForm('purchase_order', r)} className="text-[10px] font-black uppercase py-3 px-4 gap-3 cursor-pointer text-indigo-600"><ShoppingCart className="h-4 w-4" /> Create Purchase Order</DropdownMenuItem>
                              
                              <DropdownMenuSeparator className="bg-slate-50 my-2" />
                              
                              <DropdownMenuItem onClick={() => handleOpenDelete(r)} className="text-[10px] font-black uppercase py-3 px-4 gap-3 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"><Trash2 className="h-4 w-4" /> Delete {activeTab.replace('_', ' ')}</DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* SECURE DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setShowDeletePassword(false);
          setPasswordAttempt('');
          setDeleteStep(1);
        }
      }}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
           <DialogHeader className="p-8 bg-red-600 text-white flex flex-row items-center gap-4 shrink-0">
              <div className="p-3 bg-white/20 rounded-xl"><Trash2 className="h-8 w-8" /></div>
              <div>
                 <DialogTitle className="text-2xl font-display font-black uppercase">Secure Purge Protocol</DialogTitle>
                 <DialogDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Data Safety Gate</DialogDescription>
              </div>
           </DialogHeader>

           <div className="p-10 space-y-10">
              {deleteStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                   <p className="text-sm font-bold text-slate-700 leading-relaxed">Are you sure you want to delete this {activeTab.replace('_', ' ')} from the master ledger?</p>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Document Node</p>
                      <h4 className="text-lg font-black text-[#001F3D] uppercase leading-tight">{recordToDelete?.number}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{recordToDelete?.customerName}</p>
                   </div>
                   <div className="flex gap-4">
                      <Button variant="ghost" className="flex-1 rounded-xl h-12 uppercase font-bold text-[10px]" onClick={() => setIsDeleteDialogOpen(false)}>Abort</Button>
                      <Button className="flex-1 bg-[#001F3D] text-white rounded-xl h-12 uppercase font-bold text-[10px]" onClick={() => setDeleteStep(2)}>Confirm Intent</Button>
                   </div>
                </div>
              )}

              {deleteStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                      <Fingerprint className="h-6 w-6 text-blue-600" />
                      <p className="text-xs font-bold text-blue-700 uppercase leading-relaxed">Identity verification required. Enter your account password to authorize deletion.</p>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Authentication Key</Label>
                      <div className="relative">
                        <Input 
                          type={showDeletePassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="h-14 bg-slate-50 border-none rounded-xl text-center font-bold text-lg shadow-inner pr-14"
                          value={passwordAttempt}
                          onChange={(e) => setPasswordAttempt(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors z-20"
                        >
                          {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <Button variant="ghost" className="flex-1 rounded-xl h-12 uppercase font-bold text-[10px]" onClick={() => setDeleteStep(1)}>Back</Button>
                      <Button className="flex-1 bg-blue-600 text-white rounded-xl h-12 uppercase font-bold text-[10px]" onClick={handleVerifyPassword}>Authorize Purge</Button>
                   </div>
                </div>
              )}

              {deleteStep === 3 && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                   <div className="flex flex-col items-center text-center gap-6">
                      <div className="p-6 bg-red-50 rounded-full animate-pulse"><AlertTriangle className="h-14 w-14 text-red-600" /></div>
                      <div className="space-y-2">
                         <h4 className="text-xl font-display font-black text-red-600 uppercase">Permanent Data Destruction</h4>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed px-6">Warning: This action permanently deletes the selected record and cannot be undone.</p>
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <Button variant="ghost" className="flex-1 rounded-xl h-12 uppercase font-bold text-[10px]" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-red-600/20" onClick={handleFinalDelete}>Delete Permanently</Button>
                   </div>
                </div>
              )}
           </div>
           
           <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em]">Institutional Security Protocol v2.4</p>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
