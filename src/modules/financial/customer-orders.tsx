"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  UserPlus, 
  Check, 
  Receipt,
  X,
  Building2,
  Archive,
  ChevronRight,
  FileText,
  ShoppingCart,
  Landmark,
  Target,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  LayoutGrid,
  ShieldCheck,
  Upload,
  User,
  ExternalLink,
  MoreVertical,
  Contact,
  CreditCard,
  ClipboardList,
  Edit2
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
import { Switch } from '@/components/ui/switch';

const CUSTOMER_TYPES = [
  "OEM", "Corporate", "Dealer", "Government", "Service Customer"
];

interface CustomerOrdersProps {
  customers: Customer[];
  vendors: Vendor[];
  billing: BillingRecord[];
  orders: Order[];
  onSaveCustomer: (customer: Customer) => void;
  onSaveVendor: (vendor: Vendor) => void;
}

export function CustomerOrders({ customers, billing, orders, onSaveCustomer }: CustomerOrdersProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [isAddIdentityOpen, setIsAddIdentityOpen] = useState(false);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [newIdentity, setNewIdentity] = useState({
    name: '',
    gstNumber: '',
    pan: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    shippingAddress: '',
    shippingSameAsBilling: true,
    customerType: 'Corporate',
    city: '',
    state: '',
    pincode: '',
    creditDays: '30',
    creditLimit: '0',
  });

  const kpis = useMemo(() => {
    const active = customers.filter(c => c.status !== 'Closed').length;
    const inactive = customers.length - active;
    const totalPO = billing.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalInvoiced = billing.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const totalPayments = billing.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = totalInvoiced - totalPayments;

    return { total: customers.length, active, inactive, totalPO, outstanding };
  }, [customers, billing]);

  const filteredItems = useMemo(() => {
    return customers.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item as any).city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeFilter === 'All' || item.status === activeFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, customers, activeFilter]);

  const getCustomerIntelligence = (id: string) => {
    const cBilling = billing.filter(r => r.customerId === id || r.customerName === customers.find(c => c.id === id)?.name);
    const cOrders = orders.filter(o => o.customerId === id || o.customer === customers.find(c => c.id === id)?.name);
    
    const poVal = cBilling.filter(r => r.type === 'purchase_order').reduce((acc, r) => acc + (r.amount || 0), 0);
    const invoiced = cBilling.filter(r => r.type === 'invoice').reduce((acc, r) => acc + (r.amount || 0), 0);
    const payments = cBilling.filter(r => r.type === 'inward_payment').reduce((acc, r) => acc + (r.amount || 0), 0);
    const outstanding = invoiced - payments;
    const quotes = cBilling.filter(r => r.type === 'quotation' && r.status === 'Pending').length;
    const activeWO = cOrders.filter(o => ['Active', 'Production', 'Planning'].includes(o.status)).length;
    
    return { poVal, outstanding, quotes, activeWO, invoiced, payments };
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
    const id = editingIdentityId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const baseData: Customer = {
      ...newIdentity,
      id,
      name: newIdentity.name,
      gstNumber: newIdentity.gstNumber.toUpperCase(),
      pan: newIdentity.pan.toUpperCase(),
      contactPerson: newIdentity.contactPerson,
      contactNumber: newIdentity.contactNumber,
      email: newIdentity.email,
      address: newIdentity.address,
      shippingAddress: newIdentity.shippingSameAsBilling ? newIdentity.address : newIdentity.shippingAddress,
      type: 'Corporate',
      location: newIdentity.city,
      totalOrders: 0,
      status: 'Active'
    };

    onSaveCustomer(baseData);
    
    toast({ title: "Customer Synchronized", description: `${newIdentity.name} has been saved.` });
    setIsAddIdentityOpen(false); 
    setEditingIdentityId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-body">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <Target className="h-4 w-4" />
            Customer Master
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Customer <span className="text-slate-400 font-medium">Directory</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search customers..." 
              className="h-11 pl-10 rounded-xl bg-white border-slate-200 text-[11px] font-bold uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => { setEditingIdentityId(null); setIsAddIdentityOpen(true); }}
            className="bg-[#001F3D] hover:bg-black text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl"
          >
            <UserPlus className="mr-3 h-4 w-4" /> Onboard Customer
          </Button>
        </div>
      </header>

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-1">
        {[
          { label: 'Total', val: kpis.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', val: kpis.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', val: kpis.inactive, icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
          { label: 'Outstanding', val: `₹ ${(kpis.outstanding / 100000).toFixed(1)}L`, icon: Landmark, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'PO Value', val: `₹ ${(kpis.totalPO / 100000).toFixed(1)}L`, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/5' },
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

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-[#001F3D] rounded-xl text-white shadow-lg"><ClipboardList className="h-6 w-6" /></div>
              <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Customer List</h3>
           </div>
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold text-[9px] h-8 px-4 uppercase tracking-widest">
            {filteredItems.length} Records
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white border-b border-slate-100">
              <TableRow>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6 px-8">Customer / Account</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Type / City</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">GSTIN / Tax ID</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Outstanding (₹)</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-center">Status</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-right px-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const intel = getCustomerIntelligence(item.id);
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-all group">
                    <TableCell onClick={() => setSelectedCustomerId(item.id)} className="cursor-pointer px-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#001F3D] uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                        <span className="text-[8px] text-slate-400 font-code font-bold uppercase mt-1">ID: {item.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 uppercase">{item.type || 'Corporate'}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{item.city || item.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-code font-bold text-slate-500 uppercase">{item.gstNumber || '---'}</span>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm font-display font-black text-rose-600">₹ {intel.outstanding.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-[9px] font-bold uppercase px-3", item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400')}>
                        {item.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-2xl p-1">
                             <DropdownMenuItem onClick={() => setSelectedCustomerId(item.id)} className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><ExternalLink className="h-4 w-4" /> View Profile</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => { setEditingIdentityId(item.id); setIsAddIdentityOpen(true); }} className="text-[10px] font-bold uppercase py-3 px-4 gap-3"><Edit2 className="h-4 w-4" /> Edit</DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-primary"><FileText className="h-4 w-4" /> Create Quotation</DropdownMenuItem>
                             <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-primary"><ShoppingCart className="h-4 w-4" /> Create PO</DropdownMenuItem>
                             <DropdownMenuItem className="text-[10px] font-bold uppercase py-3 px-4 gap-3 text-primary"><Receipt className="h-4 w-4" /> Create Invoice</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center opacity-30">
                    <Archive className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No customers detected.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* CUSTOMER DETAIL SIDE PANEL */}
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
                       <SheetTitle className="text-3xl font-display font-black uppercase tracking-tight text-white leading-none mb-2">{selectedCustomerData.name}</SheetTitle>
                       <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Account Node: {selectedCustomerData.id}</SheetDescription>
                    </div>
                 </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                 <div className="p-8 space-y-12">
                    <div className="grid grid-cols-2 gap-6">
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-4">
                          <div className="flex items-center gap-3 text-primary"><DollarSign className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Financial Standing</h4></div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-end"><span className="text-[9px] font-bold text-slate-400 uppercase">Outstanding</span><span className="text-3xl font-display font-black text-rose-600">₹ {selectedCustomerData.intel.outstanding.toLocaleString()}</span></div>
                             <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400 uppercase">PO Value</span><span className="text-sm font-display font-black text-[#001F3D]">₹ {selectedCustomerData.intel.poVal.toLocaleString()}</span></div>
                          </div>
                       </Card>
                       <Card className="p-8 bg-slate-50 border-none shadow-inner rounded-3xl space-y-4">
                          <div className="flex items-center gap-3 text-indigo-600"><Target className="h-4 w-4" /><h4 className="text-[10px] font-black uppercase tracking-widest">Operational Yield</h4></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="text-center py-4 bg-white rounded-2xl shadow-sm"><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Active WO</p><p className="text-2xl font-display font-black text-indigo-600">{selectedCustomerData.intel.activeWO}</p></div>
                             <div className="text-center py-4 bg-white rounded-2xl shadow-sm"><p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Open Quotes</p><p className="text-2xl font-display font-black text-amber-600">{selectedCustomerData.intel.quotes}</p></div>
                          </div>
                       </Card>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-[#001F3D] border-l-4 border-primary pl-4">Account Profile</h3>
                       <div className="grid grid-cols-2 gap-8 bg-slate-50 p-8 rounded-3xl">
                          {[
                            { label: 'Contact Person', val: selectedCustomerData.contactPerson, icon: User },
                            { label: 'Mobile', val: selectedCustomerData.contactNumber, icon: Phone },
                            { label: 'Email', val: selectedCustomerData.email, icon: Mail },
                            { label: 'Location', val: (selectedCustomerData as any).city || selectedCustomerData.location, icon: Target },
                          ].map(info => (
                            <div key={info.label} className="space-y-1">
                               <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase"><info.icon className="h-3 w-3" /> {info.label}</div>
                               <p className="text-sm font-bold text-slate-700 uppercase">{info.val}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* SIMPLIFIED ONBOARDING DIALOG */}
      <Dialog open={isAddIdentityOpen} onOpenChange={setIsAddIdentityOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white p-0 overflow-hidden rounded-[2.5rem] flex flex-col">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm"><UserPlus className="h-6 w-6 text-[#001F3D]" /></div>
              <DialogTitle className="text-2xl font-display font-black text-[#001F3D] uppercase">New Customer Onboarding</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsAddIdentityOpen(false)} className="rounded-full h-10 w-10 text-slate-300 hover:text-red-500"><X className="h-6 w-6" /></Button>
          </DialogHeader>

          <ScrollArea className="flex-1 p-10">
            <div className="max-w-3xl mx-auto space-y-10">
               {/* IDENTITY NODE */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Account Identity</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Company Name *</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={newIdentity.name} onChange={(e)=>handleInputChange('name', e.target.value)} /></div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Customer Type</Label>
                        <Select value={newIdentity.customerType} onValueChange={(v)=>handleInputChange('customerType', v)}>
                           <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                           <SelectContent className="rounded-xl">{CUSTOMER_TYPES.map(t=><SelectItem key={t} value={t} className="text-xs font-bold uppercase">{t}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Contact Person</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={newIdentity.contactPerson} onChange={(e)=>handleInputChange('contactPerson', e.target.value)} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Mobile Node</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-code" value={newIdentity.contactNumber} onChange={(e)=>handleInputChange('contactNumber', e.target.value)} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Email Identity</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={newIdentity.email} onChange={(e)=>handleInputChange('email', e.target.value)} /></div>
                  </div>
               </div>

               {/* COMPLIANCE NODE */}
               <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Compliance & Tax</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">GSTIN Protocol</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold uppercase" value={newIdentity.gstNumber} onChange={(e)=>handleInputChange('gstNumber', e.target.value)} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">PAN Registry</Label><Input className="h-12 bg-slate-50 border-none rounded-xl font-code font-bold uppercase" value={newIdentity.pan} onChange={(e)=>handleInputChange('pan', e.target.value)} /></div>
                  </div>
               </div>

               {/* ADDRESS NODE */}
               <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Address Matrix</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Billing Address</Label><Textarea className="min-h-[100px] bg-slate-50 border-none rounded-xl" value={newIdentity.address} onChange={(e)=>handleInputChange('address', e.target.value)} /></div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2"><Switch checked={newIdentity.shippingSameAsBilling} onCheckedChange={(v)=>handleInputChange('shippingSameAsBilling', v)} /><span className="text-[10px] font-bold uppercase text-slate-400">Shipping Same as billing</span></div>
                        <Textarea disabled={newIdentity.shippingSameAsBilling} className="min-h-[70px] bg-slate-50 border-none rounded-xl disabled:opacity-30" value={newIdentity.shippingAddress} onChange={(e)=>handleInputChange('shippingAddress', e.target.value)} />
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">City *</Label><Input className="h-10 bg-slate-50 border-none rounded-xl font-bold" value={newIdentity.city} onChange={(e)=>handleInputChange('city', e.target.value)} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">State</Label><Input className="h-10 bg-slate-50 border-none rounded-xl" value={newIdentity.state} onChange={(e)=>handleInputChange('state', e.target.value)} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">PIN Code</Label><Input className="h-10 bg-slate-50 border-none rounded-xl font-code" value={newIdentity.pincode} onChange={(e)=>handleInputChange('pincode', e.target.value)} /></div>
                  </div>
               </div>

               {/* COMMERCIAL NODE */}
               <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Commercial Protocol</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Credit Window (Days)</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={newIdentity.creditDays} onChange={(e)=>handleInputChange('creditDays', e.target.value)} /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Credit Limit (₹)</Label><Input type="number" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={newIdentity.creditLimit} onChange={(e)=>handleInputChange('creditLimit', e.target.value)} /></div>
                  </div>
               </div>

               {/* ATTACHMENTS */}
               <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center gap-3 border-l-4 border-primary pl-4"><h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Attachments</h4></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['GST Cert', 'PAN Card', 'Trade License', 'NDA'].map(doc => (
                       <div key={doc} className="h-20 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-all cursor-pointer">
                          <Upload className="h-4 w-4 text-slate-300" />
                          <span className="text-[8px] font-bold uppercase text-slate-400">{doc}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </ScrollArea>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
            <Button variant="ghost" className="h-14 px-10 rounded-xl font-bold uppercase text-[10px] text-slate-400" onClick={()=>setIsAddIdentityOpen(false)}>Cancel</Button>
            <Button className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl flex gap-3" onClick={handleSaveIdentity}><Check className="h-4 w-4" /> Save Customer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
