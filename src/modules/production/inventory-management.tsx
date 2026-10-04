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
  History, 
  Boxes, 
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
    name: '', sku: '', category: 'Raw Material', quantity: 0, unit: 'Units', location: 'Bin A1'
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.sku) { toast({ variant: "destructive", title: "Validation Error" }); return; }
    const item: InventoryItem = {
      id: editingItem?.id || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name, sku: formData.sku, category: formData.category, quantity: Number(formData.quantity), unit: formData.unit, location: formData.location,
      status: Number(formData.quantity) > 10 ? 'In Stock' : Number(formData.quantity) > 0 ? 'Low Stock' : 'Out of Stock'
    };
    onSaveItem(item);
    toast({ title: "Ledger Updated" });
    setIsAddOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Package className="h-4 w-4" />
            Stock & Warehousing
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">Inventory Ledger</h2>
          <p className="text-muted-foreground font-medium">Real-time resource tracking across industrial classifications.</p>
        </div>
        <Button className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl" onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4" /> Add Item</Button>
      </header>

      <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-[2rem]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search SKU..." className="pl-10 h-11 bg-white border-slate-200 text-xs font-bold uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Item Identification</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center">In-Hand Qty</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
              <TableHead className="text-right px-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
              <TableRow key={item.id} className="hover:bg-slate-50/50 h-20 border-slate-50 group">
                <TableCell className="px-8">
                  <div className="flex flex-col"><span className="text-sm font-bold text-[#001F3D] uppercase">{item.name}</span><span className="text-[10px] text-slate-400 font-code uppercase">{item.sku}</span></div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[9px] font-bold uppercase">{item.category}</Badge></TableCell>
                <TableCell className="text-center font-code font-bold text-slate-700">{item.quantity} {item.unit}</TableCell>
                <TableCell className="text-center">
                  <Badge className={cn("text-[9px] font-bold uppercase px-3 py-1 rounded-full", item.status === 'In Stock' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right px-10"><Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setFormData({ ...item }); setIsAddOpen(true); }}><Edit3 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8"><DialogTitle className="text-3xl font-display font-bold uppercase">Stock Registry</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Part Name</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">SKU / ID</Label><Input className="h-12 bg-slate-50 border-none rounded-xl" value={formData.sku} onChange={(e)=>setFormData({...formData, sku: e.target.value})} /></div>
            </div>
            <Button className="w-full h-14 bg-[#001F3D] text-white rounded-2xl font-bold uppercase" onClick={handleSave}>Sync Ledger</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
