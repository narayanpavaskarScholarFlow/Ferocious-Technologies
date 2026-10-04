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
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2,
  FileCheck,
  LayoutGrid,
  Lock,
  Edit2,
  Trash2,
  Filter,
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
import { LogApprovalMatrix } from '@/components/log-approval-matrix';

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
  
  // Entry Form State
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedResourceId, setSelectedResource] = useState('');
  const [activityType, setActivityType] = useState('Production');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState(currentUser || '');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Ledger Filter State
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterOrderId, setFilterOrderId] = useState<string>('all');
  const [filterResourceId, setFilterResource] = useState<string>('all');

  // Fetch Leaves to block dates
  const leavesQuery = useMemoFirebase(() => collection(db, 'leaves'), [db]);
  const { data: leavesData } = useCollection<UserLeave>(leavesQuery);
  const leaves = leavesData || [];

  const currentUserData = useMemo(() => {
    return users.find(u => u.name === currentUser || u.email === currentUser);
  }, [users, currentUser]);

  const isHRAdmin = useMemo(() => {
    return currentUser === 'Master Admin' || currentUserData?.role === 'HR' || currentUserData?.role === 'HR Manager';
  }, [currentUser, currentUserData]);

  const isReportingManager = useMemo(() => {
    if (!currentUser) return false;
    return users.some(u => u.reportingManager === currentUser);
  }, [users, currentUser]);

  const isAuthorizedToApprove = isHRAdmin || isReportingManager;

  const pendingApprovalsCount = useMemo(() => {
    return logs.filter(l => {
      const isSubmitted = l.status === 'Submitted';
      if (!isSubmitted) return false;
      if (isHRAdmin) return true;
      const operatorUser = users.find(u => u.id === l.operatorId || u.name === l.operator);
      return operatorUser?.reportingManager === currentUser;
    }).length;
  }, [logs, isHRAdmin, users, currentUser]);

  useEffect(() => {
    if (currentUser && !operator) {
      setOperator(currentUser);
    }
  }, [currentUser, operator]);

  // Check if current user is on leave for selected date
  const isUserOnLeave = useMemo(() => {
    if (!currentUserData || !selectedDate) return false;
    const target = new Date(selectedDate);
    target.setHours(0,0,0,0);

    return leaves.some(l => {
      if (l.userId !== currentUserData.id || l.status !== 'Approved') return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      return target >= start && target <= end;
    });
  }, [leaves, currentUserData, selectedDate]);

  // Calculate Daily Totals
  const dailyStats = useMemo(() => {
    const formattedTargetDate = new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayLogs = logs.filter(l => 
      l.date === formattedTargetDate &&
      l.operator === operator
    );
    
    const totalHours = dayLogs.reduce((acc, curr) => {
      return acc + (parseFloat(curr.duration) || 0);
    }, 0);

    const isSubmitted = dayLogs.some(l => l.status === 'Submitted' || l.status === 'Approved');
    const isOT = totalHours > 9;
    const otHours = isOT ? totalHours - 9 : 0;

    return { totalHours, isOT, otHours, count: dayLogs.length, dayLogs, isSubmitted };
  }, [logs, selectedDate, operator]);

  // Global Ledger Filtering Logic
  const filteredLedgerLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesDate = !filterDate || log.date === new Date(filterDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const matchesOrder = filterOrderId === 'all' || log.workOrderId === filterOrderId;
      const matchesResource = filterResourceId === 'all' || log.resourceId === filterResourceId;
      return matchesDate && matchesOrder && matchesResource;
    });
  }, [logs, filterDate, filterOrderId, filterResourceId]);

  const handleDateChangeAttempt = (newDate: string) => {
    setSelectedDate(newDate);
    setStep(1);
  };

  const handleSaveLog = () => {
    if (dailyStats.isSubmitted) {
      toast({ variant: "destructive", title: "Temporal Lock Active", description: "This date has been formally submitted and is locked for entry." });
      return;
    }

    if (!selectedResourceId || !selectedOrderId || !duration) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Work Order, Resource, and Duration are required for ledger entry.",
      });
      return;
    }

    const resource = machines.find(m => m.id === selectedResourceId) || users.find(u => u.id === selectedResourceId);
    
    const logData: WorkLogEntryType = {
      id: editingLogId || `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      resourceId: selectedResourceId,
      resourceName: resource ? resource.name : `Resource ${selectedResourceId}`,
      operator: operator || 'System User',
      operatorId: currentUserData?.id || '',
      date: new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift: 'Morning',
      type: activityType as any,
      duration: `${duration}h`,
      activity: description || 'Routine operation recorded',
      workOrderId: selectedOrderId,
      status: 'Draft'
    };

    onAddLog(logData);
    
    toast({
      title: editingLogId ? "Entry Updated" : "Log Synchronized",
      description: `Entry for WO #${selectedOrderId} committed to master ledger.`,
    });

    setDuration('');
    setDescription('');
    setSelectedResource('');
    setEditingLogId(null);
  };

  const handleFinalSubmit = () => {
    if (dailyStats.totalHours < 9) {
      toast({ variant: "destructive", title: "Baseline Deficit", description: "Protocol requires 9.0h baseline for final submission." });
      return;
    }

    dailyStats.dayLogs.forEach(log => {
      const isOT = dailyStats.totalHours > 9;
      updateDocumentNonBlocking(doc(db, 'work_logs', log.id), { 
        status: 'Submitted',
        isOT: isOT,
        otHours: isOT ? dailyStats.otHours : 0
      });
    });

    toast({
      title: "Protocol Transmitted",
      description: "Daily matrix submitted to Reporting Manager for certification.",
    });
  };

  const handleEdit = (log: WorkLogEntryType) => {
    if (log.status !== 'Draft') {
      toast({ variant: "destructive", title: "Authorization Failure", description: "Locked entries cannot be modified without manager reversal." });
      return;
    }

    setEditingLogId(log.id);
    setSelectedOrderId(log.workOrderId || '');
    setSelectedResource(log.resourceId);
    setActivityType(log.type);
    setDuration(log.duration.replace('h', ''));
    setDescription(log.activity);
    
    setActiveTab('entry');
    setStep(2); 
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({ title: "Edit Protocol Active", description: "Log details loaded into entry matrix." });
  };

  const handleDelete = (id: string) => {
    const log = logs.find(l => l.id === id);
    if (log && log.status !== 'Draft') {
      toast({ variant: "destructive", title: "Archive Lock Active", description: "Formalized logs cannot be purged from the ledger." });
      return;
    }

    if (onDeleteLog) {
      onDeleteLog(id);
      toast({ variant: "destructive", title: "Entry Purged", description: "Operation node removed from daily ledger." });
    }
  };

  const resetFilters = () => {
    setFilterDate('');
    setFilterOrderId('all');
    setFilterResource('all');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1500px] mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <ClipboardList className="h-4 w-4" />
            Operational Command Matrix
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Work Log <span className="text-slate-400 font-medium">Protocol Hub</span>
          </h2>
          <p className="text-muted-foreground font-medium">Sequential 9.0h baseline entry with automated OT calculation.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Badge variant="outline" className={cn(
             "h-12 px-6 font-display text-lg font-bold border-none rounded-2xl shadow-xl",
             dailyStats.totalHours >= 9 ? "bg-emerald-600 text-white" : "bg-[#001F3D] text-white"
           )}>
             {dailyStats.totalHours.toFixed(1)} / 9.0h
           </Badge>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4">
          <TabsList className="bg-slate-100 p-1.5 rounded-full mb-10 h-14 inline-flex border border-slate-200 shadow-sm gap-2">
            <TabsTrigger value="entry" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
              <Zap className="h-3.5 w-3.5 mr-2" /> Entry Protocol
            </TabsTrigger>
            <TabsTrigger value="ledger" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all">
              <History className="h-3.5 w-3.5 mr-2" /> Historical Matrix
            </TabsTrigger>
            {isAuthorizedToApprove && (
              <TabsTrigger value="approvals" className="rounded-full px-10 h-11 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-[#001F3D] data-[state=active]:text-white shadow-sm transition-all relative">
                <UserCheck className="h-3.5 w-3.5 mr-2" /> Certifications
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] border-2 border-white animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="entry" className="m-0 space-y-10">
          <div className="px-4">
            <Card className={cn(
              "text-white border-none shadow-2xl rounded-[2rem] overflow-hidden group transition-all duration-500",
              isUserOnLeave ? "bg-red-900 animate-pulse" : "bg-[#001F3D]"
            )}>
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.4em]">Capacity Matrix</p>
                    <h4 className="text-xl font-display font-bold uppercase tracking-tight leading-none flex items-center gap-3">
                      {operator}
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold uppercase px-3 py-1">LIVE_SYNC</Badge>
                    </h4>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block" />
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Cumulative Yield</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-display font-bold tracking-tighter">
                        {dailyStats.totalHours.toFixed(1)} 
                        <span className="text-lg text-white/20 ml-2">/ 9.0h</span>
                      </p>
                      {dailyStats.isOT && (
                        <Badge className="bg-emerald-50 text-white border-none font-bold uppercase text-[8px] px-3 py-1 rounded-full animate-pulse shadow-lg shadow-emerald-500/30 mb-1">
                          OT ACTIVE (+{dailyStats.otHours.toFixed(1)}h)
                        </Badge>
                      )}
                      {dailyStats.isSubmitted && (
                        <Badge className="bg-blue-500 text-white border-none font-bold uppercase text-[8px] px-3 py-1 rounded-full shadow-lg shadow-blue-500/30 mb-1">
                          SUBMITTED & LOCKED
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md w-full space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                    <span>Baseline Mandate Progress</span>
                    <span>{((dailyStats.totalHours / 9) * 100).toFixed(0)}% Utilized</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        dailyStats.totalHours >= 9 ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" : "bg-primary"
                      )}
                      style={{ width: `${Math.min((dailyStats.totalHours / 9) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 max-w-xs bg-white/5 p-4 rounded-2xl border border-white/5">
                  <ShieldAlert className={cn("h-4 w-4 shrink-0 mt-0.5", isUserOnLeave ? "text-white" : "text-primary")} />
                  <p className="text-[10px] text-white/50 font-medium leading-tight">
                    <b className="text-white/80">Security Protocol:</b> {isUserOnLeave ? "Leave detected for this identity. Temporal entry disabled." : "Submission locks logs. Ensure data fidelity before final commit."}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {!isUserOnLeave ? (
            <div className="px-4 space-y-10">
              <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#001F3D 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 space-y-12">
                  {step === 1 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><CalendarDays className="h-7 w-7" /></div>
                        <div>
                          <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 01: Context Selection</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Identify the operational window and production thread.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Protocol Date</Label>
                          <DatePicker 
                            value={selectedDate}
                            onChange={handleDateChangeAttempt}
                            className="h-16 rounded-2xl text-lg font-display"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Work Order / Account</Label>
                          <Select value={selectedOrderId} onValueChange={setSelectedOrderId} disabled={dailyStats.isSubmitted}>
                            <SelectTrigger className="h-16 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase shadow-inner">
                              <SelectValue placeholder="Identify Production Thread..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                              {orders.map(order => (
                                <SelectItem key={order.id} value={order.id} className="text-xs font-bold uppercase py-4">
                                  WO #{order.id} — {order.customer}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        disabled={!selectedOrderId || dailyStats.isSubmitted}
                        className="h-16 px-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl group"
                        onClick={() => setStep(2)}
                      >
                        {dailyStats.isSubmitted ? "Date Locked" : "Proceed to Matrix Entry"} 
                        {!dailyStats.isSubmitted && <ChevronRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />}
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 border-l-4 border-accent pl-6">
                          <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Zap className="h-7 w-7" /></div>
                          <div>
                            <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Step 02: Ledger Entry</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recording for WO #{selectedOrderId} on {selectedDate}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-10 rounded-xl text-slate-400 font-bold uppercase text-[9px] hover:text-[#001F3D]" onClick={() => { setStep(1); setEditingLogId(null); }}>
                          <ChevronLeft className="mr-2 h-4 w-4" /> Change Selection
                        </Button>
                      </div>

                      <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Resource Node</Label>
                            <Select onValueChange={setSelectedResource} value={selectedResourceId} disabled={dailyStats.isSubmitted}>
                              <SelectTrigger className="h-14 bg-slate-50 border-none text-sm font-bold uppercase rounded-2xl shadow-inner">
                                <SelectValue placeholder="Identify Resource..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                <div className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b mb-1">Industrial Fleet</div>
                                {machines.map(m => <SelectItem key={m.id} value={m.id} className="text-xs font-bold uppercase">{m.name} ({m.mcNumber})</SelectItem>)}
                                <div className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b my-1">Personnel Node</div>
                                {users.map(u => <SelectItem key={u.id} value={u.id} className="text-xs font-bold uppercase">{u.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Duration (Hours)</Label>
                            <div className="relative">
                              <Input 
                                disabled={dailyStats.isSubmitted}
                                placeholder="e.g. 4.5" 
                                className="h-14 bg-slate-50 border-none text-center text-xl font-display font-bold rounded-2xl shadow-inner focus-visible:ring-primary/20"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                              />
                              <Clock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Activity Classification</Label>
                          <Select value={activityType} onValueChange={setActivityType} disabled={dailyStats.isSubmitted}>
                            <SelectTrigger className="h-14 bg-slate-50 border-none text-sm font-bold uppercase rounded-2xl shadow-inner">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Production" className="text-xs font-bold uppercase">Production Cycle</SelectItem>
                              <SelectItem value="Setup" className="text-xs font-bold uppercase">Machine Setup</SelectItem>
                              <SelectItem value="Maintenance" className="text-xs font-bold uppercase">Maintenance Window</SelectItem>
                              <SelectItem value="Idle" className="text-xs font-bold uppercase">Idle / Standby</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Functional Description</Label>
                          <Textarea 
                            disabled={dailyStats.isSubmitted}
                            placeholder="Detailed technical observations and operational notes..." 
                            className="min-h-[220px] bg-slate-50 border-none py-6 px-6 text-xs font-bold rounded-2xl shadow-inner resize-none focus-visible:ring-primary/20 leading-relaxed"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400" onClick={() => { setStep(1); setEditingLogId(null); }}>Abort</Button>
                        <Button 
                          disabled={dailyStats.isSubmitted}
                          className="flex-[2] h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/20 flex gap-4 group"
                          onClick={handleSaveLog}
                        >
                          <Save className="h-5 w-5" /> {editingLogId ? 'Update Ledger Entry' : 'Commit to Ledger'}
                          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Daily Log Summary Matrix */}
              <Card className="p-12 bg-white border-slate-200/60 shadow-2xl rounded-[3rem] overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-600/20"><FileCheck className="h-10 w-10" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Daily Log Summary Matrix</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Current Session: {selectedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirement:</span>
                        <Badge className={cn(
                          "text-[10px] font-bold uppercase px-6 py-2 rounded-full border shadow-sm",
                          dailyStats.totalHours >= 9 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {dailyStats.totalHours >= 9 ? 'Baseline Satisfied' : `Deficit: ${(9 - dailyStats.totalHours).toFixed(1)}h Remaining`}
                        </Badge>
                     </div>
                     {!dailyStats.isSubmitted && dailyStats.totalHours >= 9 && (
                       <Button 
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 h-14 font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-600/20 flex gap-3 animate-bounce"
                        onClick={handleFinalSubmit}
                       >
                         <Send className="h-4 w-4" /> Final Submit Protocol
                       </Button>
                     )}
                     {dailyStats.isSubmitted && (
                       <Badge className="mt-4 bg-blue-500 text-white border-none rounded-xl px-8 h-12 flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest">
                         <Lock className="h-4 w-4" /> Entry Archive Locked
                       </Badge>
                     )}
                  </div>
                </div>

                <div className="overflow-x-auto -mx-2">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent border-b-2 border-slate-100">
                        <TableHead className="text-[11px] font-bold uppercase text-slate-400 py-6 px-10 w-32">WO Identity</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase text-slate-400">Resource Node</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase text-slate-400">Classification</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase text-center w-32">Duration</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase text-center w-32">State</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase pl-10">Technical Observation</TableHead>
                        <TableHead className="text-right pr-10 w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyStats.dayLogs.map((log) => (
                        <TableRow key={log.id} className="border-b border-slate-50 h-24 hover:bg-slate-50/50 transition-all group">
                          <TableCell className="px-10">
                            <Badge variant="outline" className="font-code text-xs font-bold text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-lg">
                              #{log.workOrderId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Cpu className="h-5 w-5" /></div>
                              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{log.resourceName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-100 bg-white py-1.5 px-4 rounded-full text-slate-500">{log.type}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xl font-display font-bold text-[#001F3D]">{log.duration}</span>
                          </TableCell>
                          <TableCell className="text-center">
                             <Badge className={cn(
                               "text-[9px] font-bold uppercase px-3",
                               log.status === 'Approved' ? "bg-green-50 text-green-700" :
                               log.status === 'Submitted' ? "bg-blue-50 text-blue-700" :
                               "bg-slate-50 text-slate-400"
                             )}>
                               {log.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="pl-10">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md line-clamp-2 italic">
                              "{log.activity}"
                            </p>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            {!dailyStats.isSubmitted && (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-slate-300 hover:text-primary rounded-xl"
                                  onClick={() => handleEdit(log)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-xl"
                                  onClick={() => handleDelete(log.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {dailyStats.isSubmitted && <Lock className="h-4 w-4 text-slate-200 ml-auto" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          ) : (
            <div className="px-4 py-32 flex flex-col items-center justify-center opacity-30 text-center">
               <div className="p-20 bg-slate-50 rounded-[4rem] mb-10">
                 <ShieldAlert className="h-32 w-32 text-red-600" />
               </div>
               <h4 className="text-4xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Temporal Entry Disabled</h4>
               <p className="text-lg text-slate-400 mt-4 max-w-lg mx-auto font-medium leading-relaxed">
                 An approved leave application has been detected for this identity on the selected date. System security prevents operational logging during absence nodes.
               </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ledger" className="m-0 px-4 space-y-8">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
              <div className="space-y-2 flex-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Temporal Node (Date)</Label>
                <DatePicker 
                  value={filterDate} 
                  onChange={setFilterDate} 
                  placeholder="All Dates"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Work Order Thread</Label>
                <Select value={filterOrderId} onValueChange={setFilterOrderId}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="all" className="text-[10px] font-bold uppercase">All Projects</SelectItem>
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.id} className="text-[10px] font-bold uppercase">WO #{o.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Asset Node (Machine/User)</Label>
                <Select value={filterResourceId} onValueChange={setFilterResource}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase shadow-inner">
                    <SelectValue placeholder="All Assets" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="all" className="text-[10px] font-bold uppercase">All Assets</SelectItem>
                    {machines.map(m => <SelectItem key={m.id} value={m.id} className="text-[10px] font-bold uppercase">{m.name}</SelectItem>)}
                    {users.map(u => <SelectItem key={u.id} value={u.id} className="text-[10px] font-bold uppercase">{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" onClick={resetFilters} className="h-12 px-6 rounded-xl text-slate-400 hover:text-red-500 font-bold uppercase text-[9px] gap-2">
                <X className="h-3 w-3" /> Clear Matrix
              </Button>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 py-6 px-10 w-40">Date</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400 w-32">WO Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Resource Node</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Operator</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center w-32">Yield</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-center w-32">State</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase text-slate-400">Activity</TableHead>
                    <TableHead className="text-right px-10 w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgerLogs.map((log) => (
                    <TableRow key={log.id} className="h-20 border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="px-10">
                        <span className="text-[10px] font-code font-bold text-slate-500">{log.date}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-code text-[10px] font-bold text-primary border-primary/20 bg-primary/5">
                          #{log.workOrderId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Cpu className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-700 uppercase">{log.resourceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-medium text-slate-500 uppercase">{log.operator}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-display font-bold text-[#001F3D]">{log.duration}</span>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge className={cn(
                           "text-[8px] font-bold uppercase px-3 py-1 rounded-full",
                           log.status === 'Approved' ? "bg-emerald-50 text-emerald-700" :
                           log.status === 'Submitted' ? "bg-blue-50 text-blue-700" :
                           "bg-slate-50 text-slate-400"
                         )}>
                           {log.status}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic max-w-[200px]">"{log.activity}"</p>
                      </TableCell>
                      <TableCell className="text-right px-10">
                        {log.status === 'Draft' && (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-300 hover:text-primary rounded-xl"
                              onClick={() => handleEdit(log)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-xl"
                              onClick={() => handleDelete(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {log.status !== 'Draft' && <Lock className="h-3 w-3 text-slate-200 ml-auto" />}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLedgerLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-20 py-10">
                          <Archive className="h-16 w-16 text-slate-300 mb-4" />
                          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Matrix Query Null</p>
                          <p className="text-[10px] text-slate-300 mt-2 font-medium">No operational nodes matched the current filter parameters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="m-0 px-4">
          <LogApprovalMatrix 
            logs={logs}
            users={users}
            currentUser={currentUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
