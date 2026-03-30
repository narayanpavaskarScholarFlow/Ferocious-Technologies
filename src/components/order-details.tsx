"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderDetailsProps {
  orderId: string | null;
  onBack: () => void;
}

export function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const [isNew] = useState(!orderId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 text-slate-500">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-xl font-headline font-bold uppercase text-slate-800">
              {isNew ? 'Create New Production Order' : `Modify Production Order #${orderId}`}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Production Planning System v2.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-slate-500 border-slate-200 h-9" onClick={onBack}>
            Discard Changes
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2 h-9" onClick={onBack}>
            <Save className="h-4 w-4" /> Save Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Core Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Customer Name</Label>
                <Input defaultValue="Automotive Corp" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Order ID / Ref</Label>
                <Input defaultValue={orderId || "10XXXX"} className="h-10 font-code" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Start Date</Label>
                <Input type="date" defaultValue="2025-03-01" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">End Date (Due)</Label>
                <Input type="date" defaultValue="2025-03-15" className="h-10" />
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Priority Level</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Production Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Project Lead</Label>
                <Input defaultValue="John Doe" className="h-10" />
              </div>
            </div>
          </div>
        </Card>

        {/* Side Summary */}
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Current Progress</span>
                <Badge className="bg-blue-600">85%</Badge>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border">
                <div className="h-full bg-blue-600 w-[85%]" />
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Material Requirements</p>
                <div className="flex justify-between text-xs">
                  <span>Steel Alloy Grade-X</span>
                  <span className="text-green-600 font-bold">In Stock</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Carbon Inserts</span>
                  <span className="text-amber-600 font-bold">Low Stock</span>
                </div>
              </div>

              <Button variant="outline" className="w-full border-slate-200 bg-white gap-2 mt-4 text-xs h-10">
                <Plus className="h-3 w-3" /> Add Sub-Part
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Part Breakdown & Quantity</h3>
          <Button variant="outline" size="sm" className="h-8 border-primary/20 text-primary bg-primary/5 gap-2">
            <Plus className="h-3 w-3" /> Add Part
          </Button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase">#</div>
            <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase">Part Name / SKU</div>
            <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase">Quantity</div>
            <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Est. Time</div>
            <div className="col-span-1"></div>
          </div>
          <Separator className="bg-slate-50" />
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 font-bold text-xs text-slate-600">01</div>
            <div className="col-span-5 font-medium text-xs">Front Axle Support Assembly [SKU-88-A]</div>
            <div className="col-span-2 font-code text-xs">500 pcs</div>
            <div className="col-span-3 font-code text-xs">12.5 h</div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
