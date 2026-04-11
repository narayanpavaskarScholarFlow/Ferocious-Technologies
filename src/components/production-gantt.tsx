
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
  Clock,
  ListFilter,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Calendar as CalendarIcon,
  X,
  AlertCircle
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
  isWithinInterval,
  isAfter
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
  
  // Date Range Selection State
  const [highlightRange, setHighlightRange] = useState<DateRange | undefined>();

  const filteredOrders = useMemo(() => {
    if (selectedOrderId === 'all') return orders;
    return orders.filter(o => o.id === selectedOrderId);
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
    // Format: DD.MM.YYYY
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('.').map(Number);
      return startOfDay(new Date(y, m - 1, d));
    }
    // Format: YYYY-MM-DD
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

  const getStatusConfig = (status?: string, endDateStr?: string) => {
    const isCompleted = status === 'Completed';
    const isDelayed = !isCompleted && endDateStr && isAfter(new Date(), parseDate(endDateStr) || new Date());
    
    if (isCompleted) return { bg: 'bg-[#4caf50]', label: 'Done', color: '#fff' };
    if (isDelayed) return { bg: 'bg-[#f44336]', label: 'Overdue', color: '#fff' };
    if (status === 'Hold') return { bg: 'bg-[#ff9800]', label: 'Hold', color: '#fff' };
    if (status?.startsWith('Vendor')) return { bg: 'bg-[#9c27b0]', label: 'External', color: '#fff' };
    return { bg: 'bg-[#2196f3]', label: 'Active', color: '#fff' };
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] animate-in fade-in duration-700 overflow-hidden font-body">
      {/* Precision Controls Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            Production Timeline
          </h2>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
            <SelectTrigger className="w-[200px] h-9 bg-slate-50 border-slate-200 rounded-md text-xs font-bold uppercase">
              <SelectValue placeholder="Work Order..." />
            </SelectTrigger>
            <SelectContent className="rounded-md">
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
                  "h-9 rounded-md border-slate-200 text-xs font-bold uppercase gap-2 px-3",
                  highlightRange && "border-primary bg-primary/5 text-primary"
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {highlightRange?.from ? (
                  highlightRange.to ? (
                    <>{format(highlightRange.from, "MMM dd")} - {format(highlightRange.to, "MMM dd")}</>
                  ) : format(highlightRange.from, "MMM dd")
                ) : "Highlight"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-lg shadow-xl border-slate-200" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={highlightRange?.from}
                selected={highlightRange}
                onSelect={setHighlightRange}
                numberOfMonths={2}
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
          {highlightRange && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setHighlightRange(undefined)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
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
            <span className="text-[11px] font-bold text-slate-700 uppercase min-w-[140px] text-center">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week ${format(currentDate, 'w')}, ${format(currentDate, 'yyyy')}`}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Synchronized Vertical Viewport */}
      <ScrollArea className="flex-1">
        <div className="flex min-w-max min-h-full">
          {/* Tree-View Sidebar */}
          <div className="w-[300px] bg-white border-r border-slate-200 flex flex-col shrink-0 sticky left-0 z-30 shadow-[2px_0_8px_rgba(0,0,0,0.05)]">
            <div className="h-10 border-b border-slate-200 flex items-center px-4 bg-slate-50 sticky top-0 z-40">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Directory</span>
            </div>
            <div className="flex-1 py-1">
              {filteredOrders.map(order => (
                <div key={order.id} className="select-none">
                  <div 
                    className={cn(
                      "h-10 flex items-center px-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 group",
                      expandedOrders[order.id] && "bg-slate-50/50"
                    )}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {expandedOrders[order.id] ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRightIcon className="h-3 w-3 text-slate-400" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 truncate flex-1 uppercase">{order.customer}</span>
                    <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-slate-200 text-slate-400 font-bold">{order.progress || 0}%</Badge>
                  </div>

                  {expandedOrders[order.id] && order.routing?.map((op) => (
                    <div key={op.id}>
                      <div 
                        className={cn(
                          "h-9 flex items-center pl-8 pr-3 hover:bg-slate-50/80 cursor-pointer border-b border-slate-50",
                          expandedOps[op.id] && "bg-slate-100/30"
                        )}
                        onClick={() => toggleOp(op.id)}
                      >
                        <div className="w-5 h-5 flex items-center justify-center mr-1">
                          {op.subTasks?.length > 0 && (
                            expandedOps[op.id] ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRightIcon className="h-3 w-3 text-slate-300" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 truncate flex-1 uppercase">{op.name}</span>
                      </div>

                      {expandedOps[op.id] && op.subTasks?.map((sub) => (
                        <div key={sub.id} className="h-8 flex items-center pl-14 pr-3 border-b border-slate-50/50">
                          <div className="w-3 h-px bg-slate-200 mr-2" />
                          <span className="text-[9px] font-medium text-slate-400 truncate flex-1 uppercase">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 flex flex-col relative bg-white">
            {/* Horizontal Header (Dates) */}
            <div className="h-10 border-b border-slate-200 flex items-stretch bg-[#f1f3f4] sticky top-0 z-30">
              {timelineInterval.map((day, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-1 border-r border-slate-200 flex flex-col items-center justify-center min-w-[40px]",
                    isToday(day) && "bg-white z-10"
                  )}
                >
                  <span className="text-[8px] font-bold uppercase text-slate-400 leading-none">{format(day, 'EEE')}</span>
                  <span className={cn(
                    "text-[10px] font-bold mt-0.5",
                    isToday(day) ? "text-primary" : "text-slate-600"
                  )}>{format(day, 'd')}</span>
                </div>
              ))}
            </div>

            <div className="relative flex-1">
              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineInterval.map((_, idx) => (
                  <div key={idx} className="flex-1 border-r border-slate-100 min-w-[40px]" />
                ))}
              </div>

              {/* Selection Highlight */}
              {highlightStyles && (
                <div className="absolute top-0 bottom-0 bg-primary/5 border-x border-primary/10 z-0 pointer-events-none" style={highlightStyles} />
              )}

              {/* Today Vertical Line */}
              <div className="absolute top-0 bottom-0 w-[2px] border-l-2 border-dashed border-primary z-20 pointer-events-none" style={todayMarkerStyle}>
                <div className="absolute top-0 -left-[5px] w-[12px] h-[12px] bg-primary rounded-full border-2 border-white shadow-md" />
              </div>

              {/* Rows Container */}
              <div className="py-1">
                {filteredOrders.map(order => {
                  const orderBar = getBarStyles(order.startDate, order.endDate);
                  const orderConfig = getStatusConfig(order.status, order.endDate);
                  
                  return (
                    <div key={order.id}>
                      {/* Master Order Row */}
                      <div className="h-10 flex items-center relative group border-b border-slate-50">
                        {orderBar && (
                          <div className="absolute flex items-center z-10" style={orderBar}>
                            <div 
                              className={cn("h-6 rounded-md shadow-sm border border-black/10 flex items-center px-3 min-w-[40px] relative", orderConfig.bg)}
                              onClick={() => onNavigateToOperations?.(order.id)}
                            >
                              <span className="text-[9px] font-bold text-white uppercase whitespace-nowrap truncate">{order.customer}</span>
                            </div>
                            <div className="ml-3 flex items-center gap-2">
                              <Badge className="h-4 px-1.5 bg-white/80 text-[8px] font-bold border-slate-200 text-slate-600">
                                {order.progress || 0}%
                              </Badge>
                              {orderConfig.label === 'Overdue' && (
                                <Badge className="h-4 px-1.5 bg-red-500 text-white text-[8px] font-bold border-none uppercase">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Operations Rows */}
                      {expandedOrders[order.id] && order.routing?.map((op) => {
                        const opBar = getBarStyles(op.startDate, op.endDate);
                        const opConfig = getStatusConfig(op.status, op.endDate);
                        
                        return (
                          <div key={op.id}>
                            <div className="h-9 flex items-center relative group border-b border-slate-50">
                              {opBar && (
                                <div className="absolute flex items-center z-10" style={opBar}>
                                  <div 
                                    className={cn("h-5 rounded-md shadow-sm border border-black/5 flex items-center px-2 min-w-[30px] opacity-90", opConfig.bg)}
                                  >
                                    <span className="text-[8px] font-bold text-white uppercase truncate">{op.name}</span>
                                  </div>
                                  <div className="ml-2 flex items-center gap-1.5">
                                    {op.status === 'Completed' ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">{op.status}</span>
                                    )}
                                    <span className="text-[8px] font-code text-slate-300 font-bold bg-slate-50 px-1 rounded">
                                      {op.startDate} - {op.endDate}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Sub-tasks Rows */}
                            {expandedOps[op.id] && op.subTasks?.map((sub) => {
                              const subBar = getBarStyles(sub.startDate, sub.endDate);
                              return (
                                <div key={sub.id} className="h-8 flex items-center relative group border-b border-slate-50/50">
                                  {subBar && (
                                    <div className="absolute flex items-center z-10" style={subBar}>
                                      <div className="h-4 rounded bg-[#e3f2fd] border border-[#bbdefb] flex items-center px-2 min-w-[20px]">
                                        <span className="text-[7px] font-bold text-[#1976d2] uppercase truncate">{sub.name}</span>
                                      </div>
                                      <span className="ml-2 text-[7px] font-bold text-slate-300 uppercase">
                                        {sub.status === 'Completed' ? 'DONE' : 'WIP'}
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
