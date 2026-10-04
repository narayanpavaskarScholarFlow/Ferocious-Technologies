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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('entry');
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedResourceId, setSelectedResource] = useState('');
  const [activityType, setActivityType] = useState('Production');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState(currentUser || '');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const currentUserData = useMemo(() => users.find(u => u.name === currentUser || u.email === currentUser), [users, currentUser]);
  const isHRAdmin = useMemo(() => currentUser === 'Master Admin' || currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager', [currentUser, currentUserData]);
  const isReportingManager = useMemo(() => currentUser ? users.some(u => u.reportingManager === currentUser) : false, [users, currentUser]);
  const isAuthorizedToApprove = isHRAdmin || isReportingManager;

  const pendingApprovalsCount = useMemo(() => logs.filter(l => l.status === 'Submitted').length, [logs]);

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

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1500px] mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <ClipboardList className="h-4 w-4" />
            Operational Command Hub
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">Work Log Entry</h2>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4">
          <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
            <TabsTrigger value="entry" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Entry Protocol</TabsTrigger>
            <TabsTrigger value="ledger" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Historical Ledger</TabsTrigger>
            {isAuthorizedToApprove && <TabsTrigger value="approvals" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white transition-all">Certifications</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="entry" className="m-0 space-y-10">
           <div className="px-4">
              <Card className="p-10 bg-white border-slate-200 shadow-2xl rounded-[2.5rem] space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500">Protocol Date</Label><DatePicker value={selectedDate} onChange={setSelectedDate} className="h-14" /></div>
                    <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500">Work Order Thread</Label><Select value={selectedOrderId} onValueChange={setSelectedOrderId}><SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue placeholder="Identify WO..." /></SelectTrigger><SelectContent className="rounded-xl">{orders.map(o => <SelectItem key={o.id} value={o.id} className="text-xs font-bold uppercase">WO #{o.id} - {o.customer}</SelectItem>)}</SelectContent></Select></div>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500">Resource Node</Label><Select value={selectedResourceId} onValueChange={setSelectedResource}><SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold uppercase"><SelectValue placeholder="Identify Asset..." /></SelectTrigger><SelectContent className="rounded-xl">{machines.map(m => <SelectItem key={m.id} value={m.id} className="text-xs font-bold uppercase">{m.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-slate-500">Duration (h)</Label><Input placeholder="0.0" className="h-14 bg-slate-50 border-none text-center font-display font-bold text-xl" value={duration} onChange={(e)=>setDuration(e.target.value)} /></div>
                 </div>
                 <Button className="h-16 w-full bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase text-[11px] shadow-xl" onClick={handleSaveLog}>Commit to Daily Ledger</Button>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="ledger" className="m-0 px-4">
           <Card className="overflow-hidden border-slate-200 bg-white shadow-xl rounded-2xl">
              <Table>
                 <TableHeader className="bg-slate-50/50">
                    <TableRow><TableHead className="px-8 py-5 text-[10px] font-bold uppercase">Date</TableHead><TableHead className="text-[10px] font-bold uppercase">Work Order</TableHead><TableHead className="text-[10px] font-bold uppercase">Resource</TableHead><TableHead className="text-[10px] font-bold uppercase text-center">Hours</TableHead></TableRow>
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
        </TabsContent>

        <TabsContent value="approvals" className="m-0 px-4">
           <LogApprovalMatrix logs={logs} users={users} currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
