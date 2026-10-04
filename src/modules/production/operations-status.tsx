"use client";

import { useState, useMemo } from 'react';
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
  CheckCircle2, 
  Clock, 
  User, 
  Target, 
  Building2, 
  CalendarDays, 
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  ClipboardList,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, RoutingOperation, SystemUser, Machine } from '@/lib/types';
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO, isValid, isAfter } from 'date-fns';

const INITIAL_STEPS = [
  "DFM Analysis",
  "Concept Design",
  "3D Modelling",
  "Design Review",
  "Customer Review",
  "Design Revision",
  "Final Design Release",
  "Raw Material Procurement",
  "Pre-machining", 
  "CNC Turning", 
  "VMC Milling", 
  "Heat Treatment", 
  "1st Grinding", 
  "2nd Grinding", 
  "Hard Part Milling", 
  "EDM / WEDM", 
  "Quality Control (QC)", 
  "Assembly",
  "Packaging & Release"
];

const STATUS_OPTIONS = [
  { label: "Yet To Start", color: "text-slate-500 bg-slate-100 border-slate-200" },
  { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
  { label: "On Hold", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "NA", color: "text-slate-300 bg-slate-50 border-slate-100" },
];

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
      ? Math.round((completed / activeOps.length) * 100) 
      : 0;

    return { total: activeOps.length, completed, pending, delayed, progress };
  }, [operations]);

  const saveRouting = (newRouting: RoutingOperation[]) => {
    if (!selectedWorkOrder) return;
    
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
    newRouting[idx] = { ...newRouting[idx], ...updates };
    saveRouting(newRouting);
  };

  const handleAddOp = () => {
    if (!newOpName) return;
    const newOp: RoutingOperation = {
      id: `OP-${Date.now()}`,
      name: newOpName,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: "Yet To Start",
      progress: 0,
      subTasks: []
    };
    saveRouting([...operations, newOp]);
    setNewOpName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#001F3D] dark:bg-primary rounded-2xl text-white dark:text-card shadow-xl">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Execution Control Matrix</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Master Routing & Sequential Yield</p>
          </div>
        </div>
        
        <Select 
          value={selectedWorkOrder || undefined} 
          onValueChange={(val) => { setSelectedWorkOrder(val); onOrderIdChange?.(val); }}
        >
          <SelectTrigger className="w-full md:w-[350px] h-12 bg-white dark:bg-card border-slate-200 dark:border-border rounded-xl text-[10px] font-black uppercase shadow-sm">
            <SelectValue placeholder="Identify Work Order Thread..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 dark:border-border shadow-2xl">
            {orders.map(o => (
              <SelectItem key={o.id} value={o.id} className="text-[10px] font-bold uppercase py-3">WO #{o.id} - {o.customer}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {orderData ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 p-10 bg-[#001F3D] dark:bg-card text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none transition-opacity" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-6">
                   <div>
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-4 mb-3">Operational_Context_Active</Badge>
                      <h3 className="text-5xl font-display font-black tracking-tighter uppercase leading-none">#{orderData.id}</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                      <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-white/20" /><span className="text-[11px] font-bold text-white/60 uppercase">{orderData.customer}</span></div>
                      <div className="flex items-center gap-3"><User className="h-4 w-4 text-white/20" /><span className="text-[11px] font-bold text-white/60 uppercase">{orderData.owner}</span></div>
                      <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-white/20" /><span className="text-[10px] font-code font-bold text-white/40">{orderData.startDate} — {orderData.endDate}</span></div>
                      <div className="flex items-center gap-3"><Rocket className="h-4 w-4 text-white/20" /><span className="text-[11px] font-bold text-white/60 uppercase">{orderData.typeOfWork}</span></div>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Aggregate Yield</p>
                   <div className="text-7xl font-display font-black text-primary tracking-tighter">{summary.progress}%</div>
                </div>
              </div>
              <div className="mt-12 space-y-4 relative z-10">
                 <div className="h-3 bg-white/5 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.5)]" style={{ width: `${summary.progress}%` }} />
                 </div>
              </div>
            </Card>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
               {[
                 { label: 'Total Nodes', val: summary.total, icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
                 { label: 'Completed', val: summary.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
                 { label: 'Pending', val: summary.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/50 dark:bg-amber-900/10' },
                 { label: 'Delayed', val: summary.delayed, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50/50 dark:bg-rose-900/10' },
               ].map((item) => (
                 <Card key={item.label} className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm rounded-3xl flex flex-col justify-between group hover:border-primary transition-all">
                    <div className={cn("p-2.5 rounded-xl w-fit mb-4 transition-transform group-hover:scale-110 shadow-sm", item.bg, item.color)}>
                       <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                       <p className={cn("text-3xl font-display font-black mt-1", item.color)}>{item.val}</p>
                    </div>
                 </Card>
               ))}
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 dark:border-border bg-white dark:bg-card shadow-2xl rounded-[2.5rem]">
            <div className="p-10 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#001F3D] dark:bg-primary rounded-xl text-white dark:text-card shadow-lg"><ClipboardList className="h-6 w-6" /></div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#001F3D] dark:text-white uppercase tracking-tight">Routing & Sequential Planning</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Design & Manufacturing Process Node</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <Select value={newOpName} onValueChange={setNewOpName}>
                    <SelectTrigger className="w-full md:w-64 h-12 bg-white dark:bg-slate-900 text-[10px] font-black uppercase rounded-2xl shadow-inner border-none">
                      <SelectValue placeholder="Append sequence node..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {INITIAL_STEPS.map(step => (
                        <SelectItem key={step} value={step} className="text-[10px] font-bold uppercase py-2">{step}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddOp} className="h-12 px-10 bg-[#001F3D] dark:bg-primary hover:bg-black dark:hover:bg-primary/90 text-white dark:text-card text-[10px] font-black uppercase rounded-2xl shadow-2xl flex gap-3 group">
                    <Plus className="h-4 w-4" /> Append Sequence <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[1400px]">
                <TableHeader className="bg-slate-50/80 dark:bg-card border-b border-slate-100 dark:border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase text-slate-400 py-6 px-10 w-24">Seq.</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Operation Identity</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Responsible Node</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-[280px]">Planned Matrix</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-24">Yield %</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-40">Status Node</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-card">
                  {operations.map((op, idx) => (
                    <TableRow key={op.id} className="h-24 border-b border-slate-50 dark:border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all group">
                      <TableCell className="px-10">
                        <span className="text-[13px] font-display font-black text-slate-200 group-hover:text-primary transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                      </TableCell>
                      <TableCell>
                        <Input 
                          className="h-10 border-none bg-transparent font-black text-sm uppercase text-[#001F3D] dark:text-white focus-visible:ring-primary/20" 
                          value={op.name} 
                          onChange={(e) => handleUpdateOp(idx, { name: e.target.value })} 
                        />
                      </TableCell>
                      <TableCell>
                         <Select value={op.responsiblePersonId} onValueChange={(val) => handleUpdateOp(idx, { responsiblePersonId: val, responsiblePersonName: users.find(u => u.id === val)?.name })}>
                            <SelectTrigger className="h-10 border-none bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase rounded-xl px-4 shadow-inner">
                              <SelectValue placeholder="Identify Personnel..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-2xl">
                              <div className="px-2 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b mb-1">Human Capital Registry</div>
                              {users.map(u => <SelectItem key={u.id} value={u.id} className="text-[10px] font-bold uppercase">{u.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center items-center p-1 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-inner">
                          <DatePicker value={op.startDate} onChange={(val) => handleUpdateOp(idx, { startDate: val })} className="h-9 w-32 text-[9px] font-black border-none shadow-none bg-transparent" />
                          <div className="h-4 w-[1px] bg-slate-200 dark:bg-border" />
                          <DatePicker value={op.endDate} onChange={(val) => handleUpdateOp(idx, { endDate: val })} className="h-9 w-32 text-[9px] font-black border-none shadow-none bg-transparent" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          className="h-10 text-center font-display font-bold text-lg bg-slate-50 dark:bg-slate-900 border-none rounded-xl shadow-inner text-primary" 
                          value={op.progress || 0} 
                          onChange={(e) => handleUpdateOp(idx, { progress: Number(e.target.value) })} 
                        />
                      </TableCell>
                      <TableCell className="text-center px-4">
                        <Select value={op.status} onValueChange={(val: any) => handleUpdateOp(idx, { status: val })}>
                          <SelectTrigger className={cn("h-10 border-none rounded-xl text-[10px] font-black uppercase shadow-md transition-all", STATUS_OPTIONS.find(o => o.label === op.status)?.color)}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-2xl">
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.label} value={opt.label} className="text-[10px] font-bold uppercase py-2">{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right px-10">
                         <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl" onClick={() => saveRouting(operations.filter(o => o.id !== op.id))}>
                            <Trash2 className="h-5 w-5" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {operations.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="h-64 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest italic">Routing Matrix Node Offline</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="h-[600px] flex flex-col items-center justify-center opacity-30 text-center border-4 border-dashed border-slate-200 dark:border-border rounded-[4rem] px-4">
          <div className="p-16 bg-slate-50 dark:bg-slate-900 rounded-full mb-12 shadow-inner">
            <Target className="h-32 w-32 text-slate-300" />
          </div>
          <h4 className="text-4xl font-display font-black text-[#001F3D] dark:text-white uppercase tracking-tight">Identity Required</h4>
          <p className="text-sm text-slate-400 mt-6 max-w-md mx-auto font-medium leading-relaxed uppercase tracking-widest">
            Identify an active Work Order thread from the registry above to initialize the operational execution matrix.
          </p>
        </div>
      )}
    </div>
  );
}
