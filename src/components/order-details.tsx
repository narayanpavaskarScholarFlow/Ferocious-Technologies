"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Plus, Trash2, Calendar } from 'lucide-react';
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

  const darkInputClasses = "bg-[#0a0f18] border-none text-white h-12 focus-visible:ring-primary/50 text-sm font-medium";
  const darkSelectClasses = "bg-[#0a0f18] border-none text-white h-12 focus:ring-primary/50 text-sm font-medium";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header section matching image */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 text-slate-400 hover:bg-slate-100">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-headline font-bold uppercase text-slate-900 tracking-tight">
              {isNew ? 'Create New Production Order' : `Modify Production Order #${orderId}`}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
              Production Planning System v2.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="default" className="bg-[#0a0f18] hover:bg-[#111827] text-white px-6 h-11 font-bold text-xs uppercase tracking-wider" onClick={onBack}>
            Discard Changes
          </Button>
          <Button className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 gap-2 h-11 px-6 font-bold text-xs uppercase tracking-wider shadow-sm" onClick={onBack}>
            <Save className="h-4 w-4" /> Save Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Specifications Section */}
        <Card className="lg:col-span-8 p-8 bg-white border-slate-200 shadow-sm rounded-xl">
          <div className="space-y-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Core Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Customer Name</Label>
                <Input defaultValue="Automotive Corp" className={darkInputClasses} />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Order ID / Ref</Label>
                <Input value={displayId} onChange={(e) => setDisplayId(e.target.value)} className={darkInputClasses} />
              </div>
              
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Start Date</Label>
                <div className="relative">
                  <Input defaultValue="01-03-2025" className={cn(darkInputClasses, "pr-10")} />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">End Date (Due)</Label>
                <div className="relative">
                  <Input defaultValue="15-03-2025" className={cn(darkInputClasses, "pr-10")} />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Priority Level</Label>
                <Select defaultValue="high">
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none">
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Production Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger className={darkSelectClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] text-white border-none">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Project Lead</Label>
                <Input defaultValue="John Doe" className={darkInputClasses} />
              </div>
            </div>
          </div>
        </Card>

        {/* Order Summary Sidebar */}
        <Card className="lg:col-span-4 p-8 bg-white border-slate-200 shadow-sm rounded-xl flex flex-col">
          <div className="space-y-8 flex-grow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Order Summary</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">Current Progress</span>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-bold px-3 py-1">85%</Badge>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[85%] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>

              <Separator className="bg-slate-100 mt-8 mb-6" />

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Material Requirements</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Alloy Steel 4140</span>
                  <span className="text-green-600 font-bold">In Stock</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Carbide Tooling Kit</span>
                  <span className="text-amber-600 font-bold">Low Stock</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-400 hover:text-slate-900 gap-2 mt-8 text-[10px] font-bold uppercase tracking-widest h-12">
            <Plus className="h-3.5 w-3.5" /> Add Sub-Part
          </Button>
        </Card>
      </div>

      {/* Part Breakdown Matrix */}
      <Card className="p-8 bg-white border-slate-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Part Breakdown & Quantity</h3>
          <Button variant="ghost" size="sm" className="h-8 text-slate-300 hover:text-primary gap-2 text-[10px] font-bold uppercase tracking-widest">
            <Plus className="h-3.5 w-3.5" /> Add Part
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">#</div>
            <div className="col-span-5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Part Name / SKU</div>
            <div className="col-span-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Quantity</div>
            <div className="col-span-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Est. Time</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="group grid grid-cols-12 gap-4 items-center pt-2">
            <div className="col-span-1 font-bold text-sm text-slate-900">01</div>
            <div className="col-span-5 font-semibold text-sm text-slate-700">
              Front Axle Support Assembly <span className="text-slate-300 font-normal ml-2">[SKU-88-A]</span>
            </div>
            <div className="col-span-3 font-code text-sm text-slate-500">500 pcs</div>
            <div className="col-span-2 font-code text-sm text-slate-500">12.5 h</div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-200 hover:text-destructive hover:bg-destructive/5">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
