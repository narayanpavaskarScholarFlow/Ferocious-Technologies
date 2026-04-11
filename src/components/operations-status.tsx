
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { 
  Layers, 
  Truck, 
  ExternalLink, 
  Plus, 
  Settings2, 
  ChevronDown, 
  ChevronUp,
  CircleDot,
  Trash2,
  Calendar,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  User,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Order, RoutingOperation, SubTask, SystemUser, Vendor } from '@/lib/types';
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { AnnualLeaveEntry } from './manpower-utilization';
import { useToast } from '@/hooks/use-toast';

const INITIAL_STEPS = [
  "DFM", "Design", "Review", "Final Design", "Raw Material", "Pre-machining", 
  "CNC Turning", "VMC Milling", "1st Grinding", "Heat Treatment", 
  "2nd Grinding", "Hard Part Milling", "EDM / WEDM", "QC", "Assembly"
];

const STATUS_OPTIONS = [
  { label: "Yet to start", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "WIP", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Hold", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "Review Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "NA", color: "text-slate-400 bg-slate-100 border-slate-200" },
];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
  onNavigateToVendor?: () => void;
  onStatusChange?: (orderId: string, operation: string, status: string) => void;
  orders?: Order[];
  users?: SystemUser[];
  vendors?: Vendor[];
}

export function OperationsStatus({ 
  initialOrderId, 
  onOrderIdChange, 
  onNavigateToVendor,
  onStatusChange,
  orders = [],
  users = [],
  vendors = []
}: OperationsStatusProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  const [newOpName, setNewOpName] = useState('');
  const [expandedOps, setExpandedOps] = useState<Record<number, boolean>>({});

  const holidaysQuery = useMemoFirebase(() => collection(db, 'annual_leaves'), [db]);
  const { data: holidaysData } = useCollection<AnnualLeaveEntry>(holidaysQuery);
  const holidays = holidaysData || [];

  const orderDocRef = useMemoFirebase(() => 
    selectedWorkOrder ? doc(db, 'orders', selectedWorkOrder) : null,
    [db, selectedWorkOrder]
  );
  
  const { data: orderData } = useDoc<Order>(orderDocRef);
  const operations = orderData?.routing || [];

  const formatToInputDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const orderMinDate = orderData ? formatToInputDate(orderData.startDate) : undefined;
  const orderMaxDate = orderData ? formatToInputDate(orderData.endDate) : undefined;

  const isHoliday = (dateStr: string) => {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return holidays.some(h => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return target >= start && target <= end;
    });
  };

  const getNextAvailableDay = (dateStr: string) => {
    let date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    while (isHoliday(date.toISOString().split('T')[0])) {
      date.setDate(date.getDate() + 1);
    }
    const result = date.toISOString().split('T')[0];
    if (orderMaxDate && result > orderMaxDate) return orderMaxDate;
    return result;
  };

  const propagateSequentialDates = (ops: RoutingOperation[], startIndex: number) => {
    if (startIndex < 0 || startIndex >= ops.length) return ops;
    
    const updated = [...ops];
    for (let i = startIndex; i < updated.length; i++) {
      const current = updated[i];
      if (!current) continue;
      
      if (isHoliday(current.startDate)) {
        current.startDate = getNextAvailableDay(new Date(new Date(current.startDate).getTime() - 86400000).toISOString().split('T')[0]);
      }

      if (current.status === 'NA') {
        current.endDate = current.startDate;
      } else {
        current.endDate = getNextAvailableDay(current.startDate);
      }
      
      if (i + 1 < updated.length) {
        updated[i + 1].startDate = current.endDate;
      }
    }
    return updated;
  };

  useEffect(() => {
    if (initialOrderId) {
      setSelectedWorkOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const saveRouting = (newRouting: RoutingOperation[]) => {
    if (!selectedWorkOrder) return;

    const enforcedRouting = newRouting.map(op => {
      if (op.subTasks && op.subTasks.length > 0 && op.status !== 'NA') {
        const allCompleted = op.subTasks.every(s => s.status === 'Completed');
        if (!allCompleted) {
          return { ...op, status: 'WIP' };
        }
      }
      return op;
    });

    const activeOps = enforcedRouting.filter(op => op.status !== 'NA');
    if (activeOps.length === 0) {
      setDocumentNonBlocking(doc(db, 'orders', selectedWorkOrder), { routing: enforcedRouting, progress: 0, status: 'Yet to start' }, { merge: true });
      return;
    }

    let totalApplicableTasks = 0;
    let completedTasks = 0;

    enforcedRouting.forEach(op => {
      if (op.status === 'NA') return;

      if (op.subTasks && op.subTasks.length > 0) {
        totalApplicableTasks += op.subTasks.length;
        completedTasks += op.subTasks.filter(s => s.status === 'Completed').length;
      } else {
        totalApplicableTasks += 1;
        if (op.status === 'Completed') {
          completedTasks += 1;
        } else if (op.status === 'WIP') {
          completedTasks += 0.5;
        }
      }
    });

    const progress = totalApplicableTasks > 0 ? Math.round((completedTasks / totalApplicableTasks) * 100) : 0;

    let orderStatus: any = orderData?.status || 'Yet to start';
    if (progress === 100) {
      orderStatus = 'Completed';
    } else if (progress > 0) {
      orderStatus = 'Active';
    } else {
      orderStatus = 'Yet to start';
    }

    setDocumentNonBlocking(doc(db, 'orders', selectedWorkOrder), {
      routing: enforcedRouting,
      progress: progress,
      status: orderStatus
    }, { merge: true });
  };

  const handleSelectChange = (val: string) => {
    setSelectedWorkOrder(val);
    onOrderIdChange?.(val);
  };

  const handleStartDateChange = (opId: string, idx: number, newDate: string) => {
    if (orderMinDate && newDate < orderMinDate) return;
    if (orderMaxDate && newDate > orderMaxDate) return;

    const updated = [...operations];
    updated[idx].startDate = newDate;
    const final = propagateSequentialDates(updated, idx);
    saveRouting(final);
  };

  const handleEndDateChange = (opId: string, idx: number, newDate: string) => {
    if (orderMinDate && newDate < orderMinDate) return;
    if (orderMaxDate && newDate > orderMaxDate) return;

    const updated = [...operations];
    updated[idx].endDate = newDate;
    if (idx + 1 < updated.length) {
      updated[idx + 1].startDate = newDate;
      const final = propagateSequentialDates(updated, idx + 1);
      saveRouting(final);
    } else {
      saveRouting(updated);
    }
  };

  const handleAddOperation = () => {
    if (newOpName) {
      const lastOp = operations[operations.length - 1];
      const startFrom = lastOp ? lastOp.endDate : (orderData ? formatToInputDate(orderData.startDate) : new Date().toISOString().split('T')[0]);
      
      if (orderMaxDate && startFrom >= orderMaxDate) {
        toast({
          variant: "destructive",
          title: "Timeline Violation",
          description: "Cannot append operations beyond the master order end date."
        });
        return;
      }

      const newOp: RoutingOperation = {
        id: `OP-${Math.random().toString(36).substr(2, 9)}`,
        name: newOpName,
        startDate: startFrom,
        endDate: getNextAvailableDay(startFrom),
        status: "Yet to start",
        subTasks: []
      };
      saveRouting([...operations, newOp]);
      setNewOpName('');
    }
  };

  const handleAddSubTask = (idx: number, taskName: string) => {
    if (!taskName.trim()) return;
    
    const op = operations[idx];
    const lastSub = op.subTasks[op.subTasks.length - 1];
    const startFrom = lastSub ? lastSub.endDate || op.startDate : op.startDate;

    if (startFrom >= op.endDate) {
      toast({
        variant: "destructive",
        title: "Boundary Rejection",
        description: "Operation end date reached. Cannot add sequential sub-tasks."
      });
      return;
    }

    const calcEnd = getNextAvailableDay(startFrom);
    const finalEnd = calcEnd > op.endDate ? op.endDate : calcEnd;

    const newSubTask: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      name: taskName.trim(),
      startDate: startFrom,
      endDate: finalEnd,
      status: 'Yet to start',
      isCompleted: false
    };
    
    const updatedRouting = operations.map((op, i) => 
      i === idx ? { ...op, subTasks: [...op.subTasks, newSubTask] } : op
    );
    saveRouting(updatedRouting);
  };

  const handleUpdateSubTask = (opIdx: number, subIdx: number, updates: Partial<SubTask>) => {
    const parent = operations[opIdx];
    const parentStart = parent.startDate;
    const parentEnd = parent.endDate;

    const updatedRouting = operations.map((op, i) => {
      if (i !== opIdx) return op;
      
      const subTasks = [...op.subTasks];
      const currentSub = { ...subTasks[subIdx] };

      let nextStart = updates.startDate !== undefined ? updates.startDate : (currentSub.startDate || parentStart);
      let nextEnd = updates.endDate !== undefined ? updates.endDate : (currentSub.endDate || nextStart);

      if (nextStart < parentStart) nextStart = parentStart;
      if (nextStart > parentEnd) nextStart = parentEnd;

      if (updates.startDate !== undefined) {
        nextEnd = getNextAvailableDay(nextStart);
        if (nextEnd > parentEnd) nextEnd = parentEnd;
      } else if (updates.endDate !== undefined) {
        if (nextEnd > parentEnd) nextEnd = parentEnd;
        if (nextEnd < nextStart) nextEnd = nextStart;
      }

      subTasks[subIdx] = { ...currentSub, ...updates, startDate: nextStart, endDate: nextEnd };
      
      for (let j = subIdx + 1; j < subTasks.length; j++) {
        const prevEnd = subTasks[j-1].endDate!;
        subTasks[j].startDate = prevEnd;
        
        let calcEnd = getNextAvailableDay(prevEnd);
        if (calcEnd > parentEnd) calcEnd = parentEnd;
        subTasks[j].endDate = calcEnd;
      }

      return { ...op, subTasks };
    });
    
    saveRouting(updatedRouting);
  };

  const handleRemoveSubTask = (opIdx: number, taskIdx: number) => {
    const updatedRouting = operations.map((op, i) => 
      i === opIdx ? { ...op, subTasks: op.subTasks.filter((_, j) => j !== taskIdx) } : op
    );
    saveRouting(updatedRouting);
  };

  const handleLocalStatusChange = (opId: string, status: string, vendorName?: string) => {
    let finalStatus = status;
    if (status === 'Vendor' && vendorName) {
      finalStatus = `Vendor: ${vendorName}`;
    }
    const idx = operations.findIndex(o => o.id === opId);
    if (idx === -1) return;

    const updatedRouting = operations.map(op => op.id === opId ? { ...op, status: finalStatus } : op);
    const final = propagateSequentialDates(updatedRouting, idx);
    saveRouting(final);
  };

  const getStatusStyles = (status?: string) => {
    if (status?.startsWith('Vendor')) return "text-purple-600 bg-purple-50 border-purple-200";
    const match = STATUS_OPTIONS.find(opt => opt.label === status);
    return match?.color || "text-slate-400 bg-slate-100 border-slate-200";
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl hidden sm:block">
             <FileSpreadsheet className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tight text-slate-900">Operational Spreadsheet</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Sequential Progress Protocols Active</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-slate-200 h-11 px-6 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50"
            onClick={onNavigateToVendor}
          >
            Manage Vendors <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xs:block">Active Order:</span>
            <Select 
              value={selectedWorkOrder || undefined} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="flex-1 sm:w-[200px] h-11 bg-white text-sm font-bold border-slate-200 rounded-full shadow-sm">
                <SelectValue placeholder="Select ID..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {orders && orders.length > 0 ? orders.map(order => (
                  <SelectItem key={order.id} value={order.id}>{order.id} - {order.customer}</SelectItem>
                )) : (
                  <SelectItem value="none" disabled>No Orders Found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-12 overflow-hidden border-slate-200 bg-white shadow-xl rounded-[1.5rem] md:rounded-[2rem]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-8 w-20">Seq.</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[200px]">Operation / Task Row</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center min-w-[120px]">Start Date</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 text-center min-w-[120px]">End Date</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-center w-[200px]">Status</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-right px-8 w-20">
                    <Settings2 className="h-3.5 w-3.5 ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedWorkOrder ? (
                  <>
                    {operations.map((op, idx) => {
                      const currentStatus = op.status || "Yet to start";
                      const isExpanded = !!expandedOps[idx];
                      const isNA = currentStatus === 'NA';
                      const startIsHoliday = isHoliday(op.startDate);
                      const hasSubs = op.subTasks && op.subTasks.length > 0;
                      const completedSubs = hasSubs ? op.subTasks.filter(s => s.status === 'Completed').length : 0;
                      const allSubsCompleted = hasSubs ? completedSubs === op.subTasks.length : true;
                      const opProgress = hasSubs ? Math.round((completedSubs / op.subTasks.length) * 100) : (currentStatus === 'Completed' ? 100 : 0);
                      
                      return (
                        <React.Fragment key={op.id}>
                          <TableRow className={cn(
                            "h-20 border-b border-slate-50 hover:bg-slate-50/30 transition-colors group",
                            isNA && "opacity-50 grayscale bg-slate-50/50"
                          )}>
                            <TableCell className="px-8 font-code text-xs text-slate-300 font-bold">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-slate-300 hover:text-primary hover:bg-primary/5 -ml-4"
                                  onClick={() => setExpandedOps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                >
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                                {(idx + 1).toString().padStart(2, '0')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <Select 
                                    value={op.name} 
                                    onValueChange={(newName) => {
                                      const updated = operations.map(o => o.id === op.id ? { ...o, name: newName } : o);
                                      saveRouting(updated);
                                    }}
                                  >
                                    <SelectTrigger className={cn(
                                      "h-8 border-none bg-transparent hover:bg-slate-100 text-sm font-bold uppercase tracking-tight p-0 focus:ring-0 w-fit gap-2",
                                      isNA ? "text-slate-400 line-through" : "text-slate-700"
                                    )}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      {INITIAL_STEPS.map(step => (
                                        <SelectItem key={step} value={step} className="text-xs font-bold uppercase">{step}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {startIsHoliday && <Badge variant="outline" className="text-[8px] border-amber-200 text-amber-600 bg-amber-50 h-4">Holiday Shifted</Badge>}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${opProgress}%` }} />
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{opProgress}% complete</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-code text-xs text-slate-500">
                              <Input 
                                type="date"
                                min={orderMinDate}
                                max={orderMaxDate}
                                value={op.startDate}
                                className={cn(
                                  "bg-transparent border-none text-center text-xs h-8 p-0",
                                  startIsHoliday && "text-amber-600 font-bold"
                                )}
                                onChange={(e) => handleStartDateChange(op.id, idx, e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="text-center font-code text-xs text-slate-500">
                              <Input 
                                type="date"
                                min={orderMinDate}
                                max={orderMaxDate}
                                value={op.endDate}
                                className={cn(
                                  "bg-transparent border-none text-center text-xs h-8 p-0",
                                  isNA && "opacity-50"
                                )}
                                readOnly={isNA}
                                onChange={(e) => handleEndDateChange(op.id, idx, e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button 
                                      disabled={hasSubs && !allSubsCompleted}
                                      className={cn(
                                        "outline-none focus:ring-4 focus:ring-primary/10 rounded-full transition-all w-full max-w-[160px] relative group/trigger",
                                        hasSubs && !allSubsCompleted && "opacity-60 cursor-not-allowed"
                                      )}
                                    >
                                      <Badge 
                                        variant="outline"
                                        className={cn(
                                          "text-[9px] font-bold uppercase py-2 px-4 w-full justify-center rounded-full border transition-all shadow-sm",
                                          !hasSubs || allSubsCompleted ? "hover:scale-105" : "",
                                          getStatusStyles(currentStatus)
                                        )}
                                      >
                                        {hasSubs && !allSubsCompleted && <Lock className="h-2.5 w-2.5 mr-2 opacity-50" />}
                                        {currentStatus}
                                      </Badge>
                                    </button>
                                  </DropdownMenuTrigger>
                                  {(!hasSubs || allSubsCompleted) && (
                                    <DropdownMenuContent align="center" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100">
                                      {STATUS_OPTIONS.map((opt) => (
                                        <DropdownMenuItem 
                                          key={opt.label}
                                          onClick={() => handleLocalStatusChange(op.id, opt.label)}
                                          className="flex items-center gap-3 cursor-pointer rounded-xl h-10 px-3 hover:bg-slate-50"
                                        >
                                          <div className={cn("h-2 w-2 rounded-full", opt.color.split(' ')[0].replace('text-', 'bg-'))} />
                                          <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                        </DropdownMenuItem>
                                      ))}
                                      
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="flex items-center gap-3 cursor-pointer rounded-xl h-10 px-3 hover:bg-slate-50">
                                          <Truck className="h-4 w-4 text-purple-600" />
                                          <span className="text-xs font-bold uppercase tracking-wider">Vendor</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                          <DropdownMenuSubContent className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
                                            {vendors.map((vendor) => (
                                              <DropdownMenuItem 
                                                key={vendor.id}
                                                onClick={() => handleLocalStatusChange(op.id, 'Vendor', vendor.name)}
                                                className="cursor-pointer text-[10px] font-bold uppercase h-10 rounded-xl px-3"
                                              >
                                                {vendor.name}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                      </DropdownMenuSub>
                                    </DropdownMenuContent>
                                  )}
                                </DropdownMenu>
                              </div>
                            </TableCell>
                            <TableCell className="text-right px-8">
                               <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-200 hover:text-red-500 rounded-full"
                                onClick={() => saveRouting(operations.filter(o => o.id !== op.id))}
                               >
                                 <Trash2 className="h-3.5 w-3.5" />
                               </Button>
                            </TableCell>
                          </TableRow>
                          
                          {isExpanded && !isNA && (
                            <TableRow className="bg-slate-50/40 border-b border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                              <TableCell colSpan={6} className="pl-8 sm:pl-24 py-8 pr-4 sm:pr-12">
                                <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <CircleDot className="h-3 w-3 text-primary" /> Sequential Sub-Tasks for {op.name}
                                    </div>
                                    <Badge variant="outline" className="text-[8px] bg-white text-slate-400">Locked within {op.startDate} to {op.endDate}</Badge>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    {op.subTasks.map((task, sIdx) => (
                                      <div key={task.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-stretch lg:items-end bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group/task relative">
                                        <div className="lg:col-span-3 space-y-2">
                                          <Label className="text-[9px] font-bold uppercase text-slate-400">Sub-Task Identity</Label>
                                          <Input 
                                            value={task.name}
                                            onChange={(e) => handleUpdateSubTask(idx, sIdx, { name: e.target.value })}
                                            className={cn(
                                              "h-9 bg-slate-50/50 border-none rounded-lg text-xs font-bold",
                                              task.status === 'Completed' && "text-slate-400 line-through"
                                            )} 
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 lg:col-span-3 gap-4">
                                          <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase text-slate-500">Start</Label>
                                            <div className="relative">
                                              <Input 
                                                type="date"
                                                min={op.startDate}
                                                max={op.endDate}
                                                value={task.startDate}
                                                onChange={(e) => handleUpdateSubTask(idx, sIdx, { startDate: e.target.value })}
                                                className="h-9 bg-slate-50/50 border-none rounded-lg text-[10px] pr-8" 
                                              />
                                              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none" />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase text-slate-500">End</Label>
                                            <div className="relative">
                                              <Input 
                                                type="date"
                                                min={op.startDate}
                                                max={op.endDate}
                                                value={task.endDate}
                                                className="h-9 bg-slate-100 border-none rounded-lg text-[10px] pr-8 cursor-not-allowed opacity-60" 
                                                readOnly
                                              />
                                              <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none" />
                                            </div>
                                          </div>
                                        </div>
                                        <div className="lg:col-span-3 space-y-2">
                                          <Label className="text-[9px] font-bold uppercase text-slate-400">Resource Node</Label>
                                          <Select 
                                            value={task.machineId} 
                                            onValueChange={(val) => handleUpdateSubTask(idx, sIdx, { machineId: val })}
                                          >
                                            <SelectTrigger className="h-9 bg-slate-50/50 border-none rounded-lg text-[10px]">
                                              <SelectValue placeholder="Resource Allocation" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                              <SelectItem value="internal" disabled className="text-[9px] font-bold uppercase text-primary/50 bg-primary/5 px-2 py-1 flex items-center gap-2">
                                                <User className="h-3 w-3" /> Internal (Resources)
                                              </SelectItem>
                                              {users.map(u => (
                                                <SelectItem key={u.id} value={u.id} className="text-[10px] font-medium">{u.name} ({u.role})</SelectItem>
                                              ))}
                                              <SelectItem value="external" disabled className="text-[9px] font-bold uppercase text-purple-500/50 bg-purple-50 px-2 py-1 flex items-center gap-2">
                                                <Truck className="h-3 w-3" /> External (Partners)
                                              </SelectItem>
                                              {vendors.map(v => (
                                                <SelectItem key={v.id} value={v.id} className="text-[10px] font-medium">{v.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="lg:col-span-2 space-y-2">
                                          <Label className="text-[9px] font-bold uppercase text-slate-400">Status</Label>
                                          <Select 
                                            value={task.status || 'Yet to start'} 
                                            onValueChange={(val) => handleUpdateSubTask(idx, sIdx, { status: val })}
                                          >
                                            <SelectTrigger className={cn(
                                              "h-9 border-none rounded-lg text-[10px] font-bold uppercase",
                                              getStatusStyles(task.status || 'Yet to start')
                                            )}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                              {STATUS_OPTIONS.map(opt => (
                                                <SelectItem key={opt.label} value={opt.label} className="text-[10px] font-bold uppercase">
                                                  <div className="flex items-center gap-2">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", opt.color.split(' ')[0].replace('text-', 'bg-'))} />
                                                    {opt.label}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="lg:col-span-1 flex justify-end">
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-9 w-9 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full"
                                            onClick={() => handleRemoveSubTask(idx, sIdx)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3 max-w-md pt-4">
                                    <div className="relative flex-1">
                                      <Input 
                                        placeholder="Add sequential sub-item..." 
                                        className="h-11 bg-white border-slate-200 rounded-xl pl-10 text-[10px] font-bold uppercase tracking-widest focus-visible:ring-primary/20"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleAddSubTask(idx, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                          }
                                        }}
                                      />
                                      <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    </div>
                                    <Button 
                                      size="sm"
                                      className="h-11 rounded-xl bg-slate-900 hover:bg-black text-white px-6 font-bold text-[10px] uppercase"
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                                        if (input) {
                                          handleAddSubTask(idx, input.value);
                                          input.value = '';
                                        }
                                      }}
                                    >
                                      Add Item
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                    <TableRow className="bg-slate-50/30">
                      <TableCell colSpan={6} className="p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Select value={newOpName} onValueChange={setNewOpName}>
                              <SelectTrigger className="h-12 bg-white border-slate-200 rounded-2xl pl-10 text-xs font-bold uppercase tracking-widest focus:ring-primary/20">
                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Select routing operation..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-slate-100">
                                {INITIAL_STEPS.map(step => (
                                  <SelectItem key={step} value={step} className="text-xs font-bold uppercase">{step}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={handleAddOperation}
                            className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em]"
                          >
                            Append Row
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-80 p-0">
                      <div className="flex flex-col items-center justify-center text-center opacity-40 px-4">
                        <div className="bg-slate-50 p-8 rounded-full mb-6">
                          <Layers className="h-12 w-12 text-slate-300" />
                        </div>
                        <h3 className="text-lg md:text-xl font-display font-bold text-slate-900 tracking-tight">Select Order to Open Spreadsheet</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">
                          Search or select an active Work Order from the selector to load its operational routing ledger.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {holidays && holidays.length > 0 && (
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Active Planning Buffer</p>
            <p className="text-[11px] text-amber-700 font-medium leading-snug">
              The scheduling engine is currently bypassing <b>{holidays.length} plant holidays</b>. Any operation falling on these dates is automatically shifted to the next available working day.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
