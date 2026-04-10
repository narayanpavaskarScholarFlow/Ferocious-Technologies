"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ChevronLeft, Save, Plus, Trash2, Calendar as CalendarIcon, DollarSign, User, Building2, Hash, CreditCard, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer, StaffMember, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsProps {
  orderId: string | null;
  onBack: () => void;
  customers: Customer[];
  staff: StaffMember[];
  onSave: (order: Order) => void;
  orders: Order[];
}

interface PartRow {
  id: string;
  name: string;
  sku: string;
  qty: string;
  duration: string;
}

export function OrderDetails({ orderId, onBack, customers, staff, onSave, orders }: OrderDetailsProps) {
  const { toast } = useToast();
  const isNew = !orderId;
  const [displayId, setDisplayId] = useState("");
  const [customer, setCustomer] = useState("");
  const [lead, setLead] = useState("");
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Delayed' | 'Completed' | 'Yet to start'>('Yet to start');
  const [parts, setParts] = useState<PartRow[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    if (orderId) {
      const existing = orders.find(o => o.id === orderId);
      if (existing) {
        setDisplayId(existing.id);
        setCustomer(existing.customer);
        setLead(existing.owner || "");
        setPriority(existing.priority);
        setStatus(existing.status);
        
        if (existing.startDate) {
          try {
            const [d, m, y] = existing.startDate.split('.').map(Number);
            setStartDate(new Date(y, m - 1, d));
          } catch (e) {}
        }
        if (existing.endDate) {
          try {
            const [d, m, y] = existing.endDate.split('.').map(Number);
            setEndDate(new Date(y, m - 1, d));
          } catch (e) {}
        }
      }
    } else {
      const generatedId = `${Math.floor(80000 + Math.random() * 10000)}`;
      setDisplayId(generatedId);
      setCustomer("");
      setLead("");
      setPriority("Medium");
      setStatus("Yet to start");
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [orderId, orders]);

  const handleAddPart = () => {
    const newPart: PartRow = {
      id: (parts.length + 1).toString().padStart(2, '0'),
      name: '',
      sku: '',
      qty: '0 UNITS',
      duration: '0.0 HOURS'
    };
    setParts([...parts, newPart]);
  };

  const handleCommitOrder = () => {
    if (!customer || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Validation Failure",
        description: "Customer Identity and Timeline Windows are mandatory for production initialization."
      });
      return;
    }

    const newOrder: Order = {
      id: displayId,
      customer: customer,
      startDate: format(startDate, 'dd.MM.yyyy'),
      endDate: format(endDate, 'dd.MM.yyyy'),
      priority: priority,
      status: status,
      owner: lead || 'Unassigned',
      progress: isNew ? 0 : (orders.find(o => o.id === displayId)?.progress || 0),
      amountSpent: isNew ? '₹ 0.00' : (orders.find(o => o.id === displayId)?.amountSpent || '₹ 0.00')
    };

    onSave(newOrder);
    toast({
      title: isNew ? "Thread Synchronized" : "Identity Updated",
      description: `Work Order #${displayId} has been committed to the master ledger.`
    });
  };

  const darkInputClasses = "bg-[#0a0f18] border-none text-white h-12 focus-visible:ring-primary/50 text-sm font-bold placeholder:text-white/20 rounded-xl transition-all";
  const darkSelectClasses = "bg-[#0a0f18] border-none text-white h-12 focus:ring-primary/50 text-xs font-bold uppercase tracking-widest rounded-xl";

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
                {isNew ? 'New Production' : 'Modify Production'}
              </h2>
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse-red" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Operational Planning Protocol v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            className="flex-1 md:flex-none bg-[#0a0f18] hover:bg-[#111827] text-white px-8 h-12 font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-black/10" 
            onClick={onBack}
          >
            Discard Changes
          </Button>
          <Button 
            variant="outline"
            className="flex-1 md:flex-none bg-white border-slate-200 text-[#001F3D] hover:bg-slate-50 gap-3 h-12 px-8 font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-sm border-b-4 active:border-b-0 transition-all" 
            onClick={handleCommitOrder}
          >
            <Save className="h-4 w-4" /> {isNew ? 'Save Master Order' : 'Synchronize Identity'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-8 p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="space-y-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 bg-primary rounded-full" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Core Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> Customer Name (From CRM)
                </Label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue placeholder={customers.length > 0 ? "Select Account..." : "No Customers Found"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.name} className="text-xs font-bold uppercase tracking-wider">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Order ID / Ref (Auto)
                </Label>
                <Input value={displayId} readOnly className={cn(darkInputClasses, "opacity-60 cursor-not-allowed")} />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Planned Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        darkInputClasses,
                        "justify-start text-left font-bold w-full border-none hover:bg-[#111827] hover:text-white",
                        !startDate && "text-white/20"
                      )}
                    >
                      {startDate ? format(startDate, "PPP") : <span>Set Start Date...</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 text-slate-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0a0f18] border-white/10 rounded-2xl shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="bg-transparent"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Target End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        darkInputClasses,
                        "justify-start text-left font-bold w-full border-none hover:bg-[#111827] hover:text-white",
                        !endDate && "text-white/20"
                      )}
                    >
                      {endDate ? format(endDate, "PPP") : <span>Set Target Date...</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 text-slate-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0a0f18] border-white/10 rounded-2xl shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="bg-transparent"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Financial Hub Integration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Total Amount Spent (Live Ledger)</Label>
                  <div className="relative group">
                    <Input value={!isNew ? (orders.find(o => o.id === displayId)?.amountSpent || "₹ 0.00") : "₹ 0.00"} readOnly className="h-16 bg-slate-50 border-none text-[#001F3D] font-display font-bold text-2xl px-6 rounded-2xl shadow-inner" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-slate-200" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1 italic">Synced with Financial Hub v2.4</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <User className="h-3 w-3" /> Project Lead (Resource Mgmt)
                  </Label>
                  <Select value={lead} onValueChange={setLead}>
                    <SelectTrigger className={darkSelectClasses}>
                      <SelectValue placeholder={staff.length > 0 ? "Assign Officer..." : "No Personnel Found"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
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
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Priority Classification</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    <SelectItem value="High" className="text-xs font-bold uppercase">High Priority - Emergency</SelectItem>
                    <SelectItem value="Medium" className="text-xs font-bold uppercase">Standard Production</SelectItem>
                    <SelectItem value="Low" className="text-xs font-bold uppercase">Backlog Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Live Production Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    <SelectItem value="Yet to start" className="text-xs font-bold uppercase">Status: Yet to start</SelectItem>
                    <SelectItem value="Active" className="text-xs font-bold uppercase">Status: Active Thread</SelectItem>
                    <SelectItem value="Pending" className="text-xs font-bold uppercase">Status: Queue Standby</SelectItem>
                    <SelectItem value="Delayed" className="text-xs font-bold uppercase text-red-400">Status: Delayed / Critical</SelectItem>
                    <SelectItem value="Completed" className="text-xs font-bold uppercase text-green-400">Status: Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Hash className="h-20 w-20 text-[#001F3D]" />
            </div>
            
            <div className="space-y-10 flex-grow relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Order Summary</h3>
                <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold">WO_REPORT</Badge>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Velocity Progress</span>
                  <Badge className="bg-slate-100 text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-full">
                    {!isNew ? (orders.find(o => o.id === displayId)?.progress || 0) : 0}%
                  </Badge>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-[1px]">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${!isNew ? (orders.find(o => o.id === displayId)?.progress || 0) : 0}%` }}
                  />
                </div>

                <div className="pt-10 space-y-6">
                  <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Expenditure Summary
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Spent</span>
                      <span className="text-xl font-display font-bold text-[#001F3D]">
                        {!isNew ? (orders.find(o => o.id === displayId)?.amountSpent || "₹ 0.00") : "₹ 0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Ledger State</span>
                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-400 border-slate-200 uppercase font-bold px-4 py-1">UNINVOICED</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-10 space-y-6">
                  <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
                    <Trash2 className="h-3 w-3" /> Material Resource Status
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-[10px] text-slate-400 italic font-medium px-4">No materials allocated yet.</p>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary/20 gap-3 mt-12 text-[10px] font-bold uppercase tracking-widest h-16 rounded-2xl transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Register Sub-Component
            </Button>
          </Card>
          
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-center gap-4">
            <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Assignment Verified</p>
              <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1">
                {lead ? `${lead} is overseeing this thread.` : 'Assign a Command Lead to initialize this thread.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Component Breakdown & Quantities</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Routing Ledger</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddPart}
            className="h-12 text-slate-400 hover:text-primary hover:bg-primary/5 gap-3 text-[10px] font-bold uppercase tracking-widest px-6 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" /> Add Row to Spreadsheet
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-6 items-center border-b border-slate-50 pb-6 px-4">
            <div className="col-span-1 text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Seq.</div>
            <div className="col-span-5 text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Component / SKU Identity</div>
            <div className="col-span-3 text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] text-center">Batch Quantity</div>
            <div className="col-span-2 text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] text-center">Est. Duration</div>
            <div className="col-span-1"></div>
          </div>
          
          {parts.map((part, idx) => (
            <div key={part.id} className="group grid grid-cols-12 gap-6 items-center py-6 px-4 hover:bg-slate-50/50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
              <div className="col-span-1 font-display font-bold text-lg text-slate-200 group-hover:text-primary transition-colors">{part.id}</div>
              <div className="col-span-5 flex flex-col gap-2">
                <Input placeholder="Component Name..." className="h-9 bg-slate-50 border-none text-xs font-bold uppercase" />
                <Input placeholder="SKU-XXXX-X" className="h-7 bg-slate-100 border-none text-[9px] font-bold font-mono w-fit px-2" />
              </div>
              <div className="col-span-3 text-center">
                <Input placeholder="0 UNITS" className="h-10 text-center font-mono text-sm font-bold bg-slate-100/80 rounded-xl border-none" />
              </div>
              <div className="col-span-2 text-center">
                <Input placeholder="0.0 HOURS" className="h-10 text-center font-mono text-sm font-bold bg-white border-slate-200 rounded-xl" />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl"
                  onClick={() => setParts(parts.filter(p => p.id !== part.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {parts.length === 0 && (
            <div className="py-20 text-center opacity-30 flex flex-col items-center">
              <Plus className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Append row to initialize breakdown</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
