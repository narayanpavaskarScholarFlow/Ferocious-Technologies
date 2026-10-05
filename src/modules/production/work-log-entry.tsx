
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Plus, 
  History, 
  Clock, 
  User, 
  Cpu, 
  Save, 
  Hash, 
  Archive, 
  CalendarDays, 
  ChevronRight, 
  ChevronLeft,
  Zap,
  TrendingUp,
  CheckCircle2,
  FileCheck,
  Lock,
  Edit2,
  Trash2,
  Search,
  X,
  ShieldAlert,
  Send,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { WorkLogEntry as WorkLogEntryType, Machine, SystemUser, Order, UserLeave } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { LogApprovalMatrix } from '@/modules/administration/log-approval-matrix';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkLogEntryProps {
  logs: WorkLogEntryType[];
  onAddLog: (log: WorkLogEntryType) => void;
  onDeleteLog?: (id: string) => void;
  machines: Machine[];
  users: SystemUser[];
  orders: Order[];
  currentUser: string | null;
}

export function WorkLogEntry({ logs, onAddLog, onDeleteLog, machines, users, orders, currentUser }: WorkLogEntryProps) {
  const db = useFirestore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedResourceId, setSelectedResource] = useState('');
  const [activityType, setActivityType] = useState('Production');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState(currentUser || '');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const currentUserData = useMemo(() => users.find(u => u.name === currentUser || u.email === currentUser), [users, currentUser]);
  const isReportingManager = useMemo(() => currentUser ? users.some(u => u.reportingManager === currentUser) : false, [users, currentUser]);
  const isAuthorizedToApprove = currentUser === 'Master Admin' || isReportingManager;

  const dailyStats = useMemo(() => {
    const formattedTargetDate = new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayLogs = logs.filter(l => l.date === formattedTargetDate && l.operator === operator);
    const totalHours = dayLogs.reduce((acc, curr) => acc + (parseFloat(curr.duration) || 0), 0);
    return { totalHours, dayLogs, isSubmitted: dayLogs.some(l => l.status === 'Submitted') };
  }, [logs, selectedDate, operator]);

  const handleSaveLog = () => {
    if (!selectedResourceId || !selectedOrderId || !duration) { toast({ variant: "destructive", title: "Protocol Interrupted" }); return; }
    const resource = machines.find(m => m.id === selectedResourceId) || users.find(u => u.id === selectedResourceId);
    const logData: WorkLogEntryType = {
      id: editingLogId || `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      resourceId: selectedResourceId,
      resourceName: resource ? resource.name : `Resource ${selectedResourceId}`,
      operator: operator || 'System User',
      operatorId: currentUserData?.id || '',
      date: new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift: 'Morning', type: activityType as any, duration: `${duration}h`, activity: description || 'Routine operation', workOrderId: selectedOrderId, status: 'Draft'
    };
    onAddLog(logData);
    toast({ title: "Log Synchronized" });
    setDuration(''); setSelectedResource(''); setEditingLogId(null);
  };

  const LogCard = ({ log }: { log: WorkLogEntryType }) => (
    <Card className="p-5 bg-white border-slate-200 rounded-3xl shadow-sm space-y-4">
       <div className="flex justify-between items-start">
          <Badge variant="outline" className="font-code text-[10px] font-bold text-primary border-primary/20 bg-primary/5">#{log.workOrderId}</Badge>
          <span className="text-xl font-display font-black text-[#001F3D]">{log.duration}</span>
       </div>
       <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-700 uppercase">{log.resourceName}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">{log.type} • {log.date}</p>
       </div>
       <p className="text-[10px] text-slate-500 italic line-clamp-2">"{log.activity}"</p>
       <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
          <Badge className={cn("text-[8px] font-bold uppercase", log.status === 'Approved' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>{log.status}</Badge>
          {log.status === 'Draft' && (
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => onDeleteLog?.(log.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )}
       </div>
    </Card>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1500px] mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <ClipboardList className="h-4 w-4" />
            Operational Hub
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Work Log Entry</h2>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4">
          <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
            <TabsTrigger value="entry" className="rounded-full px-6 md:px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Entry</TabsTrigger>
            <TabsTrigger value="ledger" className="rounded-full px-6 md:px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Ledger</TabsTrigger>
            {isAuthorizedToApprove && <TabsTrigger value="approvals" className="rounded-full px-6 md:px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Approval</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="entry" className="m-0 space-y-10 px-4">
          <Card className="p-6 md:p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Protocol Date</Label><DatePicker value={selectedDate} onChange={setSelectedDate} className="h-14" /></div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase text-slate-500">Work Order Thread</Label>
                   <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                      <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold uppercase shadow-inner"><SelectValue placeholder="Identify WO..." /></SelectTrigger>
                      <SelectContent className="rounded-xl">{orders.map(o => <SelectItem key={o.id} value={o.id} className="text-[10px] font-bold uppercase">WO #{o.id} - {o.customer}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase text-slate-500">Resource Node</Label>
                   <Select value={selectedResourceId} onValueChange={setSelectedResource}>
                      <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold uppercase shadow-inner"><SelectValue placeholder="Identify Asset..." /></SelectTrigger>
                      <SelectContent className="rounded-xl">{machines.map(m => <SelectItem key={m.id} value={m.id} className="text-[10px] font-bold uppercase">{m.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Duration (h)</Label><Input placeholder="0.0" className="h-14 bg-slate-50 border-none text-center font-display font-bold text-xl rounded-xl shadow-inner" value={duration} onChange={(e)=>setDuration(e.target.value)} /></div>
             </div>
             <Button className="h-16 w-full bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[11px] shadow-xl" onClick={handleSaveLog}>Commit to Daily Ledger</Button>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="m-0 px-4 space-y-6">
           {isMobile ? (
             <div className="grid grid-cols-1 gap-6">
                {logs.filter(l => l.operator === operator).map(log => <LogCard key={log.id} log={log} />)}
             </div>
           ) : (
             <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
                <Table>
                   <TableHeader className="bg-slate-50/50">
                      <TableRow><TableHead className="px-8 py-5 text-[10px] font-bold uppercase">Date</TableHead><TableHead className="text-[10px] font-bold uppercase">WO</TableHead><TableHead className="text-[10px] font-bold uppercase">Resource</TableHead><TableHead className="text-center text-[10px] font-bold uppercase">Hours</TableHead></TableRow>
                   </TableHeader>
                   <TableBody>{logs.map(l => (
                     <TableRow key={l.id} className="h-20 border-slate-50 hover:bg-slate-50/30">
                        <TableCell className="px-8 font-bold text-[10px] text-slate-400">{l.date}</TableCell>
                        <TableCell className="font-bold text-primary uppercase">#{l.workOrderId}</TableCell>
                        <TableCell className="font-bold text-slate-700 uppercase">{l.resourceName}</TableCell>
                        <TableCell className="text-center font-display font-bold text-lg">{l.duration}</TableCell>
                     </TableRow>
                   ))}</TableBody>
                </Table>
             </Card>
           )}
        </TabsContent>

        <TabsContent value="approvals" className="m-0 px-4">
           <LogApprovalMatrix logs={logs} users={users} currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
