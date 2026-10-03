"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Clock, 
  User, 
  Target, 
  Building2, 
  CalendarDays, 
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, RoutingOperation, SystemUser, Machine } from '@/lib/types';
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { differenceInDays, parseISO, isValid, format, isAfter } from 'date-fns';

const INITIAL_STEPS = [
  "DFM", "Design", "Review", "Final Design", "Raw Material", "Pre-machining", 
  "CNC Turning", "VMC Milling", "1st Grinding", "Heat Treatment", 
  "2nd Grinding", "Hard Part Milling", "EDM / WEDM", "QC", "Assembly"
];

const STATUS_OPTIONS = [
  { label: "Yet To Start", color: "text-slate-500 bg-slate-100 border-slate-200" },
  { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "On Hold", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "NA", color: "text-slate-300 bg-slate-50 border-slate-100" },
];

const DEPARTMENTS = ["Design", "Engineering", "Tool Room", "Quality", "Production", "Accounts", "R&D"];

interface OperationsStatusProps {
  initialOrderId?: string | null;
  onOrderIdChange?: (orderId: string | null) => void;
  orders?: Order[];
  users?: SystemUser[];
  machines?: Machine[];
}

export function OperationsStatus({ 
  initialOrderId, 
  onOrderIdChange, 
  orders = [],
  users = [],
  machines = []
}: OperationsStatusProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(initialOrderId || null);
  const [newOpName, setNewOpName] = useState('');

  const orderDocRef = useMemoFirebase(() => 
    selectedWorkOrder ? doc(db, 'orders', selectedWorkOrder) : null,
    [db, selectedWorkOrder]
  );
  
  const { data: orderData } = useDoc<Order>(orderDocRef);
  const operations = orderData?.routing || [];

  const woBounds = useMemo(() => {
    if (!orderData) return { start: null, end: null };
    const parse = (str?: string) => {
      if (!str) return null;
      if (str.includes('.')) {
        const [d, m, y] = str.split('.');
        return `${y}-${m}-${d}`;
      }
      return str;
    };
    return { start: parse(orderData.startDate), end: parse(orderData.endDate) };
  }, [orderData]);

  const summary = useMemo(() => {
    const today = new Date();
    const activeOps = operations.filter(o => o.status !== 'NA');
    const completed = activeOps.filter(o => o.status === 'Completed').length;
    const pending = activeOps.filter(o => o.status === 'Yet To Start' || o.status === 'In Progress').length;
    const delayed = activeOps.filter(o => {
      if (o.status === 'Completed') return false;
      const end = parseISO(o.endDate);
      return isValid(end) && isAfter(today, end);
    }).length;

    const progress = activeOps.length > 0 
      ? Math.round((activeOps.reduce((acc, op) => acc + (op.progress || 0), 0)) / activeOps.length) 
      : 0;

    return { total: activeOps.length, completed, pending, delayed, progress };
  }, [operations]);

  const saveRouting = (newRouting: RoutingOperation[]) => {
    if (!selectedWorkOrder) return;
    
    // Auto-update overall progress based on operation completion
    const activeOps = newRouting.filter(o => o.status !== 'NA');
    const completedCount = activeOps.filter(o => o.status === 'Completed').length;
    const calculatedProgress = activeOps.length > 0 ? Math.round((completedCount / activeOps.length) * 100) : 0;

    setDocumentNonBlocking(doc(db, 'orders', selectedWorkOrder), {
      routing: newRouting,
      progress: calculatedProgress,
      status: calculatedProgress === 100 ? 'Completed' : calculatedProgress > 0 ? 'Active' : 'Pending'
    }, { merge: true });
  };

  const handleUpdateOp = (idx: number, updates: Partial<RoutingOperation>) => {
    const newRouting = [...operations];
    const op = { ...newRouting[idx], ...updates };

    // Validation: Check bounds
    if (updates.startDate || updates.endDate) {
      const start = updates.startDate || op.startDate;
      const end = updates.endDate || op.endDate;
      
      if (woBounds.start && start < woBounds.start) {
        toast({ variant: "destructive", title: "Date Validation", description: `Operation cannot start before Work Order (${woBounds.start}).` });
        return;
      }
      if (woBounds.end && end > woBounds.end) {
        toast({ variant: "destructive", title: "Date Validation", description: `Operation cannot end after Work Order (${woBounds.end}).` });
        return;
      }
      if (start > end) {
        toast({ variant: "destructive", title: "Logic Error", description: "Start date cannot exceed end date." });
        return;
      }
    }

    // Sequential Dependency logic: Op N cannot start before Op N-1 ends
    if (idx > 0 && updates.startDate) {
      const prevEnd = operations[idx - 1].endDate;
      if (updates.startDate < prevEnd) {
        toast({ variant: "destructive", title: "Dependency Conflict", description: `Sequence Error: Cannot start before previous operation (${operations[idx-1].name}) finishes.` });
        return;
      }
    }

    newRouting[idx] = op;
    saveRouting(newRouting);
  };

  const handleAddOp = () => {
    if (!newOpName) return;
    const lastOp = operations[operations.length - 1];
    const startFrom = lastOp ? lastOp.endDate : (woBounds.start || new Date().toISOString().split('T')[0]);
    
    const newOp: RoutingOperation = {
      id: `OP-${Date.now()}`,
      name: newOpName,
      startDate: startFrom,
      endDate: startFrom,
      status: "Yet To Start",
      progress: 0,
      subTasks: []
    };
    saveRouting([...operations, newOp]);
    setNewOpName('');
  };

  const moveOp = (idx: number, dir: 'up' | 'down') => {
    const newRouting = [...operations];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= newRouting.length) return;
    [newRouting[idx], newRouting[target]] = [newRouting[target], newRouting[idx]];
    saveRouting(newRouting);
  };

  const getDuration = (start: string, end: string) => {
    const s = parseISO(start);
    const e = parseISO(end);
    if (!isValid(s) || !isValid(e)) return 0;
    return Math.max(0, differenceInDays(e, s) + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#001F3D] rounded-2xl text-white shadow-xl shadow-blue-900/10">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Execution Control Matrix</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Master Production Routing & Temporal Tracking</p>
          </div>
        </div>
        
        <Select 
          value={selectedWorkOrder || undefined} 
          onValueChange={(val) => { setSelectedWorkOrder(val); onOrderIdChange?.(val); }}
        >
          <SelectTrigger className="w-full md:w-[300px] h-12 bg-white border-slate-200 rounded-xl text-[11px] font-bold uppercase shadow-sm">
            <SelectValue placeholder="Identify Work Order Thread..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
            {orders.map(o => (
              <SelectItem key={o.id} value={o.id} className="text-[10px] font-bold uppercase">WO #{o.id} - {o.customer}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {orderData ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Card className="md:col-span-8 p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                  <div>
                    <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold uppercase px-3 mb-2">Active Protocol</Badge>
                    <h3 className="text-4xl font-display font-bold tracking-tighter uppercase leading-none">#{orderData.id}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-white/30" />
                      <span className="text-xs font-bold text-white/60 uppercase">{orderData.customer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-white/30" />
                      <span className="text-xs font-bold text-white/60 uppercase">{orderData.owner}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-white/30" />
                      <span className="text-xs font-code font-bold text-white/40">{orderData.startDate} - {orderData.endDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                   <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Aggregate Completion</p>
                   <div className="text-6xl font-display font-black text-primary tracking-tighter">{summary.progress}%</div>
                </div>
              </div>
              <div className="mt-8 space-y-3 relative z-10">
                 <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.5)]" style={{ width: `${summary.progress}%` }} />
                 </div>
              </div>
            </Card>

            <div className="md:col-span-4 grid grid-cols-2 gap-4">
               {[
                 { label: 'Total Nodes', val: summary.total, icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Completed', val: summary.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                 { label: 'Pending', val: summary.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                 { label: 'Delayed', val: summary.delayed, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
               ].map((item) => (
                 <Card key={item.label} className="p-6 bg-white border-slate-200 shadow-xl rounded-3xl flex flex-col justify-between group hover:border-primary transition-all">
                    <div className={cn("p-2 rounded-xl w-fit mb-4 transition-transform group-hover:scale-110", item.bg, item.color)}>
                       <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                       <p className={cn("text-3xl font-display font-bold mt-1", item.color)}>{item.val}</p>
                    </div>
                 </Card>
               ))}
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl rounded-[2.5rem]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#001F3D] rounded-lg text-white"><ClipboardList className="h-4 w-4" /></div>
                  <h3 className="text-sm font-bold text-[#001F3D] uppercase tracking-[0.2em]">Sequential Routing & Planning Ledger</h3>
               </div>
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <Select value={newOpName} onValueChange={setNewOpName}>
                    <SelectTrigger className="w-full md:w-64 h-10 bg-white text-[10px] font-bold uppercase rounded-xl">
                      <SelectValue placeholder="Append Sequence node..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {INITIAL_STEPS.map(step => (
                        <SelectItem key={step} value={step} className="text-[10px] font-bold uppercase">{step}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddOp} className="h-10 px-8 bg-[#001F3D] hover:bg-black text-white text-[10px] font-bold uppercase rounded-xl shadow-lg flex gap-2">
                    <Plus className="h-4 w-4" /> Add Sequence
                  </Button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[1400px]">
                <TableHeader className="bg-white border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400 py-6 px-10 w-24">Seq.</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400">Operation Identity</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400">Responsible Node</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400">Department</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center">Planned Matrix</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center">Actual Matrix</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center">Dur.</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-slate-400 text-center w-24">Yield %</TableHead>
                    <TableHead className="font-bold text-[9px] uppercase text-center w-32">Status</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((op, idx) => (
                    <TableRow key={op.id} className="h-20 border-slate-50 hover:bg-slate-50/50 group transition-colors">
                      <TableCell className="px-10">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveOp(idx, 'up')} disabled={idx === 0} className="hover:text-primary"><ArrowUp className="h-2.5 w-2.5" /></button>
                            <button onClick={() => moveOp(idx, 'down')} disabled={idx === operations.length - 1} className="hover:text-primary"><ArrowDown className="h-2.5 w-2.5" /></button>
                          </div>
                          <span className="text-[11px] font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          className="h-9 border-none bg-transparent font-bold text-xs uppercase focus-visible:ring-primary/20" 
                          value={op.name} 
                          onChange={(e) => handleUpdateOp(idx, { name: e.target.value })} 
                        />
                      </TableCell>
                      <TableCell>
                         <Select value={op.responsiblePersonId} onValueChange={(val) => handleUpdateOp(idx, { responsiblePersonId: val, responsiblePersonName: users.find(u => u.id === val)?.name })}>
                            <SelectTrigger className="h-9 border-none bg-slate-100/50 text-[10px] font-bold uppercase rounded-lg px-3">
                              <SelectValue placeholder="Identify Personnel..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg shadow-xl">
                              {users.map(u => <SelectItem key={u.id} value={u.id} className="text-[10px] font-bold uppercase">{u.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </TableCell>
                      <TableCell>
                         <Select value={op.department} onValueChange={(val) => handleUpdateOp(idx, { department: val })}>
                            <SelectTrigger className="h-9 border-none bg-slate-100/50 text-[10px] font-bold uppercase rounded-lg px-3">
                              <SelectValue placeholder="Dept..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg shadow-xl">
                              {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="text-[10px] font-bold uppercase">{d}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-2">
                           <div className="flex gap-2">
                             <DatePicker value={op.startDate} onChange={(val) => handleUpdateOp(idx, { startDate: val })} className="h-7 w-28 text-[8px] border-none shadow-none" />
                             <DatePicker value={op.endDate} onChange={(val) => handleUpdateOp(idx, { endDate: val })} className="h-7 w-28 text-[8px] border-none shadow-none" />
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <DatePicker value={op.actualStartDate} onChange={(val) => handleUpdateOp(idx, { actualStartDate: val })} className="h-7 w-28 text-[8px] border-none bg-emerald-50/30 shadow-none" placeholder="Actual Start" />
                          <DatePicker value={op.actualEndDate} onChange={(val) => handleUpdateOp(idx, { actualEndDate: val })} className="h-7 w-28 text-[8px] border-none bg-emerald-50/30 shadow-none" placeholder="Actual End" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-200">
                          {getDuration(op.startDate, op.endDate)}d
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="h-9 text-center font-bold text-xs bg-slate-50 border-none rounded-lg" 
                          value={op.progress || 0} 
                          onChange={(e) => handleUpdateOp(idx, { progress: Number(e.target.value) })} 
                        />
                      </TableCell>
                      <TableCell className="text-center px-4">
                        <Select value={op.status} onValueChange={(val: any) => handleUpdateOp(idx, { status: val })}>
                          <SelectTrigger className={cn("h-9 border-none rounded-lg text-[9px] font-bold uppercase shadow-sm", STATUS_OPTIONS.find(o => o.label === op.status)?.color)}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg shadow-2xl">
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.label} value={opt.label} className="text-[10px] font-bold uppercase">{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right px-10">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => saveRouting(operations.filter(o => o.id !== op.id))}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {operations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                           <LayoutGrid className="h-16 w-16 text-slate-300 mb-6" />
                           <p className="text-[#001F3D] font-headline font-bold text-xl uppercase tracking-tight">Sequence Matrix Offline</p>
                           <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto font-medium">Select a routing node from the menu to initialize production planning.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="h-[600px] flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 rounded-[3rem] px-4">
          <div className="p-12 bg-slate-100 rounded-full mb-10 shadow-inner">
            <Target className="h-24 w-24 text-slate-300" />
          </div>
          <h4 className="text-3xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Node Target Required</h4>
          <p className="text-sm text-slate-400 mt-4 max-w-sm mx-auto font-medium leading-relaxed">Identify a Work Order thread from the registry to initialize the operational execution matrix and sequential planning logic.</p>
        </div>
      )}
    </div>
  );
}
