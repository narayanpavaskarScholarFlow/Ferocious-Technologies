
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Plus,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  CalendarDays,
  LayoutGrid,
  CheckCircle2,
  Clock,
  ListFilter
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
  subWeeks
} from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductionGanttProps {
  orders: Order[];
  searchTerm?: string;
  onNavigateToSchedule?: () => void;
  onNavigateToOperations?: (orderId: string) => void;
}

type ViewMode = 'month' | 'week';

export function ProductionGantt({ orders, onNavigateToOperations }: ProductionGanttProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // Default to March 2025 context
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [expandedOps, setExpandedOps] = useState<Record<string, boolean>>({});

  // Filter orders based on dropdown selection
  const filteredOrders = useMemo(() => {
    if (selectedOrderId === 'all') return orders;
    return orders.filter(o => o.id === selectedOrderId);
  }, [orders, selectedOrderId]);

  // Calculate the horizontal timeline axis
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
    // Handles dd.MM.yyyy format
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    // Handles yyyy-MM-dd format
    const isoParts = dateStr.split('-');
    if (isoParts.length === 3) {
      return new Date(parseInt(isoParts[0]), parseInt(isoParts[1]) - 1, parseInt(isoParts[2]));
    }
    return null;
  };

  const getBarStyles = (startStr?: string, endStr?: string) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return null;

    const timelineStart = timelineInterval[0];
    const timelineEnd = timelineInterval[timelineInterval.length - 1];

    // Check if task is outside current visible range
    if (end < timelineStart || start > timelineEnd) return null;

    const visibleStart = start < timelineStart ? timelineStart : start;
    const visibleEnd = end > timelineEnd ? timelineEnd : end;

    const totalDays = timelineInterval.length;
    const offsetDays = differenceInDays(startOfDay(visibleStart), startOfDay(timelineStart));
    const durationDays = differenceInDays(startOfDay(visibleEnd), startOfDay(visibleStart)) + 1;

    return {
      left: `${(offsetDays / totalDays) * 100}%`,
      width: `${(durationDays / totalDays) * 100}%`,
    };
  };

  const handlePrev = () => {
    setCurrentDate(prev => viewMode === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Dynamic Header & Search Matrix */}
      <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-30 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h2 className="text-lg font-display font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Production Timeline
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">Operational Chronology Matrix v2.4</p>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 hidden md:block" />

          <div className="flex items-center gap-3">
            <ListFilter className="h-4 w-4 text-slate-400 hidden sm:block" />
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger className="w-[240px] h-11 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-wider shadow-inner">
                <SelectValue placeholder="Select Work Order..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                <SelectItem value="all" className="text-xs font-bold uppercase">All Active Threads</SelectItem>
                {orders.map(order => (
                  <SelectItem key={order.id} value={order.id} className="text-xs font-bold uppercase">
                    WO #{order.id} - {order.customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewMode('month')}
              className={cn(
                "h-9 px-6 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                viewMode === 'month' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={cn(
                "h-9 px-6 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white hover:text-primary rounded-lg" onClick={handlePrev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-4 min-w-[140px] text-center">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week ${format(currentDate, 'w')}, ${format(currentDate, 'yyyy')}`}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white hover:text-primary rounded-lg" onClick={handleNext}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Hierarchical Task Tree */}
        <div className="w-[380px] border-r border-slate-100 bg-white flex flex-col z-20 shadow-[8px_0_24px_rgba(0,0,0,0.02)] shrink-0">
          <div className="h-12 border-b border-slate-100 flex items-center px-6 bg-slate-50/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em]">Operational Hierarchy</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-4 space-y-1">
              {filteredOrders.map(order => (
                <div key={order.id} className="select-none">
                  {/* Level 1: Work Order */}
                  <div 
                    className={cn(
                      "h-12 flex items-center px-4 hover:bg-slate-50 transition-all group cursor-pointer border-l-4",
                      order.status === 'Completed' ? "border-emerald-500" : "border-primary"
                    )}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {expandedOrders[order.id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRightIcon className="h-4 w-4 text-slate-400" />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">{order.customer}</span>
                      <span className="text-[8px] text-slate-400 font-code font-bold">WO_ID: {order.id}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] border-slate-100 font-bold bg-slate-50">{order.progress || 0}%</Badge>
                  </div>

                  {/* Level 2: Operations */}
                  {expandedOrders[order.id] && order.routing?.map((op, opIdx) => (
                    <div key={op.id}>
                      <div 
                        className="h-10 flex items-center pl-10 pr-4 hover:bg-slate-50/80 transition-all group cursor-pointer border-b border-slate-50/50"
                        onClick={() => toggleOp(op.id)}
                      >
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {op.subTasks?.length > 0 ? (
                            expandedOps[op.id] ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRightIcon className="h-3 w-3 text-slate-300" />
                          ) : null}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 mr-3 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-600 truncate flex-1 uppercase tracking-wider">{op.name}</span>
                        {op.status === 'Completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>

                      {/* Level 3: Sub-tasks */}
                      {expandedOps[op.id] && op.subTasks?.map((sub) => (
                        <div key={sub.id} className="h-9 flex items-center pl-20 pr-4 hover:bg-slate-50/50 transition-all group border-b border-slate-50/20">
                          <div className="w-4 h-px bg-slate-200 mr-3" />
                          <span className="text-[9px] font-medium text-slate-400 truncate flex-1 uppercase tracking-widest">{sub.name}</span>
                          {sub.status === 'Completed' ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Clock className="h-3 w-3 text-slate-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="p-10 text-center opacity-30 flex flex-col items-center gap-4">
                  <LayoutGrid className="h-12 w-12 text-slate-300" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No active production threads</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="h-14 border-t border-slate-100 flex items-center px-6 bg-slate-50/50">
            <button className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-all">
              <Plus className="h-3 w-3" /> Register Operational node
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Timeline Visualization */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#fcfcfc]">
          {/* Calendar Header Row */}
          <div className="h-12 border-b border-slate-100 flex items-stretch bg-white sticky top-0 z-10 shadow-sm">
            {timelineInterval.map((day, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex-1 border-r border-slate-100 flex flex-col items-center justify-center min-w-[45px] transition-colors",
                  isToday(day) && "bg-primary/[0.03]"
                )}
              >
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mb-0.5">{format(day, 'EEE')}</span>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                  isToday(day) ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Scrolling Timeline Grid */}
          <ScrollArea className="flex-1">
            <div className="relative min-h-full">
              {/* Vertical Time Guides */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineInterval.map((day, idx) => (
                  <div key={idx} className={cn("flex-1 border-r border-slate-50", isToday(day) && "bg-primary/[0.01] border-primary/10")} />
                ))}
              </div>

              {/* Current Time Indicator Protocol */}
              <div className="absolute top-0 bottom-0 w-[2px] border-l-2 border-dashed border-accent/40 left-[50%] z-10 pointer-events-none group">
                <div className="h-3 w-3 rounded-full bg-accent absolute top-[-6px] left-[-6px] shadow-lg animate-pulse" />
                <div className="absolute top-4 left-3 bg-accent text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  LIVE_PROTOCOL_MARKER
                </div>
              </div>

              {/* Graphical Bars Layer */}
              <div className="py-4 relative z-0">
                {filteredOrders.map(order => {
                  const orderStyles = getBarStyles(order.startDate, order.endDate);
                  
                  return (
                    <div key={order.id} className="mb-1">
                      {/* Master Project Bar */}
                      <div className="h-12 flex items-center relative group">
                        {orderStyles && (
                          <div 
                            className="absolute h-7 rounded-xl flex items-center px-4 shadow-xl border-b-4 transition-all hover:scale-[1.01] cursor-pointer"
                            style={{ 
                              left: orderStyles.left, 
                              width: orderStyles.width,
                              background: order.status === 'Completed' 
                                ? 'linear-gradient(to right, #10b981, #34d399)' 
                                : 'linear-gradient(to right, #6366f1, #818cf8)',
                              borderColor: order.status === 'Completed' ? '#059669' : '#4f46e5'
                            }}
                            onClick={() => onNavigateToOperations?.(order.id)}
                          >
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider truncate mr-3">{order.customer}</span>
                            <div className="ml-auto flex items-center gap-2">
                              <Badge className="bg-white/20 text-white border-none text-[8px] font-bold h-4">
                                {order.progress || 0}%
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Machining Operation Bars */}
                      {expandedOrders[order.id] && order.routing?.map((op) => {
                        const opStyles = getBarStyles(op.startDate, op.endDate);

                        return (
                          <div key={op.id}>
                            <div className="h-10 flex items-center relative group">
                              {opStyles && (
                                <div 
                                  className="absolute h-6 rounded-lg flex items-center px-3 shadow-md border-b-2"
                                  style={{ 
                                    left: opStyles.left, 
                                    width: opStyles.width,
                                    background: op.status === 'Completed' 
                                      ? 'linear-gradient(to right, #22c55e, #4ade80)' 
                                      : 'linear-gradient(to right, #3b82f6, #60a5fa)',
                                    borderColor: op.status === 'Completed' ? '#16a34a' : '#2563eb',
                                    opacity: op.status === 'NA' ? 0.2 : 1
                                  }}
                                >
                                  <span className="text-[8px] font-bold text-white uppercase tracking-tight truncate">{op.name}</span>
                                  {op.status === 'Completed' && <CheckCircle2 className="h-3 w-3 text-white ml-2 shrink-0" />}
                                </div>
                              )}
                            </div>

                            {/* Sequential Sub-task Bars */}
                            {expandedOps[op.id] && op.subTasks?.map((sub) => {
                              const subStyles = getBarStyles(sub.startDate, sub.endDate);
                              return (
                                <div key={sub.id} className="h-9 flex items-center relative group">
                                  {subStyles && (
                                    <div 
                                      className="absolute h-4 rounded-md flex items-center px-2 shadow-sm border"
                                      style={{ 
                                        left: subStyles.left, 
                                        width: subStyles.width,
                                        background: sub.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                                        borderColor: sub.status === 'Completed' ? '#10b981' : '#3b82f6',
                                        opacity: sub.status === 'NA' ? 0.1 : 0.9
                                      }}
                                    >
                                      <span className={cn(
                                        "text-[7px] font-bold uppercase tracking-tighter truncate",
                                        sub.status === 'Completed' ? "text-emerald-600" : "text-primary"
                                      )}>
                                        {sub.name}
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
