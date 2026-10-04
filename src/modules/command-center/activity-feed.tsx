"use client";

import { useEffect, useState } from 'react';
import { SystemActivity } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Zap, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
  const [activities, setActivities] = useState<SystemActivity[]>([]);

  useEffect(() => {
    setActivities([
      { id: '1', type: 'usage', message: 'VMC Node TR-MC-001 initialized by Engineering', timestamp: new Date().toISOString(), user: 'J. Patil', severity: 'low' },
      { id: '2', type: 'alert', message: 'Hydraulic calibration alert for ML-02', timestamp: new Date().toISOString(), severity: 'medium' }
    ]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#071427] rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white"><Zap className="h-4 w-4 text-primary" /> Live Event Matrix</h3>
        <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold">REAL-TIME</Badge>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-8 border-l border-white/10">
              <div className={cn("absolute -left-1.5 top-0.5 h-3 w-3 rounded-full", activity.severity === 'high' ? 'bg-red-500' : 'bg-primary')} />
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-2"><Clock className="h-2.5 w-2.5" /> {new Date(activity.timestamp).toLocaleTimeString()}</span>
                    {activity.user && <span className="flex items-center gap-2 text-primary"><User className="h-2.5 w-2.5" /> {activity.user}</span>}
                 </div>
                 <p className="text-xs text-white/70 font-medium leading-relaxed">{activity.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
