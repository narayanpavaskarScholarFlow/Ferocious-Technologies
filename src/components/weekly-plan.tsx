"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Zap, Clock, ClipboardList, TrendingUp, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkLogEntry } from '@/lib/types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// Cleared sample data for fresh installation
const planData: any[] = [];

interface WeeklyPlanProps {
  logs: WorkLogEntry[];
  onNavigateToGantt?: () => void;
}

export function WeeklyPlan({ logs, onNavigateToGantt }: WeeklyPlanProps) {
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
          <p className="text-muted-foreground font-medium">Resource Allocation & Throughput Planning.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="rounded-full border-slate-200 h-11 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-50"
            onClick={onNavigateToGantt}
          >
            <LayoutGrid className="h-4 w-4 text-primary" />
            View Visual Timeline
          </Button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 h-10 px-4 font-bold text-[10px] uppercase tracking-widest">
            Capacity Load: 0%
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
            </TabsList>

            <TabsContent value="schedule" className="m-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {days.map((day) => {
                  const item = planData.find(d => d.day === day);
                  return (
                    <Card key={day} className="flex flex-col min-h-[240px] border-slate-200 shadow-sm bg-white overflow-hidden group hover:border-primary/50 transition-colors rounded-2xl">
                      <div className="p-3 bg-slate-50/50 border-b font-bold text-[9px] uppercase tracking-widest text-slate-400 text-center">
                        {day}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center">
                        {item ? (
                           <>
                             <div className={cn("p-3 rounded-xl text-white text-[10px] font-bold leading-relaxed shadow-lg mb-4", item.color)}>
                               {item.task}
                             </div>
                           </>
                        ) : (
                          <p className="text-[8px] font-bold uppercase text-slate-300">No data</p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-8 bg-slate-50/50 border-slate-200 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-primary" /> 
                    Production Goal Contribution
                  </div>
                  <span>Actual Progress: 0%</span>
                </div>
                <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '0%' }} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="handover" className="m-0">
              <Card className="p-20 flex flex-col items-center justify-center bg-white border-slate-200 rounded-2xl text-center opacity-40">
                <ClipboardList className="h-12 w-12 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Shift Supervisor Handover Ledger</p>
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
              {recentLogs.length > 0 ? recentLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-2 relative group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary uppercase">
                      WO #{log.workOrderId}
                    </Badge>
                    <span className="text-[8px] font-code text-slate-400">{log.date}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{log.resourceName}</p>
                </div>
              )) : (
                <p className="text-center text-[10px] text-slate-400 py-10 italic">Waiting for shift logs...</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}