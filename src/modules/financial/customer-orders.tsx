
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  UserPlus, 
  Plus, 
  Edit2, 
  Check, 
  Printer, 
  XCircle, 
  Info, 
  ClipboardList, 
  Receipt,
  X,
  Building2,
  Truck,
  Archive,
  ChevronRight,
  TrendingUp,
  FileText,
  ShoppingCart,
  Landmark,
  PackageCheck,
  Target,
  DollarSign,
  History,
  Activity,
  Contact,
  MoreVertical,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  LayoutGrid
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const CUSTOMER_TYPES = [
  "OEM", "Supplier", "Channel Partner", "Dealer", "Corporate", "Government", "R&D Customer", "Strategic Customer"
];

const INDUSTRIES = [
  "Automotive", "Aerospace", "Medical", "Consumer Electronics", "Energy", "Defence", "General Engineering"
];

interface CustomerOrdersProps {
  customers: Customer[];
  vendors: Vendor[];
  billing: BillingRecord[];
  orders: Order[];
  onSaveCustomer: (customer: Customer) => void;
  onSaveVendor: (vendor: Vendor) => void;
}

export function CustomerOrders({ customers, vendors, billing, orders, onSaveCustomer, onSaveVendor }: CustomerOrdersProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'vendors'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  
  const [isAddIdentityOpen, setIsAddIdentityOpen] = useState(false);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([]);
  
  const [newIdentity, setNewIdentity] = useState({
    name: '',
    companyType: 'Customer' as 'Customer' | 'Vendor' | 'Both',
    gstNumber: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    registrationType: 'Unregistered',
    pan: '',
    address: '',
    addressLine2: '',
    landmark: '',
    city: '',
    shippingAddress: '',
    type: 'Corporate' as 'Corporate' | 'Individual',
    industry: 'General Engineering',
    customerType: 'Corporate'
  });

  const kpis = useMemo(() => {
    const active = customers.filter(c => c.status !== 'Closed').length;
    const inactive = customers.length - active;
    const totalPO = billing.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInvoiced = billing.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayments = billing.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalPayments;
    const openQuotes = billing.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    const openWO = orders.filter(o => ['Active', 'Production', 'Planning'].includes(o.status)).length;
    const activeInv = billing.filter(r => r.type === 'invoice' && r.status === 'Pending').length;

    return { total: customers.length, active, inactive, totalPO, outstanding, openQuotes, openWO, activeInv };
  }, [customers, billing, orders]);

  const filteredItems = useMemo(() => {
    const list = activeSubTab === 'customers' ? customers : vendors;
    return list.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item as any).city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeFilter === 'All' || item.status === activeFilter;
      const matchesIndustry = industryFilter === 'All' || (item as any).industry === industryFilter;
      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [searchTerm, customers, vendors, activeSubTab, activeFilter, industryFilter]);

  const getCustomerIntelligence = (id: string) => {
    const cBilling = billing.filter(r => r.customerId === id || r.customerName === customers.find(c => c.id === id)?.name);
    const cOrders = orders.filter(o => o.customerId === id || o.customer === customers.find(c => c.id === id)?.name);
    
    const poVal = cBilling.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const invoiced = cBilling.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const payments = cBilling.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = invoiced - payments;
    const quotes = cBilling.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    const activeWO = cOrders.filter(o => ['Active', 'Production', 'Planning'].includes(o.status)).length;
    const completedWO = cOrders.filter(o => o.status === 'Completed').length;
    const pendingDispatch = cOrders.filter(o => o.status === 'Ready for Delivery' || o.status === 'Dispatch').length;

    // Health Score Logic (A+ to D)
    let health: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
    if (outstanding <= 0 && poVal > 1000000) health = 'A+';
    else if (outstanding < poVal * 0.2) health = 'A';
    else if (outstanding > poVal * 0.5) health = 'C';
    else if (outstanding > poVal) health = 'D';

    return { poVal, outstanding, quotes, activeWO, completedWO, pendingDispatch, health, invoiced, payments };
  };

  const selectedCustomerData = useMemo(() => {
    if (!selectedCustomerId) return null;
    const base = customers.find(c => c.id === selectedCustomerId);
    if (!base) return null;
    return { ...base, intel: getCustomerIntelligence(base.id) };
  }, [selectedCustomerId, customers, billing, orders]);

  const handleInputChange = (field: string, value: any) => {
    setNewIdentity(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveIdentity = () => {
    if (!newIdentity.name.trim() || !newIdentity.city.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Company Name and City are required." });
      return;
    }
    const id = editingIdentityId || `${newIdentity.companyType === 'Vendor' ? 'VEND' : 'CUST'}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (newIdentity.companyType === 'Vendor') {
      const vendorData: Vendor = {
        id, name: newIdentity.name, type: newIdentity.type, contact: newIdentity.contactNumber, email: newIdentity.email,
        gstNumber: newIdentity.gstNumber.toUpperCase(), pan: newIdentity.pan.toUpperCase(), registrationType: newIdentity.registrationType,
        address: newIdentity.address, addressLine2: newIdentity.addressLine2, landmark: newIdentity.landmark,
        city: newIdentity.city, shippingAddress: newIdentity.shippingAddress || newIdentity.address,
        activeOrders: 0, rating: 5.0, status: 'Active'
      };
      onSaveVendor(vendorData);
    } else {
      const customerData: Customer = {
        id, name: newIdentity.name, companyType: newIdentity.companyType, gstNumber: newIdentity.gstNumber.toUpperCase(),
        contactPerson: newIdentity.contactPerson, contactNumber: newIdentity.contactNumber, email: newIdentity.email,
        registrationType: newIdentity.registrationType, pan: newIdentity.pan.toUpperCase(), address: newIdentity.address,
        addressLine2: newIdentity.addressLine2, landmark: newIdentity.landmark, city: newIdentity.city,
        shippingAddress: newIdentity.shippingAddress || newIdentity.address, type: newIdentity.type, location: newIdentity.city,
        totalOrders: 0, status: 'Active'
      };
      onSaveCustomer(customerData);
    }
    toast({ title: "Identity Synchronized", description: `${newIdentity.name} details committed.` });
    setIsAddIdentityOpen(false); setEditingIdentityId(null);
  };

  const handleSelectAll = () => {
    if (selectedIdentities.length === filteredItems.length) setSelectedIdentities([]);
    else setSelectedIdentities(filteredItems.map(c => c.id));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIdentities(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const HealthBadge = ({ health }: { health: string }) => {
    const colors: Record<string, string> = {
      'A+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'A': 'bg-green-50 text-green-700 border-green-200',
      'B': 'bg-blue-50 text-blue-700 border-blue-200',
      'C': 'bg-amber-50 text-amber-700 border-amber-200',
      'D': 'bg-red-50 text-red-700 border-red-200'
    };
    return <Badge className={cn("text-[10px] font-black px-2 py-0.5 border shadow-sm", colors[health] || 'bg-slate-100')}>{health}</Badge>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <Target className="h-4 w-4" />
            Strategic Relationship Matrix
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Customer <span className="text-slate-400 font-medium">Intelligence Center</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Manage customers, financials, quotations, work orders, invoices and business relationships.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search identity node..." 
              className="h-11 pl-10 rounded-xl bg-white border-slate-200 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => { setEditingIdentityId(null); setIsAddIdentityOpen(true); }}
            className="bg-[#001F3D] hover:bg-black text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl"
          >
            <UserPlus className="mr-3 h-4 w-4" /> Register New Identity
          </Button>
        </div>
      </header>

      {/* TOP KPI SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-1">
        {[
          { label: 'Total', val: kpis.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', val: kpis.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', val: kpis.inactive, icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
          { label: 'PO Value', val: `₹ ${(kpis.totalPO / 100000).toFixed(1)}L`, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Outstanding', val: `₹ ${(kpis.outstanding / 100000).toFixed(1)}L`, icon: Landmark, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Open Quotes', val: kpis.openQuotes, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active WO', val: kpis.openWO, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Inv', val: kpis.activeInv, icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(item => (
          <Card key={item.label} className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none">{item.label}</p>
               <div className={cn("p-1.5 rounded-lg shadow-sm", item.bg, item.color)}><item.icon className="h-3 w-3" /></div>
            </div>
            <p className={cn("text-xl font-display font-black leading-none", item.color)}>{item.val}</p>
          </Card>
        ))}
      </div>

      <Tabs value={activeSubTab} onValueChange={(v: any) => setActiveSubTab(v)} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-8 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
          <TabsTrigger value="customers" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <Building2 className="h-4 w-4 mr-2" /> Customer Ledger
          </TabsTrigger>
          <TabsTrigger value="vendors" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
            <Truck className="h-4 w-4 mr-2" /> Vendor Ledger
          </TabsTrigger>
        </TabsList>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><ClipboardList className="h-6 w-6" /></div>
               <div>
                  <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identity Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Master Directory Sync Active</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-white text-[10px] font-bold uppercase border-slate-200 rounded-xl"><SelectValue placeholder="All Industries" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Industries</SelectItem>
                  {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm"><Download className="h-3.5 w-3.5" /> Export Intelligence</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-slate-100 shadow-2xl p-1">
                   <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4">Export Customer List</DropdownMenuItem>
                   <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4">Export Global Ledger</DropdownMenuItem>
                   <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4">Export Outstanding Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white border-b border-slate-100">
                <TableRow>
                  <TableHead className="w-12 px-6"><Checkbox checked={selectedIdentities.length === filteredItems.length && filteredItems.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6">Customer / Account</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400">Industry / City</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400">Financial Hub (₹)</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center">Ops Nodes</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-center">Health</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-right px-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const intel = activeSubTab === 'customers' ? getCustomerIntelligence(item.id) : null;
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-50 h-24 transition-all group">
                      <TableCell className="px-6"><Checkbox checked={selectedIdentities.includes(item.id)} onCheckedChange={() => handleToggleSelect(item.id)} /></TableCell>
                      <TableCell onClick={() => activeSubTab === 'customers' && setSelectedCustomerId(item.id)} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                          <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">GSTIN: {item.gstNumber || '---'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-700 uppercase">{(item as any).industry || 'General'}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{item.city || item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         {intel ? (
                           <div className="flex flex-col gap-1">
                             <div className="flex justify-between w-32"><span className="text-[8px] font-bold text-slate-400 uppercase">Out:</span><span className="text-[11px] font-black text-rose-600">₹ {intel.outstanding.toLocaleString()}</span></div>
                             <div className="flex justify-between w-32"><span className="text-[8px] font-bold text-slate-400 uppercase">PO:</span><span className="text-[11px] font-black text-[#001F3D]">₹ {intel.poVal.toLocaleString()}</span></div>
                           </div>
                         ) : '---'}
                      </TableCell>
                      <TableCell className="text-center">
                        {intel ? (
                          <div className="inline-flex gap-4">
                             <div className="flex flex-col items-center"><span className="text-sm font-display font-black text-indigo-600">{intel.activeWO}</span><span className="text-[7px] font-black text-slate-300 uppercase">Active WO</span></div>
                             <div className="flex flex-col items-center"><span className="text-sm font-display font-black text-amber-600">{intel.quotes}</span><span className="text-[7px] font-black text-slate-300 uppercase">Quotes</span></div>
                          </div>
                        ) : '---'}
                      </TableCell>
                      <TableCell className="text-center">
                        {intel && <HealthBadge health={intel.health} />}
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-2xl p-1">
                               <DropdownMenuItem onClick={() => setSelectedCustomerId(item.id)} className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><ExternalLink className="h-4 w-4" /> View Profile</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => { setEditingIdentityId(item.id); setIsAddIdentityOpen(true); }} className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><Edit2 className="h-4 w-4" /> Edit Detail</DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-primary"><FileText className="h-4 w-4" /> Create Quotation</DropdownMenuItem>
                               <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-primary"><ShoppingCart className="h-4 w-4" /> Create Customer PO</DropdownMenuItem>
                               <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-primary"><Receipt className="h-4 w-4" /> Create Invoice</DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-rose-600"><XCircle className="h-4 w-4" /> Revoke Identity</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </Tabs>

      {/* CUSTOMER INTELLIGENCE SIDE PANEL */}
      <Sheet open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        <SheetContent className="sm:max-w-[800px] p-0 border-none shadow-2xl bg-white flex flex-col h-screen font-body overflow-hidden">
          {selectedCustomerData && (
            <>
              <SheetHeader className="p-8 bg-[#001F3D] text-white flex flex-row justify-between items-center shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md">
                       <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <SheetTitle className="text-3xl font-display font-black uppercase tracking-tight text-white leading-none">{selectedCustomerData.name}</SheetTitle>
                          <HealthBadge health={selectedCustomerData.intel.health} />
                       </div>
                       <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Account Identity Matrix Node: {selectedCustomerData.id}</SheetDescription>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setSelectedCustomerId(null)} className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"><X className="h-8 w-8" /></Button>
              </SheetHeader>

              <ScrollArea className="flex-1">
                 <div className="p-8 space-y-12">
                    <Tabs defaultValue="intel" className="w-full">
                       <TabsList className="bg-slate-50 border border-slate-100 p-1 rounded-full mb-10 h-12 w-full flex justify-between gap-1 shadow-inner">
                          <TabsTrigger value="intel" className="flex-1 rounded-full h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-md transition-all">Intelligence</TabsTrigger>
                          <TabsTrigger value="profile" className="flex-1 rounded-full h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-md transition-all">Identity Profile</TabsTrigger>
                          <TabsTrigger value="financials" className="flex-1 rounded-full h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-md transition-all">Financial Hub</TabsTrigger>
                          <TabsTrigger value="timeline" className="flex-1 rounded-full h-10 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] data-[state=active]:shadow-md transition-all">Temporal Matrix</TabsTrigger>
                       </TabsList>

                       <TabsContent value="intel" className="m-0 space-y-10 animate-in fade-in duration-500">
                          <div className="grid grid-cols-2 gap-6">
                             <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-4">
                                <div className="flex items-center gap-3 text-primary"><DollarSign className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Financial Standing</h4></div>
                                <div className="space-y-4">
                                   <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-slate-400 uppercase">Net Outstanding</span><span className="text-3xl font-display font-black text-rose-600">₹ {selectedCustomerData.intel.outstanding.toLocaleString()}</span></div>
                                   <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">Customer PO Value</span><span className="text-sm font-display font-black text-[#001F3D]">₹ {selectedCustomerData.intel.poVal.toLocaleString()}</span></div>
                                </div>
                             </Card>
                             <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-4">
                                <div className="flex items-center gap-3 text-indigo-600"><Target className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Operational Yield</h4></div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="text-center py-4 bg-white rounded-2xl shadow-sm border border-slate-100"><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Active WO</p><p className="text-2xl font-display font-black text-indigo-600">{selectedCustomerData.intel.activeWO}</p></div>
                                   <div className="text-center py-4 bg-white rounded-2xl shadow-sm border border-slate-100"><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">In Review</p><p className="text-2xl font-display font-black text-amber-600">{selectedCustomerData.intel.quotes}</p></div>
                                </div>
                             </Card>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-l-4 border-primary pl-4">Critical Action Gateway</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  { label: 'Follow-up', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
                                  { label: 'Pending PO', icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
                                  { label: 'Payment Due', icon: Receipt, color: 'text-rose-600', bg: 'bg-rose-50' },
                                  { label: 'Dispatch Hub', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                ].map(task => (
                                  <Card key={task.label} className="p-4 bg-white border border-slate-100 hover:border-primary transition-all cursor-pointer flex flex-col items-center gap-3 text-center rounded-2xl shadow-sm">
                                     <div className={cn("p-2 rounded-xl", task.bg, task.color)}><task.icon className="h-5 w-5" /></div>
                                     <span className="text-[9px] font-bold uppercase text-slate-700">{task.label}</span>
                                  </Card>
                                ))}
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="profile" className="m-0 animate-in fade-in duration-500">
                          <Card className="p-10 bg-slate-50 border-none shadow-inner rounded-[2.5rem] space-y-12">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {[
                                  { label: 'Contact Personnel', val: selectedCustomerData.contactPerson, icon: User },
                                  { label: 'Network Email', val: selectedCustomerData.email, icon: Mail },
                                  { label: 'Contact Node', val: selectedCustomerData.contactNumber, icon: Phone },
                                  { label: 'Industry Vertical', val: (selectedCustomerData as any).industry, icon: Briefcase },
                                  { label: 'Identity Classification', val: (selectedCustomerData as any).customerType || 'Corporate', icon: ShieldCheck },
                                  { label: 'Node Location', val: selectedCustomerData.city, icon: Target },
                                ].map(info => (
                                  <div key={info.label} className="space-y-1">
                                     <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><info.icon className="h-3 w-3" /> {info.label}</div>
                                     <p className="text-sm font-bold text-[#001F3D] uppercase truncate">{info.val}</p>
                                  </div>
                                ))}
                             </div>
                             <div className="space-y-8 pt-10 border-t border-slate-200">
                                <div className="space-y-2"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registered Office Hub</p><p className="text-xs font-medium text-slate-600 leading-relaxed uppercase">{selectedCustomerData.address}</p></div>
                                <div className="space-y-2"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dispatch / Shipping Matrix</p><p className="text-xs font-medium text-slate-600 leading-relaxed uppercase">{selectedCustomerData.shippingAddress}</p></div>
                             </div>
                          </Card>
                       </TabsContent>

                       <TabsContent value="financials" className="m-0 space-y-10 animate-in fade-in duration-500">
                          <Card className="p-10 bg-[#1E293B] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                             <div className="relative z-10 space-y-12">
                                <div className="flex justify-between items-start">
                                   <div><p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Institutional Liquidity Index</p><h4 className="text-4xl font-display font-black tracking-tighter">₹ {selectedCustomerData.intel.outstanding.toLocaleString()}</h4></div>
                                   <Badge className="bg-rose-500 text-white border-none text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-xl">OVERDUE_ALERT</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-10">
                                   <div><p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Invoiced</p><p className="text-lg font-display font-black">₹ {selectedCustomerData.intel.invoiced.toLocaleString()}</p></div>
                                   <div><p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Collected</p><p className="text-lg font-display font-black text-emerald-400">₹ {selectedCustomerData.intel.payments.toLocaleString()}</p></div>
                                   <div><p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">PO Locked</p><p className="text-lg font-display font-black text-primary">₹ {selectedCustomerData.intel.poVal.toLocaleString()}</p></div>
                                </div>
                             </div>
                          </Card>
                          <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center opacity-40">
                             <TrendingUp className="h-12 w-12 text-slate-300 mb-4" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">Revenue Growth Analytics & Payment Velocity Charts</p>
                             <p className="text-[8px] text-slate-400 mt-1 uppercase italic">Generating historical yield trend matrix...</p>
                          </div>
                       </TabsContent>

                       <TabsContent value="timeline" className="m-0 animate-in fade-in duration-500">
                          <div className="relative pl-10 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                             {[
                               { label: 'Customer Created', date: '---', icon: Contact, color: 'bg-blue-600' },
                               { label: 'Quotation Generated', date: '---', icon: FileText, color: 'bg-amber-600' },
                               { label: 'Customer PO Received', date: '---', icon: ShoppingCart, color: 'bg-emerald-600' },
                               { label: 'Work Order Created', date: '---', icon: Target, color: 'bg-indigo-600' },
                               { label: 'Invoice Raised', date: '---', icon: Receipt, color: 'bg-orange-600' },
                               { label: 'Dispatch Completed', date: '---', icon: PackageCheck, color: 'bg-slate-900' },
                             ].map((evt, i) => (
                               <div key={i} className="relative group">
                                  <div className={cn("absolute -left-10 top-0 h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110", evt.color)}><evt.icon className="h-5 w-5" /></div>
                                  <div className="flex flex-col">
                                     <h5 className="text-sm font-black text-[#001F3D] uppercase tracking-tight">{evt.label}</h5>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Initialized • Ledger Sync Active</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </TabsContent>
                    </Tabs>
                 </div>
              </ScrollArea>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fidelity Link Active</span></div>
                 <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest gap-2 bg-white" onClick={() => handleEditIdentity(selectedCustomerData)}><Edit2 className="h-4 w-4" /> Edit Account</Button>
                    <Button className="rounded-xl bg-[#001F3D] text-white h-12 px-10 font-bold uppercase text-[10px] tracking-widest shadow-xl">Close Matrix</Button>
                 </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isAddIdentityOpen} onOpenChange={setIsAddIdentityOpen}>
        <DialogContent className="max-w-6xl h-[92vh] bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem] flex flex-col">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 shrink-0 flex flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <ClipboardList className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">{editingIdentityId ? 'Modify Identity' : 'Identify Matrix Node'}</DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Identity Profile Matrix</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsAddIdentityOpen(false)} className="rounded-full h-12 w-12 text-slate-300 hover:text-red-500 transition-colors">
              <X className="h-7 w-7" />
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-12 space-y-12">
              <div className="space-y-4 max-w-4xl mx-auto">
                <FormFieldRow label="Company Type">
                  <RadioGroup 
                    value={newIdentity.companyType} 
                    onValueChange={(val: any) => handleInputChange('companyType', val)}
                    className="flex gap-10"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Customer" id="ct-customer" className="h-5 w-5 border-2 border-emerald-500 text-emerald-500" />
                      <Label htmlFor="ct-customer" className="text-sm font-bold text-slate-600 cursor-pointer">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Vendor" id="ct-vendor" className="h-5 w-5 border-2 border-emerald-500 text-emerald-500" />
                      <Label htmlFor="ct-vendor" className="text-sm font-bold text-slate-600 cursor-pointer">Vendor</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Both" id="ct-both" className="h-5 w-5 border-2 border-emerald-500 text-emerald-500" />
                      <Label htmlFor="ct-both" className="text-sm font-bold text-slate-600 cursor-pointer">Customer / Vendor</Label>
                    </div>
                  </RadioGroup>
                </FormFieldRow>

                <FormFieldRow label="GSTIN">
                  <div className="relative group">
                    <Input 
                      placeholder="ENTER GSTIN NUMBER" 
                      className="h-12 pr-32 bg-slate-50/50 border-slate-200 rounded-xl font-bold uppercase text-xs focus-visible:ring-emerald-500/20"
                      value={newIdentity.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      className="absolute right-1 top-1 h-10 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase rounded-lg px-4"
                      onClick={() => toast({title: "GST Lookup", description: "Verifying GSTIN with national database..."})}
                    >
                      Auto Fill
                    </Button>
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Company Name" required>
                  <Input 
                    placeholder="Enter Company Name" 
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                    value={newIdentity.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </FormFieldRow>

                <FormFieldRow label="Industry Vertical">
                   <Select value={newIdentity.industry} onValueChange={(val) => handleInputChange('industry', val)}>
                      <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-xs"><SelectValue placeholder="Select Industry..." /></SelectTrigger>
                      <SelectContent className="rounded-xl">{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                   </Select>
                </FormFieldRow>

                <FormFieldRow label="Customer Category">
                   <Select value={newIdentity.customerType} onValueChange={(val) => handleInputChange('customerType', val)}>
                      <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-xs"><SelectValue placeholder="Select Category..." /></SelectTrigger>
                      <SelectContent className="rounded-xl">{CUSTOMER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                   </Select>
                </FormFieldRow>

                <FormFieldRow label="Contact Person">
                  <Input 
                    placeholder="Enter Contact Person" 
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                    value={newIdentity.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact No">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Mobile Number" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs pr-12"
                      value={newIdentity.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    />
                    <Info className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Email">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Email ID" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs pr-12"
                      value={newIdentity.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    <Info className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="PAN">
                  <Input 
                    placeholder="Enter PAN Number" 
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-xs"
                    value={newIdentity.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
                  />
                </FormFieldRow>
              </div>

              {/* Billing Address Section */}
              <div className="space-y-6 pt-12 border-t border-slate-100 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Billing Address Matrix</h3>
                </div>

                <div className="space-y-4">
                  <FormFieldRow label="Address">
                    <div className="space-y-3">
                      <Input 
                        placeholder="House No, Building, Street" 
                        className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                        value={newIdentity.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                      <Input 
                        placeholder="Area, Locality, Sector" 
                        className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                        value={newIdentity.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      />
                    </div>
                  </FormFieldRow>

                  <FormFieldRow label="Landmark">
                    <Input 
                      placeholder="E.g. Near Industrial Estate" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                      value={newIdentity.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                    />
                  </FormFieldRow>

                  <FormFieldRow label="City" required>
                    <Input 
                      placeholder="Enter City Name" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs uppercase"
                      value={newIdentity.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </FormFieldRow>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
            <Button 
              variant="ghost" 
              className="h-14 px-10 rounded-xl font-bold uppercase text-[11px] tracking-widest text-slate-400"
              onClick={() => setIsAddIdentityOpen(false)}
            >
              Cancel Protocol
            </Button>
            <Button 
              className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl flex gap-3"
              onClick={handleSaveIdentity}
            >
              <Check className="h-5 w-5" /> Commit Identity Detail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const FormFieldRow = ({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 py-2 border-b border-slate-50 last:border-0 min-h-[64px]">
    <Label className="text-[13px] text-slate-500 font-bold uppercase tracking-widest md:col-span-4">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <div className="md:col-span-8">
      {children}
    </div>
  </div>
);
