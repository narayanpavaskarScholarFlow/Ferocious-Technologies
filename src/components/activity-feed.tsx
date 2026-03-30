
"use client";

import { useEffect, useState } from 'react';
import { SystemActivity } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Zap, Tooltip, Settings, AlertTriangle, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
  const [activities, setActivities] = useState<SystemActivity[]>([]);

  useEffect(() => {
    const initialActivities: SystemActivity[] = [
      {
        id: '1',
        type: 'usage',
        message: 'Industrial 3D Printer (TR-PRNT-01) initialized by Engineering',
        timestamp: new Date().toISOString(),
        user: 'A. Chen',
        severity: 'low'
      },
      {
        id: '2',
        type: 'ai_update',
        message: 'AI categorized "Precision Oscilloscope" into "Electronics"',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        severity: 'low'
      },
      {
        id: '3',
        type: 'alert',
        message: 'Hydraulic Press (TR-PRES-02) entering maintenance cycle',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        severity: 'medium'
      },
      {
        id: '4',
        type: 'maintenance',
        message: 'System core update deployed: ToolRoom v2.4.12',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        severity: 'high'
      }
    ];
    setActivities(initialActivities);
  }, []);

  return (
    <div className="flex flex-col h-full glass-effect rounded-xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-headline font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          Live Event Log
        </h3>
        <Badge variant="outline" className="text-[10px] bg-accent/5 text-accent border-accent/20">
          REAL-TIME
        </Badge>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-6 border-l border-white/10 group">
              <div className={cn(
                "absolute -left-1.5 top-0.5 h-3 w-3 rounded-full border-2 border-background",
                activity.severity === 'high' ? 'bg-destructive' : 
                activity.severity === 'medium' ? 'bg-amber-500' : 'bg-primary'
              )} />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-code text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {activity.user && (
                    <span className="text-[10px] font-code text-primary flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.user}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-snug group-hover:text-primary transition-colors">
                  {activity.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 bg-white/5 border-t border-white/5">
        <button className="w-full py-2 text-[10px] font-code text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
          View full audit trail
        </button>
      </div>
    </div>
  );
}
