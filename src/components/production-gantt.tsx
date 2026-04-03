"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Box, 
  LayoutGrid, 
  ClipboardList, 
  Search, 
  X,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';
import { format, addMonths, subMonths, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

const mockOrders: Order[] = [
  { id: '103645', customer: 'Automotive Corp', startDate: '01.03.2025', endDate: '05.03.2025', priority: 'High', status: 'Active', progress: 85 },
  { id: '102778', customer: 'Precision Aero', startDate: '02.03.2025', endDate: '10.03.2025', priority: 'Medium', status: 'Pending', progress: 15 },
  { id: '100685', customer: 'Medical Solutions', startDate: '03.03.2025', endDate: '04.03.2025', priority: 'Low', status: 'Completed', progress: 100 },
  { id: '105542', customer: 'Global Energy', startDate: '28.02.2025', endDate: '03.03.2025', priority: 'High', status: 'Delayed', progress: 45 },
  { id: '101230', customer: 'Future Tech', startDate: '05.03.2025', endDate: '12.03.2025', priority: 'Medium', status: 'Active', progress: 60 },
];

interface ProductionGanttProps {
  searchTerm?: string;
  onNavigateToSchedule?: () => void;
  onNavigateToOperations?: (orderId: string) => void;
}

export function ProductionGantt({ searchTerm: globalSearch, onNavigateToSchedule, onNavigateToOperations }: ProductionGanttProps) {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [localSearch, setLocalSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 3)); // Starting at Mar 3, 2025
  
  const activeSearch = globalSearch || localSearch;

  // Navigation Handlers
  const handleNext = () => {
    if (view === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else setCurrentDate(prev => addDays(prev, 7));
  };

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else setCurrentDate(prev => subDays(prev, 7));
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => 
      order.id.includes(activeSearch) || 
      order.customer.toLowerCase().includes(activeSearch.toLowerCase())
    );
  }, [activeSearch]);

  // Calculate Timeline Data
  const timelineInterval = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  }, [view, currentDate]);

  const getPositionStyles = (order: Order) => {
    // Parsing dd.mm.yyyy
    const [sD, sM, sY] = order.startDate.split('.').map(Number);
    const [eD, eM, eY] = order.endDate.split('.').map(Number);
    const start = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);

    const timelineStart = timelineInterval[0];
    const timelineEnd = timelineInterval[timelineInterval.length - 1];

    // Check if order is within view
    if (end < timelineStart || start > timelineEnd) return null;

    const visibleStart = start < timelineStart ? timelineStart : start;
    const visibleEnd = end > timelineEnd ? timelineEnd : end;

    const totalDays = timelineInterval.length;
    const diffStart = Math.max(0, Math.floor((visibleStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)));
    const diffDuration = Math.ceil((visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const left = (diffStart / totalDays) * 100 + '%';
    const width = (diffDuration / totalDays) * 100 + '%';

    return { left, width };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <LayoutGrid className="h-4 w-4" />
            Scheduling & Velocity
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Production Timeline
          </h2>
          <p className="text-muted-foreground font-medium">Visual Gantt chart for multi-order throughput monitoring.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="Filter by ID or Client..." 
              className="h-10 pl-10 pr-10 rounded-full bg-slate-100 border-none text-xs focus-visible:ring-2 focus-visible:ring-primary/20"
              value={activeSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {activeSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2" />

          <Button 
            variant="outline" 
            className="rounded-full border-slate-200 h-11 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-50"
            onClick={onNavigateToSchedule}
          >
            <ClipboardList className="h-4 w-4 text-primary" />
            View Master Schedule
          </Button>

          <div className="h-8 w-[1px] bg-slate-200 mx-2" />

          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="bg-slate-100 p-1 rounded-full border border-slate-200">
            <TabsList className="bg-transparent h-10 border-none">
              <TabsTrigger value="week" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="rounded-full px-6 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="h-10 w-[1px] bg-slate-200 mx-2" />
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest min-w-[140px] text-center">
              {view === 'week' 
                ? `${format(timelineInterval[0], 'MMM dd')} - ${format(timelineInterval[6], 'MMM dd')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2rem]">
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            {/* Timeline Header */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <div className="w-64 p-6 border-r border-slate-100 flex items-center bg-white sticky left-0 z-20">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">Work Order Ledger</span>
              </div>
              <div className="flex-1 flex">
                {timelineInterval.map((day, idx) => (
                  <div key={idx} className="flex-1 p-6 border-r border-slate-100 last:border-r-0 text-center min-w-[40px]">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                      {view === 'week' ? format(day, 'EEE') : format(day, 'd')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders Rows */}
            <div className="flex flex-col">
              {filteredOrders.map((order) => {
                const styles = getPositionStyles(order);
                return (
                  <div key={order.id} className="flex border-b border-slate-50 last:border-b-0 hover:bg-slate-50/30 transition-colors group animate-in slide-in-from-left-2 duration-300">
                    <div className="w-64 p-6 border-r border-slate-100 flex flex-col gap-1 justify-center bg-white sticky left-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">#{order.id}</span>
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          order.status === 'Active' ? 'bg-primary' : 
                          order.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'
                        )} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight truncate">{order.customer}</span>
                    </div>
                    
                    <div className="flex-1 relative h-24 flex items-center">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex pointer-events-none opacity-20">
                        {timelineInterval.map((_, idx) => (
                          <div key={idx} className="flex-1 border-r border-slate-200 last:border-none" />
                        ))}
                      </div>

                      {/* Gantt Bar */}
                      {styles && (
                        <div 
                          className="absolute h-12 rounded-2xl flex flex-col justify-center px-4 shadow-lg group/bar cursor-pointer hover:scale-[1.02] transition-all duration-500 overflow-hidden z-0"
                          style={{ 
                            left: styles.left, 
                            width: styles.width,
                            background: order.status === 'Completed' ? '#ecfdf5' : order.status === 'Active' ? '#eff6ff' : '#fffbeb',
                            border: `1px solid ${order.status === 'Completed' ? '#10b981' : order.status === 'Active' ? '#3b82f6' : '#f59e0b'}`
                          }}
                          onClick={() => onNavigateToOperations?.(order.id)}
                        >
                          <div className="flex justify-between items-center mb-1 relative z-10">
                            <span className={cn(
                              "text-[9px] font-bold uppercase",
                              order.status === 'Completed' ? 'text-green-700' : order.status === 'Active' ? 'text-blue-700' : 'text-amber-700'
                            )}>
                              {order.progress}%
                            </span>
                            <Clock className={cn(
                              "h-3 w-3",
                              order.status === 'Completed' ? 'text-green-400' : order.status === 'Active' ? 'text-blue-400' : 'text-amber-400'
                            )} />
                          </div>
                          <div className="h-1 bg-white/50 rounded-full overflow-hidden relative z-10">
                            <div 
                              className={cn(
                                "h-full transition-all duration-1000",
                                order.status === 'Completed' ? 'bg-green-500' : order.status === 'Active' ? 'bg-blue-500' : 'bg-amber-500'
                              )}
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          {/* Sub-text on hover */}
                          <div className="absolute bottom-1 right-4 opacity-0 group-hover/bar:opacity-40 transition-opacity">
                            <span className="text-[8px] font-bold uppercase font-code">Deadline: {order.endDate}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <Box className="h-12 w-12 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No matching Work Orders found in current timeline</p>
                </div>
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 flex items-center gap-6">
          <div className="p-4 bg-primary/5 rounded-2xl">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Threads</p>
            <p className="text-2xl font-display font-bold text-slate-900">{mockOrders.filter(o => o.status === 'Active').length}</p>
          </div>
        </div>
        <div className="glass-card p-8 flex items-center gap-6">
          <div className="p-4 bg-green-500/5 rounded-2xl">
            <Clock className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On-Time Rate</p>
            <p className="text-2xl font-display font-bold text-slate-900">92.4%</p>
          </div>
        </div>
        <div className="glass-card p-8 bg-slate-900 text-white border-none">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Bottleneck Prediction</p>
            <Badge variant="outline" className="text-[8px] border-slate-700 text-slate-400">AI_SYNC</Badge>
          </div>
          <p className="text-sm font-medium leading-relaxed">System detects potential overlap in <span className="text-primary font-bold">EDM Station</span> during Week 11.</p>
        </div>
      </div>
    </div>
  );
}
