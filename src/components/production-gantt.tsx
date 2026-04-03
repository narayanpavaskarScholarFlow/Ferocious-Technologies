"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Layers,
  ArrowRight
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

const mockOperationsData: Record<string, any[]> = {
  '103645': [
    { name: 'DFM Analysis', startDate: '01.03.2025', endDate: '01.03.2025', progress: 100, status: 'Completed' },
    { name: 'CAD Design', startDate: '01.03.2025', endDate: '02.03.2025', progress: 100, status: 'Completed' },
    { name: 'Raw Material', startDate: '02.03.2025', endDate: '03.03.2025', progress: 100, status: 'Completed' },
    { name: 'VMC Milling', startDate: '03.03.2025', endDate: '04.03.2025', progress: 60, status: 'Active' },
    { name: 'Final QC', startDate: '05.03.2025', endDate: '05.03.2025', progress: 0, status: 'Pending' },
  ],
  '102778': [
    { name: 'Engineering Review', startDate: '02.03.2025', endDate: '03.03.2025', progress: 50, status: 'Active' },
    { name: 'Material Prep', startDate: '04.03.2025', endDate: '05.03.2025', progress: 0, status: 'Pending' },
    { name: 'Turning Ops', startDate: '06.03.2025', endDate: '08.03.2025', progress: 0, status: 'Pending' },
  ],
  '100685': [
    { name: 'Surface Finish', startDate: '03.03.2025', endDate: '03.03.2025', progress: 100, status: 'Completed' },
    { name: 'Packaging', startDate: '04.03.2025', endDate: '04.03.2025', progress: 100, status: 'Completed' },
  ],
  '105542': [
    { name: 'Heat Treatment', startDate: '28.02.2025', endDate: '01.03.2025', progress: 80, status: 'Active' },
    { name: 'Internal Grinding', startDate: '02.03.2025', endDate: '03.03.2025', progress: 0, status: 'Pending' },
  ],
  '101230': [
    { name: 'Assembly Step 1', startDate: '05.03.2025', endDate: '07.03.2025', progress: 90, status: 'Active' },
    { name: 'Assembly Step 2', startDate: '08.03.2025', endDate: '10.03.2025', progress: 20, status: 'Active' },
    { name: 'Validation', startDate: '11.03.2025', endDate: '12.03.2025', progress: 0, status: 'Pending' },
  ],
};

interface ProductionGanttProps {
  searchTerm?: string;
  onNavigateToSchedule?: () => void;
  onNavigateToOperations?: (orderId: string) => void;
}

export function ProductionGantt({ searchTerm: globalSearch, onNavigateToSchedule, onNavigateToOperations }: ProductionGanttProps) {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [localSearch, setLocalSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 3)); 
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  
  const activeSearch = globalSearch || localSearch;

  const handleNext = () => {
    if (view === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else setCurrentDate(prev => addDays(prev, 7));
  };

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else setCurrentDate(prev => subDays(prev, 7));
  };

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesSearch = order.id.includes(activeSearch) || 
                          order.customer.toLowerCase().includes(activeSearch.toLowerCase());
      const matchesDropdown = selectedOrderId === 'all' || order.id === selectedOrderId;
      return matchesSearch && matchesDropdown;
    });
  }, [activeSearch, selectedOrderId]);

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

  const getPositionStyles = (startDateStr: string, endDateStr: string) => {
    const [sD, sM, sY] = startDateStr.split('.').map(Number);
    const [eD, eM, eY] = endDateStr.split('.').map(Number);
    const start = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);

    const timelineStart = timelineInterval[0];
    const timelineEnd = timelineInterval[timelineInterval.length - 1];

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
    <div className="space-y-6 animate-in fade-in duration-1000 max-w-full overflow-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <LayoutGrid className="h-3.5 w-3.5" />
            Scheduling & Velocity
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900">
            Production Timeline
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Visual Gantt chart for macro and operational monitoring.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Yellow Box Requirement: Work Order Selection Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus:</span>
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger className="w-[180px] h-10 rounded-full border-slate-200 bg-white shadow-sm text-xs font-bold">
                <SelectValue placeholder="Select Work Order" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Master Ledger (All)</SelectItem>
                {mockOrders.map(order => (
                  <SelectItem key={order.id} value={order.id}>#{order.id} - {order.customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-56 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search Ledger..." 
              className="h-10 pl-9 rounded-full bg-slate-100 border-none text-[11px] focus-visible:ring-2 focus-visible:ring-primary/20"
              value={activeSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          <Button 
            variant="outline" 
            className="rounded-full border-slate-200 h-10 px-5 font-bold text-[9px] uppercase tracking-widest gap-2"
            onClick={onNavigateToSchedule}
          >
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            Master Schedule
          </Button>

          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="bg-slate-100 p-1 rounded-full border border-slate-200">
            <TabsList className="bg-transparent h-8 border-none gap-1">
              <TabsTrigger value="week" className="rounded-full px-4 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm h-7">
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="rounded-full px-4 font-bold text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm h-7">
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest min-w-[120px] text-center">
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

      {/* Red Box Requirement: fit to screen and all word orders visible */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-2xl">
        <ScrollArea className="w-full">
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <div className="w-56 p-4 border-r border-slate-100 flex items-center bg-white sticky left-0 z-20">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em]">Resource Matrix</span>
              </div>
              <div className="flex-1 flex">
                {timelineInterval.map((day, idx) => (
                  <div key={idx} className="flex-1 p-4 border-r border-slate-100 last:border-r-0 text-center min-w-[40px]">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">
                      {view === 'week' ? format(day, 'EEE') : format(day, 'd')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders & Operations Rows */}
            <div className="flex flex-col">
              {filteredOrders.map((order) => {
                const orderStyles = getPositionStyles(order.startDate, order.endDate);
                const orderOps = mockOperationsData[order.id] || [];
                const isFocused = selectedOrderId === order.id;

                return (
                  <div key={order.id} className="flex flex-col border-b border-slate-50 last:border-b-0 animate-in slide-in-from-left-2 duration-300">
                    {/* Master Order Row */}
                    <div className={cn(
                      "flex group transition-colors",
                      isFocused ? "bg-primary/[0.02]" : "hover:bg-slate-50/30"
                    )}>
                      <div className="w-56 p-4 border-r border-slate-100 flex flex-col gap-0.5 justify-center bg-white sticky left-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.01)]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">#{order.id}</span>
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            order.status === 'Active' ? 'bg-primary' : 
                            order.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'
                          )} />
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tight truncate">{order.customer}</span>
                      </div>
                      
                      <div className="flex-1 relative h-16 flex items-center">
                        <div className="absolute inset-0 flex pointer-events-none opacity-10">
                          {timelineInterval.map((_, idx) => (
                            <div key={idx} className="flex-1 border-r border-slate-200 last:border-none" />
                          ))}
                        </div>

                        {orderStyles && (
                          <div 
                            className="absolute h-10 rounded-xl flex flex-col justify-center px-3 shadow-sm group/bar cursor-pointer hover:scale-[1.01] transition-all duration-500 overflow-hidden z-0"
                            style={{ 
                              left: orderStyles.left, 
                              width: orderStyles.width,
                              background: order.status === 'Completed' ? '#ecfdf5' : order.status === 'Active' ? '#eff6ff' : '#fffbeb',
                              border: `1px solid ${order.status === 'Completed' ? '#10b981' : order.status === 'Active' ? '#3b82f6' : '#f59e0b'}`
                            }}
                            onClick={() => onNavigateToOperations?.(order.id)}
                          >
                            <div className="flex justify-between items-center mb-0.5 relative z-10">
                              <span className={cn(
                                "text-[8px] font-bold uppercase",
                                order.status === 'Completed' ? 'text-green-700' : order.status === 'Active' ? 'text-blue-700' : 'text-amber-700'
                              )}>
                                {order.progress}%
                              </span>
                              <Clock className={cn(
                                "h-2.5 w-2.5",
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
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Drilled-Down Operations Rows (Only shown if focused or searched) */}
                    {(isFocused || (activeSearch && filteredOrders.length === 1)) && orderOps.map((op, opIdx) => {
                      const opStyles = getPositionStyles(op.startDate, op.endDate);
                      return (
                        <div key={opIdx} className="flex bg-slate-50/40 border-t border-slate-100 group transition-colors hover:bg-slate-50/80 animate-in fade-in duration-500">
                          <div className="w-56 pl-8 p-3 border-r border-slate-100 flex flex-col gap-0.5 justify-center sticky left-0 z-10 bg-[#fbfbfc]">
                            <div className="flex items-center gap-2">
                              <Layers className="h-3 w-3 text-slate-300" />
                              <span className="text-[10px] font-semibold text-slate-600 truncate">{op.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 relative h-12 flex items-center">
                            <div className="absolute inset-0 flex pointer-events-none opacity-10">
                              {timelineInterval.map((_, idx) => (
                                <div key={idx} className="flex-1 border-r border-slate-200 last:border-none" />
                              ))}
                            </div>

                            {opStyles && (
                              <div 
                                className="absolute h-6 rounded-lg flex flex-col justify-center px-2 shadow-sm border border-slate-200 bg-white/80 backdrop-blur-sm z-0"
                                style={{ 
                                  left: opStyles.left, 
                                  width: opStyles.width,
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full transition-all duration-1000",
                                        op.status === 'Completed' ? 'bg-green-400' : op.status === 'Active' ? 'bg-primary' : 'bg-slate-300'
                                      )}
                                      style={{ width: `${op.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[7px] font-bold text-slate-400">{op.progress}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/5 rounded-xl">
            <Box className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Threads</p>
            <p className="text-xl font-display font-bold text-slate-900">{mockOrders.filter(o => o.status === 'Active').length}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/5 rounded-xl">
            <Clock className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">On-Time Rate</p>
            <p className="text-xl font-display font-bold text-slate-900">92.4%</p>
          </div>
        </div>
        <div className="glass-card p-6 bg-slate-900 text-white border-none relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Timeline Analysis</p>
            <Badge variant="outline" className="text-[7px] border-slate-700 text-slate-400 h-4">AUTO_DRIVE</Badge>
          </div>
          <p className="text-[11px] font-medium leading-relaxed">Focus a Work Order from the dropdown to see detailed <span className="text-primary font-bold">operational routing</span> on the Gantt chart.</p>
          <ArrowRight className="absolute bottom-2 right-2 h-3 w-3 text-slate-700 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
