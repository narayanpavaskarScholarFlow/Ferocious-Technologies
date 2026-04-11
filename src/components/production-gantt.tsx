"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  CheckCircle2,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Calendar as CalendarIcon,
  X,
  Layers,
  CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday, 
  differenceInDays,
  startOfDay,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
} from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface ProductionGanttProps {
  orders: Order[];
  searchTerm?: string;
  onNavigateToSchedule?: () => void;
  onNavigateToOperations?: (orderId: string) => void;
}

type ViewMode = 'month' | 'week';

export function ProductionGantt({ orders, onNavigateToOperations }: ProductionGanttProps) {
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date())); 
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [expandedOps, setExpandedOps] = useState<Record<string, boolean>>({});
  
  const [highlightRange, setHighlightRange] = useState<DateRange | undefined>();

  const filteredOrders = useMemo(() => {
    const base = selectedOrderId === 'all' ? orders : orders.filter(o => o.id === selectedOrderId);
    return base;
  }, [orders, selectedOrderId]);

  const timelineInterval = useMemo(() => {
    const start = viewMode === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = viewMode === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate, viewMode]);

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOp = (id: string) => {
    setExpandedOps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('.').map(Number);
      return startOfDay(new Date(y, m - 1, d));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return startOfDay(new Date(y, m - 1, d));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : startOfDay(d);
  };

  const getBarStyles = (startStr?: string, endStr?: string) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return null;

    const timelineStart = startOfDay(timelineInterval[0]);
    const timelineEnd = startOfDay(timelineInterval[timelineInterval.length - 1]);

    if (end < timelineStart || start > timelineEnd) return null;

    const visibleStart = start < timelineStart ? timelineStart : start;
    const visibleEnd = end > timelineEnd ? timelineEnd : end;

    const offsetDays = differenceInDays(visibleStart, timelineStart);
    const durationDays = differenceInDays(visibleEnd, visibleStart) + 1;

    const totalDays = timelineInterval.length;

    return {
      left: `${(offsetDays / totalDays) * 100}%`,
      width: `${(durationDays / totalDays) * 100}%`,
    };
  };

  const highlightStyles = useMemo(() => {
    if (!highlightRange?.from || !highlightRange?.to) return null;
    
    const start = startOfDay(highlightRange.from);
    const end = startOfDay(highlightRange.to);
    
    const timelineStart = startOfDay(timelineInterval[0]);
    const timelineEnd = startOfDay(timelineInterval[timelineInterval.length - 1]);

    if (end < timelineStart || start > timelineEnd) return null;

    const visibleStart = start < timelineStart ? timelineStart : start;
    const visibleEnd = end > timelineEnd ? timelineEnd : end;

    const offsetDays = differenceInDays(visibleStart, timelineStart);
    const durationDays = differenceInDays(visibleEnd, visibleStart) + 1;

    return {
      left: `${(offsetDays / timelineInterval.length) * 100}%`,
      width: `${(durationDays / timelineInterval.length) * 100}%`,
    };
  }, [highlightRange, timelineInterval]);

  const todayMarkerStyle = useMemo(() => {
    const today = startOfDay(new Date());
    const timelineStart = startOfDay(timelineInterval[0]);
    const timelineEnd = startOfDay(timelineInterval[timelineInterval.length - 1]);

    if (today < timelineStart || today > timelineEnd) return { display: 'none' };

    const offsetDays = differenceInDays(today, timelineStart);
    const totalDays = timelineInterval.length;
    return {
      left: `${(offsetDays / totalDays) * 100}%`,
    };
  }, [timelineInterval]);

  const handlePrev = () => {
    setCurrentDate(prev => viewMode === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1));
  };

  const getStatusColor = (status?: string) => {
    if (status === 'Completed') return 'bg-emerald-500';
    if (status === 'Hold' || status === 'Delayed') return 'bg-rose-500';
    if (status?.startsWith('Vendor')) return 'bg-purple-500';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden font-body">
      {/* Simplified Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Timeline Matrix</h2>
          </div>

          <div className="h-6 w-px bg-slate-100" />

          <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
            <SelectTrigger className="w-[220px] h-9 border-slate-200 text-xs font-bold uppercase rounded-lg">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-bold">ALL PROJECTS</SelectItem>
              {orders.map(order => (
                <SelectItem key={order.id} value={order.id} className="text-xs font-bold uppercase">
                  #{order.id} - {order.customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "h-9 rounded-lg border-slate-200 text-xs font-bold uppercase gap-2 px-3",
                  highlightRange && "border-primary bg-primary/5 text-primary"
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {highlightRange?.from ? (
                  highlightRange.to ? (
                    <>{format(highlightRange.from, "MMM d")} - {format(highlightRange.to, "MMM d")}</>
                  ) : format(highlightRange.from, "MMM d")
                ) : "Focus Period"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-none" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={highlightRange}
                onSelect={setHighlightRange}
                numberOfMonths={2}
                className="bg-[#0a0f18] text-white"
              />
            </PopoverContent>
          </Popover>
          {highlightRange && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setHighlightRange(undefined)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('month')}
              className={cn(
                "h-7 px-4 text-[10px] font-bold uppercase transition-all rounded-md",
                viewMode === 'month' ? "bg-white text-primary shadow-sm" : "text-slate-500"
              )}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={cn(
                "h-7 px-4 text-[10px] font-bold uppercase transition-all rounded-md",
                viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-slate-500"
              )}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[11px] font-bold text-slate-700 uppercase min-w-[120px] text-center">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week ${format(currentDate, 'w')}, ${format(currentDate, 'yyyy')}`}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <ScrollArea className="flex-1">
        <div className="flex min-w-max min-h-full">
          {/* Simplified Directory Sidebar */}
          <div className="w-[280px] bg-white border-r border-slate-100 flex flex-col shrink-0 sticky left-0 z-30 shadow-sm">
            <div className="h-10 border-b border-slate-100 flex items-center px-4 bg-slate-50/50 sticky top-0 z-40">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resource Directory</span>
            </div>
            <div className="flex-1 py-2">
              {filteredOrders.map(order => (
                <div key={order.id} className="select-none">
                  <div 
                    className={cn(
                      "h-10 flex items-center px-4 hover:bg-slate-50 cursor-pointer transition-colors",
                      expandedOrders[order.id] && "bg-slate-50/50"
                    )}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center mr-2">
                      {expandedOrders[order.id] ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRightIcon className="h-3 w-3 text-slate-300" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate flex-1 uppercase">#{order.id} {order.customer}</span>
                    <span className="text-[9px] font-bold text-slate-400 ml-2">{order.progress || 0}%</span>
                  </div>

                  {expandedOrders[order.id] && order.routing?.map((op, idx) => (
                    <div key={op.id}>
                      <div 
                        className={cn(
                          "h-9 flex items-center pl-10 pr-4 hover:bg-slate-50/80 cursor-pointer border-l-2 border-transparent transition-colors",
                          expandedOps[op.id] ? "border-primary bg-slate-50/30" : "hover:border-slate-200"
                        )}
                        onClick={() => toggleOp(op.id)}
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          {op.subTasks?.length > 0 && (
                            expandedOps[op.id] ? <ChevronDown className="h-2.5 w-2.5 text-primary" /> : <ChevronRightIcon className="h-2.5 w-2.5 text-slate-300" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 truncate flex-1 uppercase">{op.name}</span>
                      </div>

                      {expandedOps[op.id] && op.subTasks?.map((sub) => (
                        <div key={sub.id} className="h-8 flex items-center pl-16 pr-4 hover:bg-slate-50/50 transition-colors">
                          <CircleDot className="h-2 w-2 text-slate-200 mr-2" />
                          <span className="text-[9px] font-medium text-slate-400 truncate flex-1 uppercase">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Timeline Grid */}
          <div className="flex-1 flex flex-col relative bg-white">
            {/* Simple Date Header */}
            <div className="h-10 border-b border-slate-100 flex items-stretch bg-slate-50/50 sticky top-0 z-30">
              {timelineInterval.map((day, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-1 border-r border-slate-100/50 flex flex-col items-center justify-center min-w-[45px]",
                    isToday(day) && "bg-primary/5 border-primary/20 z-10"
                  )}
                >
                  <span className="text-[8px] font-bold uppercase text-slate-400">{format(day, 'EEE')}</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    isToday(day) ? "text-primary" : "text-slate-600"
                  )}>{format(day, 'd')}</span>
                </div>
              ))}
            </div>

            <div className="relative flex-1">
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineInterval.map((_, idx) => (
                  <div key={idx} className="flex-1 border-r border-slate-50 min-w-[45px]" />
                ))}
              </div>

              {/* Range Highlight */}
              {highlightStyles && (
                <div className="absolute top-0 bottom-0 bg-primary/5 z-0 pointer-events-none" style={highlightStyles} />
              )}

              {/* Minimal Today Line */}
              <div className="absolute top-0 bottom-0 w-px bg-primary z-20 pointer-events-none" style={todayMarkerStyle}>
                <div className="absolute top-0 -left-1 w-2 h-2 bg-primary rounded-full" />
              </div>

              {/* Bars Layer */}
              <div className="py-2">
                {filteredOrders.map(order => {
                  const orderBar = getBarStyles(order.startDate, order.endDate);
                  
                  return (
                    <div key={order.id}>
                      {/* Project Bar */}
                      <div className="h-10 flex items-center relative group border-b border-transparent">
                        {orderBar && (
                          <div className="absolute flex items-center z-10" style={orderBar}>
                            <div className="h-6 w-full rounded-md bg-slate-900 shadow-sm flex items-center px-3 cursor-pointer overflow-hidden" onClick={() => onNavigateToOperations?.(order.id)}>
                              <span className="text-[9px] font-bold text-white uppercase whitespace-nowrap truncate">{order.customer}</span>
                            </div>
                            <span className="ml-3 text-[9px] font-bold text-slate-400 whitespace-nowrap">{order.progress || 0}% Complete</span>
                          </div>
                        )}
                      </div>

                      {/* Operation Bars */}
                      {expandedOrders[order.id] && order.routing?.map((op) => {
                        const opBar = getBarStyles(op.startDate, op.endDate);
                        const isDone = op.status === 'Completed';
                        
                        return (
                          <div key={op.id}>
                            <div className="h-9 flex items-center relative group border-b border-transparent">
                              {opBar && (
                                <div className="absolute flex items-center z-10" style={opBar}>
                                  <div className={cn(
                                    "h-5 w-full rounded-md shadow-sm flex items-center px-2 transition-all group-hover:scale-[1.02]",
                                    getStatusColor(op.status)
                                  )}>
                                    <span className="text-[8px] font-bold text-white uppercase truncate">{op.name}</span>
                                  </div>
                                  <div className="ml-3 flex items-center gap-2">
                                    {isDone ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <span className="text-[8px] font-bold text-slate-400 uppercase">{op.status}</span>}
                                    <span className="text-[8px] font-code text-slate-300 font-bold bg-slate-50 px-1 rounded border border-slate-100">
                                      {op.startDate} - {op.endDate}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Sub-task Bars */}
                            {expandedOps[op.id] && op.subTasks?.map((sub) => {
                              const subBar = getBarStyles(sub.startDate, sub.endDate);
                              return (
                                <div key={sub.id} className="h-8 flex items-center relative group border-b border-transparent">
                                  {subBar && (
                                    <div className="absolute flex items-center z-10" style={subBar}>
                                      <div className="h-3 w-full rounded bg-slate-100 border border-slate-200" />
                                      <span className="ml-2 text-[7px] font-bold text-slate-400 uppercase truncate">
                                        {sub.name} • {sub.status === 'Completed' ? 'DONE' : 'WIP'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
