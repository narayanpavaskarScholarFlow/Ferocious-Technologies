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
  Truck
} from 'lucide-react';
import { Customer, Vendor } from '@/lib/types';
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
  vendors: Vendor[];
  onSaveCustomer: (customer: Customer) => void;
  onSaveVendor: (vendor: Vendor) => void;
}

export function CustomerOrders({ customers, vendors, onSaveCustomer, onSaveVendor }: CustomerOrdersProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'vendors'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active');
  const [isAddIdentityOpen, setIsAddIdentityOpen] = useState(false);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
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
    type: 'Corporate' as 'Corporate' | 'Individual'
  });

  const filteredItems = useMemo(() => {
    const list = activeSubTab === 'customers' ? customers : vendors;
    return list.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customers, vendors, activeSubTab]);

  const handleInputChange = (field: string, value: any) => {
    setNewIdentity(prev => ({ ...prev, [field]: value }));
  };

  const handleEditIdentity = (item: Customer | Vendor) => {
    setNewIdentity({
      name: item.name,
      companyType: (activeSubTab === 'customers' ? 'Customer' : 'Vendor') as any,
      gstNumber: item.gstNumber,
      contactPerson: (item as any).contactPerson || (item as any).contact || '',
      contactNumber: (item as any).contactNumber || (item as any).contact || '',
      email: item.email || '',
      registrationType: (item as any).registrationType || 'Unregistered',
      pan: item.pan || '',
      address: item.address || '',
      addressLine2: (item as any).addressLine2 || '',
      landmark: (item as any).landmark || '',
      city: item.city || '',
      shippingAddress: item.shippingAddress || '',
      type: (item as any).type || 'Corporate'
    });
    setEditingIdentityId(item.id);
    setIsAddIdentityOpen(true);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIdentities(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIdentities.length === filteredItems.length) {
      setSelectedIdentities([]);
    } else {
      setSelectedIdentities(filteredItems.map(c => c.id));
    }
  };

  const handleSaveIdentity = () => {
    if (!newIdentity.name.trim() || !newIdentity.city.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Company Name and City are required fields."
      });
      return;
    }

    const id = editingIdentityId || `${newIdentity.companyType === 'Vendor' ? 'VEND' : 'CUST'}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (newIdentity.companyType === 'Vendor') {
      const vendorData: Vendor = {
        id,
        name: newIdentity.name,
        type: newIdentity.type,
        contact: newIdentity.contactNumber,
        email: newIdentity.email,
        gstNumber: newIdentity.gstNumber.toUpperCase(),
        pan: newIdentity.pan.toUpperCase(),
        registrationType: newIdentity.registrationType,
        address: newIdentity.address,
        addressLine2: newIdentity.addressLine2,
        landmark: newIdentity.landmark,
        city: newIdentity.city,
        shippingAddress: newIdentity.shippingAddress || newIdentity.address,
        activeOrders: 0,
        rating: 5.0,
        status: 'Active'
      };
      onSaveVendor(vendorData);
    } else {
      const customerData: Customer = {
        id,
        name: newIdentity.name,
        companyType: newIdentity.companyType,
        gstNumber: newIdentity.gstNumber.toUpperCase(),
        contactPerson: newIdentity.contactPerson,
        contactNumber: newIdentity.contactNumber,
        email: newIdentity.email,
        registrationType: newIdentity.registrationType,
        pan: newIdentity.pan.toUpperCase(),
        address: newIdentity.address,
        addressLine2: newIdentity.addressLine2,
        landmark: newIdentity.landmark,
        city: newIdentity.city,
        shippingAddress: newIdentity.shippingAddress || newIdentity.address,
        type: newIdentity.type,
        location: newIdentity.city,
        totalOrders: 0,
        status: 'Active'
      };
      onSaveCustomer(customerData);
    }

    toast({
      title: "Identity Synchronized",
      description: `${newIdentity.name} details have been committed to the master directory.`
    });
    
    setIsAddIdentityOpen(false);
    setEditingIdentityId(null);
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
            Institutional Identity Registry
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Identity <span className="text-slate-400 font-medium">Registry</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Unified management for Customers and Supply Chain Partners.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter identities..." 
              className="h-11 pl-10 rounded-xl bg-slate-100 border-none text-[11px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              setEditingIdentityId(null);
              setNewIdentity({
                name: '', companyType: activeSubTab === 'customers' ? 'Customer' : 'Vendor', gstNumber: '', contactPerson: '', contactNumber: '', email: '', registrationType: 'Unregistered', pan: '', address: '', addressLine2: '', landmark: '', city: '', shippingAddress: '', type: 'Corporate'
              });
              setIsAddIdentityOpen(true);
            }}
            className="bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <UserPlus className="mr-3 h-4 w-4" /> Register New Identity
          </Button>
        </div>
      </header>

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
            <div>
              <h3 className="text-lg font-display font-bold text-[#001F3D] uppercase tracking-tight">
                {activeSubTab === 'customers' ? 'Active Customer Ledger' : 'Supply Chain Partner Matrix'}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest gap-2">
                <Printer className="h-3.5 w-3.5 text-slate-400" /> Export Matrix
              </Button>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-white text-[10px] font-bold uppercase border-slate-200 rounded-xl">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active Nodes</SelectItem>
                  <SelectItem value="Closed" className="text-[10px] font-bold uppercase">Archived Nodes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-slate-100">
                  <TableHead className="w-12 px-6"><Checkbox checked={selectedIdentities.length === filteredItems.length && filteredItems.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Identity Name</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">GSTIN / PAN</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Primary Contact</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Location Node</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
                  <TableHead className="text-right px-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-50 h-20 transition-colors group">
                    <TableCell className="px-6"><Checkbox checked={selectedIdentities.includes(item.id)} onCheckedChange={() => handleToggleSelect(item.id)} /></TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#001F3D]">{item.name}</span>
                        <span className="text-[9px] text-slate-400 font-code uppercase">ID_{item.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[9px] font-bold w-fit uppercase">{item.gstNumber || 'NO GST'}</Badge>
                        {item.pan && <span className="text-[9px] font-code text-slate-400 ml-1 uppercase">{item.pan}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700">{(item as any).contactPerson || (item as any).contact}</span>
                        <span className="text-[10px] text-slate-400">{(item as any).contactNumber || (item as any).email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-slate-500 uppercase">{item.city || item.location}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "text-[9px] uppercase font-bold",
                        item.status === 'Closed' || item.status === 'Inactive' ? "bg-slate-100 text-slate-400" : "bg-green-50 text-green-700"
                      )}>
                        {item.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEditIdentity(item)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500"><XCircle className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                       <div className="flex flex-col items-center justify-center opacity-30 py-10">
                          <ArchiveX className="h-12 w-12 text-slate-300 mb-4" />
                          <p className="text-[#001F3D] font-headline font-bold text-lg uppercase tracking-tight">Ledger Matrix Null</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase">No identity nodes discovered in this classification.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </Tabs>

      <Dialog open={isAddIdentityOpen} onOpenChange={setIsAddIdentityOpen}>
        <DialogContent className="max-w-6xl h-[92vh] bg-white border-none shadow-2xl p-0 overflow-hidden rounded-[2rem] flex flex-col">
          <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 shrink-0 flex flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <ClipboardList className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Identify Matrix Node</DialogTitle>
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

                <FormFieldRow label="Registration Type">
                  <Select 
                    value={newIdentity.registrationType} 
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
              className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20 flex gap-3"
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
