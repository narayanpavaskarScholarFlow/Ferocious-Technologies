"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isValid } from 'date-fns';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  DollarSign, 
  User, 
  Building2, 
  Hash, 
  CreditCard, 
  Target, 
  Clock, 
  ShieldCheck,
  FileText,
  Hammer,
  Sparkles,
  Link2,
  Cpu,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer, SystemUser as StaffMember, Order, UISettings, BillingRecord, BillingLineItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';

interface OrderDetailsProps {
  orderId: string | null;
  onBack: () => void;
  customers: Customer[];
  staff: StaffMember[];
  onSave: (order: Order) => void;
  orders: Order[];
  uiSettings: UISettings;
  billing?: BillingRecord[];
}

const WORK_TYPES = [
  "Mould Manufacturing",
  "Press Tooling",
  "Fixture Fabrication",
  "Precision Component",
  "Mould Design",
  "Product Design",
  "Engineering Consultancy",
  "DFM Analysis",
  "Reverse Engineering",
  "Maintenance & Rework"
];

const ORDER_STATUS_WORKFLOW = [
  "Draft",
  "Planning",
  "Production",
  "Inspection",
  "Dispatch",
  "Completed",
  "Delivered"
];

export function OrderDetails({ orderId, onBack, customers, staff, onSave, orders, uiSettings, billing = [] }: OrderDetailsProps) {
  const { toast } = useToast();
  const isNew = !orderId;
  const [displayId, setDisplayId] = useState("");
  const [customer, setCustomer] = useState("");
  const [lead, setLead] = useState("");
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<Order['status']>('Planning');
  
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  
  const [poNumber, setPoNumber] = useState("");
  const [poId, setPoId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [typeOfWork, setTypeOfWork] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [orderItems, setOrderItems] = useState<BillingLineItem[]>([]);

  const purchaseOrders = useMemo(() => {
    return billing.filter(record => record.type === 'purchase_order');
  }, [billing]);

  useEffect(() => {
    if (orderId) {
      const existing = orders.find(o => o.id === orderId);
      if (existing) {
        setDisplayId(existing.id);
        setCustomer(existing.customer);
        setLead(existing.owner || "");
        setPriority(existing.priority);
        setStatus(existing.status);
        setPoNumber(existing.poNumber || "");
        setPoId(existing.poId || "");
        setQuotationId(existing.quotationId || "");
        setTypeOfWork(existing.typeOfWork || "");
        setTargetBudget(existing.targetBudget || "");
        setOrderItems(existing.items || []);
        
        const parseToISO = (str?: string) => {
          if (!str) return "";
          if (str.includes('.')) {
            const [d, m, y] = str.split('.');
            return `${y}-${m}-${d}`;
          }
          return str;
        };

        setStartDateStr(parseToISO(existing.startDate));
        setEndDateStr(parseToISO(existing.endDate));
      }
    } else {
      const prefix = uiSettings?.woPrefix || 'WO-';
      const seq = uiSettings?.woNextNumber ?? 1001;
      const generatedId = `${prefix}${seq.toString().padStart(4, '0')}`;
      
      setDisplayId(generatedId);
      setCustomer("");
      setLead("");
      setPriority("Medium");
      setStatus("Planning");
      setStartDateStr("");
      setEndDateStr("");
      setPoNumber("");
      setPoId("");
      setQuotationId("");
      setTypeOfWork("");
      setTargetBudget("");
      setOrderItems([]);
    }
  }, [orderId, orders, uiSettings]);

  const handlePOConsumption = (selectedPOId: string) => {
    const linkedPO = purchaseOrders.find(po => po.id === selectedPOId);
    if (linkedPO) {
      setPoId(linkedPO.id);
      setPoNumber(linkedPO.number);
      setCustomer(linkedPO.customerName);
      setQuotationId(linkedPO.quotationId || "");
      setTargetBudget(linkedPO.amount.toString());
      setOrderItems(linkedPO.items || []);
      
      toast({
        title: "Matrix Sync Active",
        description: `Linked Customer PO #${linkedPO.number}. Identity and products mapped.`
      });
    }
  };

  const handleCommitOrder = () => {
    if (!customer || !startDateStr || !endDateStr) {
      toast({
        variant: "destructive",
        title: "Validation Failure",
        description: "Customer Identity and Timeline Windows are mandatory for production initialization."
      });
      return;
    }

    const formatDate = (isoStr: string) => {
      const date = parseISO(isoStr);
      return isValid(date) ? format(date, 'dd.MM.yyyy') : isoStr;
    };

    const orderToSave: Order = {
      id: displayId,
      customer: customer,
      poNumber: poNumber,
      poId: poId,
      quotationId: quotationId,
      typeOfWork: typeOfWork,
      startDate: formatDate(startDateStr),
      endDate: formatDate(endDateStr),
      priority: priority,
      status: status,
      owner: lead || 'Unassigned',
      targetBudget: targetBudget,
      items: orderItems,
    };

    if (isNew) {
      orderToSave.progress = 0;
      orderToSave.amountSpent = '₹ 0.00';
      orderToSave.routing = [];
    }

    onSave(orderToSave);
    toast({
      title: isNew ? "Thread Synchronized" : "Identity Updated",
      description: `Work Order #${displayId} has been committed to the master ledger.`
    });
  };

  return (
    <div className="space-y-8 max-w-[1300px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 text-slate-400 hover:bg-slate-100 rounded-2xl">
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-3xl font-display font-bold uppercase text-[#001F3D] tracking-tight leading-none">
                {isNew ? 'Initialize Order' : 'Modify Order Matrix'}
              </h2>
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse-red" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Master Order Architecture v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="ghost"
            className="flex-1 md:flex-none h-12 font-bold text-[10px] uppercase tracking-widest rounded-xl" 
            onClick={onBack}
          >
            Discard Changes
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-[#001F3D] hover:bg-black text-white gap-3 h-12 px-8 font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 transition-all" 
            onClick={handleCommitOrder}
          >
            <Save className="h-4 w-4" /> {isNew ? 'Finalize Master Order' : 'Synchronize Identity'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-8 p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="space-y-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 bg-primary rounded-full" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Traceability Protocol</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Link2 className="h-3 w-3" /> Link Customer PO
                </Label>
                <Select value={poId} onValueChange={handlePOConsumption}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code shadow-inner">
                    <SelectValue placeholder="Select existing PO node..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                    <div className="px-2 py-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b mb-1">Customer PO Registry</div>
                    {purchaseOrders.map(po => (
                      <SelectItem key={po.id} value={po.id} className="text-xs font-bold font-code py-3">
                        {po.number} — {po.customerName}
                      </SelectItem>
                    ))}
                    {purchaseOrders.length === 0 && (
                      <div className="px-2 py-6 text-center text-[9px] text-slate-400 font-medium uppercase">No PO Nodes Discovered</div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[8px] text-slate-400 font-medium italic mt-1 ml-1">* Linking auto-populates items & customer metadata.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> Customer Identity
                </Label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue placeholder="Identify Account..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.name} className="text-xs font-bold uppercase tracking-wider">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Work Order ID
                </Label>
                <Input value={displayId} readOnly className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code text-slate-400 opacity-60" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Hammer className="h-3 w-3" /> Type of Work
                </Label>
                <Select value={typeOfWork} onValueChange={setTypeOfWork}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner">
                    <SelectValue placeholder="Identify work type..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                    {WORK_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="text-xs font-bold uppercase">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Execution Start
                </Label>
                <DatePicker 
                  value={startDateStr}
                  onChange={setStartDateStr}
                  placeholder="SELECT START DATE"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Promised Delivery
                </Label>
                <DatePicker 
                  value={endDateStr}
                  onChange={setEndDateStr}
                  placeholder="SELECT DELIVERY DATE"
                  className="h-12"
                />
              </div>
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Commercial Value Matrix</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Total Quoted Value</Label>
                  <div className="relative">
                    <Input 
                      placeholder="0.00" 
                      className="h-16 bg-slate-50 border-none rounded-2xl font-display font-bold text-2xl text-[#001F3D] shadow-inner pl-12 focus-visible:ring-primary/20"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(e.target.value)}
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display font-bold text-2xl text-slate-300">₹</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <User className="h-3 w-3" /> Production Command Lead
                  </Label>
                  <Select value={lead} onValueChange={setLead}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                      <SelectValue placeholder="Assign Commander..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.name} className="text-xs font-bold uppercase tracking-wider">{s.name} ({s.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Priority Protocol</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="High" className="text-xs font-bold uppercase text-red-600">Flash_Priority (Critical)</SelectItem>
                    <SelectItem value="Medium" className="text-xs font-bold uppercase">Standard_Protocol</SelectItem>
                    <SelectItem value="Low" className="text-xs font-bold uppercase">Backlog_Queue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Operational State</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    {ORDER_STATUS_WORKFLOW.map(s => (
                      <SelectItem key={s} value={s} className="text-xs font-bold uppercase">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-0.05 transition-opacity">
              <Target className="h-24 w-24" />
            </div>
            
            <div className="space-y-10 flex-grow relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.25em]">Matrix Overview</h3>
                <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold uppercase px-2">ORDER_SYNC</Badge>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[9px] font-bold uppercase text-white/30 tracking-widest">Linked Items ({orderItems.length})</p>
                  <div className="space-y-2">
                    {orderItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[10px] font-bold text-white/60 uppercase truncate flex-1 pr-4">{item.description}</span>
                        <span className="text-[10px] font-bold text-primary">{item.qty} {item.unit}</span>
                      </div>
                    ))}
                    {orderItems.length > 3 && (
                      <p className="text-[9px] text-white/20 font-bold uppercase text-center mt-2">+{orderItems.length - 3} More Items</p>
                    )}
                    {orderItems.length === 0 && (
                      <p className="text-[9px] text-white/20 font-bold uppercase italic text-center py-4">No Items Attached</p>
                    )}
                  </div>
                </div>

                <div className="pt-10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Timeline Health</span>
                    <span className="text-xs font-bold text-emerald-400">NOMINAL</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 gap-3 mt-12 text-[10px] font-bold uppercase tracking-widest h-14 rounded-2xl transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Add Custom Sub-Node
            </Button>
          </Card>
          
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 animate-in slide-in-from-right-2 duration-1000">
            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Fidelity Verified</p>
              <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1">
                This Order is linked to a validated Customer PO. Traceability is active across all operational nodes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

