"use client";

import { useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  UserPlus, 
  MapPin, 
  Building2, 
  Plus, 
  Contact, 
  ArrowRight,
  CreditCard,
  User,
  Phone,
  Edit2,
  Check,
  Printer,
  XCircle,
  Truck
} from 'lucide-react';
import { Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface CustomerOrdersProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
}

export function CustomerOrders({ customers, onSaveCustomer }: CustomerOrdersProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  const sectionRefs = {
    step1: useRef<HTMLDivElement>(null),
    step2: useRef<HTMLDivElement>(null),
    step3: useRef<HTMLDivElement>(null),
  };

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    address: '',
    shippingAddress: '',
    contactNumber: '',
    gstNumber: '',
    contactPerson: '',
    type: 'Corporate' as 'Corporate' | 'Individual'
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers]);

  const handleInputChange = (field: string, value: string) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleEditCustomer = (customer: Customer) => {
    setNewCustomer({
      name: customer.name,
      address: customer.address,
      shippingAddress: customer.shippingAddress || '',
      contactNumber: customer.contactNumber,
      gstNumber: customer.gstNumber,
      contactPerson: customer.contactPerson,
      type: customer.type
    });
    setEditingCustomerId(customer.id);
    setIsAddCustomerOpen(true);
    setActiveStep(1);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleCloseAccount = (customer: Customer) => {
    onSaveCustomer({ ...customer, status: 'Closed' as const });
    toast({
      title: "Account Decommissioned",
      description: "Customer status has been moved to Closed archive.",
      variant: "destructive"
    });
  };

  const scrollToSection = (step: number) => {
    setActiveStep(step);
    const ref = step === 1 ? sectionRefs.step1 : step === 2 ? sectionRefs.step2 : step === 3;
    if (ref && typeof ref !== 'number' && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.gstNumber.trim() || !newCustomer.contactPerson.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Protocol requires Company Name, GST, and Contact Person for ledger registration."
      });
      return;
    }

    if (editingCustomerId) {
      const updatedCustomer: Customer = {
        id: editingCustomerId,
        name: newCustomer.name.trim(), 
        gstNumber: newCustomer.gstNumber.trim().toUpperCase(),
        contactPerson: newCustomer.contactPerson.trim(),
        contactNumber: newCustomer.contactNumber.trim() || 'N/A',
        address: newCustomer.address.trim() || 'N/A',
        shippingAddress: newCustomer.shippingAddress.trim() || 'N/A',
        type: newCustomer.type,
        email: customers.find(c => c.id === editingCustomerId)?.email || '',
        location: newCustomer.address.trim() || 'Global',
        totalOrders: customers.find(c => c.id === editingCustomerId)?.totalOrders || 0,
        status: customers.find(c => c.id === editingCustomerId)?.status || 'Active'
      };
      onSaveCustomer(updatedCustomer);
      toast({
        title: "Identity Synchronized",
        description: `${newCustomer.name} details have been updated in the master directory.`
      });
    } else {
      const customer: Customer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newCustomer.name.trim(),
        gstNumber: newCustomer.gstNumber.trim().toUpperCase(),
        contactPerson: newCustomer.contactPerson.trim(),
        contactNumber: newCustomer.contactNumber.trim() || 'N/A',
        address: newCustomer.address.trim() || 'N/A',
        shippingAddress: newCustomer.shippingAddress.trim() || 'N/A',
        type: newCustomer.type,
        email: '',
        location: newCustomer.address.trim() || 'Global',
        totalOrders: 0,
        status: 'Active'
      };

      onSaveCustomer(customer);
      toast({
        title: "Identity Verified",
        description: `${customer.name} has been committed to the master directory.`
      });
    }
    
    setIsAddCustomerOpen(false);
    setEditingCustomerId(null);
    setNewCustomer({ name: '', address: '', shippingAddress: '', contactNumber: '', gstNumber: '', contactPerson: '', type: 'Corporate' });
  };

  const isStepComplete = (step: number) => {
    if (step === 1) return !!(newCustomer.name && newCustomer.gstNumber);
    if (step === 2) return !!(newCustomer.contactPerson && newCustomer.contactNumber);
    if (step === 3) return !!(newCustomer.address && newCustomer.shippingAddress);
    return false;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Master Identity Directory
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Customer <span className="text-slate-400 font-medium">Identity</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Lifecycle management for industrial accounts and legal identities.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter Identities..." 
              className="h-11 pl-10 rounded-xl bg-slate-100 border-none text-[11px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              setEditingCustomerId(null);
              setNewCustomer({ name: '', address: '', shippingAddress: '', contactNumber: '', gstNumber: '', contactPerson: '', type: 'Corporate' });
              setIsAddCustomerOpen(true);
              setActiveStep(1);
            }}
            className="bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <UserPlus className="mr-3 h-4 w-4" /> Register New Identity
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-12 overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-lg font-display font-bold text-[#001F3D] uppercase tracking-tight">Active Identity Ledger</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Total Verified Nodes: {filteredCustomers.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2 shadow-sm">
                <Printer className="h-3.5 w-3.5 text-slate-400" /> Export Matrix
              </Button>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[180px] h-10 bg-white text-[10px] font-bold uppercase tracking-widest border-slate-200 rounded-xl shadow-sm">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active Identity</SelectItem>
                    <SelectItem value="Closed" className="text-[10px] font-bold uppercase">Archived Nodes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-12 py-6 px-6">
                    <Checkbox checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 w-20">Seq.</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">GST / Tax ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Primary Contact</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Node Location</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-10">Status & Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? filteredCustomers.map((customer, idx) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-colors group">
                    <TableCell className="px-6">
                      <Checkbox checked={selectedCustomers.includes(customer.id)} onCheckedChange={() => handleToggleSelect(customer.id)} />
                    </TableCell>
                    <TableCell className="font-code text-[11px] text-slate-300 font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#001F3D]">{customer.name}</span>
                        <span className="text-[9px] text-slate-400 font-code uppercase tracking-tighter">ID_{customer.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase px-2 py-0.5 border-slate-100 bg-slate-50 text-slate-500">
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase px-3 py-1 bg-white border-slate-200 text-slate-500">
                        {customer.gstNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                          <Contact className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">{customer.contactPerson}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-slate-300" /> {customer.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex items-center justify-end gap-3">
                        <Badge className={cn(
                          "text-[9px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-full border shadow-sm",
                          customer.status === 'Closed' 
                            ? "bg-slate-100 text-slate-400 border-slate-200" 
                            : "bg-green-50 text-green-700 border-green-100"
                        )}>
                          {customer.status || 'Active'}
                        </Badge>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-primary"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => handleCloseAccount(customer)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30 py-10">
                        <div className="p-8 bg-slate-50 rounded-[2rem] mb-6">
                          <Building2 className="h-16 w-16 text-slate-300" />
                        </div>
                        <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Identity Matrix Offline</p>
                        <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto font-medium">No verified identities detected. Register a new account to initialize industrial telemetry.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
          <DialogTitle className="sr-only">Identity Onboarding Protocol</DialogTitle>
          <DialogDescription className="sr-only">Sequence for initializing or updating legal identities in the ERP directory.</DialogDescription>
          
          <div className="flex flex-col md:flex-row h-[650px]">
            {/* Sidebar Protocol Map */}
            <div className="w-full md:w-80 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="p-5 bg-[#001F3D] rounded-[1.5rem] w-fit shadow-2xl shadow-primary/20 relative">
                  {editingCustomerId ? <Edit2 className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="space-y-10 hidden md:block">
                  {[
                    { s: 1, label: editingCustomerId ? 'Update Identity' : 'Legal Identity', desc: 'NAME & GST' },
                    { s: 2, label: 'Liaison Nodes', desc: 'CONTACT POINTS' },
                    { s: 3, label: 'Logistics Matrix', desc: 'ADDRESS_SYNC' },
                  ].map((item) => (
                    <button 
                      key={item.s} 
                      onClick={() => scrollToSection(item.s)}
                      className="flex text-left gap-6 group relative w-full outline-none"
                    >
                      {item.s < 3 && <div className={cn("absolute left-3 top-8 w-[1px] h-12 transition-colors", isStepComplete(item.s) ? "bg-emerald-500" : "bg-slate-200")} />}
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 z-10 shadow-sm bg-white",
                        activeStep === item.s ? "border-[#001F3D] text-[#001F3D] scale-110 shadow-lg shadow-primary/10" : 
                        isStepComplete(item.s) ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-400"
                      )}>
                        {isStepComplete(item.s) ? <Check className="h-3 w-3" /> : item.s}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-bold transition-colors duration-500 leading-none",
                          activeStep === item.s ? "text-[#001F3D]" : 
                          isStepComplete(item.s) ? "text-emerald-600" : "text-slate-400"
                        )}>{item.label}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-2">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] hidden md:block">
                IDENTITY_SYNC_SYS_V2.4
              </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 p-8 md:p-12 flex flex-col bg-white overflow-y-auto hide-scrollbar">
              <div className="space-y-10 flex-grow pb-10">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-10 bg-red-500 rounded-full" />
                  <div>
                    <h3 className="text-3xl font-display font-bold text-[#001F3D] tracking-tight uppercase">{editingCustomerId ? 'Update Protocol' : 'Identity Protocol'}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Master Data Synchronization Sequence</p>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Step 1: Identity */}
                  <div ref={sectionRefs.step1} className="space-y-6" onFocus={() => setActiveStep(1)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Customer Identity Name</Label>
                        <div className="relative">
                          <Input 
                            placeholder="Legal Account Identity" 
                            className="h-12 bg-slate-50/50 border-none rounded-xl text-[11px] font-bold pl-10 focus-visible:ring-primary/20"
                            value={newCustomer.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">GST Number</Label>
                        <div className="relative">
                          <Input 
                            placeholder="TAX_ID / GSTIN" 
                            className="h-12 bg-slate-50/50 border-none rounded-xl text-[11px] font-bold pl-10 focus-visible:ring-primary/20 uppercase"
                            value={newCustomer.gstNumber}
                            onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                          />
                          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Liaison */}
                  <div ref={sectionRefs.step2} className="space-y-6" onFocus={() => setActiveStep(2)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Contact Liaison</Label>
                        <div className="relative">
                          <Input 
                            placeholder="Authorized Signatory / Liaison" 
                            className="h-12 bg-slate-50/50 border-none rounded-xl text-[11px] font-bold pl-10 focus-visible:ring-primary/20"
                            value={newCustomer.contactPerson}
                            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                          />
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Contact Node (Phone)</Label>
                        <div className="relative">
                          <Input 
                            placeholder="+91 (000) 000-0000" 
                            className="h-12 bg-slate-50/50 border-none rounded-xl text-[11px] font-bold pl-10 focus-visible:ring-primary/20"
                            value={newCustomer.contactNumber}
                            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          />
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Logistics */}
                  <div ref={sectionRefs.step3} className="space-y-6" onFocus={() => setActiveStep(3)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Present Address (Billing)</Label>
                        <div className="relative">
                          <Textarea 
                            placeholder="Current Registered Billing Address" 
                            className="min-h-[100px] bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold pl-10 focus-visible:ring-primary/20 pt-4"
                            value={newCustomer.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                          />
                          <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Shipping Address</Label>
                        <div className="relative">
                          <Textarea 
                            placeholder="Operational Base / Delivery Node" 
                            className="min-h-[100px] bg-slate-50/50 border-none rounded-2xl text-[11px] font-bold pl-10 focus-visible:ring-primary/20 pt-4"
                            value={newCustomer.shippingAddress}
                            onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                          />
                          <Truck className="absolute left-3.5 top-4 h-4 w-4 text-slate-300" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[8px] uppercase font-bold p-0 text-primary hover:bg-transparent"
                          onClick={() => handleInputChange('shippingAddress', newCustomer.address)}
                        >
                          Same as Billing
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] text-slate-400 hover:text-[#001F3D] hover:bg-slate-50"
                  onClick={() => setIsAddCustomerOpen(false)}
                >
                  Abort Protocol
                </Button>
                <Button 
                  className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] shadow-xl shadow-red-600/30 flex gap-3 group"
                  onClick={handleAddCustomer}
                >
                  {editingCustomerId ? 'Synchronize Identity' : 'Commit to Matrix'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
