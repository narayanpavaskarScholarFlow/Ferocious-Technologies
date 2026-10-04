"use client";

import { useEffect, useState } from 'react';
import { SystemActivity } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Clock, History, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
  const [activities, setActivities] = useState<SystemActivity[]>([]);

  useEffect(() => {
    setActivities([
      { id: '1', type: 'usage', message: 'VMC Node TR-MC-001 initialized for Spindle Block TC1', timestamp: new Date().toISOString(), user: 'J. Patil', severity: 'low' },
      { id: '2', type: 'alert', message: 'Hydraulic maintenance scheduled for Grinding Unit ML-02', timestamp: new Date().toISOString(), severity: 'medium' },
      { id: '3', type: 'maintenance', message: 'System wide backup protocol complete.', timestamp: new Date().toISOString(), severity: 'low' },
      { id: '4', type: 'usage', message: 'Product Master record updated for Mould Die X-40', timestamp: new Date().toISOString(), user: 'A. Sharma', severity: 'low' }
    ]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-body">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200"><History className="h-5 w-5 text-slate-400" /></div>
           <div>
              <h3 className="text-sm font-bold uppercase text-slate-900 tracking-widest">Business Activity Feed</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit-Ready Event Log</p>
           </div>
        </div>
        <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold px-4 h-8 uppercase tracking-widest">LIVE_SYNC</Badge>
      </div>
      <ScrollArea className="flex-1 p-8">
        <div className="space-y-10">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-10 border-l-2 border-slate-100 group">
              <div className={cn(
                "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-white shadow-md transition-all group-hover:scale-110",
                activity.severity === 'high' ? 'bg-red-500' : activity.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              )} />
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg"><Clock className="h-3 w-3" /> {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {activity.user && <span className="flex items-center gap-2 text-blue-600"><User className="h-3 w-3" /> {activity.user}</span>}
                 </div>
                 <p className="text-sm text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{activity.message}</p>
                 <div className="flex gap-2">
                    <Badge className={cn(
                      "text-[7px] font-bold uppercase border-none px-2 py-0.5 rounded-full",
                      activity.severity === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {activity.severity === 'high' ? <AlertCircle className="h-2 w-2 mr-1" /> : <Info className="h-2 w-2 mr-1" />}
                      {activity.type}
                    </Badge>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-center">
         <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600">
            View Complete Transaction History
         </Button>
      </div>
    </div>
  );
}
