
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
  Plus, 
  ArrowRight,
  Receipt,
  Building2,
  Calendar,
  Hash,
  Truck,
  User,
  Package,
  CheckCircle2,
  Clock,
  Banknote,
  MoreVertical
} from 'lucide-react';
import { Customer, Vendor, BillingRecord, Order, SystemUser } from '@/lib/types';
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
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

type BillingCategory = 'quotation' | 'invoice' | 'proforma' | 'inward' | 'outward' | 'expenses';

interface BillingManagementProps {
  customers: Customer[];
  vendors: Vendor[];
  records: BillingRecord[];
  orders: Order[];
  users: SystemUser[];
  onSaveRecord: (record: BillingRecord) => void;
}

export function BillingManagement({ customers, vendors, records, orders, users, onSaveRecord }: BillingManagementProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BillingCategory>('quotation');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    number: '',
    note: 'Terms & Conditions as per Industrial Standard Protocol.',
    amount: 0,
    itemName: '',
    orderId: '',
    receiverName: '',
    paymentStatus: 'pending',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer',
    transactionDetails: ''
  });

  const isLogisticsCategory = activeCategory === 'inward' || activeCategory === 'outward';

  const selectedEntity = useMemo(() => {
    if (activeCategory === 'inward') return vendors.find(v => v.id === formData.customerId);
    return customers.find(c => c.name === formData.customerId || c.id === formData.customerId);
  }, [customers, vendors, formData.customerId, activeCategory]);

  const handleCreateNew = () => {
    const prefix = activeCategory === 'quotation' ? 'QT' : activeCategory === 'invoice' ? 'INV' : activeCategory === 'inward' ? 'INW' : 'DOC';
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      number: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: 'Standard Terms Apply.',
      amount: 0,
      itemName: '',
      orderId: '',
      receiverName: '',
      paymentStatus: 'pending',
      paymentMethod: 'Bank Transfer',
      transactionDetails: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId || (activeCategory === 'inward' && !formData.itemName)) {
      toast({ variant: "destructive", title: "Protocol Interrupted", description: "Mandatory identity fields required." });
      return;
    }

    const record: BillingRecord = {
      id: `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: activeCategory,
      customerName: selectedEntity?.name || 'Unknown',
      customerId: formData.customerId,
      date: formData.date,
      number: formData.number,
      amount: formData.amount,
      status: formData.paymentStatus === 'paid' ? 'Paid' : 'Pending',
      note: formData.note,
      itemName: formData.itemName,
      orderId: formData.orderId,
      receiverName: formData.receiverName,
      paymentMethod: formData.paymentMethod,
      transactionDetails: formData.transactionDetails
    };

    // If INWARD and linked to an Order, update Order's Amount Spent
    if (activeCategory === 'inward' && formData.orderId && formData.amount > 0) {
      const order = orders.find(o => o.id === formData.orderId);
      if (order) {
        const currentSpent = parseFloat((order.amountSpent || "₹ 0.00").replace(/[₹,]/g, '')) || 0;
        const newSpent = currentSpent + formData.amount;
        const formattedSpent = `₹ ${newSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        
        setDocumentNonBlocking(doc(db, 'orders', order.id), { amountSpent: formattedSpent }, { merge: true });
        toast({ title: "Order Ledger Updated", description: `Expenditure for Order #${order.id} increased by ₹ ${formData.amount.toLocaleString()}.` });
      }
    }

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
          <p className="text-muted-foreground font-medium">Manage production revenue and logistics expenditures.</p>
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
                <TableHead className="font-bold text-[10px] uppercase text-slate-400">Account / Vendor Name</TableHead>
                {activeCategory === 'inward' && <TableHead className="font-bold text-[10px] uppercase text-slate-400">Item Name</TableHead>}
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
                  {activeCategory === 'inward' && <TableCell className="text-xs font-medium text-slate-500 uppercase">{record.itemName}</TableCell>}
                  <TableCell className="text-right font-display font-bold text-[#001F3D]">₹ {record.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase",
                      record.status === 'Paid' ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                    )}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-none shadow-2xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Ledger Initialization: {activeCategory.toUpperCase()}</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execute financial synchronization protocol.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> {activeCategory === 'inward' ? 'Vendor Node' : 'Client Identity'}
                </Label>
                <Select value={formData.customerId} onValueChange={(val) => setFormData({...formData, customerId: val})}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue placeholder="Identify entity..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {activeCategory === 'inward' ? (
                      vendors.map(v => <SelectItem key={v.id} value={v.id} className="text-xs font-bold uppercase">{v.name}</SelectItem>)
                    ) : (
                      customers.map(c => <SelectItem key={c.id} value={c.name} className="text-xs font-bold uppercase">{c.name}</SelectItem>)
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Document Ref
                </Label>
                <Input className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold" value={formData.number} readOnly />
              </div>
            </div>

            {activeCategory === 'inward' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Package className="h-3 w-3" /> Item Description
                    </Label>
                    <Input 
                      placeholder="e.g. M10 Machining Plate" 
                      className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                      value={formData.itemName}
                      onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Receipt className="h-3 w-3" /> Associated Work Order
                    </Label>
                    <Select value={formData.orderId} onValueChange={(val) => setFormData({...formData, orderId: val})}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold">
                        <SelectValue placeholder="Link to production..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none" className="text-xs font-bold uppercase">No Order (General)</SelectItem>
                        {orders.map(o => <SelectItem key={o.id} value={o.id} className="text-xs font-bold">#{o.id} - {o.customer}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <User className="h-3 w-3" /> Receiver Name
                    </Label>
                    <Select value={formData.receiverName} onValueChange={(val) => setFormData({...formData, receiverName: val})}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold">
                        <SelectValue placeholder="Identify personnel..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {users.map(u => <SelectItem key={u.id} value={u.name} className="text-xs font-bold uppercase">{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Received Date
                    </Label>
                    <Input 
                      type="date" 
                      className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Payment Protocol
                </Label>
                <Select value={formData.paymentStatus} onValueChange={(val) => setFormData({...formData, paymentStatus: val})}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="pending" className="text-xs font-bold uppercase">Protocol: Pending</SelectItem>
                    <SelectItem value="paid" className="text-xs font-bold uppercase">Protocol: Settled / Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Net Valuation (₹)</Label>
                <Input 
                  type="number" 
                  className="h-12 bg-slate-50 border-none rounded-xl text-xl font-display font-bold text-primary"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                />
              </div>
            </div>

            {formData.paymentStatus === 'paid' && (
              <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-6 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Settlement Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-emerald-600">Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}>
                      <SelectTrigger className="h-10 bg-white border-none rounded-lg text-xs font-bold uppercase text-emerald-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-emerald-100">
                        <SelectItem value="Cash" className="text-xs font-bold">Cash Payment</SelectItem>
                        <SelectItem value="Bank Transfer" className="text-xs font-bold">Bank Transfer / NEFT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-emerald-600">Transaction Ref / ID</Label>
                    <Input 
                      placeholder="UTR / Receipt No." 
                      className="h-10 bg-white border-none rounded-lg text-xs font-bold text-emerald-700 uppercase"
                      value={formData.transactionDetails}
                      onChange={(e) => setFormData({...formData, transactionDetails: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsCreateDialogOpen(false)}>Abort Protocol</Button>
              <Button className="flex-[2] h-14 bg-[#001F3D] hover:bg-[#002d4f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20" onClick={handleSave}>Commit to Ledger</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
