
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, ExternalLink, Star, Phone, ShieldCheck, FileCheck, Activity, PackageX, Plus, Edit2, Trash2 } from 'lucide-react';
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
    type: 'Sub-Contractor',
    contact: '',
    address: '',
    email: '',
    gstNumber: ''
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      type: vendor.type,
      contact: vendor.contact,
      address: vendor.address || '',
      email: vendor.email || '',
      gstNumber: vendor.gstNumber || ''
    });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.contact) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Identity name and contact are required." });
      return;
    }

    const vendor: Vendor = {
      id: editingVendor?.id || `VEND-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      type: formData.type,
      contact: formData.contact,
      address: formData.address,
      email: formData.email,
      gstNumber: formData.gstNumber,
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
    setFormData({ name: '', type: 'Sub-Contractor', contact: '', address: '', email: '', gstNumber: '' });
  };

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
                  <TableRow key={vendor.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
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
                {vendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20 py-10">
                        <PackageX className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-slate-500 font-code text-xs italic uppercase tracking-widest">No vendor partners found in database</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Partner Onboarding</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Register external technical nodes for the ERP ecosystem.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Company Name</Label>
              <Input 
                placeholder="e.g. Precision Finishing Ltd" 
                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Contact No.</Label>
                <Input 
                  placeholder="+91 00000 00000" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">GST Number</Label>
                <Input 
                  placeholder="TAX_ID_XXXX" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Node Email</Label>
              <Input 
                placeholder="accounts@vendor.com" 
                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Physical Location</Label>
              <Input 
                placeholder="Street, City, State..." 
                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsAddOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20" onClick={handleSave}>Execute Synchronization</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
