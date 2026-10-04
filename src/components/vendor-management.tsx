"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Plus, Edit2, Trash2, Check, X, ClipboardList, Info, Receipt, Archive } from 'lucide-react';
import { Vendor } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VendorManagementProps {
  vendors: Vendor[];
  onSaveVendor: (vendor: Vendor) => void;
}

export function VendorManagement({ vendors, onSaveVendor }: VendorManagementProps) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyType: 'Vendor' as 'Customer' | 'Vendor' | 'Both',
    contact: '',
    email: '',
    gstNumber: '',
    registrationType: 'Unregistered',
    pan: '',
    address: '',
    addressLine2: '',
    landmark: '',
    city: '',
    shippingAddress: '',
    type: 'Corporate'
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      companyType: 'Vendor',
      contact: vendor.contact,
      email: vendor.email || '',
      gstNumber: vendor.gstNumber || '',
      registrationType: vendor.registrationType || 'Unregistered',
      pan: vendor.pan || '',
      address: vendor.address || '',
      addressLine2: vendor.addressLine2 || '',
      landmark: vendor.landmark || '',
      city: vendor.city || '',
      shippingAddress: vendor.shippingAddress || '',
      type: vendor.type || 'Corporate'
    });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.contact || !formData.city) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Identity name, contact, and city are required." });
      return;
    }

    const vendor: Vendor = {
      id: editingVendor?.id || `VEND-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      type: formData.type,
      contact: formData.contact,
      email: formData.email,
      gstNumber: formData.gstNumber.toUpperCase(),
      pan: formData.pan.toUpperCase(),
      registrationType: formData.registrationType,
      address: formData.address,
      addressLine2: formData.addressLine2,
      landmark: formData.landmark,
      city: formData.city,
      shippingAddress: formData.shippingAddress || formData.address,
      activeOrders: editingVendor?.activeOrders || 0,
      rating: editingVendor?.rating || 5.0,
      status: editingVendor?.status || 'Active'
    };

    onSaveVendor(vendor);
    toast({ title: "Partner Synchronized", description: `${vendor.name} identity has been committed to the master ledger.` });
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingVendor(null);
    setFormData({ 
      name: '', companyType: 'Vendor', contact: '', email: '', gstNumber: '', registrationType: 'Unregistered', 
      pan: '', address: '', addressLine2: '', landmark: '', city: '', shippingAddress: '', type: 'Corporate' 
    });
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
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Truck className="h-4 w-4" />
            Supply Chain Governance
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Partner Ecosystem
          </h2>
          <p className="text-muted-foreground font-medium">Manage external dependencies, sub-contracts, and logistics partners.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
            onClick={() => { resetForm(); setIsAddOpen(true); }}
           >
             <Plus className="h-4 w-4" /> Onboard New Partner
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-white border-slate-200/60 shadow-sm rounded-2xl group hover:border-primary/50 transition-colors">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Total Partners</p>
          <p className="text-3xl font-display font-bold text-[#001F3D]">{vendors.length}</p>
        </Card>
        <Card className="p-8 bg-white border-slate-200/60 shadow-sm rounded-2xl group hover:border-blue-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Active Jobs (Ext)</p>
          <p className="text-3xl font-display font-bold text-blue-600">{vendors.reduce((acc, v) => acc + v.activeOrders, 0)}</p>
        </Card>
        <Card className="p-8 bg-white border-slate-200/60 shadow-sm rounded-2xl group hover:border-green-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Fleet Rating</p>
          <p className="text-3xl font-display font-bold text-green-600">4.8 / 5.0</p>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-full mb-8 h-14 inline-flex border border-slate-200 shadow-sm">
          <TabsTrigger value="partners" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            Active Partners
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-full px-8 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">
            Compliance Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="m-0">
          <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-2xl">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Vendor Identity</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Active Jobs</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">GST / Tax ID</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400">Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group transition-colors">
                    <TableCell className="px-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#001F3D]">{vendor.name}</span>
                        <span className="text-[10px] text-slate-400 font-code uppercase">{vendor.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase py-1 px-3 bg-white border-slate-200">
                        {vendor.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-code font-bold text-primary">
                      {vendor.activeOrders}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-500 uppercase">{vendor.gstNumber || '---'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-50 text-green-700 border border-green-100 text-[9px] uppercase font-bold px-3 py-1">
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" onClick={() => handleEdit(vendor)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
            <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="rounded-full h-12 w-12 text-slate-300 hover:text-red-500 transition-colors">
              <X className="h-7 w-7" />
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-12 space-y-12">
              <div className="space-y-4 max-w-4xl mx-auto">
                <FormFieldRow label="Company Type">
                  <RadioGroup 
                    value={formData.companyType} 
                    onValueChange={(val: any) => setFormData(prev => ({...prev, companyType: val}))}
                    className="flex gap-10"
                  >
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
                      value={formData.gstNumber}
                      onChange={(e) => setFormData(prev => ({...prev, gstNumber: e.target.value}))}
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact Person">
                  <Input 
                    placeholder="Enter Contact Person" 
                    className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({...prev, contact: e.target.value}))}
                  />
                </FormFieldRow>

                <FormFieldRow label="Contact No">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Mobile Number" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs pr-12"
                      value={formData.contact} // Reusing contact for simplicity
                      onChange={(e) => setFormData(prev => ({...prev, contact: e.target.value}))}
                    />
                    <Info className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Email">
                  <div className="relative">
                    <Input 
                      placeholder="Enter Email ID" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs pr-12"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    />
                    <Info className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200" />
                  </div>
                </FormFieldRow>

                <FormFieldRow label="Registration Type">
                  <Select 
                    value={formData.registrationType} 
                    onValueChange={(val) => setFormData(prev => ({...prev, registrationType: val}))}
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
                    value={formData.pan}
                    onChange={(e) => setFormData(prev => ({...prev, pan: e.target.value}))}
                  />
                </FormFieldRow>
              </div>

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
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                      />
                      <Input 
                        placeholder="Area, Locality, Sector" 
                        className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData(prev => ({...prev, addressLine2: e.target.value}))}
                      />
                    </div>
                  </FormFieldRow>

                  <FormFieldRow label="Landmark">
                    <Input 
                      placeholder="E.g. Near Industrial Estate" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs"
                      value={formData.landmark}
                      onChange={(e) => setFormData(prev => ({...prev, landmark: e.target.value}))}
                    />
                  </FormFieldRow>

                  <FormFieldRow label="City" required>
                    <Input 
                      placeholder="Enter City Name" 
                      className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs uppercase"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
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
              onClick={() => setIsAddOpen(false)}
            >
              Cancel Protocol
            </Button>
            <Button 
              className="h-14 px-16 bg-[#001F3D] hover:bg-black text-white rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20 flex gap-3"
              onClick={handleSave}
            >
              <Check className="h-5 w-5" /> Commit Partner Detail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
