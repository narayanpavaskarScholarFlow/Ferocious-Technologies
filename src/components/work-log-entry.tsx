
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
import { 
  ClipboardList, 
  Plus, 
  History, 
  Clock, 
  User, 
  Cpu, 
  Save, 
  Hash, 
  ArchiveX, 
  CalendarDays, 
  ChevronRight, 
  ChevronLeft,
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { WorkLogEntry as WorkLogEntryType, Machine, SystemUser, Order } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkLogEntryProps {
  logs: WorkLogEntryType[];
  onAddLog: (log: WorkLogEntryType) => void;
  machines: Machine[];
  users: SystemUser[];
  orders: Order[];
  currentUser: string | null;
}

export function WorkLogEntry({ logs, onAddLog, machines, users, orders, currentUser }: WorkLogEntryProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedResourceId, setSelectedResource] = useState('');
  const [activityType, setActivityType] = useState('Production');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState(currentUser || '');

  useEffect(() => {
    if (currentUser) {
      setOperator(currentUser);
    }
  }, [currentUser]);

  // Calculate Daily Totals for the selected date and operator
  const dailyStats = useMemo(() => {
    const dayLogs = logs.filter(l => 
      l.date === new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) &&
      l.operator === operator
    );
    
    const totalHours = dayLogs.reduce((acc, curr) => {
      return acc + (parseFloat(curr.duration) || 0);
    }, 0);

    const isOT = totalHours > 9;
    const otHours = isOT ? totalHours - 9 : 0;

    return { totalHours, isOT, otHours, count: dayLogs.length, dayLogs };
  }, [logs, selectedDate, operator]);

  const handleSaveLog = () => {
    if (!selectedResourceId || !selectedOrderId || !duration) {
      toast({
        variant: "destructive",
        title: "Protocol Interrupted",
        description: "Work Order, Resource, and Duration are required for ledger entry.",
      });
      return;
    }

    const resource = machines.find(m => m.id === selectedResourceId) || users.find(u => u.id === selectedResourceId);
    
    const newLog: WorkLogEntryType = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      resourceId: selectedResourceId,
      resourceName: resource ? resource.name : `Resource ${selectedResourceId}`,
      operator: operator || 'System User',
      date: new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift: 'Morning',
      type: activityType as any,
      duration: `${duration}h`,
      activity: description || 'Routine operation recorded',
      workOrderId: selectedOrderId
    };

    onAddLog(newLog);
    
    toast({
      title: "Log Synchronized",
      description: `Entry for WO #${selectedOrderId} committed to master ledger.`,
    });

    // Reset Stage 3 inputs but keep WO if they need to add another sub-task
    setDuration('');
    setDescription('');
  };

  const darkInputClasses = "bg-slate-50 border-none h-12 focus-visible:ring-primary/20 text-sm font-bold rounded-xl shadow-inner";
  const darkSelectClasses = "bg-slate-50 border-none h-12 focus:ring-primary/20 text-sm font-bold rounded-xl shadow-inner";

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.3em]">
            <ClipboardList className="h-3.5 w-3.5" />
            Operational Logging Protocol
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#001F3D]">
            Daily Work <span className="text-slate-400 font-medium">Ledger</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Execute the 3-stage logging sequence with 9-hour baseline enforcement.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 px-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-500",
                  step === s ? "bg-[#001F3D] text-white shadow-xl scale-110" : 
                  step > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={cn("h-0.5 flex-1 rounded-full", step > s ? "bg-emerald-500" : "bg-slate-100")} />}
              </div>
            ))}
          </div>

          <Card className="p-10 bg-white border-slate-200/60 shadow-2xl rounded-[2.5rem] relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#001F3D 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 space-y-10">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary"><CalendarDays className="h-8 w-8" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Stage 01: Date Protocol</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select the operational window for logging.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-sm">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Log Date</Label>
                    <DatePicker 
                      value={selectedDate}
                      onChange={setSelectedDate}
                      className="h-16 rounded-2xl text-lg font-display"
                    />
                  </div>

                  <Button 
                    className="h-14 px-10 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl group"
                    onClick={() => setStep(2)}
                  >
                    Proceed to Identity <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Hash className="h-8 w-8" /></div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Stage 02: Thread Identification</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Identify the production thread for the logs.</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-lg">
                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Work Order / Account</Label>
                    <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
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

                  <div className="flex gap-4">
                    <Button variant="ghost" className="h-14 rounded-2xl px-6 font-bold uppercase text-[10px] text-slate-400" onClick={() => setStep(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button 
                      disabled={!selectedOrderId}
                      className="h-14 px-10 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl group"
                      onClick={() => setStep(3)}
                    >
                      Initialize Matrix Entry <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Zap className="h-8 w-8" /></div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">STAGE 03: MATRIX ENTRY</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">RECORDING FOR WO #{selectedOrderId} ON {selectedDate}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-[9px] font-bold uppercase" onClick={() => setStep(2)}>
                      CHANGE WO
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">SELECT ASSET / MACHINE</Label>
                        <Select onValueChange={setSelectedResource} value={selectedResourceId}>
                          <SelectTrigger className={darkSelectClasses}>
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

                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">DURATION (HOURS)</Label>
                        <div className="relative">
                          <Input 
                            placeholder="e.g. 4.5" 
                            className={cn(darkInputClasses, "pr-12 text-center text-lg")}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                          />
                          <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">ACTIVITY CLASSIFICATION</Label>
                        <Select value={activityType} onValueChange={setActivityType}>
                          <SelectTrigger className={darkSelectClasses}>
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
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">FUNCTIONAL DESCRIPTION</Label>
                      <Textarea 
                        placeholder="Task details..." 
                        className={cn(darkInputClasses, "min-h-[120px] py-4 resize-none leading-relaxed")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] text-slate-400" onClick={() => setStep(2)}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> ABORT
                    </Button>
                    <Button 
                      className="flex-[2] h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl flex gap-3 group"
                      onClick={handleSaveLog}
                    >
                      <Save className="h-4 w-4" /> COMMIT TO LEDGER
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Daily Capacity Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-8 bg-[#001F3D] text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-20 w-20" />
            </div>
            
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Operator Capacity Matrix</p>
                  <h4 className="text-xl font-display font-bold uppercase tracking-tight">{operator}</h4>
                </div>
                <Badge className="bg-white/10 text-white border-none text-[8px] font-bold uppercase px-3">Live_Tracking</Badge>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Cumulative Hours</p>
                    <p className="text-4xl font-display font-bold">{dailyStats.totalHours.toFixed(1)} <span className="text-xl text-white/20">/ 9.0h</span></p>
                  </div>
                  {dailyStats.isOT && (
                    <Badge className="bg-emerald-500 text-white border-none font-bold uppercase text-[9px] px-4 py-1.5 rounded-full animate-pulse shadow-lg shadow-emerald-500/20">
                      Overtime Active (+{dailyStats.otHours.toFixed(1)}h)
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        dailyStats.totalHours >= 9 ? "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" : "bg-primary"
                      )}
                      style={{ width: `${Math.min((dailyStats.totalHours / 9) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.3em] text-white/30">
                    <span>Baseline Goal: 9.0h</span>
                    <span>{((dailyStats.totalHours / 9) * 100).toFixed(0)}% Utilized</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                    <b>Protocol Note:</b> A 9-hour operational block is mandatory for standard throughput. Hours exceeding 9.0h are logged as OT and processed via separate financial settlement.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem] flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History className="h-3.5 w-3.5" /> Contextual Daily Audit
              </h4>
              <Badge variant="outline" className="text-[8px] border-slate-100 text-slate-400 font-bold px-2">{dailyStats.count} Entries</Badge>
            </div>
            
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-4">
                {dailyStats.dayLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-[8px] font-bold border-primary/20 text-primary uppercase">WO #{log.workOrderId}</Badge>
                      <span className="text-[10px] font-display font-bold text-[#001F3D]">{log.duration}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 uppercase line-clamp-1">{log.resourceName}</p>
                    <p className="text-[9px] text-slate-400 line-clamp-1 italic">"{log.activity}"</p>
                  </div>
                ))}
                {dailyStats.count === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center">
                    <ArchiveX className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Ledger Empty for {selectedDate}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
