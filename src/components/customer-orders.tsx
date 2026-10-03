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
  MapPin, 
  Building2, 
  ClipboardList,
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
  Truck,
  Info,
  ChevronRight,
  Receipt
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
  
  // New Customer Form State - Aligned with the required UI
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    companyType: 'Customer' as 'Customer' | 'Both',
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
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2">
      <Label className="text-sm text-slate-600 font-medium md:col-span-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="md:col-span-2">
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
        <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[1.5rem]">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-slate-600" />
              <DialogTitle className="text-lg font-bold text-slate-800">Customer / Vendor Detail</DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div className="p-8 space-y-10">
              {/* General Detail Section */}
              <div className="space-y-6">
                <FormFieldRow label="Company Type">
                  <RadioGroup 
                    value={newCustomer.companyType} 
                    onValueChange={(val: any) => handleInputChange('companyType', val)}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Customer" id="ct-customer" className="border-emerald-500 text-emerald-500" />
                      <Label htmlFor="ct-customer" className="text-sm font-medium text-slate-600 cursor-pointer">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Both" id="ct-both" className="border-emerald-500 text-emerald-500" />
                      <Label htmlFor="ct-both" className="text-sm font-medium text-slate-600 cursor-pointer">Customer / Vendor</Label>
                    </div>
                  </RadioGroup>
                </FormFieldRow>

                <FormFieldRow label="GSTIN">
                  <div className="relative group">
                    <Input 
                      placeholder="Enter GSTIN Number" 
                      className="h-10 pr-24 border-slate-200 focus-visible:ring-emerald-500/20 uppercase"
                      value={newCustomer.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      className="absolute right-1 top-1 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md px-3"
                      onClick={() => toast({title: "GST Lookup", description: "Verifying GSTIN with national database..."})}
                    >
                      Auto Fill
                    </Button>
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Company Name" required>
                  <Input 
                    placeholder="Enter Company Name" 
                    className="h-10 border-slate-200 focus-visible:ring-emerald-500/20"
                    value={newCustomer.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact Person">
                  <Input 
                    placeholder="Enter Contact Person" 
                    className="h-10 border-slate-200 focus-visible:ring-emerald-500/20"
                    value={newCustomer.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact No">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Mobile Number" 
                      className="h-10 border-slate-200 focus-visible:ring-emerald-500/20 pr-10"
                      value={newCustomer.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    />
                    <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Email">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Email ID" 
                      className="h-10 border-slate-200 focus-visible:ring-emerald-500/20 pr-10"
                      value={newCustomer.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Registration Type">
                  <Select 
                    value={newCustomer.registrationType} 
                    onValueChange={(val) => handleInputChange('registrationType', val)}
                  >
                    <SelectTrigger className="h-10 border-slate-200 focus:ring-emerald-500/20">
                      <SelectValue placeholder="Select Registration Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unregistered">Unregistered</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Composition">Composition</SelectItem>
                    </SelectContent>
                  </Select>
                </FormFieldRow>

                <FormFieldRow label="PAN">
                  <Input 
                    placeholder="Enter PAN Number" 
                    className="h-10 border-slate-200 focus-visible:ring-emerald-500/20 uppercase"
                    value={newCustomer.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
                  />
                </FormFieldRow>
              </div>

              {/* Billing Address Section */}
              <div className="space-y-6 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <Receipt className="h-4 w-4 text-slate-600" />
                  </div>
                  <h3 className="text-md font-bold text-slate-800">Billing Address</h3>
                </div>

                <div className="space-y-4">
                  <FormFieldRow label="Address">
                    <div className="space-y-3">
                      <Input 
                        placeholder="House No, Building, Street" 
                        className="h-10 border-slate-200 focus-visible:ring-emerald-500/20"
                        value={newCustomer.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                      <Input 
                        placeholder="Area, Locality, Sector" 
                        className="h-10 border-slate-200 focus-visible:ring-emerald-500/20"
                        value={newCustomer.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      />
                    </div>
                  </FormFieldRow>

                  <FormFieldRow label="Landmark">
                    <Input 
                      placeholder="E.g. Near Industrial Estate" 
                      className="h-10 border-slate-200 focus-visible:ring-emerald-500/20"
                      value={newCustomer.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                    />
                  </FormFieldRow>

                  <FormFieldRow label="City" required>
                    <Input 
                      placeholder="Enter City Name" 
                      className="h-10 border-slate-200 focus-visible:ring-emerald-500/20"
                      value={newCustomer.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </FormFieldRow>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="h-10 px-6 rounded-lg font-bold text-slate-500"
              onClick={() => setIsAddCustomerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="h-10 px-10 bg-[#001F3D] hover:bg-black text-white rounded-lg font-bold flex gap-2"
              onClick={handleAddCustomer}
            >
              <Check className="h-4 w-4" /> Commit Detail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
