"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  CheckCircle2,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Calendar as CalendarIcon,
  X,
  CircleDot,
  Filter
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
    <div className="flex flex-col h-full bg-slate-50/30 animate-in fade-in duration-500 overflow-hidden font-body">
      {/* Precision Command Header */}
      <header className="h-16 border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Production Timeline</h2>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2" />

          <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
            <SelectTrigger className="w-[200px] h-9 bg-white border-slate-200 text-[10px] font-bold uppercase rounded-xl focus:ring-primary/20">
              <SelectValue placeholder="Focus Order" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
              <SelectItem value="all" className="text-[10px] font-bold">ALL PROJECTS</SelectItem>
              {orders.map(order => (
                <SelectItem key={order.id} value={order.id} className="text-[10px] font-bold uppercase">
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
                  "h-9 rounded-xl border-slate-200 text-[10px] font-bold uppercase gap-2 px-4 transition-all",
                  highlightRange ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10" : "bg-white hover:bg-slate-50"
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
            <PopoverContent className="w-auto p-0 rounded-[1.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 bg-white" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={highlightRange}
                onSelect={setHighlightRange}
                numberOfMonths={1}
                className="bg-white"
              />
              {highlightRange && (
                <div className="p-3 border-t border-slate-50 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setHighlightRange(undefined)} className="text-[10px] font-bold uppercase text-slate-400 hover:text-red-500">
                    Clear Range
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('month')}
              className={cn(
                "h-7 px-4 text-[9px] font-bold uppercase transition-all rounded-lg",
                viewMode === 'month' ? "bg-white text-primary shadow-sm" : "text-slate-500"
              )}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={cn(
                "h-7 px-4 text-[9px] font-bold uppercase transition-all rounded-lg",
                viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-slate-500"
              )}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[10px] font-bold text-slate-700 uppercase min-w-[120px] text-center tracking-widest">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week ${format(currentDate, 'w')}`}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Timeline Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Hierarchical Sidebar */}
        <div className="w-[300px] bg-white border-r border-slate-200/60 flex flex-col shrink-0 z-30 shadow-sm">
          <div className="h-10 border-b border-slate-100 flex items-center px-5 bg-slate-50/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Project Hierarchy</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-2">
              {filteredOrders.map(order => (
                <div key={order.id}>
                  <div 
                    className={cn(
                      "h-11 flex items-center px-5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 group",
                      expandedOrders[order.id] && "bg-slate-50/50"
                    )}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center mr-3">
                      {expandedOrders[order.id] ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate flex-1 uppercase">#{order.id} {order.customer}</span>
                    <Badge variant="outline" className="text-[8px] font-bold border-slate-200 text-slate-400">{order.progress || 0}%</Badge>
                  </div>

                  {expandedOrders[order.id] && order.routing?.map((op) => (
                    <div key={op.id}>
                      <div 
                        className={cn(
                          "h-10 flex items-center pl-12 pr-5 hover:bg-slate-50/80 cursor-pointer border-l-4 border-transparent border-b border-slate-50 transition-colors",
                          expandedOps[op.id] ? "border-primary bg-primary/5" : "hover:border-slate-200"
                        )}
                        onClick={() => toggleOp(op.id)}
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-2">
                          {op.subTasks?.length > 0 && (
                            expandedOps[op.id] ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRightIcon className="h-3 w-3 text-slate-300" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 truncate flex-1 uppercase">{op.name}</span>
                      </div>

                      {expandedOps[op.id] && op.subTasks?.map((sub) => (
                        <div key={sub.id} className="h-9 flex items-center pl-20 pr-5 hover:bg-slate-50/50 border-b border-slate-50 transition-colors">
                          <CircleDot className="h-2 w-2 text-slate-200 mr-3" />
                          <span className="text-[9px] font-medium text-slate-400 truncate flex-1 uppercase">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Responsive Grid Canvas */}
        <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
          {/* Calendar Header Matrix */}
          <div className="h-10 border-b border-slate-200/60 flex bg-slate-50/80 sticky top-0 z-30">
            {timelineInterval.map((day, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex-1 border-r border-slate-200/40 flex flex-col items-center justify-center min-w-0",
                  isToday(day) && "bg-primary/5 border-primary/20"
                )}
              >
                <span className="text-[7px] font-bold uppercase text-slate-400">{format(day, 'EE')}</span>
                <span className={cn(
                  "text-[10px] font-bold",
                  isToday(day) ? "text-primary" : "text-slate-600"
                )}>{format(day, 'd')}</span>
              </div>
            ))}
          </div>

          <ScrollArea className="flex-1">
            <div className="relative h-full min-h-full">
              {/* Grid Background Layer */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineInterval.map((_, idx) => (
                  <div key={idx} className="flex-1 border-r border-slate-100/50" />
                ))}
              </div>

              {/* Range Focus Layer */}
              {highlightStyles && (
                <div className="absolute top-0 bottom-0 bg-primary/5 border-x border-primary/10 z-0 pointer-events-none animate-in fade-in duration-500" style={highlightStyles} />
              )}

              {/* Real-time Today Marker */}
              <div className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-primary z-20 pointer-events-none" style={todayMarkerStyle}>
                <div className="absolute top-0 -left-1.5 w-3 h-3 bg-primary rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
              </div>

              {/* Operational Bar Layer */}
              <div className="py-3">
                {filteredOrders.map(order => {
                  const orderBar = getBarStyles(order.startDate, order.endDate);
                  
                  return (
                    <div key={order.id}>
                      {/* Master Project Thread */}
                      <div className="h-11 flex items-center relative">
                        {orderBar && (
                          <div className="absolute flex items-center z-10" style={orderBar}>
                            <div className="h-7 w-full rounded-xl bg-slate-900 shadow-lg flex items-center px-3 cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => onNavigateToOperations?.(order.id)}>
                              <span className="text-[9px] font-bold text-white uppercase truncate">WO #{order.id} - {order.customer}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Operational Nodes */}
                      {expandedOrders[order.id] && order.routing?.map((op) => {
                        const opBar = getBarStyles(op.startDate, op.endDate);
                        if (op.status === 'NA') return null;
                        
                        return (
                          <div key={op.id}>
                            <div className="h-10 flex items-center relative">
                              {opBar && (
                                <div className="absolute flex items-center z-10" style={opBar}>
                                  <div className={cn(
                                    "h-6 w-full rounded-lg shadow-sm flex items-center justify-center px-2 group/bar relative transition-all",
                                    getStatusColor(op.status)
                                  )}>
                                    <span className="text-[8px] font-bold text-white uppercase truncate">
                                      {op.name}
                                    </span>
                                    {/* Hover Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                      {op.startDate} to {op.endDate}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Resource Tasks */}
                            {expandedOps[op.id] && op.subTasks?.map((sub) => {
                              const subBar = getBarStyles(sub.startDate, sub.endDate);
                              return (
                                <div key={sub.id} className="h-9 flex items-center relative">
                                  {subBar && (
                                    <div className="absolute flex items-center z-10" style={subBar}>
                                      <div className={cn(
                                        "h-4 w-full rounded-md border-2 shadow-inner transition-colors",
                                        sub.status === 'Completed' ? "bg-emerald-400 border-emerald-500" : "bg-slate-100 border-slate-200"
                                      )} />
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
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
