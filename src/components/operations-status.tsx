
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ExternalLink, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  CircleDot,
  Trash2,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Order, RoutingOperation, SubTask, SystemUser, Vendor, Machine, QualityReport, BillingRecord } from '@/lib/types';
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { AnnualLeaveEntry } from './manpower-utilization';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';

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
  { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
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
  machines?: Machine[];
}

export function OperationsStatus({ 
  initialOrderId, 
  onOrderIdChange, 
  onNavigateToVendor,
  onStatusChange,
  orders = [],
  users = [],
  vendors = [],
  machines = []
}: OperationsStatusProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  const [newOpName, setNewOpName] = useState('');
  const [expandedOps, setExpandedOps] = useState<Record<number, boolean>>({});

  const holidaysQuery = useMemoFirebase(() => collection(db, 'annual_leaves'), [db]);
  const { data: holidaysData } = useCollection<AnnualLeaveEntry>(holidaysQuery);
  const holidays = holidaysData || [];

  const reportsQuery = useMemoFirebase(() => collection(db, 'quality_reports'), [db]);
  const { data: allReports } = useCollection<QualityReport>(reportsQuery);

  const billingQuery = useMemoFirebase(() => collection(db, 'billing'), [db]);
  const { data: allBilling } = useCollection<BillingRecord>(billingQuery);

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

  const getNextAvailableDay = (dateStr: string, days = 1) => {
    let date = new Date(dateStr);
    for(let i = 0; i < days; i++) {
      date.setDate(date.getDate() + 1);
      while (isHoliday(date.toISOString().split('T')[0])) {
        date.setDate(date.getDate() + 1);
      }
    }
    const result = date.toISOString().split('T')[0];
    if (orderMaxDate && result > orderMaxDate) return orderMaxDate;
    return result;
  };

  const propagateSequentialDates = (ops: RoutingOperation[], startIndex: number) => {
    if (startIndex < 0 || startIndex >= ops.length) return ops;
    
    const updated = ops.map(op => ({
      ...op, 
      subTasks: op.subTasks ? op.subTasks.map(st => ({...st})) : []
    }));

    for (let i = startIndex; i < updated.length; i++) {
      const current = updated[i];
      if (!current) continue;
      
      if (isHoliday(current.startDate)) {
        current.startDate = getNextAvailableDay(new Date(new Date(current.startDate).getTime() - 86400000).toISOString().split('T')[0]);
      }

      const start = new Date(current.startDate);
      const end = new Date(current.endDate || current.startDate);
      const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      if (current.status === 'NA') {
        current.endDate = current.startDate;
      } else {
        current.endDate = getNextAvailableDay(current.startDate, durationDays);
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
        const allCompleted = op.subTasks.every(s => s.status === 'Completed' || s.isCompleted);
        if (!allCompleted) {
          // If at least one is started, it's WIP
          const anyStarted = op.subTasks.some(s => s.status === 'Completed' || s.isCompleted || s.status === 'WIP');
          if (anyStarted && op.status !== 'Hold') {
            return { ...op, status: 'WIP' };
          }
        } else if (allCompleted) {
          return { ...op, status: 'Completed' };
        }
      }
      return op;
    });

    const activeOps = enforcedRouting.filter(op => op.status !== 'NA');
    if (activeOps.length === 0) {
      setDocumentNonBlocking(doc(db, 'orders', selectedWorkOrder), { 
        routing: enforcedRouting, 
        progress: 0, 
        status: 'Pending' 
      }, { merge: true });
      return;
    }

    let totalApplicableTasks = 0;
    let completedTasksCount = 0;

    enforcedRouting.forEach(op => {
      if (op.status === 'NA') return;

      if (op.subTasks && op.subTasks.length > 0) {
        totalApplicableTasks += op.subTasks.length;
        completedTasksCount += op.subTasks.filter(s => s.status === 'Completed' || s.isCompleted).length;
      } else {
        totalApplicableTasks += 1;
        if (op.status === 'Completed') {
          completedTasksCount += 1;
        } else if (op.status === 'WIP') {
          completedTasksCount += 0.5;
        }
      }
    });

    const progress = totalApplicableTasks > 0 ? Math.round((completedTasksCount / totalApplicableTasks) * 100) : 0;

    // INTEGRATED STATUS LOGIC
    let orderStatus: Order['status'] = orderData?.status || 'Pending';
    const opsFinished = progress === 100;
    
    if (opsFinished) {
      const orderReports = allReports?.filter(r => r.workOrderId === selectedWorkOrder) || [];
      const qualityReleased = orderReports.length > 0 && orderReports.every(r => r.status === 'Released');
      const orderBilling = allBilling?.filter(b => b.orderId === selectedWorkOrder && b.type === 'invoice') || [];
      const billingCleared = orderBilling.length > 0 && orderBilling.every(b => b.status === 'Paid');

      if (qualityReleased && billingCleared) {
        orderStatus = 'Ready for Delivery';
      } else {
        orderStatus = 'Completed'; 
      }
    } else if (progress > 0) {
      if (orderStatus === 'Yet to start' || orderStatus === 'Pending') {
        orderStatus = 'Active';
      }
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
    updated[idx] = { ...updated[idx], startDate: newDate };
    const final = propagateSequentialDates(updated, idx);
    saveRouting(final);
  };

  const handleEndDateChange = (opId: string, idx: number, newDate: string) => {
    if (orderMinDate && newDate < orderMinDate) return;
    if (orderMaxDate && newDate > orderMaxDate) return;

    const updated = [...operations];
    updated[idx] = { ...updated[idx], endDate: newDate };
    if (idx + 1 < updated.length) {
      updated[idx + 1].startDate = newDate;
      const final = propagateSequentialDates(updated, idx + 1);
      saveRouting(final);
    } else {
      saveRouting(updated);
    }
  };

  const moveOperation = (idx: number, direction: 'up' | 'down') => {
    const newRouting = [...operations];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newRouting.length) return;
    
    [newRouting[idx], newRouting[targetIdx]] = [newRouting[targetIdx], newRouting[idx]];
    
    const final = propagateSequentialDates(newRouting, Math.min(idx, targetIdx));
    saveRouting(final);
  };

  const handleAddOperation = () => {
    if (newOpName) {
      const lastOp = operations[operations.length - 1];
      const startFrom = lastOp ? lastOp.endDate : (orderData ? formatToInputDate(orderData.startDate) : new Date().toISOString().split('T')[0]);
      
      if (orderMaxDate && startFrom >= orderMaxDate) {
        toast({ variant: "destructive", title: "Limit Reached", description: "Timeline exceeded." });
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
      toast({ variant: "destructive", title: "Boundary Error", description: "End date reached." });
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
      
      const subTasks = op.subTasks.map(st => ({...st}));
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
             <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold uppercase text-slate-900">Spreadsheet</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select 
            value={selectedWorkOrder || undefined} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-[200px] h-9 bg-white text-[10px] font-bold uppercase border-slate-200 rounded-lg">
              <SelectValue placeholder="Select WO..." />
            </SelectTrigger>
            <SelectContent>
              {orders.map(order => (
                <SelectItem key={order.id} value={order.id} className="text-[10px] font-bold uppercase">{order.id} - {order.customer}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onNavigateToVendor} className="h-9 px-4 text-[10px] uppercase font-bold rounded-lg border-slate-200">
            Vendors <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-3 px-4 w-20">Seq.</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400">Operation</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center w-28">Start</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center w-28">End</TableHead>
                <TableHead className="font-bold text-[9px] uppercase text-center w-32">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedWorkOrder ? (
                <>
                  {operations.map((op, idx) => {
                    const currentStatus = op.status || "Yet to start";
                    const isExpanded = !!expandedOps[idx];
                    const isNA = currentStatus === 'NA';
                    
                    return (
                      <React.Fragment key={op.id}>
                        <TableRow className={cn(
                          "h-12 border-b border-slate-50 hover:bg-slate-50/30 group",
                          isNA && "opacity-50 grayscale"
                        )}>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setExpandedOps(prev => ({ ...prev, [idx]: !prev[idx] }))}>
                                {isExpanded ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                              </button>
                              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveOperation(idx, 'up')} disabled={idx === 0}><ArrowUp className="h-2 w-2" /></button>
                                <button onClick={() => moveOperation(idx, 'down')} disabled={idx === operations.length - 1}><ArrowDown className="h-2 w-2" /></button>
                              </div>
                              <span className="text-[10px] font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select 
                              disabled={op.name === 'QC'}
                              value={op.name} 
                              onValueChange={(newName) => {
                                const updated = operations.map(o => o.id === op.id ? { ...o, name: newName } : o);
                                saveRouting(updated);
                              }}
                            >
                              <SelectTrigger className="h-7 border-none bg-transparent p-0 text-[11px] font-bold uppercase tracking-tight focus:ring-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {INITIAL_STEPS.map(step => (
                                  <SelectItem key={step} value={step} className="text-[10px] font-bold uppercase">{step}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-0">
                            <DatePicker 
                              value={op.startDate}
                              onChange={(val) => handleStartDateChange(op.id, idx, val)}
                              className="h-8 border-none bg-transparent text-center text-[10px]"
                            />
                          </TableCell>
                          <TableCell className="p-0">
                            <DatePicker 
                              disabled={isNA}
                              value={op.endDate}
                              onChange={(val) => handleEndDateChange(op.id, idx, val)}
                              className="h-8 border-none bg-transparent text-center text-[10px]"
                            />
                          </TableCell>
                          <TableCell className="px-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge variant="outline" className={cn("text-[8px] font-bold uppercase py-1 w-full justify-center rounded-md cursor-pointer", getStatusStyles(currentStatus))}>
                                  {currentStatus}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48 text-[10px] font-bold uppercase">
                                {STATUS_OPTIONS.map(opt => (
                                  <DropdownMenuItem key={opt.label} onClick={() => handleLocalStatusChange(op.id, opt.label)}>{opt.label}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="px-4">
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-200 hover:text-red-500" onClick={() => saveRouting(operations.filter(o => o.id !== op.id))}>
                               <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && !isNA && (
                          <TableRow className="bg-slate-50/20">
                            <TableCell colSpan={6} className="pl-12 py-4">
                              <div className="space-y-3">
                                {op.subTasks.map((task, sIdx) => (
                                  <div key={task.id} className={cn(
                                    "flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 transition-opacity",
                                    (task.status === 'Completed' || task.isCompleted) && "opacity-60"
                                  )}>
                                    <div className="px-2">
                                      <Checkbox 
                                        checked={task.status === 'Completed' || task.isCompleted} 
                                        onCheckedChange={(checked) => handleUpdateSubTask(idx, sIdx, { status: checked ? 'Completed' : 'Yet to start', isCompleted: !!checked })}
                                      />
                                    </div>
                                    <Input 
                                      defaultValue={task.name}
                                      onBlur={(e) => handleUpdateSubTask(idx, sIdx, { name: e.target.value })}
                                      className={cn(
                                        "h-7 bg-slate-50 border-none text-[10px] font-bold flex-1",
                                        (task.status === 'Completed' || task.isCompleted) && "line-through"
                                      )} 
                                    />
                                    <DatePicker value={task.startDate} onChange={(val) => handleUpdateSubTask(idx, sIdx, { startDate: val })} className="h-7 w-28 text-[9px]" />
                                    <Select value={task.machineId} onValueChange={(val) => handleUpdateSubTask(idx, sIdx, { machineId: val })}>
                                      <SelectTrigger className="h-7 w-32 text-[9px] bg-slate-50 border-none"><SelectValue placeholder="Resource" /></SelectTrigger>
                                      <SelectContent>
                                        {machines.map(m => <SelectItem key={m.id} value={m.id} className="text-[9px] font-bold uppercase">{m.name}</SelectItem>)}
                                        {users.map(u => <SelectItem key={u.id} value={u.id} className="text-[9px] font-bold uppercase">{u.name}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300" onClick={() => handleRemoveSubTask(idx, sIdx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                ))}
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="Add sub-task..." 
                                    className="h-8 text-[10px] font-bold"
                                    onKeyDown={(e) => { if (e.key === 'Enter') { handleAddSubTask(idx, e.currentTarget.value); e.currentTarget.value = ''; } }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 bg-slate-50/30">
                      <div className="flex gap-2">
                        <Select value={newOpName} onValueChange={setNewOpName}>
                          <SelectTrigger className="h-9 bg-white text-[10px] font-bold uppercase"><SelectValue placeholder="New Operation..." /></SelectTrigger>
                          <SelectContent>
                            {INITIAL_STEPS.map(step => <SelectItem key={step} value={step} className="text-[10px] font-bold uppercase">{step}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAddOperation} className="h-9 px-6 bg-[#001F3D] text-white text-[10px] font-bold uppercase rounded-lg">Add Sequence Node</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400 text-xs italic">Select a Work Order Identity to initialize the operational matrix.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

