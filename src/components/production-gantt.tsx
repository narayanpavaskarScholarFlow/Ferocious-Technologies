
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  MoreHorizontal,
  Plus,
  Share2,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, RoutingOperation, SubTask } from '@/lib/types';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  differenceInDays,
  startOfDay
} from 'date-fns';

interface ProductionGanttProps {
  orders: Order[];
  searchTerm?: string;
  onNavigateToSchedule?: () => void;
  onNavigateToOperations?: (orderId: string) => void;
}

export function ProductionGantt({ orders, searchTerm: globalSearch, onNavigateToOperations }: ProductionGanttProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // Set to March 2025 as per current context
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [expandedOps, setExpandedOps] = useState<Record<string, boolean>>({});

  const timelineInterval = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOp = (id: string) => {
    setExpandedOps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split('.').map(Number);
    return new Date(y, m - 1, d);
  };

  const getBarStyles = (startStr?: string, endStr?: string) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return null;

    const timelineStart = timelineInterval[0];
    const timelineEnd = timelineInterval[timelineInterval.length - 1];

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

  const isOverdue = (endStr?: string, status?: string) => {
    const end = parseDate(endStr);
    if (!end || status === 'Completed') return false;
    return end < new Date();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-[#fdfdfd] border border-slate-200 rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Top Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Production Timeline</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              placeholder="Search & Filter" 
              className="h-8 pl-9 pr-4 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-medium w-48 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Date Header Controls */}
      <div className="h-12 bg-white border-b border-slate-100 flex items-center px-4 gap-4">
        <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <Button variant="ghost" size="sm" className="h-7 px-4 text-[10px] font-bold uppercase tracking-wider bg-white shadow-sm rounded">By Date</Button>
          <Button variant="ghost" size="sm" className="h-7 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Manual</Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[11px] font-bold text-[#001F3D] uppercase tracking-[0.1em] min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Gantt Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Hierarchy List */}
        <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col z-20 shadow-[4px_0_15px_rgba(0,0,0,0.02)]">
          <div className="h-10 border-b border-slate-100 flex items-center px-4 bg-slate-50/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Project Task Directory</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-2">
              {orders.map(order => (
                <div key={order.id} className="mb-1">
                  {/* Order Row */}
                  <div 
                    className="h-10 flex items-center px-2 hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {expandedOrders[order.id] ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRightIcon className="h-3 w-3 text-slate-400" />}
                    </div>
                    <div className={cn("w-1.5 h-6 rounded-full mr-2", order.status === 'Completed' ? 'bg-emerald-500' : 'bg-primary')} />
                    <span className="text-[11px] font-bold text-slate-700 truncate flex-1 uppercase tracking-tight">{order.customer}</span>
                    <Avatar className="h-5 w-5 ml-2 border border-white shadow-sm opacity-0 group-hover:opacity-100">
                      <AvatarImage src={`https://picsum.photos/seed/${order.owner}/20/20`} />
                    </Avatar>
                  </div>

                  {/* Operations (Nested) */}
                  {expandedOrders[order.id] && order.routing?.map((op, opIdx) => (
                    <div key={op.id}>
                      <div 
                        className="h-9 flex items-center pl-8 pr-2 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => toggleOp(op.id)}
                      >
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                          {op.subTasks?.length > 0 && (expandedOps[op.id] ? <ChevronDown className="h-2.5 w-2.5 text-slate-300" /> : <ChevronRightIcon className="h-2.5 w-2.5 text-slate-300" />)}
                        </div>
                        <div className="w-1 h-4 rounded-full bg-slate-200 mr-2" />
                        <span className="text-[10px] font-medium text-slate-500 truncate flex-1">{op.name}</span>
                      </div>

                      {/* Subtasks (Deeply Nested) */}
                      {expandedOps[op.id] && op.subTasks?.map((sub) => (
                        <div key={sub.id} className="h-8 flex items-center pl-14 pr-2 hover:bg-slate-50/50 transition-colors group">
                          <div className="w-3 h-px bg-slate-200 mr-2" />
                          <span className="text-[9px] font-medium text-slate-400 truncate flex-1">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="h-10 border-t border-slate-100 flex items-center px-4 bg-slate-50/50">
            <button className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
              <Plus className="h-3 w-3" /> Add Project
            </button>
          </div>
        </div>

        {/* Right Side: Timeline Visualization */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Calendar Day Header */}
          <div className="h-10 border-b border-slate-100 flex items-stretch bg-white sticky top-0 z-10">
            {timelineInterval.map((day, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex-1 border-r border-slate-100 flex flex-col items-center justify-center min-w-[40px]",
                  isToday(day) && "bg-blue-50/30"
                )}
              >
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mb-0.5">{format(day, 'EEE').charAt(0)}</span>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight",
                  isToday(day) ? "text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center" : "text-slate-400"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Grid Content */}
          <ScrollArea className="flex-1">
            <div className="relative min-h-full">
              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineInterval.map((day, idx) => (
                  <div key={idx} className={cn("flex-1 border-r border-slate-50", isToday(day) && "bg-blue-50/10 border-blue-100/30")} />
                ))}
              </div>

              {/* Current Time Line */}
              <div className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-purple-400/50 left-[50%] z-10 pointer-events-none">
                <div className="h-2 w-2 rounded-full bg-purple-400 absolute top-0 -left-1 shadow-lg" />
              </div>

              {/* Bars Overlay */}
              <div className="py-2 relative z-0">
                {orders.map(order => {
                  const orderStyles = getBarStyles(order.startDate, order.endDate);
                  const orderOverdue = isOverdue(order.endDate, order.status);

                  return (
                    <div key={order.id} className="mb-1">
                      {/* Order Row Bar */}
                      <div className="h-10 flex items-center relative group">
                        {orderStyles && (
                          <div 
                            className="absolute h-6 rounded-md flex items-center px-3 shadow-md border-b-4 transition-transform hover:scale-[1.01] cursor-pointer"
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
                            <span className="text-[9px] font-bold text-white uppercase tracking-tight truncate mr-2">{order.customer}</span>
                            <div className="ml-auto flex items-center gap-2">
                              <Badge className="bg-white/20 text-white border-none text-[8px] font-bold h-4">
                                {order.progress}%
                              </Badge>
                              {orderOverdue && <Badge className="bg-red-500 text-white border-none text-[8px] font-bold h-4 animate-pulse">Overdue</Badge>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Operations Bars */}
                      {expandedOrders[order.id] && order.routing?.map((op) => {
                        const opStyles = getBarStyles(op.startDate, op.endDate);
                        const opOverdue = isOverdue(op.endDate, op.status);

                        return (
                          <div key={op.id}>
                            <div className="h-9 flex items-center relative group">
                              {opStyles && (
                                <div 
                                  className="absolute h-5 rounded flex items-center px-3 shadow-sm border-b-2"
                                  style={{ 
                                    left: opStyles.left, 
                                    width: opStyles.width,
                                    background: op.status === 'Completed' 
                                      ? 'linear-gradient(to right, #22c55e, #4ade80)' 
                                      : 'linear-gradient(to right, #3b82f6, #60a5fa)',
                                    borderColor: op.status === 'Completed' ? '#16a34a' : '#2563eb',
                                    opacity: op.status === 'NA' ? 0.3 : 1
                                  }}
                                >
                                  {op.status === 'Completed' && <CheckCircle2 className="h-3 w-3 text-white mr-2" />}
                                  <span className="text-[8px] font-bold text-white uppercase tracking-tight truncate">{op.name}</span>
                                  {opOverdue && <AlertCircle className="h-3 w-3 text-white ml-auto" />}
                                </div>
                              )}
                            </div>

                            {/* Subtask Bars */}
                            {expandedOps[op.id] && op.subTasks?.map((sub) => {
                              const subStyles = getBarStyles(sub.startDate, sub.endDate);
                              return (
                                <div key={sub.id} className="h-8 flex items-center relative group">
                                  {subStyles && (
                                    <div 
                                      className="absolute h-4 rounded-sm flex items-center px-2 shadow-sm opacity-80"
                                      style={{ 
                                        left: subStyles.left, 
                                        width: subStyles.width,
                                        background: sub.status === 'Completed' ? '#86efac' : '#93c5fd',
                                        border: `1px solid ${sub.status === 'Completed' ? '#22c55e' : '#3b82f6'}`,
                                        opacity: sub.status === 'NA' ? 0.2 : 0.8
                                      }}
                                    >
                                      <span className="text-[7px] font-bold text-slate-700 uppercase tracking-tighter truncate">{sub.name}</span>
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
