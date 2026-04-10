"use client";

import { useState, useEffect } from 'react';
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
  ArrowRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Order, RoutingOperation, SubTask } from '@/lib/types';
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const INITIAL_STEPS = [
  "DFM", "Design", "Review", "Final Design", "Raw Material", "Pre-machining", 
  "1st Grinding", "Heat Treatment", "2nd Grinding", "Hard Part Milling", "EDM / WEDM", "QC", "Assembly"
];

const STATUS_OPTIONS = [
  { label: "Yet to start", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "WIP", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Hold", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "Review Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "NA", color: "text-slate-400 bg-slate-100 border-slate-200" },
];

const RESOURCE_LIST = [
  { id: '01', name: 'VMC milling-BFW (01)', type: 'internal' },
  { id: '02', name: 'VMC milling-BFW (02)', type: 'internal' },
  { id: '03', name: 'VMC milling-HASS (03)', type: 'internal' },
  { id: '04', name: 'VMC milling (04)', type: 'internal' },
  { id: '05', name: 'CNC Turning (05)', type: 'internal' },
  { id: '06', name: 'EDM ZNC (06)', type: 'internal' },
  { id: 'V1', name: 'Precision HT', type: 'vendor' },
  { id: 'V2', name: 'Global Logistics', type: 'vendor' },
  { id: 'V3', name: 'Electro-Chem', type: 'vendor' },
  { id: 'V4', name: 'Alpha Machining', type: 'vendor' },
  { id: 'V5', name: 'Apex Finishing', type: 'vendor' },
];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
  onNavigateToVendor?: () => void;
  onStatusChange?: (orderId: string, operation: string, status: string) => void;
}

export function OperationsStatus({ 
  initialOrderId, 
  onOrderIdChange, 
  onNavigateToVendor,
  onStatusChange
}: OperationsStatusProps) {
  const db = useFirestore();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  const [newOpName, setNewOpName] = useState('');
  const [expandedOps, setExpandedOps] = useState<Record<number, boolean>>({});

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

  const getNextDay = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const propagateSequentialDates = (ops: RoutingOperation[], startIndex: number) => {
    const updated = [...ops];
    for (let i = startIndex; i < updated.length; i++) {
      const current = updated[i];
      
      // Rule: If NA, duration is 0 (Start = End). Otherwise, duration is 1 day.
      if (current.status === 'NA') {
        current.endDate = current.startDate;
      } else {
        current.endDate = getNextDay(current.startDate);
      }
      
      // Rule: Next operation starts when current ends
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

  useEffect(() => {
    if (selectedWorkOrder && orderData && (!orderData.routing || orderData.routing.length === 0)) {
      const projectStart = formatToInputDate(orderData.startDate);
      let currentStart = projectStart;
      
      const seededOps: RoutingOperation[] = INITIAL_STEPS.map((name, i) => {
        const op = {
          id: `OP-${i}-${Date.now()}`,
          name,
          startDate: currentStart,
          endDate: getNextDay(currentStart),
          status: "Yet to start",
          subTasks: []
        };
        currentStart = op.endDate;
        return op;
      });
      
      saveRouting(seededOps);
    }
  }, [selectedWorkOrder, orderData]);

  const saveRouting = (newRouting: RoutingOperation[]) => {
    if (!selectedWorkOrder) return;
    setDocumentNonBlocking(doc(db, 'orders', selectedWorkOrder), {
      routing: newRouting
    }, { merge: true });
  };

  const handleSelectChange = (val: string) => {
    setSelectedWorkOrder(val);
    onOrderIdChange?.(val);
  };

  const handleStartDateChange = (opId: string, idx: number, newDate: string) => {
    const updated = [...operations];
    updated[idx].startDate = newDate;
    const final = propagateSequentialDates(updated, idx);
    saveRouting(final);
  };

  const handleEndDateChange = (opId: string, idx: number, newDate: string) => {
    const updated = [...operations];
    updated[idx].endDate = newDate;
    // Push the next operation to start on this end date
    if (idx + 1 < updated.length) {
      updated[idx + 1].startDate = newDate;
      const final = propagateSequentialDates(updated, idx + 1);
      saveRouting(final);
    } else {
      saveRouting(updated);
    }
  };

  const handleAddOperation = () => {
    if (newOpName.trim()) {
      const lastOp = operations[operations.length - 1];
      const startFrom = lastOp ? lastOp.endDate : (orderData ? formatToInputDate(orderData.startDate) : new Date().toISOString().split('T')[0]);
      
      const newOp: RoutingOperation = {
        id: `OP-${Math.random().toString(36).substr(2, 9)}`,
        name: newOpName.trim(),
        startDate: startFrom,
        endDate: getNextDay(startFrom),
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

    const newSubTask: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      name: taskName.trim(),
      startDate: startFrom,
      endDate: getNextDay(startFrom),
    };
    
    const updatedRouting = operations.map((op, i) => 
      i === idx ? { ...op, subTasks: [...op.subTasks, newSubTask] } : op
    );
    saveRouting(updatedRouting);
  };

  const handleUpdateSubTask = (opIdx: number, subIdx: number, updates: Partial<SubTask>) => {
    const updatedRouting = operations.map((op, i) => {
      if (i !== opIdx) return op;
      const subTasks = [...op.subTasks];
      subTasks[subIdx] = { ...subTasks[subIdx], ...updates };
      
      // Sub-task auto-date logic
      if (updates.startDate) {
        subTasks[subIdx].endDate = getNextDay(updates.startDate);
      }
      
      // Cascade sub-tasks
      for (let j = subIdx + 1; j < subTasks.length; j++) {
        subTasks[j].startDate = subTasks[j-1].endDate;
        subTasks[j].endDate = getNextDay(subTasks[j].startDate);
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
    const updatedRouting = operations.map(op => op.id === opId ? { ...op, status: finalStatus } : op);
    
    // Re-propagate dates from this point because if status is NA, duration changes to 0
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
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Cascading Sequential Date Protocol Active</p>
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
                <SelectItem value="103645">103645</SelectItem>
                <SelectItem value="102778">102778</SelectItem>
                <SelectItem value="100685">100685</SelectItem>
                <SelectItem value="105542">105542</SelectItem>
                <SelectItem value="101230">101230</SelectItem>
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
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 min-w-[200px]">Operation / Spreadsheet Row</TableHead>
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
                                <span className={cn(
                                  "text-sm font-bold uppercase tracking-tight",
                                  isNA ? "text-slate-400 line-through" : "text-slate-700"
                                )}>{op.name}</span>
                                {op.subTasks.length > 0 && !isNA && (
                                  <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-0.5">
                                    {op.subTasks.length} nested items
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-code text-xs text-slate-500">
                              <Input 
                                type="date"
                                value={op.startDate}
                                className="bg-transparent border-none text-center text-xs h-8 p-0"
                                onChange={(e) => handleStartDateChange(op.id, idx, e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="text-center font-code text-xs text-slate-500">
                              <Input 
                                type="date"
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
                                    <button className="outline-none focus:ring-4 focus:ring-primary/10 rounded-full transition-all w-full max-w-[160px]">
                                      <Badge 
                                        variant="outline"
                                        className={cn(
                                          "text-[9px] font-bold uppercase py-2 px-4 w-full justify-center rounded-full border transition-all hover:scale-105 shadow-sm",
                                          getStatusStyles(currentStatus)
                                        )}
                                      >
                                        {currentStatus}
                                      </Badge>
                                    </button>
                                  </DropdownMenuTrigger>
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
                                          {RESOURCE_LIST.filter(r => r.type === 'vendor').map((vendor) => (
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
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <CircleDot className="h-3 w-3 text-primary" /> Detailed Sequential Breakdown for {op.name}
                                  </div>
                                  
                                  <div className="space-y-4">
                                    {op.subTasks.map((task, sIdx) => (
                                      <div key={task.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-stretch md:items-end bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group/task relative">
                                        <div className="md:col-span-4 space-y-2">
                                          <Label className="text-[9px] font-bold uppercase text-slate-400">Task Detail</Label>
                                          <Input 
                                            value={task.name}
                                            onChange={(e) => handleUpdateSubTask(idx, sIdx, { name: e.target.value })}
                                            className="h-9 bg-slate-50/50 border-none rounded-lg text-xs font-bold" 
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 md:col-span-4 gap-4">
                                          <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase text-slate-400">Start</Label>
                                            <div className="relative">
                                              <Input 
                                                type="date"
                                                value={task.startDate}
                                                onChange={(e) => handleUpdateSubTask(idx, sIdx, { startDate: e.target.value })}
                                                className="h-9 bg-slate-50/50 border-none rounded-lg text-[10px] pr-8" 
                                              />
                                              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none" />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase text-slate-400">End (Auto)</Label>
                                            <div className="relative">
                                              <Input 
                                                type="date"
                                                value={task.endDate}
                                                className="h-9 bg-slate-100 border-none rounded-lg text-[10px] pr-8 cursor-not-allowed opacity-60" 
                                                readOnly
                                              />
                                              <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none" />
                                            </div>
                                          </div>
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                          <Label className="text-[9px] font-bold uppercase text-slate-400">Resource</Label>
                                          <Select 
                                            value={task.machineId} 
                                            onValueChange={(val) => handleUpdateSubTask(idx, sIdx, { machineId: val })}
                                          >
                                            <SelectTrigger className="h-9 bg-slate-50/50 border-none rounded-lg text-[10px]">
                                              <SelectValue placeholder="Machine/Vendor" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                              <SelectItem value="internal" disabled className="text-[9px] font-bold uppercase text-primary/50 bg-primary/5 px-2 py-1">Internal</SelectItem>
                                              {RESOURCE_LIST.filter(r => r.type === 'internal').map(res => (
                                                <SelectItem key={res.id} value={res.id} className="text-[10px] font-medium">{res.name}</SelectItem>
                                              ))}
                                              <SelectItem value="vendors" disabled className="text-[9px] font-bold uppercase text-purple-500/50 bg-purple-50 px-2 py-1">External</SelectItem>
                                              {RESOURCE_LIST.filter(r => r.type === 'vendor').map(res => (
                                                <SelectItem key={res.id} value={res.id} className="text-[10px] font-medium">{res.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="md:col-span-1 flex justify-end">
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
                            <Input 
                              placeholder="Insert new routing operation..." 
                              className="h-12 bg-white border-slate-200 rounded-2xl pl-10 text-xs font-bold uppercase tracking-widest focus-visible:ring-primary/20"
                              value={newOpName}
                              onChange={(e) => setNewOpName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddOperation()}
                            />
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                          Search or select an active Work Order from the Gantt chart to load its operational routing ledger.
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
    </div>
  );
}
