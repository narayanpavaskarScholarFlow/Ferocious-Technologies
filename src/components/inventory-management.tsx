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
  Container
} from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Alloy Steel 4140', sku: 'MAT-STL-4140', category: 'Raw Material', quantity: 1250, unit: 'kg', minThreshold: 500, location: 'Rack A-12', status: 'In Stock' },
  { id: '2', name: 'Carbide End Mill 10mm', sku: 'TOOL-EM-10', category: 'Tooling', quantity: 12, unit: 'pcs', minThreshold: 15, location: 'Tool Crib 2', status: 'Low Stock' },
  { id: '3', name: 'Hydraulic Seals Kit', sku: 'CON-HS-500', category: 'Consumable', quantity: 45, unit: 'kits', minThreshold: 10, location: 'B-Section', status: 'In Stock' },
  { id: '4', name: 'Front Axle Housing', sku: 'FG-AX-88', category: 'Finished Goods', quantity: 85, unit: 'pcs', minThreshold: 0, location: 'Shipping Bay', status: 'In Stock' },
  { id: '5', name: 'Aluminum 6061-T6', sku: 'MAT-ALU-6061', category: 'Raw Material', quantity: 0, unit: 'kg', minThreshold: 200, location: 'Rack A-08', status: 'Out of Stock' },
];

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = mockInventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-muted-foreground font-medium">Real-time resource tracking across 4 industrial classifications.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-full border-slate-200 gap-2 h-11 px-6 font-bold text-xs uppercase tracking-wider">
             <History className="h-4 w-4" /> View Movements
           </Button>
           <Button className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20">
             <Plus className="h-4 w-4" /> Add Item
           </Button>
        </div>
      </header>

      {/* Resource KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-primary/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Total SKUs</p>
          <p className="text-3xl font-display font-bold text-slate-900">1,244</p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-green-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">In Stock</p>
          <p className="text-3xl font-display font-bold text-green-600">89%</p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-amber-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Low Stock Alerts</p>
          <p className="text-3xl font-display font-bold text-amber-600">12</p>
        </Card>
        <Card className="p-8 border-slate-200 shadow-sm flex flex-col justify-between bg-white group hover:border-red-500/50 transition-colors">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Out of Stock</p>
          <p className="text-3xl font-display font-bold text-red-500">4</p>
        </Card>
      </div>

      <div className="glass-card bg-white border-slate-200 shadow-xl overflow-hidden rounded-2xl">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by SKU or Item Name..." 
              className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-primary/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider gap-2 text-slate-500">
               <Filter className="h-4 w-4" /> Advanced Filter
             </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Item Detail</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Classification</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center">Available Qty</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-slate-400">Storage Location</TableHead>
              <TableHead className="font-bold text-[10px] uppercase text-right px-8">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/50 h-24 border-slate-50 group">
                <TableCell className="px-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-code uppercase">{item.sku}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white border-slate-200 text-[9px] font-bold uppercase py-1 px-3">
                      {item.category}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "text-sm font-bold",
                    item.status === 'Out of Stock' ? "text-red-500" : "text-slate-700"
                  )}>
                    {item.quantity} <span className="text-[10px] text-slate-400 font-medium uppercase ml-1">{item.unit}</span>
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">
                  {item.location}
                </TableCell>
                <TableCell className="text-right px-8">
                  <Badge className={cn(
                    "text-[9px] font-bold uppercase px-3 py-1",
                    item.status === 'In Stock' ? "bg-green-50 text-green-700 border border-green-100" :
                    item.status === 'Low Stock' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-red-50 text-red-700 border border-red-100"
                  )}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
        <AlertTriangle className="h-5 w-5 text-blue-600" />
        <p className="text-xs font-medium text-slate-600 leading-snug">
          The ERP has detected <span className="font-bold text-blue-700">3 replenishment requests</span> based on current production load for Work Order #103645.
        </p>
        <Button size="sm" variant="ghost" className="ml-auto text-blue-700 font-bold text-[10px] uppercase gap-2">
          Auto-Generate PO <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
