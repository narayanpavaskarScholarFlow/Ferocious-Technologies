
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  ArrowRight,
  History,
  Boxes,
  Layers,
  Container,
  BarChart3,
  Archive,
  Edit3
} from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface InventoryManagementProps {
  items: InventoryItem[];
  onSaveItem: (item: InventoryItem) => void;
}

export function InventoryManagement({ items, onSaveItem }: InventoryManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Raw Material',
    quantity: 0,
    unit: 'Units',
    location: 'Bin A1'
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.sku) {
      toast({ variant: "destructive", title: "Validation Error", description: "SKU and Name are mandatory." });
      return;
    }

    const item: InventoryItem = {
      id: editingItem?.id || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      location: formData.location,
      status: Number(formData.quantity) > 10 ? 'In Stock' : Number(formData.quantity) > 0 ? 'Low Stock' : 'Out of Stock'
    };

    onSaveItem(item);
    toast({ title: "Ledger Updated", description: `${item.name} status synchronized.` });
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ name: '', sku: '', category: 'Raw Material', quantity: 0, unit: 'Units', location: 'Bin A1' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Package className="h-4 w-4" />
            Stock & Warehousing
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Inventory Ledger
          </h2>
          <p className="text-muted-foreground font-medium">Real-time resource tracking across industrial classifications.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-11 px-6 font-bold text-[10px] uppercase tracking-widest shadow-sm">
             <History className="h-4 w-4" /> View Movements
           </Button>
           <Button 
            className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
            onClick={() => { resetForm(); setIsAddOpen(true); }}
           >
             <Plus className="h-4 w-4" /> Add Item to Ledger
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 border-slate-200/60 shadow-sm flex flex-col justify-between bg-white group hover:border-primary/50 transition-colors rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Total SKUs</p>
          <p className="text-3xl font-display font-bold text-slate-900">{items.length}</p>
        </Card>
        <Card className="p-8 border-slate-200/60 shadow-sm flex flex-col justify-between bg-white group hover:border-green-500/50 transition-colors rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Inventory Value</p>
          <p className="text-3xl font-display font-bold text-green-600">₹ {(items.reduce((acc, i) => acc + (i.quantity * 150), 0)).toLocaleString()}</p>
        </Card>
        <Card className="p-8 border-slate-200/60 shadow-sm flex flex-col justify-between bg-white group hover:border-amber-500/50 transition-colors rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Shortage Alerts</p>
          <p className="text-3xl font-display font-bold text-amber-600">{items.filter(i => i.status !== 'In Stock').length}</p>
        </Card>
        <Card className="p-8 border-slate-200/60 shadow-sm flex flex-col justify-between bg-white group hover:border-red-500/50 transition-colors rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Out of Stock</p>
          <p className="text-3xl font-display font-bold text-red-500">{items.filter(i => i.status === 'Out of Stock').length}</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by SKU or Item Name..." 
              className="pl-10 h-11 bg-white border-slate-200 text-xs font-bold uppercase focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="bg-white text-[10px] font-bold uppercase tracking-widest h-10 px-6">Ledger Records: {items.length}</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Item Identification</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">In-Hand Qty</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Node Location</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center w-32">Status</TableHead>
                <TableHead className="text-right px-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                  <TableCell className="px-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D] uppercase">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-code uppercase">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase bg-white border-slate-200">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-code font-bold text-slate-700">
                    {item.quantity} <span className="text-[9px] text-slate-400 font-bold ml-1">{item.unit}</span>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">
                    {item.location}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "text-[9px] font-bold uppercase px-3 py-1 rounded-full",
                      item.status === 'In Stock' ? "bg-green-50 text-green-700 border-green-100" :
                      item.status === 'Low Stock' ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-200 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => {
                        setEditingItem(item);
                        setFormData({
                          name: item.name,
                          sku: item.sku,
                          category: item.category,
                          quantity: item.quantity,
                          unit: item.unit,
                          location: item.location
                        });
                        setIsAddOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20 py-10">
                      <Boxes className="h-12 w-12 text-slate-400 mb-4" />
                      <p className="text-slate-500 font-code text-xs italic uppercase tracking-widest">Master Inventory Matrix Offline</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Stock Registration</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Update SKU metadata and quantity in the industrial ledger.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Part Name</Label>
                <Input 
                  placeholder="e.g. M10 Hex Bolt" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">SKU / ID</Label>
                <Input 
                  placeholder="SKU-XXXX" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Quantity</Label>
                <Input 
                  type="number"
                  placeholder="0" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Unit</Label>
                <Input 
                  placeholder="e.g. Kg, Units, Box" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Storage Location</Label>
              <Input 
                placeholder="e.g. Warehouse A - Bin 12" 
                className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsAddOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20" onClick={handleSave}>Synchronize Ledger</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
