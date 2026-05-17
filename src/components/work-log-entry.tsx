
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
  CheckCircle2,
  FileCheck,
  LayoutGrid,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { WorkLogEntry as WorkLogEntryType, Machine, SystemUser, Order } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
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
    const formattedTargetDate = new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayLogs = logs.filter(l => 
      l.date === formattedTargetDate &&
      l.operator === operator
    );
    
    const totalHours = dayLogs.reduce((acc, curr) => {
      return acc + (parseFloat(curr.duration) || 0);
    }, 0);

    const isOT = totalHours > 9;
    const otHours = isOT ? totalHours - 9 : 0;

    return { totalHours, isOT, otHours, count: dayLogs.length, dayLogs };
  }, [logs, selectedDate, operator]);

  const handleDateChangeAttempt = (newDate: string) => {
    // Industrial Rule: Cannot change date if current selection hasn't met 9h baseline
    if (dailyStats.totalHours > 0 && dailyStats.totalHours < 9) {
      toast({
        variant: "destructive",
        title: "Date Switch Blocked",
        description: "Protocol requires 9.0h baseline completion for the current date before temporal migration.",
      });
      return;
    }
    setSelectedDate(newDate);
  };

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

    setDuration('');
    setDescription('');
  };

  const handleFinalSubmit = () => {
    toast({
      title: "Daily Protocol Finalized",
      description: `Operational data for ${selectedDate} has been locked and transmitted to the central vault.`,
    });
    setStep(1); // Reset to first step for next entry cycle
  };

  const darkInputClasses = "bg-slate-50 border-none h-12 focus-visible:ring-primary/20 text-sm font-bold rounded-xl shadow-inner";
  const darkSelectClasses = "bg-slate-50 border-none h-12 focus:ring-primary/20 text-sm font-bold rounded-xl shadow-inner";

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 max-w-[1400px] mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <ClipboardList className="h-4 w-4" />
            Daily Work Ledger Protocol
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-[#001F3D] uppercase">
            Work Log <span className="text-slate-400 font-medium">Command Matrix</span>
          </h2>
          <p className="text-muted-foreground font-medium">Multi-stage operational logging with 9.0h baseline mandate.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className="lg:col-span-8 space-y-10">
          {/* Step-by-Step Selection Matrix */}
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
                  </div>

                  <Button 
                    disabled={!selectedOrderId}
                    className="h-16 px-12 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl group"
                    onClick={() => setStep(2)}
                  >
                    Proceed to Matrix Entry <ChevronRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
                    <Button variant="ghost" size="sm" className="h-10 rounded-xl text-slate-400 font-bold uppercase text-[9px] hover:text-[#001F3D]" onClick={() => setStep(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Change Selection
                    </Button>
                  </div>

                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Resource Node</Label>
                        <Select onValueChange={setSelectedResource} value={selectedResourceId}>
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
                      <Select value={activityType} onValueChange={setActivityType}>
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
                        placeholder="Detailed technical observations and operational notes..." 
                        className="min-h-[220px] bg-slate-50 border-none py-6 px-6 text-xs font-bold rounded-2xl shadow-inner resize-none focus-visible:ring-primary/20 leading-relaxed"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400" onClick={() => setStep(1)}>Abort</Button>
                    <Button 
                      className="flex-[2] h-16 bg-[#001F3D] hover:bg-black text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/20 flex gap-4 group"
                      onClick={handleSaveLog}
                    >
                      <Save className="h-5 w-5" /> Commit to Ledger
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Large Scale Summary Matrix */}
          <Card className="p-12 bg-white border-slate-200/60 shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-600/20"><FileCheck className="h-10 w-10" /></div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-[#001F3D] uppercase tracking-tight">Daily Log Summary Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Selected Node: {selectedDate}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Status:</span>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase px-6 py-2 rounded-full border shadow-sm",
                      dailyStats.totalHours >= 9 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {dailyStats.totalHours >= 9 ? 'Baseline Satisfied' : 'Requirement Gap Detected'}
                    </Badge>
                 </div>
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">SYNC_V2.4_STABLE</p>
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
                    <TableHead className="text-[11px] font-bold uppercase pl-10">Technical Observation</TableHead>
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
                      <TableCell className="pl-10">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md line-clamp-2 italic">
                          "{log.activity}"
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dailyStats.dayLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-20 py-10">
                          <ArchiveX className="h-20 w-20 text-slate-300 mb-6" />
                          <p className="text-xl font-display font-bold uppercase tracking-tight text-slate-400">Ledger Matrix Idle</p>
                          <p className="text-xs text-slate-300 mt-2 font-medium uppercase tracking-widest">No entries detected for this date node.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-start gap-6 max-w-lg bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className={cn(
                  "p-3 rounded-2xl text-white shadow-lg",
                  dailyStats.totalHours < 9 ? "bg-red-500 shadow-red-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                )}>
                  {dailyStats.totalHours < 9 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Temporal Mandate Audit</p>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                    {dailyStats.totalHours < 9 
                      ? `Requirement Mismatch: ${ (9 - dailyStats.totalHours).toFixed(1) }h remaining to satisfy the 9.0h operational baseline mandate.`
                      : "Mandate Satisfied: The daily operational baseline has been achieved. Overtime protocols active."}
                  </p>
                </div>
              </div>
              
              <Button 
                disabled={dailyStats.totalHours < 9}
                className={cn(
                  "h-20 px-16 rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[12px] shadow-2xl transition-all duration-700 flex gap-4 group",
                  dailyStats.totalHours >= 9 ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30" : "bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-dashed border-slate-200"
                )}
                onClick={handleFinalSubmit}
              >
                {dailyStats.totalHours < 9 ? <Lock className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                Final Submit Protocol
                <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Daily Capacity Node Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-10 bg-[#001F3D] text-white border-none shadow-2xl rounded-[3rem] relative overflow-hidden group sticky top-24">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-32 w-32" />
            </div>
            
            <div className="space-y-12 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Capacity Matrix</p>
                  <h4 className="text-2xl font-display font-bold uppercase tracking-tight leading-none">{operator}</h4>
                </div>
                <Badge className="bg-primary/20 text-primary border-none text-[8px] font-bold uppercase px-3 py-1">LIVE_SYNC</Badge>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cumulative Yield</p>
                    <p className="text-6xl font-display font-bold tracking-tighter">
                      {dailyStats.totalHours.toFixed(1)} 
                      <span className="text-2xl text-white/20 ml-2">/ 9.0h</span>
                    </p>
                  </div>
                  {dailyStats.isOT && (
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-emerald-500 text-white border-none font-bold uppercase text-[9px] px-4 py-2 rounded-full animate-pulse shadow-lg shadow-emerald-500/30">
                        OT ACTIVE (+{dailyStats.otHours.toFixed(1)}h)
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        dailyStats.totalHours >= 9 ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" : "bg-primary"
                      )}
                      style={{ width: `${Math.min((dailyStats.totalHours / 9) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                    <span>Baseline Mandate</span>
                    <span>{((dailyStats.totalHours / 9) * 100).toFixed(0)}% Utilized</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-4 shadow-inner">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                    <b className="text-white/80">Compliance Rule:</b> Entry nodes committed beyond 9.0h are strictly classified as Overtime (OT). Financial settlement for OT nodes is processed as a separate transaction protocol.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="p-8 bg-slate-50/80 border border-slate-100 rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-right-4 duration-1000">
             <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-primary"><Clock className="h-6 w-6" /></div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Archive Protocol</p>
                <p className="text-[11px] font-bold text-[#001F3D] leading-snug mt-1">Logs are automatically hashed and committed to the master ledger upon final submission.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
