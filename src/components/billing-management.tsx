
"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Search, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Receipt,
  ClipboardList,
  Share2,
  Building2,
  Calendar,
  Trash2,
  Printer,
  ChevronRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  MoreVertical,
  Percent,
  Hash,
  Calculator,
  Truck
} from 'lucide-react';
import { Customer, Vendor, BillingRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LineItem {
  id: string;
  description: string;
  hsn: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  gst: number;
  discount: number;
}

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses';

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  onSaveRecord: (record: BillingRecord) => void;
}

export function BillingManagement({ customers, vendors, records, onSaveRecord }: BillingManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('quotation');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<'form' | 'preview'>('form');

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    note: 'Terms & Conditions as per Industrial Standard Protocol.',
    globalDiscount: 0,
    amountPaid: 0
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'Industrial Service', hsn: '9987', unit: 'Lot', quantity: 1, pricePerUnit: 0, gst: 18, discount: 0 },
  ]);

  const isLogisticsCategory = activeCategory === 'inward' || activeCategory === 'outward';

  const selectedEntity = useMemo(() => {
    if (isLogisticsCategory) return vendors.find(v => v.id === formData.customerId);
    return customers.find(c => c.name === formData.customerId || c.id === formData.customerId);
  }, [customers, vendors, formData.customerId, isLogisticsCategory]);

  const totals = useMemo(() => {
    const subTotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit - item.discount), 0);
    const totalGst = subTotal * 0.18;
    return { finalAmount: subTotal + totalGst - formData.globalDiscount };
  }, [lineItems, formData.globalDiscount]);

  const handleCreateNew = () => {
    const prefix = activeCategory === 'quotation' ? 'QT' : activeCategory === 'invoice' ? 'INV' : 'DOC';
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: 'Standard Terms Apply.',
      globalDiscount: 0,
      amountPaid: 0
    });
    setWizardStep('form');
    setIsCreateDialogOpen(true);
  };

  const handleSave = (status: string = 'Active') => {
    if (!formData.customerId) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Identity is required." });
      return;
    }

    const record: BillingRecord = {
      id: `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: activeCategory,
      customerName: selectedEntity?.name || 'Unknown',
      customerId: formData.customerId,
      date: formData.date,
      number: formData.number,
      amount: totals.finalAmount,
      status: status,
      note: formData.note
    };

    onSaveRecord(record);
    toast({ title: "Ledger Entry Committed", description: `${record.number} has been saved.` });
    setIsCreateDialogOpen(false);
  };

  const filteredRecords = records.filter(r => r.type === activeCategory && (r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || r.number.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <CreditCard className="h-4 w-4" />
            Financial Operations Hub
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Billing & Invoices
          </h2>
          <p className="text-muted-foreground font-medium">Manage production revenue and customer receivables.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button className="rounded-xl bg-[#001F3D] hover:bg-[#002d4f] text-white gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleCreateNew}>
             <Plus className="h-4 w-4" /> Create New Record
           </Button>
        </div>
      </header>

      <Tabs value={activeCategory} onValueChange={(val) => setActiveCategory(val as any)}>
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 h-14 inline-flex border border-slate-200/60 shadow-sm gap-2">
          {['quotation', 'invoice', 'proforma', 'inward', 'outward'].map((cat) => (
            <TabsTrigger key={cat} value={cat} className="rounded-xl px-6 h-11 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#001F3D] shadow-sm">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="overflow-hidden border-slate-200/60 bg-white shadow-2xl rounded-2xl">
          <div className="p-8 border-b border-slate-100 flex items-center bg-slate-50/50">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search records..." className="pl-10 h-11 bg-white border-slate-200 text-xs font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8">Identity / Ref</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-right">Net Value</TableHead>
                <TableHead className="font-bold text-[10px] uppercase text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="h-20 border-slate-50 hover:bg-slate-50/50">
                  <TableCell className="px-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3D]">{record.number}</span>
                      <span className="text-[9px] text-slate-400 font-code">{record.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-700 uppercase">{record.customerName}</TableCell>
                  <TableCell className="text-right font-display font-bold text-[#001F3D]">₹ {record.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-bold uppercase">{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Ledger Initialization</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Receiver Identity</Label>
              <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                  <SelectValue placeholder="Identify receiver..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {customers.map(c => <SelectItem key={c.id} value={c.name} className="text-xs font-bold uppercase">{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Document Number</Label>
              <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={formData.number} readOnly />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Net Valuation (₹)</Label>
              <Input className="h-12 bg-slate-50 border-none rounded-xl text-xl font-display font-bold" type="number" onChange={(e) => setLineItems([{...lineItems[0], pricePerUnit: Number(e.target.value)}])} />
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsCreateDialogOpen(false)}>Abort</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20" onClick={() => handleSave()}>Commit Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
