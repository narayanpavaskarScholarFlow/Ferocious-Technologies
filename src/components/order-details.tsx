"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Plus, Trash2, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface OrderDetailsProps {
  orderId: string | null;
  onBack: () => void;
}

export function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const isNew = !orderId;
  const [displayId, setDisplayId] = useState(orderId || "10XXXX");

  // Sync ID if it changes via prop
  useEffect(() => {
    if (orderId) setDisplayId(orderId);
  }, [orderId]);

  // Industrial Dark Input Styling matching the reference image
  const darkInputClasses = "bg-[#0a0f18] border-none text-white h-12 focus-visible:ring-primary/50 text-sm font-medium placeholder:text-white/20";
  const darkSelectClasses = "bg-[#0a0f18] border-none text-white h-12 focus:ring-primary/50 text-sm font-medium";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header section matching image weight and typography */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 text-slate-400 hover:bg-slate-100">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-display font-bold uppercase text-[#001F3D] tracking-tight leading-none">
              {isNew ? 'Create New Production' : 'Modify Production'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-display font-bold uppercase text-[#001F3D] tracking-tight leading-none">Order</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Planning System v2.0</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-[#0a0f18] hover:bg-[#111827] text-white px-8 h-11 font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-xl" 
            onClick={onBack}
          >
            Discard Changes
          </Button>
          <Button 
            variant="outline"
            className="bg-white border-slate-200 text-[#001F3D] hover:bg-slate-50 gap-2 h-11 px-8 font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-sm" 
            onClick={onBack}
          >
            <Save className="h-3.5 w-3.5" /> Save Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Specifications Boxed Section */}
        <Card className="lg:col-span-8 p-10 bg-white border-slate-200/60 shadow-sm rounded-[2rem] relative overflow-hidden">
          {/* Subtle Industrial Grid Background */}
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          
          <div className="space-y-10 relative z-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Core Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Customer Name</Label>
                <Input defaultValue="Automotive Corp" className={darkInputClasses} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Order ID / Ref</Label>
                <Input value={displayId} onChange={(e) => setDisplayId(e.target.value)} className={darkInputClasses} />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Start Date</Label>
                <div className="relative">
                  <Input defaultValue="01-03-2025" className={cn(darkInputClasses, "pr-12")} />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">End Date (Due)</Label>
                <div className="relative">
                  <Input defaultValue="15-03-2025" className={cn(darkInputClasses, "pr-12")} />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Financial Breakdown (Amount Spent Details)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Actual Material Spent</Label>
                  <Input defaultValue="$8,450.00" className={darkInputClasses} />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Actual Labor / Machine Spent</Label>
                  <Input defaultValue="$4,000.00" className={darkInputClasses} />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Total Amount Spent</Label>
                  <Input defaultValue="$12,450.00" readOnly className="h-12 bg-slate-50 border-none text-[#001F3D] font-bold text-sm px-4 focus-visible:ring-0" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Priority Level</Label>
                <Select defaultValue="high">
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    <SelectItem value="high" className="text-xs font-bold uppercase">High Priority</SelectItem>
                    <SelectItem value="medium" className="text-xs font-bold uppercase">Medium Priority</SelectItem>
                    <SelectItem value="low" className="text-xs font-bold uppercase">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Production Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none rounded-xl">
                    <SelectItem value="active" className="text-xs font-bold uppercase">Active</SelectItem>
                    <SelectItem value="pending" className="text-xs font-bold uppercase">Pending</SelectItem>
                    <SelectItem value="delayed" className="text-xs font-bold uppercase">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Project Lead</Label>
                <Input defaultValue="John Doe" className={darkInputClasses} />
              </div>
            </div>
          </div>
        </Card>

        {/* Order Summary Sidebar */}
        <Card className="lg:col-span-4 p-10 bg-white border-slate-200/60 shadow-xl rounded-[2rem] flex flex-col">
          <div className="space-y-10 flex-grow">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Order Summary</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Current Progress</span>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-600/20">85%</Badge>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[85%] rounded-full shadow-[0_0_12px_rgba(37,99,235,0.5)] transition-all duration-1000" />
              </div>

              <div className="pt-8 space-y-5">
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em]">Expenditure Summary</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Total Spent</span>
                  <span className="text-[#001F3D] font-bold">$12,450.00</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Payment Status</span>
                  <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200 uppercase font-bold px-3">INVOICED</Badge>
                </div>
              </div>

              <div className="pt-8 space-y-5">
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em]">Material Requirements</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Alloy Steel 4140</span>
                  <span className="text-green-600 font-bold flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> In Stock
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Carbide Tooling Kit</span>
                  <span className="text-amber-600 font-bold flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Low Stock
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-400 hover:text-[#001F3D] hover:border-primary/20 gap-2 mt-10 text-[10px] font-bold uppercase tracking-widest h-14 rounded-2xl transition-all">
            <Plus className="h-4 w-4" /> Add Sub-Part
          </Button>
        </Card>
      </div>

      {/* Part Breakdown Matrix */}
      <Card className="p-10 bg-white border-slate-200/60 shadow-xl rounded-[2rem]">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Part Breakdown & Quantity</h3>
          <Button variant="ghost" size="sm" className="h-10 text-slate-300 hover:text-primary gap-2 text-[10px] font-bold uppercase tracking-widest px-4 rounded-xl">
            <Plus className="h-3.5 w-3.5" /> Add Part Row
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4 items-center border-b border-slate-50 pb-4 px-2">
            <div className="col-span-1 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">#</div>
            <div className="col-span-5 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Part Name / SKU Matrix</div>
            <div className="col-span-3 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] text-center">Quantity</div>
            <div className="col-span-2 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] text-center">Est. Time</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="group grid grid-cols-12 gap-4 items-center py-4 px-2 hover:bg-slate-50/50 rounded-2xl transition-colors">
            <div className="col-span-1 font-bold text-sm text-slate-300 group-hover:text-primary transition-colors">01</div>
            <div className="col-span-5 flex flex-col">
              <span className="font-bold text-sm text-[#001F3D] uppercase tracking-tight">Front Axle Support Assembly</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">[SKU-88-A]</span>
            </div>
            <div className="col-span-3 text-center">
              <span className="font-code text-sm font-bold text-slate-600 bg-slate-100 px-4 py-1.5 rounded-lg">500 pcs</span>
            </div>
            <div className="col-span-2 text-center">
              <span className="font-code text-sm font-bold text-slate-600">12.5 h</span>
            </div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
