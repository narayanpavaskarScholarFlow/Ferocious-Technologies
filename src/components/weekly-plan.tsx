"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const planData = [
  { day: 'Monday', task: 'ML-01 Main Batch Production', color: 'bg-blue-500' },
  { day: 'Tuesday', task: 'Preventive Maintenance - Section B', color: 'bg-amber-500' },
  { day: 'Wednesday', task: 'Customer Audit - Aerospace', color: 'bg-purple-500' },
  { day: 'Thursday', task: 'New Staff Orientation / 3D Training', color: 'bg-green-500' },
  { day: 'Friday', task: 'Inventory Audit & Shift Handover', color: 'bg-slate-700' },
];

export function WeeklyPlan() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold uppercase">Weekly Master Schedule</h2>
        <p className="text-xs font-bold text-slate-400 font-code">Week 10 / March 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {planData.map((item) => (
          <Card key={item.day} className="flex flex-col min-h-[200px] border-slate-200 overflow-hidden group">
            <div className="p-3 bg-slate-50 border-b font-bold text-xs uppercase tracking-widest text-slate-600">
              {item.day}
            </div>
            <div className="flex-1 p-4 space-y-4">
               <div className={cn("p-3 rounded text-white text-[11px] font-medium leading-relaxed shadow-sm", item.color)}>
                 {item.task}
               </div>
               <div className="mt-auto pt-4 border-t border-dashed">
                 <p className="text-[9px] text-slate-400 uppercase font-bold">Allocated Staff</p>
                 <div className="flex -space-x-2 mt-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                   ))}
                 </div>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
          <span>Weekly Production Goal: 12,000 Units</span>
          <span>Actual Progress: 8,450 Units (70%)</span>
        </div>
        <div className="h-2 bg-white rounded-full mt-3 overflow-hidden border">
          <div className="h-full bg-primary w-[70%]" />
        </div>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
