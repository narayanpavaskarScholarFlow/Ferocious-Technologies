"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Zap, Clock, ClipboardList, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkLogEntry } from '@/lib/types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const planData = [
  { day: 'Monday', task: 'ML-01 Main Batch Production', color: 'bg-blue-500' },
  { day: 'Tuesday', task: 'Preventive Maintenance - Section B', color: 'bg-amber-500' },
  { day: 'Wednesday', task: 'Customer Audit - Aerospace', color: 'bg-purple-500' },
  { day: 'Thursday', task: 'New Staff Orientation / 3D Training', color: 'bg-green-500' },
  { day: 'Friday', task: 'Inventory Audit & Shift Handover', color: 'bg-slate-700' },
];

interface WeeklyPlanProps {
  logs: WorkLogEntry[];
}

export function WeeklyPlan({ logs }: WeeklyPlanProps) {
  // Calculate total production hours from logs to simulate reflection
  const productionLogs = logs.filter(l => l.type === 'Production');
  const recentLogs = logs.slice(0, 5);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {planData.map((item) => (
                  <Card key={item.day} className="flex flex-col min-h-[240px] border-slate-200 shadow-sm bg-white overflow-hidden group hover:border-primary/50 transition-colors rounded-2xl">
                    <div className="p-3 bg-slate-50/50 border-b font-bold text-[9px] uppercase tracking-widest text-slate-400 text-center">
                      {item.day}
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                       <div className={cn("p-3 rounded-xl text-white text-[10px] font-bold leading-relaxed shadow-lg mb-4", item.color)}>
                         {item.task}
                       </div>
                       <div className="mt-auto pt-4 border-t border-slate-50">
                         <div className="flex items-center justify-between">
                            <div className="flex -space-x-1.5">
                              {[1, 2].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                  U{i}
                                </div>
                              ))}
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">2 Ops</span>
                         </div>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-8 bg-slate-50/50 border-slate-200 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-primary" /> 
                    Production Goal Contribution (Logs: {productionLogs.length})
                  </div>
                  <span>Actual Progress: 8,450 Units ({Math.min(70 + productionLogs.length, 100)}%)</span>
                </div>
                <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000" 
                    style={{ width: `${Math.min(70 + productionLogs.length, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-4 italic">
                  * Progress dynamically synchronized with operational work log submissions.
                </p>
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

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xl rounded-2xl overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Live Production Feed
            </h3>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-2 relative group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary uppercase">
                      WO #{log.workOrderId}
                    </Badge>
                    <span className="text-[8px] font-code text-slate-400">{log.date}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{log.resourceName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                        {log.operator.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{log.operator}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">{log.duration}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center text-[10px] text-slate-400 py-10 italic">Waiting for shift logs...</p>
              )}
            </div>
          </Card>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-primary rounded-lg text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Reflection Active</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">The Master Schedule is currently reflecting <b>{logs.length} entries</b> from today's operational ledger.</p>
            </div>
          </div>
        </div>
      </div>
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
