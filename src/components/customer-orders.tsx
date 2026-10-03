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
  X
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  const [newCustomer, setNewCustomer] = useState({
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
    type: 'Corporate' as 'Corporate' | 'Individual'
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers]);

  const handleInputChange = (field: string, value: any) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleEditCustomer = (customer: Customer) => {
    setNewCustomer({
      name: customer.name,
      companyType: (customer.companyType as any) || 'Customer',
      gstNumber: customer.gstNumber,
      contactPerson: customer.contactPerson,
      contactNumber: customer.contactNumber,
      email: customer.email || '',
      registrationType: customer.registrationType || 'Unregistered',
      pan: customer.pan || '',
      address: customer.address,
      addressLine2: customer.addressLine2 || '',
      landmark: customer.landmark || '',
      city: customer.city || '',
      shippingAddress: customer.shippingAddress || '',
      type: customer.type
    });
    setEditingCustomerId(customer.id);
    setIsAddCustomerOpen(true);
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

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim() || !newCustomer.city.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Company Name and City are required fields."
      });
      return;
    }

    const customerData: Customer = {
      id: editingCustomerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustomer.name,
      companyType: newCustomer.companyType,
      gstNumber: newCustomer.gstNumber.toUpperCase(),
      contactPerson: newCustomer.contactPerson,
      contactNumber: newCustomer.contactNumber,
      email: newCustomer.email,
      registrationType: newCustomer.registrationType,
      pan: newCustomer.pan.toUpperCase(),
      address: newCustomer.address,
      addressLine2: newCustomer.addressLine2,
      landmark: newCustomer.landmark,
      city: newCustomer.city,
      shippingAddress: newCustomer.shippingAddress || newCustomer.address,
      type: newCustomer.type,
      location: newCustomer.city,
      totalOrders: editingCustomerId ? (customers.find(c => c.id === editingCustomerId)?.totalOrders || 0) : 0,
      status: 'Active'
    };

    onSaveCustomer(customerData);
    toast({
      title: editingCustomerId ? "Identity Synchronized" : "Identity Verified",
      description: `${newCustomer.name} details have been committed to the master directory.`
    });
    
    setIsAddCustomerOpen(false);
    setEditingCustomerId(null);
  };

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
              setNewCustomer({
                name: '', companyType: 'Customer', gstNumber: '', contactPerson: '', contactNumber: '', email: '', registrationType: 'Unregistered', pan: '', address: '', addressLine2: '', landmark: '', city: '', shippingAddress: '', type: 'Corporate'
              });
              setIsAddCustomerOpen(true);
            }}
            className="bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <UserPlus className="mr-3 h-4 w-4" /> Register New Identity
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-lg font-display font-bold text-[#001F3D] uppercase tracking-tight">Active Identity Ledger</h3>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2">
              <Printer className="h-3.5 w-3.5 text-slate-400" /> Export
            </Button>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px] h-10 bg-white text-[10px] font-bold uppercase border-slate-200 rounded-xl">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active Identity</SelectItem>
                <SelectItem value="Closed" className="text-[10px] font-bold uppercase">Archived Nodes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-slate-100">
                <TableHead className="w-12 px-6"><Checkbox checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Customer Identity</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">GSTIN / PAN</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Primary Contact</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">City</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                <TableHead className="text-right px-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-colors group">
                  <TableCell className="px-6"><Checkbox checked={selectedCustomers.includes(customer.id)} onCheckedChange={() => handleToggleSelect(customer.id)} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D]">{customer.name}</span>
                      <span className="text-[9px] text-slate-400 font-code">ID_{customer.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-[9px] font-bold w-fit">{customer.gstNumber || 'NO GST'}</Badge>
                      {customer.pan && <span className="text-[9px] font-code text-slate-400 ml-1">{customer.pan}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">{customer.contactPerson}</span>
                      <span className="text-[10px] text-slate-400">{customer.contactNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500 uppercase">{customer.city || customer.location}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "text-[9px] uppercase font-bold",
                      customer.status === 'Closed' ? "bg-slate-100 text-slate-400" : "bg-green-50 text-green-700"
                    )}>
                      {customer.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => onSaveCustomer({...customer, status: 'Closed'})} className="text-red-500"><XCircle className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-6xl h-[92vh] bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem] flex flex-col">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 shrink-0 flex flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <ClipboardList className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Customer / Vendor Detail</DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Identity Profile Matrix</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsAddCustomerOpen(false)} className="rounded-full h-12 w-12 text-slate-300 hover:text-red-500 transition-colors">
              <X className="h-7 w-7" />
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-12 space-y-12">
              {/* General Detail Section */}
              <div className="space-y-4 max-w-4xl mx-auto">
                <FormFieldRow label="Company Type">
                  <RadioGroup 
                    value={newCustomer.companyType} 
                    onValueChange={(val: any) => handleInputChange('companyType', val)}
                    className="flex gap-10"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="Customer" id="ct-customer" className="h-5 w-5 border-2 border-emerald-500 text-emerald-500" />
                      <Label htmlFor="ct-customer" className="text-sm font-bold text-slate-600 cursor-pointer">Customer</Label>
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
                      value={newCustomer.gstNumber}
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
                    value={newCustomer.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact Person">
                  <Input 
                    placeholder="Enter Contact Person" 
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                    value={newCustomer.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact No">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Mobile Number" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs pr-12"
                      value={newCustomer.contactNumber}
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
                      value={newCustomer.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    <Info className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Registration Type">
                  <Select 
                    value={newCustomer.registrationType} 
                    onValueChange={(val) => handleInputChange('registrationType', val)}
                  >
                    <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-xs">
                      <SelectValue placeholder="Select Registration Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Unregistered" className="text-xs font-bold uppercase">Unregistered</SelectItem>
                      <SelectItem value="Regular" className="text-xs font-bold uppercase">Regular</SelectItem>
                      <SelectItem value="Composition" className="text-xs font-bold uppercase">Composition</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldRow>

                <FormFieldRow label="PAN">
                  <Input 
                    placeholder="Enter PAN Number" 
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold uppercase text-xs"
                    value={newCustomer.pan}
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
                        value={newCustomer.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                      <Input 
                        placeholder="Area, Locality, Sector" 
                        className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                        value={newCustomer.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      />
                    </div>
                  </FormFieldRow>

                  <FormFieldRow label="Landmark">
                    <Input 
                      placeholder="E.g. Near Industrial Estate" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                      value={newCustomer.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                    />
                  </FormFieldRow>

                  <FormFieldRow label="City" required>
                    <Input 
                      placeholder="Enter City Name" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs uppercase"
                      value={newCustomer.city}
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
              onClick={() => setIsAddCustomerOpen(false)}
            >
              Cancel Protocol
            </Button>
            <Button 
              className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20 flex gap-3"
              onClick={handleAddCustomer}
            >
              <Check className="h-5 w-5" /> Commit Identity Detail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
