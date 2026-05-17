"use client";

import { useState, useEffect } from 'react';
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
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer, SystemUser as StaffMember, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';

interface OrderDetailsProps {
  orderId: string | null;
  onBack: () => void;
  customers: Customer[];
  staff: StaffMember[];
  onSave: (order: Order) => void;
  orders: Order[];
}

export function OrderDetails({ orderId, onBack, customers, staff, onSave, orders }: OrderDetailsProps) {
  const { toast } = useToast();
  const isNew = !orderId;
  const [displayId, setDisplayId] = useState("");
  const [customer, setCustomer] = useState("");
  const [lead, setLead] = useState("");
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Delayed' | 'Completed' | 'Yet to start'>('Yet to start');
  
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  useEffect(() => {
    if (orderId) {
      const existing = orders.find(o => o.id === orderId);
      if (existing) {
        setDisplayId(existing.id);
        setCustomer(existing.customer);
        setLead(existing.owner || "");
        setPriority(existing.priority);
        setStatus(existing.status);
        
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
      const generatedId = `${Math.floor(80000 + Math.random() * 10000)}`;
      setDisplayId(generatedId);
      setCustomer("");
      setLead("");
      setPriority("Medium");
      setStatus("Yet to start");
      setStartDateStr("");
      setEndDateStr("");
    }
  }, [orderId, orders]);

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

    const orderToSave: any = {
      id: displayId,
      customer: customer,
      startDate: formatDate(startDateStr),
      endDate: formatDate(endDateStr),
      priority: priority,
      status: status,
      owner: lead || 'Unassigned',
    };

    if (isNew) {
      orderToSave.progress = 0;
      orderToSave.amountSpent = '₹ 0.00';
      orderToSave.routing = [];
    }

    onSave(orderToSave as Order);
    toast({
      title: isNew ? "Thread Synchronized" : "Identity Updated",
      description: `Work Order #${displayId} has been committed to the master ledger.`
    });
  };

  const currentOrderFromLedger = orders.find(o => o.id === displayId);

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
                  <Hash className="h-3 w-3" /> Thread Identification
                </Label>
                <Input value={displayId} readOnly className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold font-code text-slate-400 opacity-60" />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Planned Start
                </Label>
                <DatePicker 
                  value={startDateStr}
                  onChange={setStartDateStr}
                  placeholder="SELECT A DATE"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Target Finish
                </Label>
                <DatePicker 
                  value={endDateStr}
                  onChange={setEndDateStr}
                  placeholder="SELECT A DATE"
                  className="h-12"
                />
              </div>
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-3 mb-8">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Financial Integration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Total Spent (Live Ledger)</Label>
                  <div className="h-16 flex items-center px-6 bg-slate-50 rounded-2xl font-display font-bold text-2xl text-[#001F3D] shadow-inner">
                    {currentOrderFromLedger?.amountSpent || "₹ 0.00"}
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1 italic">Synchronized with Hub v2.4</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <User className="h-3 w-3" /> Command Lead
                  </Label>
                  <Select value={lead} onValueChange={setLead}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                      <SelectValue placeholder="Assign Personnel..." />
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
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Priority Assignment</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="High" className="text-xs font-bold uppercase text-red-600">Critical / Emergency</SelectItem>
                    <SelectItem value="Medium" className="text-xs font-bold uppercase">Standard Protocol</SelectItem>
                    <SelectItem value="Low" className="text-xs font-bold uppercase">Maintenance Queue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Protocol State</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="Yet to start" className="text-xs font-bold uppercase">Ready_for_init</SelectItem>
                    <SelectItem value="Active" className="text-xs font-bold uppercase">Node_Active</SelectItem>
                    <SelectItem value="Pending" className="text-xs font-bold uppercase">On_Standby</SelectItem>
                    <SelectItem value="Delayed" className="text-xs font-bold uppercase text-red-600">Blocked / Error</SelectItem>
                    <SelectItem value="Completed" className="text-xs font-bold uppercase text-emerald-600">Terminal_Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <Target className="h-24 w-24 text-[#001F3D]" />
            </div>
            
            <div className="space-y-10 flex-grow relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Thread Analytics</h3>
                <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold uppercase px-2">Live_Tele</Badge>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Velocity Progress</span>
                  <span className="text-xs font-bold text-primary">{currentOrderFromLedger?.progress || 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${currentOrderFromLedger?.progress || 0}%` }}
                  />
                </div>

                <div className="pt-10 space-y-6">
                  <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Cumulative Consumption
                  </p>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Burn</span>
                    <span className="text-xl font-display font-bold text-[#001F3D]">
                      {currentOrderFromLedger?.amountSpent || "₹ 0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary/20 gap-3 mt-12 text-[10px] font-bold uppercase tracking-widest h-14 rounded-2xl transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Initialize Sub-Node
            </Button>
          </Card>
          
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-center gap-4 animate-in slide-in-from-right-2 duration-1000">
            <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Matrix Sync Active</p>
              <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1">
                {lead ? `Operational node assigned to ${lead}.` : 'Awaiting lead assignment for protocol initialization.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
