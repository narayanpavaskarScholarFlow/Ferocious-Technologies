"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Zap, Clock, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Calendar className="h-4 w-4" />
            Strategic Operations
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Master Production Schedule
          </h2>
          <p className="text-muted-foreground font-medium">Week 10 / March 2025 | Resource Allocation & Throughput Planning.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 h-10 px-4 font-bold text-[10px] uppercase tracking-widest">
            Capacity Load: 72%
          </Badge>
        </div>
      </header>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8 h-12 inline-flex border border-slate-200">
          <TabsTrigger value="schedule" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="handover" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Shift Handover Log
          </TabsTrigger>
          <TabsTrigger value="capacity" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Capacity Map
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Bottlenecks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="m-0 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {planData.map((item) => (
              <Card key={item.day} className="flex flex-col min-h-[280px] border-slate-200 shadow-sm bg-white overflow-hidden group hover:border-primary/50 transition-colors rounded-2xl">
                <div className="p-4 bg-slate-50/50 border-b font-bold text-[10px] uppercase tracking-widest text-slate-400">
                  {item.day}
                </div>
                <div className="flex-1 p-6 flex flex-col">
                   <div className={cn("p-4 rounded-xl text-white text-xs font-bold leading-relaxed shadow-lg", item.color)}>
                     {item.task}
                   </div>
                   <div className="mt-auto pt-6 border-t border-slate-50">
                     <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-3">Allocated Resources</p>
                     <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                              U{i}
                            </div>
                          ))}
                        </div>
                        <Badge variant="outline" className="text-[8px] bg-slate-50 border-none font-bold">3 OPS</Badge>
                     </div>
                   </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-slate-50/50 border-slate-200 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
              <div className="flex items-center gap-2"><Zap className="h-3 w-3 text-primary" /> Weekly Production Goal: 12,000 Units</div>
              <span>Actual Progress: 8,450 Units (70%)</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
              <div className="h-full bg-primary w-[70%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="handover" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
            <ClipboardList className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Shift Supervisor Handover Ledger</p>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
            <Clock className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Calculating Theoretical vs Actual Capacity Map</p>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="m-0">
          <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
            <Activity className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">AI Detection: Identifying Operational Bottlenecks</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
