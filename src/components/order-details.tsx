"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Plus, Trash2, Calendar, CreditCard, DollarSign, User, Building2, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderDetailsProps {
  orderId: string | null;
  onBack: () => void;
}

// Mock Data representing integrations
const CRM_CUSTOMERS = [
  "Automotive Corp",
  "Aerospace Dynamics",
  "Global Logistics",
  "Precision Tooling Ltd",
  "Euro-Machining Group"
];

const STAFF_DIRECTORY = [
  "John Doe (Plant Controller)",
  "Sarah Miller (Production Lead)",
  "A. Chen (Senior Engineer)",
  "Miloš Kovařík (Operations)",
  "Sys_Admin_01"
];

export function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const isNew = !orderId;
  const [displayId, setDisplayId] = useState(orderId || "");
  const [customer, setCustomer] = useState(CRM_CUSTOMERS[0]);
  const [lead, setLead] = useState(STAFF_DIRECTORY[0]);

  // Auto-generate ID protocol for new orders
  useEffect(() => {
    if (isNew) {
      const generatedId = `WO-${Math.floor(80000 + Math.random() * 10000)}`;
      setDisplayId(generatedId);
    } else {
      setDisplayId(orderId);
    }
  }, [orderId, isNew]);

  // Industrial Dark Input Styling
  const darkInputClasses = "bg-[#0a0f18] border-none text-white h-12 focus-visible:ring-primary/50 text-sm font-bold placeholder:text-white/20 rounded-xl";
  const darkSelectClasses = "bg-[#0a0f18] border-none text-white h-12 focus:ring-primary/50 text-xs font-bold uppercase tracking-widest rounded-xl";

  return (
    <div className="space-y-8 max-w-[1300px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header section with professional weight */}
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
            onClick={onBack}
          >
            <Save className="h-4 w-4" /> Save Master Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Core Specifications Matrix */}
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
                    <SelectValue placeholder="Select Account..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    {CRM_CUSTOMERS.map(c => (
                      <SelectItem key={c} value={c} className="text-xs font-bold uppercase tracking-wider">{c}</SelectItem>
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
                  <Calendar className="h-3 w-3" /> Planned Start Date
                </Label>
                <div className="relative">
                  <Input defaultValue="01-03-2025" className={cn(darkInputClasses, "pr-12")} />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Target End Date
                </Label>
                <div className="relative">
                  <Input defaultValue="15-03-2025" className={cn(darkInputClasses, "pr-12")} />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
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
                    <Input value="$12,450.00" readOnly className="h-16 bg-slate-50 border-none text-[#001F3D] font-display font-bold text-2xl px-6 rounded-2xl shadow-inner" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1 italic">Synced with Financial Hub v2.4</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <User className="h-3 w-3" /> Project Lead (Resource Mgmt)
                  </Label>
                  <Select value={lead} onValueChange={setLead}>
                    <SelectTrigger className={darkSelectClasses}>
                      <SelectValue placeholder="Assign Officer..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                      {STAFF_DIRECTORY.map(s => (
                        <SelectItem key={s} value={s} className="text-xs font-bold uppercase tracking-wider">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Priority Classification</Label>
                <Select defaultValue="high">
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    <SelectItem value="high" className="text-xs font-bold uppercase">High Priority - Emergency</SelectItem>
                    <SelectItem value="medium" className="text-xs font-bold uppercase">Standard Production</SelectItem>
                    <SelectItem value="low" className="text-xs font-bold uppercase">Backlog Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Live Production Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    <SelectItem value="active" className="text-xs font-bold uppercase">Status: Active Thread</SelectItem>
                    <SelectItem value="pending" className="text-xs font-bold uppercase">Status: Queue Standby</SelectItem>
                    <SelectItem value="delayed" className="text-xs font-bold uppercase text-red-400">Status: Delayed / Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Updated Order Summary Sidebar */}
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
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/20">85%</Badge>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-[1px]">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[85%] rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all duration-1000" />
                </div>

                <div className="pt-10 space-y-6">
                  <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Expenditure Summary
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Spent</span>
                      <span className="text-xl font-display font-bold text-[#001F3D]">$12,450.00</span>
                    </div>
                    <div className="flex justify-between items-center px-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Ledger State</span>
                      <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200 uppercase font-bold px-4 py-1">INVOICED_V2</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-10 space-y-6">
                  <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
                    <Trash2 className="h-3 w-3" /> Material Resource Status
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center text-[11px] font-bold p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <span className="text-slate-600">Alloy Steel 4140</span>
                      <span className="text-emerald-600 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> IN_STOCK
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                      <span className="text-slate-600">Carbide Tooling Kit</span>
                      <span className="text-amber-600 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> LOW_LIMIT
                      </span>
                    </div>
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
              <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Assignment Active</p>
              <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1">{lead} assigned as Command Lead for this thread.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Part Breakdown Ledger */}
      <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Component Breakdown & Quantities</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Routing Ledger</p>
          </div>
          <Button variant="ghost" size="sm" className="h-12 text-slate-400 hover:text-primary hover:bg-primary/5 gap-3 text-[10px] font-bold uppercase tracking-widest px-6 rounded-xl transition-all">
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
          
          <div className="group grid grid-cols-12 gap-6 items-center py-6 px-4 hover:bg-slate-50/50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <div className="col-span-1 font-display font-bold text-lg text-slate-200 group-hover:text-primary transition-colors">01</div>
            <div className="col-span-5 flex flex-col gap-1">
              <span className="font-bold text-sm text-[#001F3D] uppercase tracking-tight">Front Axle Support Assembly</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] font-mono bg-slate-100 w-fit px-2 py-0.5 rounded">SKU-88452-A</span>
            </div>
            <div className="col-span-3 text-center">
              <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100/80 px-5 py-2 rounded-xl border border-slate-200/50">500 UNITS</span>
            </div>
            <div className="col-span-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-sm font-bold text-[#001F3D]">12.5 HOURS</span>
                <span className="text-[8px] text-slate-400 uppercase font-bold">Standard_Rate</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
